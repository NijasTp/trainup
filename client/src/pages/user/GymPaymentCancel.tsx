import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/ui/Aurora";
import API from "@/lib/axios";
import { toast } from "sonner";

export default function GymPaymentCancel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        const cleanup = async () => {
            try {
                await API.post("/payment/cleanup-pending-gym");
                toast.error("Payment was cancelled.");
            } catch (error) {
                console.error("Cleanup error:", error);
            }
        };
        cleanup();
    }, [sessionId]);

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#030303] text-white font-outfit overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
            </div>

            <div className="relative z-10 max-w-md w-full mx-auto p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl text-center">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/20 mb-8">
                    <XCircle className="h-12 w-12 text-red-500" />
                </div>
                
                <div className="space-y-4 mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-red-400 to-white bg-clip-text text-transparent">
                        Cancelled
                    </h1>
                    <p className="text-xl font-medium text-gray-200">Payment Aborted</p>
                    <p className="text-muted-foreground">
                        Your gym subscription was not completed. No charges were made.
                    </p>
                </div>

                <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 flex items-center gap-4 text-left mb-10">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-amber-400 uppercase tracking-widest font-black">Quick Note</p>
                        <p className="text-sm font-medium text-gray-300">Changed your mind? No worries!</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button 
                        onClick={() => navigate(-1)} 
                        className="w-full bg-white text-black hover:bg-gray-200 py-7 font-bold text-lg rounded-xl group transition-all"
                    >
                        <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                        Try Again
                    </Button>
                    <Button 
                        onClick={() => navigate("/")} 
                        variant="ghost" 
                        className="w-full h-14 hover:bg-white/5 text-muted-foreground flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
