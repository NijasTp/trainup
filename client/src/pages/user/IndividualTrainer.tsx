import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { getIndividualTrainer } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import TrainerReviews from "@/components/user/reviews/TrainerReviews";

import type { Position, Trainer, User } from "@/interfaces/user/iIndividualTrainer";

type SafeAny = any;

const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(34, 211, 238, 0.08)"
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
            className={`relative rounded-2xl border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] bg-[#171717] overflow-hidden transition-all duration-300 ${className}`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out"
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
    const [isOpen, setIsOpen] = useState(false);

    const isSameTrainer = user?.assignedTrainer === id;
    const hasTrainer = !!user?.assignedTrainer;

    const fetchTrainer = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getIndividualTrainer(id);
            const trainerData = response.trainer;

            // Robust parsing for stringified price data
            if (trainerData && typeof trainerData.price === "string") {
                try {
                    trainerData.price = JSON.parse(trainerData.price);
                } catch (eVal) {
                    const e = eVal as SafeAny;
                    console.error("Failed to parse price:", e);
                }
            }

            setTrainer(trainerData);
            setIsLoading(false);
        } catch (errVal) {
            const err = errVal as SafeAny;
            console.error("Failed to fetch trainer:", err);
            setError("Failed to load trainer details");
            toast.error("Failed to load trainer details");
            setIsLoading(false);
        }
    }, [id]);

    const fetchUser = useCallback(async () => {
        try {
            const response = await API.get("/user/get-profile");
            setUser(response.data.user);
        } catch (errVal) {
            const err = errVal as SafeAny;
            console.error("Failed to fetch user:", err);
            toast.error("Failed to load user data");
        }
    }, []);

    useEffect(() => {
        document.title = "TrainUp - Trainer Profile";
        fetchTrainer();
        fetchUser();
    }, [id, fetchTrainer, fetchUser]);

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

    const handleReviewAdded = (newReview: SafeAny) => {
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

        if (trainer) {
            navigate(`/trainers/${trainer._id}/pricing`);
        }
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing trainer profile...</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (error || !trainer) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="relative container mx-auto px-6 py-12 text-center space-y-6 flex-grow flex flex-col items-center justify-center max-w-lg">
                    <div className="w-20 h-20 bg-[#171717] border border-[#262626] rounded-full flex items-center justify-center mb-4 text-neutral-600">
                        <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-extrabold font-mono text-white uppercase">Trainer Not Found</h3>
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">{error || "The trainer profile you are seeking is offline."}</p>
                    <Link to="/trainers">
                        <button className="duo-btn-cyan h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Trainers
                        </button>
                    </Link>
                </div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-6 py-12 space-y-10 flex-1 z-10 max-w-5xl w-full">
                
                <div className="flex justify-start">
                    <Link to="/trainers">
                        <button className="duo-btn-gray h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ArrowLeft className="h-4 w-4" /> Back to Trainers
                        </button>
                    </Link>
                </div>

                {hasTrainer && !isSameTrainer && (
                    <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl flex items-center gap-3 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <span>
                            You already have a trainer assigned.{" "}
                            <Link to="/my-trainer/profile" className="text-[#22d3ee] underline">
                                View current profile
                            </Link>{" "}
                            or cancel subscription to assign a new coach.
                        </span>
                    </div>
                )}

                {/* Hero Section */}
                <SpotlightCard className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center gap-8">
                        <div className="relative shrink-0">
                            <div className="relative w-44 h-44 lg:w-56 lg:h-56 rounded-2xl overflow-hidden border-2 border-[#262626] bg-[#0d0d0e]">
                                {!imageLoaded && (
                                    <div className="absolute inset-0 bg-[#0d0d0e] flex items-center justify-center">
                                        <Users className="h-10 w-10 text-neutral-700 animate-pulse" />
                                    </div>
                                )}
                                <img
                                    src={trainer.profileImage || "/placeholder.svg"}
                                    alt={trainer.name}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                {trainer.isVerified && (
                                    <div className="absolute top-3 right-3 z-20">
                                        <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-950/80 border border-emerald-900/40 rounded-lg backdrop-blur-md">
                                            <Shield className="h-3.5 w-3.5 text-emerald-400" />
                                            <span className="text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-wider">Verified</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/5 border border-[#22d3ee]/20 rounded-lg">
                                    <Trophy className="h-3.5 w-3.5 text-[#22d3ee]" />
                                    <span className="text-[9px] font-mono font-bold text-[#22d3ee] uppercase tracking-wider">Elite Fitness Coach</span>
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-extrabold font-mono text-white uppercase tracking-tight flex flex-wrap justify-center md:justify-start items-center gap-3">
                                    {trainer.name}
                                    {isSameTrainer && (
                                        <span className="bg-cyan-500/10 text-[#22d3ee] border border-[#22d3ee]/20 py-0.5 px-2 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                                            Active Coach
                                        </span>
                                    )}
                                </h1>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 font-mono text-[9px] font-bold uppercase">
                                <span className="bg-cyan-500/5 text-[#22d3ee] border border-[#22d3ee]/20 px-2.5 py-1 rounded">
                                    {trainer.specialization}
                                </span>
                                <span className="bg-neutral-800 text-neutral-400 border border-[#262626] px-2.5 py-1 rounded flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {trainer.rating} ({trainer.clients?.length || 0} Clients)
                                </span>
                                <span className="bg-neutral-800 text-neutral-400 border border-[#262626] px-2.5 py-1 rounded flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-[#22d3ee]" /> {trainer.location}
                                </span>
                                <span className="bg-neutral-800 text-neutral-400 border border-[#262626] px-2.5 py-1 rounded flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-[#22d3ee]" /> {trainer.experience} Yrs EXP
                                </span>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                                {isSameTrainer ? (
                                    <button
                                        disabled
                                        className="duo-btn-outline h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider opacity-60 cursor-not-allowed"
                                    >
                                        <Check className="h-4 w-4 mr-1.5 inline-block" /> Your Active Coach
                                    </button>
                                ) : (
                                    <button
                                        onClick={openSubscriptionModal}
                                        disabled={hasTrainer}
                                        className="duo-btn-cyan h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider"
                                    >
                                        <Calendar className="h-4 w-4 mr-1.5 inline-block" /> Book Coach
                                    </button>
                                )}
                                {isSameTrainer && (
                                    <Link to="/my-trainer/profile">
                                        <button
                                            className="duo-btn-outline h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider"
                                        >
                                            View Coach Dashboard
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </SpotlightCard>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
                            <h2 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide flex items-center gap-2">
                                <Award className="h-5 w-5 text-[#22d3ee]" />
                                Bio & Coach Information
                            </h2>
                            <p className="text-xs font-mono text-neutral-400 leading-relaxed uppercase tracking-wide">{trainer.bio}</p>

                            <div className="grid gap-4 sm:grid-cols-2 pt-2 text-xs font-mono">
                                <div className="space-y-1 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                                    <h3 className="font-bold text-neutral-500 uppercase text-[9px] tracking-widest flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-[#22d3ee]" /> EXPERIENCE
                                    </h3>
                                    <p className="text-neutral-300 font-bold uppercase">{trainer.experience} years coaching</p>
                                </div>
                                <div className="space-y-1 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                                    <h3 className="font-bold text-neutral-500 uppercase text-[9px] tracking-widest flex items-center gap-1.5">
                                        <Target className="h-3.5 w-3.5 text-[#22d3ee]" /> FOCUS
                                    </h3>
                                    <p className="text-neutral-300 font-bold uppercase">{trainer.specialization}</p>
                                </div>
                            </div>
                        </div>

                        {/* Certifications Section */}
                        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
                            <h2 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">VERIFIED CREDENTIALS</h2>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="group flex items-center justify-between gap-3 p-4 bg-[#0d0d0e] border border-[#262626] rounded-xl hover:border-neutral-700 transition-colors w-full text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#171717] border border-[#262626] rounded-lg text-[#22d3ee]">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="font-mono text-xs">
                                        <p className="font-bold text-white uppercase">Professional Certificate</p>
                                        <p className="text-[10px] text-neutral-500 uppercase">Click to view credential dossier</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-600" />
                            </button>
                        </div>

                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogContent className="max-w-2xl bg-[#171717] border-2 border-[#262626] rounded-2xl p-6 text-white font-mono">
                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-base font-extrabold text-white uppercase tracking-tight">
                                        Professional Credentials
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="border border-[#262626] rounded-xl overflow-hidden bg-[#0d0d0e]">
                                    <img
                                        src={trainer.certificate}
                                        alt="Professional Certificate"
                                        className="w-full h-auto object-contain max-h-[70vh] opacity-90"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-6">
                        {/* Contact Widget */}
                        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-[#22d3ee]" /> Contact Channels
                            </h3>
                            
                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex items-center gap-3 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                                    <Phone className="h-4 w-4 text-[#22d3ee]" />
                                    <div>
                                        <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Phone</p>
                                        <p className="text-xs font-bold text-white">{trainer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-[#0d0d0e] p-3 rounded-xl border border-[#262626]">
                                    <Mail className="h-4 w-4 text-[#22d3ee]" />
                                    <div className="overflow-hidden">
                                        <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Email</p>
                                        <p className="text-xs font-bold truncate text-white">{trainer.email}</p>
                                    </div>
                                </div>
                            </div>

                            {user?.trainerPlan && isSameTrainer && (
                                <button
                                    onClick={handleChat}
                                    className="duo-btn-cyan w-full h-11 text-xs font-mono font-bold uppercase tracking-wider mt-2"
                                >
                                    <MessageSquare className="h-4 w-4 mr-1.5 inline-block" /> Chat with Coach
                                </button>
                            )}
                        </div>

                        {/* Pricing Quick Info */}
                        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-4 font-mono">
                            <h3 className="text-sm font-extrabold uppercase text-white tracking-wide flex items-center gap-2">
                                <Crown className="h-4 w-4 text-[#22d3ee]" /> Subscription Plans
                            </h3>

                            <div className="space-y-3">
                                {[
                                    { type: 'basic', label: 'Basic', price: trainer.price?.basic },
                                    { type: 'premium', label: 'Premium', price: trainer.price?.premium, popular: true },
                                    { type: 'pro', label: 'Pro', price: trainer.price?.pro }
                                ].map((plan) => (
                                    <div
                                        key={plan.type}
                                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-colors ${
                                            plan.popular
                                                ? 'bg-cyan-500/5 border-[#22d3ee]'
                                                : 'bg-[#0d0d0e] border-[#262626]'
                                        }`}
                                    >
                                        <div>
                                            <h4 className="font-extrabold text-white uppercase text-[10px]">{plan.label}</h4>
                                            <p className="text-[8px] text-neutral-500 uppercase tracking-wider">Per Month</p>
                                        </div>
                                        <span className="font-extrabold text-[#22d3ee] text-xs">₹{(Number(plan.price) || 0).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2">
                                {isSameTrainer ? (
                                    <button
                                        disabled
                                        className="duo-btn-outline w-full h-11 text-xs font-bold uppercase tracking-wider opacity-60 cursor-not-allowed"
                                    >
                                        Active Enrollment
                                    </button>
                                ) : (
                                    <button
                                        onClick={openSubscriptionModal}
                                        disabled={hasTrainer}
                                        className="duo-btn-cyan w-full h-11 text-xs font-bold uppercase tracking-wider"
                                    >
                                        Choose Plan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <TrainerReviews
                        trainerId={trainer._id}
                        onReviewAdded={handleReviewAdded}
                        canReview={hasTrainer && isSameTrainer}
                        currentUserPlan={user?.trainerPlan}
                    />
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
