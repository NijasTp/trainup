import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Star,
    Clock,
    Users,
    ArrowLeft,
    Shield,
    Check,
    ChevronRight,
    Map as MapIcon,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { getGymForUser, getActiveSubscriptionPlans } from "@/services/gymService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import GymSubscriptionModal from "@/components/user/gym/GymSubscriptionModal";
import GymReviews from "@/components/user/reviews/GymReviews";
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function IndividualGym() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [gym, setGym] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            fetchGymDetails();
            fetchPlans();
        }
    }, [id]);

    async function fetchGymDetails() {
        try {
            const response = await getGymForUser(id!);
            setGym(response.gym);
            document.title = `${response.gym.name} | TrainUp`;
        } catch (error) {
            toast.error("Failed to load gym details");
            navigate("/gyms");
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchPlans() {
        try {
            const response = await getActiveSubscriptionPlans(id!);
            setPlans(response.plans || []);
        } catch (error) {
            console.error("Failed to fetch plans", error);
        }
    }

    const handleReviewAdded = (newReview: any) => {
        if (gym) {
            setGym({
                ...gym,
                reviews: [newReview, ...(gym.reviews || [])]
            });
        }
    };

    const handleSubscribe = async (planId: string, preferredTime: string) => {
        setIsProcessing(true);
        try {
            const plan = plans.find(p => p._id === planId);
            if (!plan) throw new Error("Plan not found");

            // 1. Create Order
            const { data: orderResponse } = await API.post("/payment/create-gym-order", {
                gymId: id,
                subscriptionPlanId: planId,
                amount: plan.price
            });

            // 2. Load Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: orderResponse.order.amount,
                currency: "INR",
                name: "TrainUp",
                description: `Membership for ${gym.name}`,
                order_id: orderResponse.order.id,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await API.post("/payment/verify-gym-payment", {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            gymId: id,
                            subscriptionPlanId: planId,
                            preferredTime
                        });

                        if (verifyRes.data.success) {
                            toast.success("Membership confirmed!");
                            navigate("/gym-dashboard");
                        }
                    } catch (error: any) {
                        toast.error(error.response?.data?.message || "Payment verification failed");
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: ""
                },
                theme: {
                    color: "#030303"
                },
                modal: {
                    ondismiss: () => setIsProcessing(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const allImages = [gym.profileImage, ...(gym.images || [])].filter(Boolean);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-8 space-y-12 flex-1 z-10">
                <Link to="/gyms">
                    <Button variant="ghost" className="mb-4 hover:bg-white/5 transition-all">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
                    </Button>
                </Link>

                {/* Hero / Images Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 group shadow-2xl">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={allImages[selectedImage] || "/placeholder.svg"}
                                    alt={gym.name}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 flex gap-2">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`h-2 rounded-full transition-all ${selectedImage === i ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-primary scale-95" : "border-transparent opacity-50 hover:opacity-100"
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8 py-4">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20"
                            >
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-black text-primary uppercase tracking-widest">Premium Facility</span>
                            </motion.div>
                            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">{gym.name}</h1>

                            <div className="flex flex-wrap gap-6 text-gray-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    <span className="text-white font-bold">{gym.avgRating || "0.0"}</span>
                                    <span>({gym.reviews?.length || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    <span>{gym.members?.length || 0} active members</span>
                                </div>
                            </div>

                            <p className="text-xl text-gray-400 leading-relaxed font-light">{gym.description || "Experience top-tier fitness at our state-of-the-art facility. We offer a range of modern equipment and professional coaching."}</p>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest">Starting Price</p>
                                    <p className="text-4xl font-black text-white">
                                        {plans.length > 0 ? `₹${plans[0].price}` : <span className="text-2xl text-gray-400 italic">Unavailable</span>}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={plans.length === 0}
                                    size="lg"
                                    className="h-16 px-10 rounded-2xl bg-primary text-black font-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all text-lg"
                                >
                                    Choose Your Plan <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                <Clock className="h-6 w-6 text-primary mb-2" />
                                <p className="font-black text-white">Opening Hours (Today)</p>
                                <p className="text-sm text-gray-400">
                                    {Array.isArray(gym.openingHours) && gym.openingHours.length > 0
                                        ? (() => {
                                            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                            const todayHours = gym.openingHours.find((h: any) => h.day.toLowerCase() === today) || gym.openingHours[0];
                                            return todayHours.isClosed ? "Closed Today" : `${todayHours.open} - ${todayHours.close}`;
                                        })()
                                        : (gym.openingHours || "06:00 AM - 10:00 PM")}
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                <MapIcon className="h-6 w-6 text-primary mb-2" />
                                <p className="font-black text-white">Location</p>
                                <p className="text-sm text-gray-400 truncate">{gym.address || "Main City Center"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features & Amenities */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-black flex items-center gap-3">
                        <Shield className="h-7 w-7 text-primary" /> World-Class Amenities
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {["Cardio Zone", "Free Weights", "Yoga Studio", "Personal Training", "Sauna", "Group Classes"].map((amenity, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-4 text-center group hover:bg-white/10 transition-all">
                                <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-all">
                                    <Check className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-gray-300">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Plans Deep Dive */}
                <section className="space-y-8">
                    <h2 className="text-3xl font-black">Membership Plans</h2>
                    {plans.length === 0 ? (
                        <div className="py-12 text-center bg-white/5 border border-white/10 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
                            <h3 className="text-2xl font-bold text-gray-300">Plans Currently Unavailable</h3>
                            <p className="text-gray-500 mt-2">This gym hasn't added any membership plans yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan, i) => (
                                <Card key={plan._id} className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-8 overflow-hidden relative group shadow-2xl">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{plan.duration} {plan.durationUnit}(s)</p>
                                    </div>
                                    <div className="space-y-4">
                                        {plan.features.map((f: string, fi: number) => (
                                            <div key={fi} className="flex items-start gap-3">
                                                <Check className="h-4 w-4 text-primary mt-1" />
                                                <span className="text-gray-400 font-medium">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                                        <p className="text-3xl font-black text-white">₹{plan.price}</p>
                                        <Button
                                            onClick={() => setIsModalOpen(true)}
                                            className="rounded-2xl bg-white text-black font-black px-6 hover:bg-primary hover:text-white transition-all"
                                        >
                                            Select
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Reviews */}
                <section className="pt-12 pb-24 border-t border-white/10">
                    <GymReviews 
                        gymId={id!} 
                        reviews={gym.reviews || []}
                        onReviewAdded={handleReviewAdded}
                    />
                </section>

            </main>

            <GymSubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubscribe={handleSubscribe}
                plans={plans}
                gymName={gym?.name || ""}
                isProcessing={isProcessing}
            />

            <SiteFooter />
        </div>
    );
}
