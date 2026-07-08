import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { 
    Check, 
    Shield, 
    CreditCard, 
    ArrowLeft, 
    Zap, 
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { motion, AnimatePresence } from "framer-motion";
import { getGymForUser, getActiveSubscriptionPlans } from "@/services/gymService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const timeSlots = [
    "05:00 AM", "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
    "09:00 PM", "10:00 PM"
];

export default function GymPlanSelection() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [gym, setGym] = useState<SafeAny>(null);
    const [plans, setPlans] = useState<SafeAny[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>(location.state?.selectedPlanId || "");
    const [preferredTime, setPreferredTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [gymRes, plansRes] = await Promise.all([
                getGymForUser(id!),
                getActiveSubscriptionPlans(id!)
            ]);
            setGym(gymRes.gym);
            setPlans(plansRes.plans || []);
            setSelectedPlanId(prev => {
                if (!prev && plansRes.plans?.length > 0) {
                    return plansRes.plans[0]._id;
                }
                return prev;
            });
        } catch (_error) {
            toast.error("Failed to load details");
            navigate("/gyms");
        } finally {
            setIsLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    const handleSubscribe = async () => {
        if (!selectedPlanId || !preferredTime) {
            toast.error("Please select a plan and a preferred time");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await API.post("/payment/create-gym-checkout-session", {
                subscriptionPlanId: selectedPlanId,
                gymId: id,
                preferredTime
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (errorVal) {
            const error = errorVal as SafeAny;
            console.error("Failed to initiate payment:", error);
            const errorMessage = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing payment gateways...</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    const selectedPlan = plans.find(p => p._id === selectedPlanId);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-6 py-12 space-y-8 flex-1 z-10 max-w-5xl w-full">
                <div className="flex justify-start">
                    <Link to={`/gym/${id}`}>
                        <button className="duo-btn-gray h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <ArrowLeft className="h-4 w-4" /> Back to {gym?.name}
                        </button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Plan Selection */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/5 border border-[#22d3ee]/20 rounded-lg">
                                <Sparkles size={12} className="text-[#22d3ee]" />
                                <span className="text-[9px] font-mono font-bold text-[#22d3ee] uppercase tracking-wider">Secure Checkout</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-extrabold font-mono text-white uppercase tracking-tight">CHOOSE YOUR SUBSCRIPTION</h1>
                            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">Select the membership plan that best fits your fitness journey at {gym?.name}.</p>
                        </div>

                        <div className="grid gap-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan._id}
                                    onClick={() => setSelectedPlanId(plan._id)}
                                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
                                        selectedPlanId === plan._id
                                            ? "border-[#22d3ee] bg-cyan-500/5 border-bottom-[5px] border-b-[#06b6d4]"
                                            : "border-[#262626] border-b-[5px] border-b-[#1f1f1f] bg-[#171717] hover:border-neutral-500"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl transition-all ${
                                            selectedPlanId === plan._id ? "bg-[#22d3ee] text-[#090909]" : "bg-[#0d0d0e] text-neutral-500 border border-[#262626]"
                                        }`}>
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-extrabold font-mono uppercase text-white">{plan.name}</h3>
                                            <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{plan.duration} {plan.durationUnit}(s)</p>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono">
                                        <p className="text-base font-extrabold text-white">₹{plan.price}</p>
                                        {selectedPlanId === plan._id && (
                                            <div className="flex justify-end text-[#22d3ee] mt-1">
                                                <CheckCircle2 size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4">
                            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                                PREFERRED TRAINING HOUR <span className="text-[#22d3ee]">*</span>
                            </label>
                            <Select value={preferredTime} onValueChange={setPreferredTime}>
                                <SelectTrigger className="h-12 bg-[#0d0d0e] border-2 border-[#262626] rounded-xl text-white font-mono text-xs uppercase tracking-wider focus:border-[#22d3ee] transition-all w-full px-4 flex items-center justify-between">
                                    <SelectValue placeholder="When will you hit the gym?" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#171717] border-2 border-[#262626] text-white rounded-xl max-h-[250px] font-mono text-xs">
                                    {timeSlots.map((slot) => (
                                        <SelectItem key={slot} value={slot} className="focus:bg-[#22d3ee] focus:text-[#090909] rounded-lg py-2.5 font-bold uppercase cursor-pointer">
                                            {slot}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wide">
                                We will send a reminder if you have not checked in within 10 minutes of your selected time.
                            </p>
                        </div>
                    </div>

                    {/* Right: Summary Card */}
                    <div>
                        <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 md:p-8 space-y-6 sticky top-12 shadow-lg">
                            <h3 className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500">DEPARTURE DOSSIER</h3>
                            
                            <AnimatePresence mode="wait">
                                {selectedPlan ? (
                                    <motion.div
                                        key={selectedPlan._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-3 font-mono text-xs text-neutral-300 uppercase">
                                            {selectedPlan.features.map((feature: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2.5">
                                                    <Check className="h-4 w-4 text-[#22d3ee] shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-6 border-t border-[#262626] space-y-3 font-mono text-xs">
                                            <div className="flex justify-between items-center text-neutral-400 font-bold uppercase">
                                                <span>Membership Tier</span>
                                                <span className="text-white font-extrabold">₹{selectedPlan.price}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-neutral-400 font-bold uppercase">
                                                <span>System Taxes</span>
                                                <span className="text-white font-extrabold text-[10px]">INCLUSIVE</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-[#262626]/60">
                                                <span className="text-sm font-extrabold text-white uppercase">Total Investment</span>
                                                <span className="text-2xl font-extrabold text-[#22d3ee]">₹{selectedPlan.price}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-32 flex items-center justify-center border-2 border-dashed border-[#262626] rounded-xl bg-[#0d0d0e]">
                                        <p className="text-neutral-500 font-mono text-xs uppercase tracking-wider">Select a Protocol</p>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-4 pt-2">
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isProcessing || !selectedPlanId || !preferredTime}
                                    className="duo-btn-cyan w-full h-14 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-[#090909]/20 border-t-[#090909] rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4" />
                                            Initialize Access
                                        </>
                                    )}
                                </button>
                                <p className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5 text-[#22d3ee]" /> Secured Encrypted Payment Gateway
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
