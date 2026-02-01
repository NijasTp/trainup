import { ChevronDown, Star } from "lucide-react";

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
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trainer Insights</h3>
                <div className="relative">
                    <select
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        className="appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                        {trainers.map((trainer) => (
                            <option key={trainer._id} value={trainer._id}>{trainer.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-100 dark:hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {review.user?.name || "Client"}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold">{review.rating}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {review.comment || review.message}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No recent reviews for this trainer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
