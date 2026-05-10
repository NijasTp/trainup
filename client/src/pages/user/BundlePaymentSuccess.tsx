import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/ui/Aurora";
import API from "@/lib/axios";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export default function BundlePaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isVerifying, setIsVerifying] = useState(true);
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        } else {
            setIsVerifying(false);
        }

        // Auto-redirect after 5 seconds to My Trainer profile
        const timer = setTimeout(() => {
            navigate(ROUTES.MY_TRAINER_PROFILE);
        }, 5000);

        return () => clearTimeout(timer);
    }, [sessionId, navigate]);

    const verifyPayment = async () => {
        try {
            const response = await API.get(`/payment/session-status/${sessionId}`);
            if (response.data.status === 'complete' || response.data.status === 'paid') {
                toast.success("Your sessions have been added!");
            }
        } catch (error) {
            console.error("Verification error:", error);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-site-bg text-foreground font-outfit overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["var(--background)", "var(--site-bg)", "var(--background)"]}
                    amplitude={1.1}
                    blend={0.6}
                />
            </div>

            <div className="relative z-10 max-w-md w-full mx-auto p-8 rounded-[2.5rem] bg-glass-bg border border-glass-border backdrop-blur-xl shadow-2xl text-center">
                {isVerifying ? (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase">Updating...</h1>
                        <p className="text-muted-foreground">Confirming your new sessions.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/20">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        
                        <div className="space-y-3">
                            <h1 className="text-4xl font-black italic uppercase text-foreground">
                                PAYMENT SUCCESS
                            </h1>
                            <p className="text-xl font-bold text-foreground">Sessions Ready</p>
                            <p className="text-muted-foreground">
                                Your session top-up was successful. You can now book your next call.
                            </p>
                        </div>

                        <div className="bg-muted rounded-2xl p-4 border border-border flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Secure Transaction</p>
                                <p className="text-sm font-bold text-foreground truncate">ID: {sessionId?.slice(0, 20)}...</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button 
                                onClick={() => navigate(ROUTES.MY_TRAINER_PROFILE)} 
                                className="w-full bg-primary text-primary-foreground hover:opacity-90 h-14 font-black italic uppercase tracking-widest rounded-xl group transition-all"
                            >
                                Back to Coach
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
