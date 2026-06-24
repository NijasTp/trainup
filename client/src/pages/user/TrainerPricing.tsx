import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Zap, Check, Crown, Star, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { getIndividualTrainer } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import type { Trainer } from "@/interfaces/user/iIndividualTrainer";

type SafeAny = any;

export default function TrainerPricingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState<number>(1);
    const [processingPayment, setProcessingPayment] = useState(false);

    const fetchTrainer = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getIndividualTrainer(id!);
            const trainerData = response.trainer;

            if (trainerData && typeof trainerData.price === "string") {
                try {
                    trainerData.price = JSON.parse(trainerData.price);
                } catch (eVal) {
                    const e = eVal as SafeAny;
                    console.error("Failed to parse price:", e);
                }
            }

            setTrainer(trainerData);
        } catch (errVal) {
            const err = errVal as SafeAny;
            console.error("Failed to fetch trainer:", err);
            toast.error("Failed to load trainer details");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchTrainer();
        }
    }, [id, fetchTrainer]);

    const handleSubscribe = async (planType: string) => {
        if (!trainer) return;

        setProcessingPayment(true);
        try {
            const trainerPrice = trainer.price;
            const basePrice = trainerPrice[planType as keyof typeof trainerPrice];
            const totalAmount = basePrice * duration;

            const response = await API.post("/payment/create-checkout-session", {
                amount: totalAmount,
                trainerId: trainer._id,
                planType,
                duration
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                throw new Error("No checkout URL received");
            }
        } catch (errVal) {
            const err = errVal as SafeAny;
            console.error("Failed to initiate payment:", err);
            const errorMessage = err.response?.data?.message || err.message || "Failed to initiate payment";
            toast.error(errorMessage);
            setProcessingPayment(false);
        }
    };

    const durations = [
        { label: "1 Month", value: 1 },
        { label: "3 Months", value: 3 },
        { label: "6 Months", value: 6 },
    ];

    const calculatePrice = (basePrice: number, months: number) => {
        return basePrice * months;
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
                    <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing session plans...</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
                <SiteHeader />
                <div className="flex-grow flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6 space-y-4">
                    <h1 className="text-xl font-extrabold font-mono text-white uppercase">Trainer Not Found</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="duo-btn-cyan h-11 px-5 text-xs font-mono font-bold uppercase tracking-wider"
                    >
                        Go Back
                    </button>
                </div>
                <SiteFooter />
            </div>
        );
    }

    const plans = [
        {
            type: "basic",
            title: "Basic",
            subtitle: "Kickstart your journey",
            icon: <Zap className="h-5 w-5 text-cyan-400" />,
            basePrice: trainer.price?.basic || 0,
            features: [
                "Personal workout plans",
                "Custom diet plans",
                "Progress tracking",
                "Basic support"
            ],
            styles: {
                border: "border-[#262626] border-b-[#1f1f1f]",
                bg: "bg-[#171717]",
                iconBg: "bg-[#0d0d0e]",
                checkColor: "text-[#22d3ee]",
                button: "duo-btn-cyan"
            },
            popular: false
        },
        {
            type: "premium",
            title: "Premium",
            subtitle: "Most popular choice",
            icon: <Crown className="h-5 w-5 text-amber-500" />,
            basePrice: trainer.price?.premium || 0,
            features: [
                "Everything in Basic",
                "Limited chat (200 msgs/mo)",
                "Priority support",
                "Weekly check-ins"
            ],
            styles: {
                border: "border-[#22d3ee] border-b-[#06b6d4]",
                bg: "bg-cyan-950/10",
                iconBg: "bg-[#0d0d0e]",
                checkColor: "text-[#22d3ee]",
                button: "duo-btn-cyan"
            },
            popular: true
        },
        {
            type: "pro",
            title: "Pro",
            subtitle: "Ultimate experience",
            icon: <Star className="h-5 w-5 text-purple-400" />,
            basePrice: trainer.price?.pro || 0,
            features: [
                "Everything in Premium",
                "Unlimited chat access",
                "Video calls (5/month)",
                "24/7 VIP support"
            ],
            styles: {
                border: "border-[#262626] border-b-[#1f1f1f]",
                bg: "bg-[#171717]",
                iconBg: "bg-[#0d0d0e]",
                checkColor: "text-[#22d3ee]",
                button: "duo-btn-cyan"
            },
            popular: false
        }
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
            </div>

            <SiteHeader />

            <main className="relative container mx-auto px-6 py-12 space-y-8 flex-1 z-10 max-w-5xl w-full">
                <div className="flex justify-start">
                    <button
                        onClick={() => navigate(-1)}
                        className="duo-btn-gray h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Profile
                    </button>
                </div>

                <div className="text-center space-y-3">
                    <h1 className="text-2xl md:text-4xl font-extrabold font-mono text-white uppercase tracking-tight">
                        COACH SUBSCRIPTION PLANS
                    </h1>
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
                        Choose your training duration and package tier to start training with <span className="text-white font-bold">{trainer.name}</span>
                    </p>
                </div>

                {/* Duration Pills */}
                <div className="flex justify-center gap-3 mb-10 font-mono">
                    {durations.map((d) => (
                        <button
                            key={d.value}
                            onClick={() => setDuration(d.value)}
                            className={`h-11 px-5 text-xs font-bold uppercase tracking-wider ${
                                duration === d.value
                                    ? "duo-btn-cyan"
                                    : "duo-btn-outline"
                            }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                {/* Pricing Grid */}
                <div className="grid md:grid-cols-3 gap-6 items-stretch font-mono">
                    {plans.map((plan) => (
                        <div
                            key={plan.type}
                            className={`relative duo-card-3d border-2 border-b-[5px] rounded-2xl flex flex-col p-6 transition-all duration-300 ${plan.styles.border} ${plan.styles.bg}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-3.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-amber-400">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex-1 flex flex-col justify-between space-y-6">
                                <div className="text-center border-b border-[#262626] pb-5">
                                    <div className={`w-12 h-12 mx-auto rounded-xl ${plan.styles.iconBg} border border-[#262626] flex items-center justify-center mb-3`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="font-extrabold text-base text-white uppercase">{plan.title}</h3>
                                    <p className="text-[10px] text-neutral-500 uppercase mt-0.5">{plan.subtitle}</p>
                                </div>

                                <div className="text-center p-4 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                                    <p className="text-xl font-extrabold text-[#22d3ee]">
                                        ₹{calculatePrice(plan.basePrice, duration).toLocaleString()}
                                    </p>
                                    <p className="text-[8px] text-neutral-500 uppercase tracking-wider mt-1">
                                        {duration > 1 ? `Total for ${duration} months` : 'Per month'}
                                    </p>
                                    {duration > 1 && (
                                        <span className="inline-block bg-cyan-950/20 text-[#22d3ee] border border-[#22d3ee]/20 text-[8px] font-bold px-2 py-0.5 rounded mt-2">
                                            ₹{plan.basePrice.toLocaleString()}/MO EQUIVALENT
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3 flex-1 text-xs text-neutral-300 uppercase">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.styles.checkColor}`} strokeWidth={3} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan.type)}
                                    disabled={processingPayment}
                                    className={`w-full h-12 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${plan.styles.button}`}
                                >
                                    {processingPayment ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Get Started"
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-4">
                    <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-emerald-400" />
                        Secure processing. Cancel/Manage subscriptions anytime.
                    </p>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
