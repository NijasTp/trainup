import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/ui/Aurora";
import API from "@/lib/axios";
import { toast } from "sonner";

export default function GymPaymentSuccess() {
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
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const response = await API.get(`/payment/gym-session-status/${sessionId}`);
            if (response.data.status === 'complete' || response.data.status === 'paid') {
                toast.success("Gym subscription activated!");
            }
        } catch (error) {
            console.error("Verification error:", error);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#030303] text-white font-outfit overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
            </div>

            <div className="relative z-10 max-w-md w-full mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl text-center">
                {isVerifying ? (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">Verifying Subscription...</h1>
                        <p className="text-muted-foreground">Welcome to the elite gym squad.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-primary/20">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                                You're In!
                            </h1>
                            <p className="text-xl font-medium text-gray-200">Membership Activated</p>
                            <p className="text-muted-foreground">
                                Your gym subscription is now live. Time to crush those goals!
                            </p>
                        </div>

                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Dumbbell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Secure Enrollment</p>
                                <p className="text-sm font-medium text-gray-300">ID: {sessionId?.slice(0, 15)}...</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button 
                                onClick={() => navigate("/gym-dashboard")} 
                                className="w-full bg-primary text-black hover:bg-primary/90 py-6 font-bold text-lg rounded-xl group transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                            >
                                Go to Gym Dashboard
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button 
                                onClick={() => navigate("/")} 
                                variant="ghost" 
                                className="w-full hover:bg-white/5 text-muted-foreground"
                            >
                                Back to Home
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
