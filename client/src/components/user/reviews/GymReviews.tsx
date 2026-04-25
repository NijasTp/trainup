import { useState, useEffect } from "react";
import { Star, User, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addGymRating, editReview, deleteReview } from "@/services/userService";
import API from "@/lib/axios";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Review {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
    };
    rating: number;
    comment: string;
    message?: string; // Fallback for mixed data
    createdAt: string;
    subscriptionPlan?: string;
}

interface GymReviewsProps {
    gymId: string;
    onReviewAdded?: (newReview: Review) => void;
    canReview?: boolean;
    currentUserPlan?: string;
}

export default function GymReviews({ gymId, onReviewAdded, canReview = false, currentUserPlan }: GymReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [filterRating, setFilterRating] = useState<number>(0);
    const { user } = useSelector((state: RootState) => state.userAuth);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const url = `/user/gym/ratings/${gymId}?page=${page}&limit=5${filterRating > 0 ? `&rating=${filterRating}` : ''}`;
            const response = await API.get(url);
            setReviews(response.data.reviews);
            setTotalPages(response.data.pages);
            setTotalReviews(response.data.total);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMyReview = async () => {
        try {
            const response = await API.get(`/user/gym/rating/me/${gymId}`);
            if (response.data.review) {
                setUserReview(response.data.review);
            } else {
                setUserReview(null);
            }
        } catch (error) {
            console.error("Failed to fetch my review:", error);
        }
    };

    useEffect(() => {
        if (gymId) {
            fetchReviews();
            if (canReview) {
                fetchMyReview();
            }
        }
    }, [gymId, page, filterRating]);

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
            if (editingReviewId) {
                const response = await editReview(editingReviewId, rating, message);
                setUserReview(response);
                setReviews(prev => prev.map(r => r._id === editingReviewId ? response : r));
                setEditingReviewId(null);
                toast.success("Review updated successfully");
            } else {
                const response = await addGymRating(gymId, rating, message, currentUserPlan);
                setUserReview(response);
                if (onReviewAdded) onReviewAdded(response);
                toast.success("Review added successfully");
                setPage(1);
                fetchReviews();
            }
            setRating(0);
            setMessage("");
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (review: Review) => {
        setEditingReviewId(review._id);
        setRating(review.rating);
        setMessage(review.comment || review.message || "");
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setRating(0);
        setMessage("");
    };

    const handleDeleteClick = async (reviewId: string) => {
        try {
            await deleteReview(reviewId);
            setReviews(prev => prev.filter(r => r._id !== reviewId));
            setTotalReviews(prev => prev - 1);
            if (userReview && userReview._id === reviewId) {
                setUserReview(null);
            }
            toast.success("Review deleted successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to delete review");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Reviews</h2>
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{totalReviews}</span>
                        <span className="text-muted-foreground text-sm">total</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                    <Button 
                        variant={filterRating === 0 ? "secondary" : "ghost"} 
                        size="sm" 
                        onClick={() => { setFilterRating(0); setPage(1); }}
                        className="rounded-full text-xs font-semibold"
                    >
                        All
                    </Button>
                    {[5, 4, 3, 2, 1].map(star => (
                        <Button 
                            key={star}
                            variant={filterRating === star ? "secondary" : "ghost"} 
                            size="sm" 
                            onClick={() => { setFilterRating(star); setPage(1); }}
                            className="rounded-full flex items-center gap-1 text-xs px-3"
                        >
                            {star} <Star className={`w-3.5 h-3.5 ${filterRating === star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {(canReview && !userReview) || editingReviewId ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{editingReviewId ? "Edit Your Review" : "Write a Review"}</h3>
                            {editingReviewId && (
                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                </Button>
                            )}
                        </div>
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
                                {isSubmitting ? "Submitting..." : (editingReviewId ? "Update Review" : "Post Review")}
                            </Button>
                        </form>
                    </div>
                ) : userReview ? (
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-primary italic uppercase tracking-wider">Your Review</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(userReview)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteClick(userReview._id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= userReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-zinc-400">{userReview.comment || userReview.message}</p>
                    </div>
                ) : null}

                <div className="space-y-4 md:col-span-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            No reviews yet. Be the first to review!
                        </div>
                    ) : (
                        <>
                            {reviews.filter(r => r._id !== userReview?._id).map((review) => (
                                <div key={review._id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
                                            {review.userId.profilePicture ? (
                                                <img src={review.userId.profilePicture} alt={review.userId.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold">{review.userId.firstName} {review.userId.lastName}</h4>
                                                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground text-sm mt-2">{review.comment || review.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="flex items-center text-sm">Page {page} of {totalPages}</span>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
