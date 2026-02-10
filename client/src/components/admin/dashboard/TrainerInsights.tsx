import { ChevronDown, Star, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface TrainerInsightsProps {
    trainers: any[];
    selectedTrainer: string;
    setSelectedTrainer: (id: string) => void;
    reviews: any[];
}

export default function TrainerInsights({
    trainers,
    selectedTrainer,
    setSelectedTrainer,
    reviews
}: TrainerInsightsProps) {
    return (
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all hover:border-white/20 h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <MessageSquare size={160} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
                <h3 className="text-2xl font-black text-white italic tracking-tight">TRAINER INSIGHTS</h3>
                <div className="relative group/select w-full sm:w-auto">
                    <select
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="w-full appearance-none bg-zinc-900 border border-white/10 rounded-2xl px-5 py-3 pr-12 text-xs font-black tracking-widest text-white uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer hover:border-primary/30"
                    >
                        {trainers.map((trainer) => (
                            <option key={trainer._id} value={trainer._id} className="bg-zinc-900">{trainer.name.toUpperCase()}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none group-hover/select:scale-110 transition-transform" />
                </div>
            </div>

            <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-5 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-primary/20 transition-all group/item"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {review.user?.name?.[0] || "C"}
                                    </div>
                                    {review.user?.name || "ANONYMOUS CLIENT"}
                                </span>
                                <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-white/5 group-hover/item:border-primary/30 transition-colors">
                                    <Star className="h-3 w-3 text-primary fill-primary" />
                                    <span className="text-[10px] font-black text-white">{review.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                                "{review.comment || review.message}"
                            </p>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
                        <MessageSquare className="text-zinc-700" size={40} />
                        <p className="text-xs font-black text-zinc-500 tracking-widest">NO FEEDBACK DATA AVAILABLE</p>
                    </div>
                )}
            </div>
        </div>
    );
}

