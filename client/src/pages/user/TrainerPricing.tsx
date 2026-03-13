import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Check, Crown, Star, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { getIndividualTrainer } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import type { Trainer } from "@/interfaces/user/IIndividualTrainer";

export default function TrainerPricingPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState<number>(1);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTrainer();
        }
    }, [id]);

    const fetchTrainer = async () => {
        setIsLoading(true);
        try {
            const response = await getIndividualTrainer(id!);
            const trainerData = response.trainer;

            if (trainerData && typeof trainerData.price === "string") {
                try {
                    trainerData.price = JSON.parse(trainerData.price);
                } catch (e) {
                    console.error("Failed to parse price:", e);
                }
            }

            setTrainer(trainerData);
        } catch (err) {
            console.error("Failed to fetch trainer:", err);
            toast.error("Failed to load trainer details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubscribe = async (planType: string) => {
        if (!trainer) return;

        setProcessingPayment(true);
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
                                setProcessingPayment(false);
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
                    } finally {
                        setProcessingPayment(false);
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
                setProcessingPayment(false);
            } finally {
                document.body.removeChild(script);
            }
        };

        script.onerror = () => {
            toast.error("Failed to load Razorpay SDK");
            document.body.removeChild(script);
            setProcessingPayment(false);
        };
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
            <div className="min-h-screen bg-[#030303] flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white space-y-4">
                <h1 className="text-2xl font-bold">Trainer Not Found</h1>
                <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
            </div>
        );
    }

    const plans = [
        {
            type: "basic",
            title: "Basic",
            subtitle: "Kickstart your journey",
            icon: <Zap className="h-6 w-6 text-blue-500" />,
            basePrice: trainer.price?.basic || 0,
            features: [
                "Personal workout plans",
                "Custom diet plans",
                "Progress tracking",
                "Basic support"
            ],
            styles: {
                border: "border-blue-500/50",
                bg: "bg-blue-500/5",
                iconBg: "bg-blue-500/10",
                featureBg: "bg-blue-500/20",
                checkColor: "text-blue-600",
                button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
                badge: "bg-blue-500"
            },
            popular: false
        },
        {
            type: "premium",
            title: "Premium",
            subtitle: "Most popular choice",
            icon: <Crown className="h-6 w-6 text-amber-500" />,
            basePrice: trainer.price?.premium || 0,
            features: [
                "Everything in Basic",
                "Limited chat (200 msgs/mo)",
                "Priority support",
                "Weekly check-ins"
            ],
            styles: {
                border: "border-amber-500/50",
                bg: "bg-amber-500/5",
                iconBg: "bg-amber-500/10",
                featureBg: "bg-amber-500/20",
                checkColor: "text-amber-600",
                button: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/25",
                badge: "bg-amber-500"
            },
            popular: true
        },
        {
            type: "pro",
            title: "Pro",
            subtitle: "Ultimate experience",
            icon: <Star className="h-6 w-6 text-purple-500" />,
            basePrice: trainer.price?.pro || 0,
            features: [
                "Everything in Premium",
                "Unlimited chat access",
                "Video calls (5/month)",
                "24/7 VIP support"
            ],
            styles: {
                border: "border-purple-500/50",
                bg: "bg-purple-500/5",
                iconBg: "bg-purple-500/10",
                featureBg: "bg-purple-500/20",
                checkColor: "text-purple-600",
                button: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/25",
                badge: "bg-purple-500"
            },
            popular: false
        }
    ];

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white font-outfit overflow-x-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
            </div>

            <SiteHeader />

            <div className="relative z-10 flex-1 container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="ghost"
                        className="group hover:bg-white/5 text-muted-foreground hover:text-white mb-4 pl-0"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Profile
                    </Button>
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                            Choose Your Plan
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Start your journey with <span className="text-primary font-semibold">{trainer.name}</span>
                        </p>
                    </div>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                        <Tabs
                            value={duration.toString()}
                            onValueChange={(val) => setDuration(parseInt(val))}
                            className="w-auto"
                        >
                            <TabsList className="bg-transparent border-0 h-auto p-0 gap-1">
                                {durations.map((d) => (
                                    <TabsTrigger
                                        key={d.value}
                                        value={d.value.toString()}
                                        className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground hover:text-white transition-all font-medium"
                                    >
                                        {d.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {plans.map((plan) => (
                        <div
                            key={plan.type}
                            className={`relative flex flex-col rounded-3xl border transition-all duration-500 group hover:-translate-y-2 ${plan.popular
                                ? `${plan.styles.border} ${plan.styles.bg} shadow-[0_0_50px_-12px] shadow-amber-500/30 z-10 scale-105 md:scale-110`
                                : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg uppercase tracking-wide flex items-center gap-2 border border-amber-400/50">
                                    <Crown className="h-4 w-4 fill-current" /> Most Popular
                                </div>
                            )}

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="text-center mb-8">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl ${plan.styles.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="font-bold text-2xl mb-2">{plan.title}</h3>
                                    <p className="text-muted-foreground">{plan.subtitle}</p>
                                </div>

                                <div className="mb-8 text-center p-6 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold tracking-tight">
                                            ₹{calculatePrice(plan.basePrice, duration).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {duration > 1 ? `Total for ${duration} months` : 'Per month'}
                                    </p>
                                    {duration > 1 && (
                                        <p className="text-xs text-primary mt-1 font-medium bg-primary/10 inline-block px-2 py-0.5 rounded">
                                            ₹{plan.basePrice.toLocaleString()}/mo equivalent
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4 flex-1 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-4 group/item">
                                            <div className={`mt-0.5 rounded-full p-1 ${plan.styles.featureBg} group-hover/item:scale-110 transition-transform`}>
                                                <Check className={`h-3 w-3 ${plan.styles.checkColor}`} strokeWidth={3} />
                                            </div>
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => handleSubscribe(plan.type)}
                                    disabled={processingPayment}
                                    className={`w-full py-6 font-bold text-lg rounded-xl shadow-lg transition-all duration-300 ${plan.popular
                                        ? `${plan.styles.button} text-white hover:shadow-amber-500/25`
                                        : "bg-white text-black hover:bg-gray-200 hover:shadow-white/10"
                                        }`}
                                >
                                    {processingPayment ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Get Started"
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center pb-8">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        Secure payment processing via Razorpay. Cancel anytime.
                    </p>
                </div>
            </div>

            <SiteFooter />
        </div>
    );
}
