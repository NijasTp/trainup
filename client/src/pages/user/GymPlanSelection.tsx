import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import Aurora from "@/components/ui/Aurora";
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
    const [gym, setGym] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>(location.state?.selectedPlanId || "");
    const [preferredTime, setPreferredTime] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    async function fetchData() {
        try {
            const [gymRes, plansRes] = await Promise.all([
                getGymForUser(id!),
                getActiveSubscriptionPlans(id!)
            ]);
            setGym(gymRes.gym);
            setPlans(plansRes.plans || []);
            if (!selectedPlanId && plansRes.plans?.length > 0) {
                setSelectedPlanId(plansRes.plans[0]._id);
            }
        } catch (error) {
            toast.error("Failed to load details");
            navigate("/gyms");
        } finally {
            setIsLoading(false);
        }
    }

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
            } else if (response.status === 409) {
                toast.warning("Payment Pending: You already have a transaction in progress.");
                setIsProcessing(false);
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (error: any) {
            console.error("Failed to initiate payment:", error);
            const errorMessage = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
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

    const selectedPlan = plans.find(p => p._id === selectedPlanId);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-12 flex-1 z-10">
                <Link to={`/gym/${id}`}>
                    <Button variant="ghost" className="mb-8 hover:bg-white/5 transition-all text-gray-400">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to {gym?.name}
                    </Button>
                </Link>

                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left: Plan Selection */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs font-black text-primary uppercase tracking-widest"
                                >
                                    <Sparkles size={12} /> Secure Checkout
                                </motion.div>
                                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Choose Your <span className="text-primary text-glow-primary">Power Level</span></h1>
                                <p className="text-gray-400 font-medium">Select the membership plan that best fits your fitness journey at {gym?.name}.</p>
                            </div>

                            <div className="grid gap-4">
                                {plans.map((plan) => (
                                    <motion.div
                                        key={plan._id}
                                        whileHover={{ x: 10 }}
                                        onClick={() => setSelectedPlanId(plan._id)}
                                        className={`cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between group ${
                                            selectedPlanId === plan._id
                                                ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]"
                                                : "border-white/5 bg-white/5 hover:bg-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`p-4 rounded-2xl transition-all ${
                                                selectedPlanId === plan._id ? "bg-primary text-black" : "bg-white/5 text-gray-500"
                                            }`}>
                                                <Zap className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black italic uppercase text-white">{plan.name}</h3>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{plan.duration} {plan.durationUnit}(s)</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white">₹{plan.price}</p>
                                            {selectedPlanId === plan._id && (
                                                <motion.div layoutId="check" className="flex justify-end text-primary">
                                                    <CheckCircle2 size={16} />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-4">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                    Preferred Training Time <span className="text-primary">*</span>
                                </label>
                                <Select value={preferredTime} onValueChange={setPreferredTime}>
                                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-white font-bold focus:ring-primary border-2 group hover:border-primary/50 transition-all">
                                        <SelectValue placeholder="When will you hit the gym?" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0f172a] border-white/10 text-white rounded-2xl max-h-[300px]">
                                        {timeSlots.map((slot) => (
                                            <SelectItem key={slot} value={slot} className="focus:bg-primary focus:text-black rounded-xl font-bold py-3">
                                                {slot}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-gray-500 font-bold italic uppercase tracking-widest">
                                    We'll send you a reminder if you haven't checked in 10 minutes after your preferred time.
                                </p>
                            </div>
                        </div>

                        {/* Right: Summary Card */}
                        <div className="lg:pl-12">
                            <Card className="bg-white/5 border-white/10 rounded-[3rem] p-8 lg:p-10 sticky top-12 shadow-2xl backdrop-blur-xl overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 opacity-5 -mr-8 -mt-8 rotate-12">
                                    <CreditCard size={200} />
                                </div>
                                <div className="relative space-y-8">
                                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 italic">Deployment Summary</h3>
                                    
                                    <AnimatePresence mode="wait">
                                        {selectedPlan ? (
                                            <motion.div
                                                key={selectedPlan._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="space-y-8"
                                            >
                                                <div className="space-y-4">
                                                    {selectedPlan.features.map((feature: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-4">
                                                            <div className="mt-1 p-1 bg-primary/20 rounded-full">
                                                                <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                                                            </div>
                                                            <span className="text-sm text-gray-300 font-bold italic">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="pt-8 border-t border-white/10 space-y-4">
                                                    <div className="flex justify-between items-center text-gray-400 font-bold italic uppercase text-xs tracking-widest">
                                                        <span>Membership Tier</span>
                                                        <span className="text-white">₹{selectedPlan.price}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-gray-400 font-bold italic uppercase text-xs tracking-widest">
                                                        <span>System Taxes</span>
                                                        <span className="text-white">Inclusive</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-4">
                                                        <span className="text-lg font-black text-white italic uppercase">Total Investment</span>
                                                        <span className="text-4xl font-black text-primary text-glow-primary">₹{selectedPlan.price}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem]">
                                                <p className="text-gray-500 font-black italic uppercase tracking-widest">Select a Protocol</p>
                                            </div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-4 pt-4">
                                        <Button
                                            onClick={handleSubscribe}
                                            disabled={isProcessing || !selectedPlanId || !preferredTime}
                                            className="w-full h-20 rounded-[2rem] bg-white text-black hover:bg-primary hover:text-white font-black uppercase italic tracking-widest text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center justify-center gap-4 group/btn"
                                        >
                                            {isProcessing ? (
                                                <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                                                    Initialize Access
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-[10px] text-zinc-600 text-center font-black uppercase tracking-widest flex items-center justify-center gap-2 italic">
                                            <Shield className="h-3 w-3 text-primary" /> End-to-End Encrypted Quantum Gateway
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
