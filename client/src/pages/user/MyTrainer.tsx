import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Shield,
    AlertTriangle,
    Video,
    Calendar,
    Crown,
    CheckCircle2,
    Zap,
    Trophy,
    Target
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import API from "@/lib/axios";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDistanceToNow, addMonths } from "date-fns";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TrainerReviews from "@/components/user/reviews/TrainerReviews";
import Aurora from "@/components/ui/Aurora";
import { motion } from "framer-motion";
import { BundlePurchaseModal } from "@/components/user/BundlePurchaseModal";

import type { User, Trainer, UserPlan } from "@/interfaces/user/IMyTrainer";

const SpotlightCard = ({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.15)"
}: {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState<number>(0);

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
        if (!divRef.current || isFocused) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => { setIsFocused(true); setOpacity(0.3); };
    const handleBlur = () => { setIsFocused(false); setOpacity(0); };
    const handleMouseEnter = () => setOpacity(0.3);
    const handleMouseLeave = () => setOpacity(0);

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden transition-all duration-500 hover:bg-glass-hover ${className}`}
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

export default function MyTrainerProfile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [isCertOpen, setIsCertOpen] = useState(false);
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);



    const fetchMyTrainer = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await API.get("/user/my-trainer");
            setTrainer(response.data.trainer);
        } catch (_err: unknown) {
            console.error("Failed to fetch my trainer:", _err);
            setError("Failed to load trainer details");
            toast.error("Failed to load trainer details");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = useCallback(async () => {
        try {
            const response = await API.get("/user/me");
            setUser(response.data.user);
        } catch (_err: unknown) {
            console.error("Failed to fetch user:", _err);
        }
    }, []);

    const fetchUserPlan = useCallback(async () => {
        try {
            const response = await API.get("/user/plan");
            setUserPlan(response.data.plan);
        } catch (_err: unknown) {
            console.error("Failed to fetch user plan:", _err);
        }
    }, []);

    useEffect(() => {
        document.title = "TrainUp - My Trainer";
        fetchMyTrainer();
        fetchUser();
        fetchUserPlan();
    }, [fetchMyTrainer, fetchUser, fetchUserPlan]);

    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelSubscription = async () => {
        setIsCancelling(true);
        try {
            await API.post("/user/cancel-subscription");
            toast.success("Subscription cancelled successfully");
            
            // Invalidate dashboard cache
            dispatch({ type: 'dashboard/invalidateCache' });

            // Sync Redux state
            dispatch(updateUser({ 
                assignedTrainer: undefined, 
                assignedTrainerDetails: null,
                trainerPlan: null
            }));
            
            setTrainer(null);
            setUser(null);
            navigate('/trainers');
        } catch (_err: unknown) {
            console.error("Failed to cancel subscription:", _err);
            toast.error("Failed to cancel subscription");
        } finally {
            setIsCancelling(false);
        }
    };

    const getRemainingTime = () => {
        if (userPlan?.expiryDate) {
            const expiry = new Date(userPlan.expiryDate);
            return formatDistanceToNow(expiry, { addSuffix: true });
        }
        if (!user?.subscriptionStartDate) return "Unknown";
        const startDate = new Date(user.subscriptionStartDate);
        const endDate = addMonths(startDate, 1);
        return formatDistanceToNow(endDate, { addSuffix: true });
    };

    const getDaysLeft = () => {
        if (!userPlan?.expiryDate) return 0;
        const expiry = new Date(userPlan.expiryDate);
        const today = new Date();
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'basic': return { label: 'Basic', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Star };
            case 'premium': return { label: 'Premium', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Zap };
            case 'pro': return { label: 'Pro', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Crown };
            default: return { label: plan, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Award };
        }
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-site-bg text-foreground overflow-hidden font-outfit">
                <div className="absolute inset-0 z-0">
                    <Aurora colorStops={["var(--background)", "var(--site-bg)", "var(--background)"]} amplitude={1.1} blend={0.6} />
                </div>
                <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6 flex-1">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Syncing Trainer Data...</p>
                </div>
            </div>
        );
    }

    if (error || !trainer) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-site-bg text-foreground overflow-hidden font-outfit">
                <div className="absolute inset-0 z-0">
                    <Aurora colorStops={["var(--background)", "var(--site-bg)", "var(--background)"]} amplitude={1.1} blend={0.6} />
                </div>
                <div className="relative container mx-auto px-4 py-16 text-center space-y-8 flex-1 flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-glass-bg rounded-full flex items-center justify-center mb-6 border border-glass-border ring-4 ring-primary/5">
                        <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">No Active Trainer</h1>
                    <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">{error || "You haven't assigned a personal trainer to your profile yet. Ready to start your journey?"}</p>
                    <Link to="/trainers">
                        <Button className="bg-primary text-primary-foreground hover:opacity-90 px-10 h-14 rounded-2xl font-black italic uppercase tracking-widest shadow-2xl">
                            Find a Trainer <Zap className="ml-2 h-4 w-4 fill-current" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const planInfo = getPlanBadge(user?.trainerPlan || 'basic');
    const PlanIcon = planInfo.icon;

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-site-bg text-foreground overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["var(--background)", "var(--site-bg)", "var(--background)"]} amplitude={1.1} blend={0.6} />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-12 space-y-12 flex-1 z-10">
                {/* Hero Profile Section */}
                <SpotlightCard className="p-8 md:p-12">
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
                        <div className="relative">
                            <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-white/5">
                                <img
                                    src={trainer.profileImage || "/placeholder.svg"}
                                    alt={trainer.name}
                                    className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
                            </div>
                            {trainer.isVerified && (
                                <div className="absolute -top-3 -right-3 bg-green-500 text-black p-3 rounded-2xl shadow-xl border-4 border-[#030303]">
                                    <Shield className="h-6 w-6 fill-black" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border border-primary/30">
                                    <Trophy className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-black italic uppercase text-primary">Your Elite Coach</span>
                                </div>
                                <Badge className={`${planInfo.color} font-black italic uppercase px-4 py-2 text-xs rounded-full border shadow-lg`}>
                                    <PlanIcon className="h-4 w-4 mr-2" />
                                    {planInfo.label} Plan
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-foreground">
                                    {trainer.name}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                        <span className="text-foreground">{trainer.rating} RATING</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="text-foreground">{trainer.experience} YRS EXP</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-accent" />
                                        <span className="text-foreground truncate max-w-[150px]">{trainer.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                {user?.trainerPlan !== 'basic' && (
                                    <Button
                                        onClick={() => navigate(`/my-trainer/chat/${trainer._id}`)}
                                        className="h-14 px-8 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl font-black italic uppercase tracking-widest text-sm shadow-xl"
                                    >
                                        <MessageSquare className="mr-2 h-5 w-5 fill-current" /> Chat Support
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/my-trainer/sessions')}
                                    className="h-14 px-8 bg-glass-bg border-glass-border hover:bg-glass-hover rounded-2xl font-black italic uppercase tracking-widest text-sm text-foreground"
                                >
                                    <Calendar className="mr-2 h-5 w-5" /> Schedule
                                </Button>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-14 px-8 text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-2xl font-black italic uppercase tracking-widest text-sm"
                                        >
                                            <AlertTriangle className="mr-2 h-5 w-5" /> End Coaching
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-2xl font-black italic uppercase">End Coaching?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-muted-foreground font-medium py-4">
                                                Your current plan with {trainer.name} expires {getRemainingTime()}. 
                                                Ending your coaching now will end your access immediately. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-4">
                                            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-xl font-bold uppercase text-xs">Stay Active</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleCancelSubscription}
                                                disabled={isCancelling}
                                                className="bg-red-500 text-white hover:bg-red-600 h-12 rounded-xl font-bold uppercase text-xs"
                                            >
                                                {isCancelling ? "Ending..." : "Confirm"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </SpotlightCard>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Plan Status Bento */}
                        {user?.trainerPlan && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SpotlightCard className="p-6 flex flex-col items-center justify-center text-center gap-2 group">
                                    <div className="p-3 bg-primary/20 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Time Remaining</p>
                                        <p className="text-3xl font-black italic uppercase">{getDaysLeft()} Days</p>
                                    </div>
                                </SpotlightCard>

                                <SpotlightCard className="p-6 flex flex-col items-center justify-center text-center gap-2 group">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                        <MessageSquare className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Messages Left</p>
                                        <p className="text-3xl font-black italic uppercase">
                                            {user.trainerPlan === 'pro' ? '∞' : (userPlan?.messagesLeft ?? 0)}
                                        </p>
                                    </div>
                                </SpotlightCard>

                                <SpotlightCard className="p-6 flex flex-col items-center justify-center text-center gap-2 group relative overflow-hidden">
                                    <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Video className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Calls Remaining</p>
                                        <p className="text-3xl font-black italic uppercase">
                                            {user.trainerPlan === 'pro' ? (userPlan?.videoCallsLeft ?? 0) : '0'}
                                        </p>
                                    </div>
                                    
                                    {(userPlan?.videoCallsLeft ?? 0) === 0 && (
                                        <Button
                                            onClick={() => setIsBundleModalOpen(true)}
                                            size="sm"
                                            className="h-8 mt-2 bg-purple-500 hover:bg-purple-600 text-white font-black italic uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95"
                                        >
                                            <Zap size={10} className="mr-1.5 fill-white" /> Top-up Sessions
                                        </Button>
                                    )}
                                </SpotlightCard>
                            </div>
                        )}

                        <SpotlightCard className="p-8 md:p-10 space-y-8">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-foreground">
                                <Award className="h-8 w-8 text-primary" /> The Coach's Philosophy
                            </h2>
                            <p className="text-xl font-medium text-muted-foreground leading-relaxed italic">
                                "{trainer.bio}"
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-primary" />
                                        <h3 className="font-black italic uppercase tracking-widest text-xs">Specialization</h3>
                                    </div>
                                    <p className="text-gray-400 font-bold uppercase text-sm">{trainer.specialization}</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <h3 className="font-black italic uppercase tracking-widest text-xs">Credentials</h3>
                                    </div>
                                    <button 
                                        onClick={() => setIsCertOpen(true)}
                                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-bold uppercase tracking-widest group"
                                    >
                                        View Certificate <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </SpotlightCard>

                        <div className="mt-8">
                            <TrainerReviews
                                trainerId={trainer._id}
                                onReviewAdded={fetchMyTrainer}
                                canReview={true}
                                currentUserPlan={user?.trainerPlan}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Plan Details Sidebar */}
                        <SpotlightCard className="p-8 space-y-8 border-glass-border">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase text-foreground">Subscription Details</h3>
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/20 font-black italic uppercase text-[10px]">Active</Badge>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <span>Expiry Date</span>
                                        <span className="text-foreground">{getRemainingTime()}</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (getDaysLeft() / 30) * 100)}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic font-medium">Synced with Stripe Billing</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-glass-border">
                                    <h4 className="text-xs font-black italic uppercase tracking-widest text-foreground">What's Included</h4>
                                    <div className="space-y-3">
                                        {[
                                            "Custom Workouts",
                                            "Meal Plans",
                                            user?.trainerPlan !== 'basic' ? "Direct Chat Support" : null,
                                            user?.trainerPlan === 'pro' ? "1-on-1 Video Sessions" : null
                                        ].filter(Boolean).map((perk, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span>{perk}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* Contact Sidebar */}
                        <SpotlightCard className="p-8 space-y-6">
                            <h3 className="text-xl font-black italic uppercase text-foreground">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 bg-muted p-4 rounded-2xl border border-border">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mobile</p>
                                        <p className="font-bold truncate text-foreground">{trainer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-muted p-4 rounded-2xl border border-border">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                                        <p className="font-bold truncate text-foreground">{trainer.email}</p>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </main>

            <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
                <DialogContent className="max-w-4xl bg-background border-border p-2 overflow-hidden rounded-[2rem]">
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-2xl font-black italic uppercase text-foreground">Credentials</DialogTitle>
                    </DialogHeader>
                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-border">
                        <img 
                            src={trainer.certificate} 
                            alt="Credentials" 
                            className="w-full h-full object-contain bg-muted" 
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <BundlePurchaseModal
                isOpen={isBundleModalOpen}
                onClose={() => setIsBundleModalOpen(false)}
                trainerId={trainer._id}
                trainerName={trainer.name}
                bundles={trainer.sessionBundles || []}
            />

            <SiteFooter />
        </div>
    );
}