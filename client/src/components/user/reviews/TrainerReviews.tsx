import { useState } from "react";
import { Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addTrainerRating } from "@/services/userService";

interface Review {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    rating: number;
    message: string;
    createdAt: string;
    subscriptionPlan?: string;
}

interface TrainerReviewsProps {
    trainerId: string;
    reviews: Review[];
    onReviewAdded: (newReview: Review) => void;
    canReview?: boolean;
    currentUserPlan?: string;
}

export default function TrainerReviews({ trainerId, reviews, onReviewAdded, canReview = false, currentUserPlan }: TrainerReviewsProps) {
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        if (!message.trim()) {
            toast.error("Please write a review");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await addTrainerRating(trainerId, rating, message, currentUserPlan);
            onReviewAdded(response);
            setRating(0);
            setMessage("");
            toast.success("Review added successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-lg">
                        {reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : "0.0"}
                    </span>
                    <span className="text-muted-foreground">({reviews.length} reviews)</span>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {canReview && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Write a Review</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-6 h-6 ${star <= rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-muted-foreground/30"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <Textarea
                                placeholder="Share your experience..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Post Review"}
                            </Button>
                        </form>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 col-span-2">
                        No reviews yet. Be the first to review!
                    </div>
                ) : (
                    <div className="space-y-4 md:col-span-2">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
                                        {review.userId.profilePicture ? (
                                            <img
                                                src={review.userId.profilePicture}
                                                alt={review.userId.firstName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold">
                                                    {review.userId.firstName} {review.userId.lastName}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {review.subscriptionPlan && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                            {review.subscriptionPlan} Plan
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-muted-foreground/30"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground text-sm mt-2">{review.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
