import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Aurora from "@/components/ui/Aurora";

export default function BundlePaymentCancel() {
    const navigate = useNavigate();

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
                <div className="space-y-8">
                    <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-500/20">
                        <XCircle className="h-12 w-12 text-rose-500" />
                    </div>
                    
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-rose-400 to-white bg-clip-text text-transparent">
                            CANCELLED
                        </h1>
                        <p className="text-xl font-medium text-gray-200">Transaction Aborted</p>
                        <p className="text-muted-foreground">
                            The session stack top-up was cancelled. No charges were made.
                        </p>
                    </div>

                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">Information</p>
                            <p className="text-sm font-medium text-gray-300">Your session balance remains unchanged.</p>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button 
                            onClick={() => navigate("/my-trainer/profile")} 
                            className="w-full bg-white text-black hover:bg-gray-200 py-6 font-bold text-lg rounded-xl group transition-all"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            Return to Profile
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
