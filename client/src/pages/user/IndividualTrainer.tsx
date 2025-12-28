import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    MapPin,
    Star,
    MessageSquare,
    Clock,
    Users,
    Award,
    Phone,
    Mail,
    ArrowLeft,
    Calendar,
    Shield,
    AlertTriangle,
    FileText,
    Check,
    Crown,
    Target,
    Trophy,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { getIndividualTrainer } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import SubscriptionModal from "@/components/ui/SubscriptionModal";
import TrainerReviews from "@/components/user/reviews/TrainerReviews";

import type { Position, Trainer, User } from "@/interfaces/user/IIndividualTrainer";

const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.25)"
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState<number>(0);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
        if (!divRef.current || isFocused) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setIsFocused(true);
        setOpacity(0.4);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(0.4);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-500 ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
                style={{
                    opacity,
                    background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
                }}
            />
            {children}
        </div>
    );
};

export default function TrainerPage() {
    const params = useParams();
    const id = params?.id as string;
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [checkingPendingTransaction, setCheckingPendingTransaction] = useState(false);

    useEffect(() => {
        document.title = "TrainUp - Trainer Profile";
        fetchTrainer();
        fetchUser();
    }, [id]);

    const fetchTrainer = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getIndividualTrainer(id);
            setTrainer(response.trainer);
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to fetch trainer:", err);
            setError("Failed to load trainer details");
            toast.error("Failed to load trainer details");
            setIsLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await API.get("/user/get-profile");
            setUser(response.data.user);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            toast.error("Failed to load user data");
        }
    };

    const checkPendingTransaction = async (): Promise<boolean> => {
        try {
            const response = await API.get("/payment/check-pending");
            return response.data.hasPending;
        } catch (error) {
            console.error("Failed to check pending transactions:", error);
            return false;
        }
    };

    const handleSubscribe = async (planType: string, duration: number) => {
        if (!trainer) return;

        setShowSubscriptionModal(false);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
            try {
                const trainerPrice = trainer.price;
                const basePrice = trainerPrice[planType as keyof typeof trainerPrice];
                const totalAmount = basePrice * duration;

                const response = await API.post("/payment/create-order", {
                    amount: totalAmount,
                    currency: "INR",
                    receipt: `booking_${Date.now()}`,
                    trainerId: trainer._id,
                    planType,
                    duration
                });
                const order = response.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY,
                    amount: order.amount,
                    currency: order.currency,
                    name: "TrainUp",
                    description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan - ${trainer?.name}`,
                    image: import.meta.env.VITE_LOGO_URL || "/logo.png",
                    order_id: order.id,
                    handler: async (response: any) => {
                        try {
                            const verifyResponse = await API.post("/payment/verify-payment", {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                trainerId: id,
                                planType: planType,
                                amount: totalAmount,
                                duration: duration
                            });
                            if (verifyResponse.data.success) {
                                toast.success("Payment successful! Subscription confirmed.");
                                navigate("/my-trainer/profile");
                            } else {
                                toast.error("Payment verification failed");
                            }
                        } catch (err) {
                            console.error("Payment verification failed:", err);
                            toast.error("Failed to verify payment");
                        }
                    },
                    prefill: {
                        name: trainer?.name || "",
                        email: trainer?.email || "",
                        contact: trainer?.phone || "",
                    },
                    theme: {
                        color: "#3b82f6",
                    },
                    modal: {
                        ondismiss: async () => {
                            try {
                                await API.post("/payment/cleanup-pending");
                                toast.info("Payment cancelled");
                            } catch (error) {
                                console.error("Failed to cleanup on dismiss:", error);
                            }
                        }
                    }
                };

                const rzp = new (window as unknown as { Razorpay: new (options: any) => any }).Razorpay(options);
                rzp.on("payment.failed", async () => {
                    try {
                        await API.post("/payment/cleanup-pending");
                        toast.error("Payment failed. Please try again.");
                    } catch (error) {
                        console.error("Failed to cleanup on failure:", error);
                    }
                });
                rzp.open();
            } catch (err: any) {
                console.error("Failed to create order:", err);
                if (err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error("Failed to initiate payment");
                }
            } finally {
                document.body.removeChild(script);
            }
        };

        script.onerror = () => {
            toast.error("Failed to load Razorpay SDK");
            document.body.removeChild(script);
        };
    };

    const handleChat = () => {
        if (!user?.trainerPlan) {
            toast.error("Please subscribe to a plan to start chatting with your trainer");
            return;
        }

        if (user.trainerPlan === 'basic') {
            toast.error("Chat is not available with Basic plan. Please upgrade to Premium or Pro");
            return;
        }

        if (trainer) {
            navigate(`/my-trainer/chat/${trainer._id}`);
        } else {
            toast.error("No trainer found to chat with");
        }
    };

    const handleReviewAdded = (newReview: any) => {
        if (trainer) {
            setTrainer({
                ...trainer,
                reviews: [...(trainer.reviews || []), newReview]
            });
        }
    };

    const openSubscriptionModal = async () => {
        if (hasTrainer && !isSameTrainer) {
            toast.error("You already have a trainer assigned. Please cancel your current subscription first.");
            return;
        }

        // Check for pending transactions before opening modal
        setCheckingPendingTransaction(true);
        const hasPending = await checkPendingTransaction();
        setCheckingPendingTransaction(false);

        if (hasPending) {
            toast.error("You have a pending transaction. Please complete or cancel it first.", {
                action: {
                    label: "Cancel Pending",
                    onClick: async () => {
                        try {
                            await API.post("/payment/cleanup-pending");
                            toast.success("Pending transaction cancelled");
                        } catch (error) {
                            toast.error("Failed to cancel pending transaction");
                        }
                    }
                }
            });
            return;
        }

        setShowSubscriptionModal(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground font-medium text-lg">Loading trainer profile...</p>
                </div>
            </div>
        );
    }

    if (error || !trainer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
                <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Trainer Not Found</h3>
                    <p className="text-muted-foreground text-lg">{error || "The trainer you're looking for doesn't exist"}</p>
                    <Link to="/trainers">
                        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Trainers
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const isSameTrainer = user?.assignedTrainer === id;
    const hasTrainer = !!user?.assignedTrainer;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            {hasTrainer && !isSameTrainer && (
                <div className="relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 py-4 px-6">
                    <div className="container mx-auto flex items-center justify-center gap-3 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium text-center">
                            You already have a trainer assigned.{" "}
                            <Link to="/my-trainer/profile" className="underline hover:text-amber-700 font-semibold">
                                View your trainer's profile
                            </Link>{" "}
                            or cancel your current subscription to book a new trainer.
                        </span>
                    </div>
                </div>
            )}
            <SiteHeader />
            <div className="relative border-b border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <Link to="/trainers">
                        <Button variant="ghost" className="group hover:bg-primary/5 transition-all duration-300">
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Trainers
                        </Button>
                    </Link>
                </div>
            </div>

            <main className="relative container mx-auto px-4 py-12 space-y-12 flex-1">
                {/* Hero Section */}
                <SpotlightCard className="p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                        <div className="relative group/image">
                            <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>

                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center">
                                        <Users className="h-16 w-16 text-muted-foreground/30" />
                                    </div>
                                )}

                                <img
                                    src={trainer.profileImage || "/placeholder.svg"}
                                    alt={trainer.name}
                                    className={`w-full h-full object-cover transition-all duration-700 group-hover/image:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                    onLoad={() => setImageLoaded(true)}
                                />

                                {trainer.isVerified && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 backdrop-blur-md rounded-full border border-white/20">
                                            <Shield className="h-4 w-4 text-white" />
                                            <span className="text-white text-sm font-semibold">Verified</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20">
                                    <Trophy className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary">Elite Trainer</span>
                                </div>

                                <div className="space-y-3">
                                    <h1 className="font-display text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                                        {trainer.name}
                                    </h1>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge
                                            variant="secondary"
                                            className="bg-primary/10 text-primary border-primary/20 font-medium px-4 py-2 text-base"
                                        >
                                            <Target className="h-4 w-4 mr-2" />
                                            {trainer.specialization}
                                        </Badge>
                                        {trainer.isVerified && (
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-medium px-4 py-2 text-base">
                                                <Shield className="h-4 w-4 mr-1" />
                                                Verified Professional
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${i < Math.floor(trainer.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-bold text-foreground text-lg">{trainer.rating}</span>
                                        <span className="text-sm">({trainer.clients?.length || 0} clients)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <span className="font-medium">{trainer.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-accent" />
                                        <span className="font-medium">{trainer.experience} years experience</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {isSameTrainer ? (
                                    <Button
                                        disabled
                                        size="lg"
                                        className="bg-gray-500/50 cursor-not-allowed font-semibold px-8 text-base"
                                    >
                                        <Check className="h-5 w-5 mr-2" />
                                        Your Current Trainer
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={openSubscriptionModal}
                                        size="lg"
                                        disabled={hasTrainer || checkingPendingTransaction}
                                        className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold px-8 text-base"
                                    >
                                        {checkingPendingTransaction ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <Calendar className="h-5 w-5 mr-2" />
                                                Start Your Journey
                                            </>
                                        )}
                                    </Button>
                                )}
                                {isSameTrainer && (
                                    <Link to="/my-trainer/profile">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 font-medium px-8 bg-transparent text-base"
                                        >
                                            View Dashboard
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </SpotlightCard>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <SpotlightCard className="p-8">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                    <Award className="h-7 w-7 text-primary" />
                                    About {trainer.name}
                                </h2>
                                <p className="text-muted-foreground leading-relaxed text-lg">{trainer.bio}</p>

                                <div className="grid gap-6 sm:grid-cols-2 pt-4">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg">
                                            <Users className="h-5 w-5 text-primary" />
                                            Experience
                                        </h3>
                                        <p className="text-muted-foreground">{trainer.experience} years of professional training</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg">
                                            <Target className="h-5 w-5 text-primary" />
                                            Specialization
                                        </h3>
                                        <p className="text-muted-foreground">{trainer.specialization}</p>
                                    </div>
                                </div>

                            </div>
                        </SpotlightCard>

                        <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
                            </CardHeader>
                            <CardContent>
                                <button
                                    onClick={() => setIsOpen(true)}
                                    className="group inline-flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300 w-full text-left"
                                >
                                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Professional Certificate</p>
                                        <p className="text-sm text-muted-foreground">Click to view credentials</p>
                                    </div>
                                </button>
                            </CardContent>
                        </Card>

                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center justify-between">
                                        Professional Certificate
                                    </DialogTitle>
                                </DialogHeader>
                                <img
                                    src={trainer.certificate}
                                    alt="Professional Certificate"
                                    className="w-full h-auto rounded-lg border border-border/50"
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mt-8">
                        <TrainerReviews
                            trainerId={trainer._id}
                            onReviewAdded={handleReviewAdded}
                            canReview={hasTrainer && isSameTrainer}
                            currentUserPlan={user?.trainerPlan}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Pricing Card */}
                    <SpotlightCard className="p-6">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                <Crown className="h-6 w-6 text-primary" />
                                Plans Starting From
                            </h3>
                            <div className="text-center p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 rounded-xl border border-primary/10">
                                <div className="text-4xl font-bold text-primary mb-2">₹{trainer.price.basic.toLocaleString()}</div>
                                <p className="text-muted-foreground font-medium">per month</p>
                                <p className="text-sm text-muted-foreground/70 mt-2">Transform your fitness journey</p>
                            </div>
                            {isSameTrainer ? (
                                <Button
                                    disabled
                                    className="w-full bg-gray-500/50 cursor-not-allowed font-semibold"
                                    size="lg"
                                >
                                    <Check className="h-5 w-5 mr-2" />
                                    Your Current Trainer
                                </Button>
                            ) : (
                                <Button
                                    onClick={openSubscriptionModal}
                                    disabled={hasTrainer || checkingPendingTransaction}
                                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                                    size="lg"
                                >
                                    {checkingPendingTransaction ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="h-5 w-5 mr-2" />
                                            Choose Your Plan
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-6">
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Get In Touch
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-all duration-300">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">{trainer.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-all duration-300">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium">{trainer.email}</span>
                                </div>
                            </div>
                            <Button
                                onClick={handleChat}
                                variant="outline"
                                className="w-full hover:bg-primary/5"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Start Conversation
                            </Button>
                        </div>
                    </SpotlightCard>
                </div>
            </main>

            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSubscribe={handleSubscribe}
                prices={trainer.price}
                trainerName={trainer.name}
            />
            <SiteFooter />
        </div>
    );
}