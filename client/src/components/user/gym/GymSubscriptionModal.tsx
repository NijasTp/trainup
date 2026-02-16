import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Shield, Clock, Calendar, Zap, CreditCard } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface GymPlan {
    _id: string;
    name: string;
    duration: number;
    durationUnit: 'day' | 'month' | 'year';
    price: number;
    description?: string;
    features: string[];
}

interface GymSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: (planId: string, preferredTime: string) => void;
    plans: GymPlan[];
    gymName: string;
    isProcessing?: boolean;
}

const timeSlots = [
    "05:00 AM - 07:00 AM",
    "07:00 AM - 09:00 AM",
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
    "08:00 PM - 10:00 PM",
    "Anytime"
];

const GymSubscriptionModal: React.FC<GymSubscriptionModalProps> = ({
    isOpen,
    onClose,
    onSubscribe,
    plans,
    gymName,
    isProcessing = false
}) => {
    const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?._id || "");
    const [preferredTime, setPreferredTime] = useState<string>("Anytime");

    const selectedPlan = plans.find(p => p._id === selectedPlanId);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
            <DialogContent className="max-w-4xl bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/10 p-0 overflow-hidden gap-0 rounded-[2rem]">
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Side: Plan Info */}
                    <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/10 bg-white/5">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <DialogTitle className="text-3xl font-black text-white">
                                    Join <span className="text-primary">{gymName}</span>
                                </DialogTitle>
                                <p className="text-gray-400 font-medium">Select your membership plan and preferred workout time.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black uppercase tracking-widest text-gray-500">Pick a Plan</label>
                                <div className="grid gap-3">
                                    {plans.map((plan) => (
                                        <motion.div
                                            key={plan._id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedPlanId(plan._id)}
                                            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${selectedPlanId === plan._id
                                                    ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                                                    : "border-white/5 bg-white/5 hover:bg-white/10"
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${selectedPlanId === plan._id ? "bg-primary text-white" : "bg-white/10 text-gray-400"}`}>
                                                    <Zap className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{plan.name}</p>
                                                    <p className="text-xs text-gray-500">{plan.duration} {plan.durationUnit}(s)</p>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-white">₹{plan.price}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black uppercase tracking-widest text-gray-500">Preferred Time Slot</label>
                                <Select value={preferredTime} onValueChange={setPreferredTime}>
                                    <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl text-white font-medium focus:ring-primary">
                                        <SelectValue placeholder="When will you train?" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#121212] border-white/10 text-white rounded-2xl">
                                        {timeSlots.map((slot) => (
                                            <SelectItem key={slot} value={slot} className="focus:bg-white/10 focus:text-primary rounded-xl">
                                                {slot}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Summary & Action */}
                    <div className="w-full md:w-[320px] p-8 flex flex-col justify-between bg-black">
                        <div className="space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Order Summary</h3>

                            <AnimatePresence mode="wait">
                                {selectedPlan && (
                                    <motion.div
                                        key={selectedPlan._id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            {selectedPlan.features.slice(0, 5).map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <div className="mt-1 p-0.5 bg-primary/20 rounded-full">
                                                        <Check className="h-3 w-3 text-primary" strokeWidth={4} />
                                                    </div>
                                                    <span className="text-sm text-gray-400 font-medium">{feature}</span>
                                                </div>
                                            ))}
                                            {selectedPlan.features.length > 5 && (
                                                <p className="text-[10px] text-primary font-bold uppercase pl-6">+ {selectedPlan.features.length - 5} more perks</p>
                                            )}
                                        </div>

                                        <div className="pt-6 border-t border-white/10 space-y-4">
                                            <div className="flex justify-between items-center text-gray-400">
                                                <span className="text-sm">Membership</span>
                                                <span className="text-sm font-bold text-white">₹{selectedPlan.price}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-400">
                                                <span className="text-sm">Tax (GST)</span>
                                                <span className="text-sm font-bold text-white">Inclusive</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-lg font-black text-white">Total</span>
                                                <span className="text-2xl font-black text-primary">₹{selectedPlan.price}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-4 pt-8">
                            <Button
                                onClick={() => onSubscribe(selectedPlanId, preferredTime)}
                                disabled={isProcessing || !selectedPlanId}
                                className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        Complete Payment
                                    </>
                                )}
                            </Button>
                            <p className="text-[10px] text-gray-600 text-center font-bold flex items-center justify-center gap-2">
                                <Shield className="h-3 w-3" /> Encrypted & Secure Payment
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default GymSubscriptionModal;
