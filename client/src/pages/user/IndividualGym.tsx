import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { getGymForUser, getActiveSubscriptionPlans } from "@/services/gymService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import GymReviews from "@/components/user/reviews/GymReviews";
import { motion, AnimatePresence } from "framer-motion";

type SafeAny = any;

export default function IndividualGym() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [gym, setGym] = useState<SafeAny>(null);
    const [plans, setPlans] = useState<SafeAny[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    const fetchGymDetails = useCallback(async () => {
        try {
            const response = await getGymForUser(id!);
            setGym(response.gym);
            document.title = `${response.gym.name} | TrainUp`;
        } catch (_error) {
            toast.error("Failed to load gym details");
            navigate("/gyms");
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    const fetchPlans = useCallback(async () => {
        try {
            const response = await getActiveSubscriptionPlans(id!);
            setPlans(response.plans || []);
        } catch (errorVal) {
            const error = errorVal as SafeAny;
            console.error("Failed to fetch plans", error);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchGymDetails();
            fetchPlans();
        }
    }, [id, fetchGymDetails, fetchPlans]);

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing facility specs...</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-6 text-center">
                    <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest italic animate-pulse">Loading Gym Identity...</p>
                </div>
                <SiteFooter />
            </div>
        );
    }
    
    const allImages = [gym.profileImage, ...(gym.images || [])].filter(Boolean);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-6 py-12 space-y-10 flex-1 z-10 max-w-5xl w-full">
                <div className="flex justify-start">
                    <Link to="/gyms">
                        <button className="duo-btn-gray h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ArrowLeft className="h-4 w-4" /> Back to Search
                        </button>
                    </Link>
                </div>

                {/* Hero / Images Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#262626] bg-[#171717] shadow-lg">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    src={allImages[selectedImage] || "/placeholder.svg"}
                                    alt={gym.name}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 flex gap-1.5 z-20">
                                {allImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`h-1.5 rounded-full transition-all ${selectedImage === i ? "w-6 bg-[#22d3ee]" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-[#22d3ee] scale-95" : "border-transparent opacity-50 hover:opacity-100"}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/5 border border-[#22d3ee]/20 rounded-lg">
                                <Sparkles className="h-3.5 w-3.5 text-[#22d3ee]" />
                                <span className="text-[9px] font-mono font-bold text-[#22d3ee] uppercase tracking-wider">Premium Facility</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-5xl font-extrabold font-mono text-white uppercase tracking-tight leading-tight">
                                {gym.name}
                            </h1>

                            <div className="flex flex-wrap gap-4 font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    <span className="text-white">{gym.avgRating || "0.0"}</span>
                                    <span>({gym.reviews?.length || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-[#22d3ee]" />
                                    <span>{gym.members?.length || 0} active members</span>
                                </div>
                            </div>

                            <p className="text-xs font-mono text-neutral-400 uppercase leading-relaxed tracking-wide">
                                {gym.description || "Experience top-tier fitness at our state-of-the-art facility. We offer a range of modern equipment and professional coaching."}
                            </p>
                        </div>

                        <div className="p-6 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">STARTING RATE</p>
                                <p className="text-2xl font-extrabold font-mono text-white">
                                    {plans.length > 0 ? `₹${plans[0].price}` : <span className="text-base text-neutral-500 italic uppercase">Unavailable</span>}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/gym/select-plan/${id}`)}
                                disabled={plans.length === 0}
                                className="duo-btn-cyan h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider w-full sm:w-auto flex items-center justify-center gap-1.5"
                            >
                                Choose Your Plan <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                            <div className="p-4 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl space-y-1">
                                <Clock className="h-4 w-4 text-[#22d3ee] mb-1" />
                                <p className="font-bold text-white uppercase text-[9px] text-neutral-400">Opening Hours (Today)</p>
                                <p className="text-[11px] font-bold text-neutral-200 uppercase">
                                    {Array.isArray(gym.openingHours) && gym.openingHours.length > 0
                                        ? (() => {
                                            const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                            const todayHours = gym.openingHours.find((h: SafeAny) => h.day.toLowerCase() === today) || gym.openingHours[0];
                                            return todayHours.isClosed ? "Closed Today" : `${todayHours.open} - ${todayHours.close}`;
                                        })()
                                        : (gym.openingHours || "06:00 AM - 10:00 PM")}
                                </p>
                            </div>
                            <div className="p-4 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl space-y-1">
                                <MapIcon className="h-4 w-4 text-[#22d3ee] mb-1" />
                                <p className="font-bold text-white uppercase text-[9px] text-neutral-400">Location</p>
                                <p className="text-[11px] font-bold text-neutral-200 uppercase truncate">{gym.address || "Main City Center"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features & Amenities */}
                <section className="space-y-6 pt-6">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#171717] border border-[#262626] rounded-lg text-[#22d3ee]">
                            <Shield className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">WORLD-CLASS AMENITIES</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {["Cardio Zone", "Free Weights", "Yoga Studio", "Personal Training", "Sauna", "Group Classes"].map((amenity) => (
                            <div key={amenity} className="p-4 rounded-xl bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] flex flex-col items-center gap-3 text-center">
                                <div className="p-2 bg-[#0d0d0e] border border-[#262626] rounded-lg text-[#22d3ee]">
                                    <Check className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wide">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Plans Deep Dive */}
                <section className="space-y-6 pt-6">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#171717] border border-[#262626] rounded-lg text-[#22d3ee]">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">MEMBERSHIP PLANS</h2>
                    </div>

                    {plans.length === 0 ? (
                        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl py-12 text-center flex flex-col items-center justify-center gap-3">
                            <h3 className="text-base font-extrabold font-mono text-white uppercase tracking-tight">Plans Currently Unavailable</h3>
                            <p className="text-xs font-mono text-neutral-400 uppercase">This gym hasn't configured any membership packages yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan._id} className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 flex flex-col justify-between h-full">
                                    <div className="space-y-4">
                                        <div className="border-b border-[#262626] pb-4">
                                            <h3 className="text-lg font-extrabold font-mono text-white uppercase tracking-tight">{plan.name}</h3>
                                            <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">{plan.duration} {plan.durationUnit}(s)</p>
                                        </div>
                                        <div className="space-y-2.5 font-mono text-xs text-neutral-300 uppercase">
                                            {plan.features.map((f: string, fi: number) => (
                                                <div key={fi} className="flex items-start gap-2">
                                                    <Check className="h-3.5 w-3.5 text-[#22d3ee] mt-0.5 flex-shrink-0" />
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-[#262626] flex items-center justify-between mt-6">
                                        <p className="text-xl font-extrabold font-mono text-white">₹{plan.price}</p>
                                        <button
                                            onClick={() => navigate(`/gym/select-plan/${id}`, { state: { selectedPlanId: plan._id } })}
                                            className="duo-btn-cyan h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider"
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Reviews */}
                <section className="pt-6 border-t border-[#262626]">
                    <GymReviews 
                        gymId={id!} 
                        canReview={false}
                    />
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
