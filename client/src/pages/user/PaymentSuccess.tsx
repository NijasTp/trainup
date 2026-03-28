import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/ui/Aurora";
import API from "@/lib/axios";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
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
            // The backend webhook usually handles the fulfillment, 
            // but we can check the session status here to show a nice message.
            const response = await API.get(`/payment/session-status/${sessionId}`);
            if (response.data.status === 'complete' || response.data.status === 'paid') {
                toast.success("Payment verified successfully!");
            }
        } catch (error) {
            console.error("Verification error:", error);
            // Don't show error to user as webhook might still be processing
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
                        <h1 className="text-3xl font-bold">Verifying Payment...</h1>
                        <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-500/20">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                        
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-400 to-white bg-clip-text text-transparent">
                                Success!
                            </h1>
                            <p className="text-xl font-medium text-gray-200">Payment Recieved</p>
                            <p className="text-muted-foreground">
                                Your subscription has been activated. Welcome to the elite squad!
                            </p>
                        </div>

                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Secure Transaction</p>
                                <p className="text-sm font-medium text-gray-300">ID: {sessionId?.slice(0, 15)}...</p>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button 
                                onClick={() => navigate("/my-trainer/profile")} 
                                className="w-full bg-white text-black hover:bg-gray-200 py-6 font-bold text-lg rounded-xl group transition-all"
                            >
                                Go to Trainer Dashboard
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
