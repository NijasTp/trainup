import React from "react";
import { useState, useEffect, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2, Star, Users, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { getTrainers, getTrainerReviews } from "@/services/adminService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { TrainerResponse } from "@/interfaces/admin/adminTrainerManagement";
import type { PaginatedReviews } from "@/interfaces/admin/adminRatingManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";

const ReviewList = ({ trainerId }: { trainerId: string }) => {
    const [reviewsResponse, setReviewsResponse] = useState<PaginatedReviews>({ reviews: [], total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const limit = 8;

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await getTrainerReviews(trainerId, page, limit, search);
            setReviewsResponse(res as PaginatedReviews);
        } catch (error: unknown) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, search]);

    const handleSearch = () => {
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="p-4 bg-muted/20 border-t border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Recent Reviews
                </h3>
                <div className="flex gap-2 items-center max-w-xs w-full">
                    <Input
                        placeholder="Search reviews..."
                        value={searchInput}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="h-8 text-xs bg-background/50 border-border/50"
                    />
                    <Button size="sm" onClick={handleSearch} className="h-8 px-3 text-xs">Search</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground font-medium">Loading reviews...</p>
                </div>
            ) : reviewsResponse.reviews.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground">No reviews found for this trainer.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                        {reviewsResponse.reviews.map((review) => (
                            <Card key={review._id} className="bg-card/30 backdrop-blur-sm border-border/30 hover:shadow-md transition-all duration-300 group">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 ring-1 ring-primary/20">
                                                <AvatarImage src={review.userId.profileImage || review.userId.profilePicture} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                                    {(review.userId.firstName || review.userId.name || "U").substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-semibold leading-none">{review.userId.firstName ? `${review.userId.firstName} ${review.userId.lastName}` : review.userId.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5 bg-primary/10 px-1.5 py-0.5 rounded-full">
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                            <span className="text-[10px] font-bold text-primary">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed italic group-hover:text-foreground transition-colors line-clamp-2">
                                        "{review.comment}"
                                    </p>
                                    {review.subscriptionPlan && (
                                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider h-4 bg-muted/50 border-primary/20 text-primary/80">
                                            {review.subscriptionPlan} Plan
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground font-medium">
                            Showing {reviewsResponse.reviews.length} of {reviewsResponse.total} reviews
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-background/50"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-[10px] font-bold min-w-[3rem] text-center bg-muted/30 py-1 rounded-md">{page} / {reviewsResponse.pages}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-background/50"
                                onClick={() => setPage((p) => Math.min(reviewsResponse.pages, p + 1))}
                                disabled={page >= reviewsResponse.pages}
                            >
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const AdminRatingManagement = () => {
    const [response, setResponse] = useState<TrainerResponse>({ trainers: [], total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedTrainerId, setExpandedTrainerId] = useState<string | null>(null);
    const trainersPerPage = 10;

    useEffect(() => {
        const fetchTrainers = async () => {
            setLoading(true);
            try {
                const res = await getTrainers(
                    currentPage,
                    trainersPerPage,
                    searchQuery,
                    "all", // isBanned
                    "all"  // isVerified
                );
                setResponse(res as TrainerResponse);
            } catch (error: unknown) {
                console.error("Error fetching trainers:", error);
                toast.error("Failed to fetch trainers");
            } finally {
                setLoading(false);
            }
        };

        fetchTrainers();
    }, [currentPage, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const toggleExpand = (trainerId: string) => {
        setExpandedTrainerId(expandedTrainerId === trainerId ? null : trainerId);
    };

    return (
        <AdminLayout>
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
                        <Star className="h-10 w-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
                        Rating Management
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Monitor and manage trainer ratings and user feedback.</p>
                </div>

                <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="p-6 border-b border-border/40 bg-muted/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Trainers Review Status
                            </CardTitle>
                            <div className="flex gap-2 max-w-md w-full">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        placeholder="Search by trainer name or email..."
                                        value={searchInput}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="pl-10 bg-background/50 border-border/40 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-300"
                                    />
                                </div>
                                <Button onClick={handleSearch} className="px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                                    Search
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-80" />
                                    <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse rounded-full"></div>
                                </div>
                                <span className="text-muted-foreground font-semibold animate-pulse tracking-wide">Retrieving trainer stats...</span>
                            </div>
                        ) : response.trainers.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-xl text-muted-foreground font-medium">No trainers found matching your criteria.</p>
                                <Button variant="link" onClick={() => { setSearchInput(""); setSearchQuery(""); }} className="mt-2 text-primary">Clear all filters</Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                                        <tr>
                                            <th className="text-left py-4 px-6">Trainer Information</th>
                                            <th className="text-left py-4 px-6">Average Rating</th>
                                            <th className="text-left py-4 px-6">Clients</th>
                                            <th className="text-right py-4 px-6 pr-10">Reviews</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {response.trainers.map((trainer) => (
                                            <React.Fragment key={trainer._id}>
                                                <tr
                                                    className={`border-b border-border/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer group ${expandedTrainerId === trainer._id ? 'bg-primary/5' : ''}`}
                                                    onClick={() => toggleExpand(trainer._id)}
                                                >
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <Avatar className="h-12 w-12 border border-border/50 shadow-md group-hover:scale-105 transition-transform duration-300">
                                                                    <AvatarImage src={trainer.profileImage} alt={trainer.name} />
                                                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                                                                        {trainer.name.substring(0, 2).toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {trainer.rating >= 4.5 && <div className="absolute -top-1 -right-1 bg-amber-500 w-3 h-3 rounded-full border-2 border-card shadow-sm"></div>}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-foreground font-bold tracking-tight text-base group-hover:text-primary transition-colors">{trainer.name}</span>
                                                                <span className="text-xs text-muted-foreground font-medium">{trainer.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="flex p-0.5">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <Star
                                                                            key={star}
                                                                            className={`h-3.5 w-3.5 ${star <= Math.round(trainer.rating) ? 'text-amber-500 fill-amber-500' : 'text-muted/30'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm font-black text-foreground">{trainer.rating.toFixed(1)}</span>
                                                            </div>
                                                            <div className="w-24 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                                                                    style={{ width: `${(trainer.rating / 5) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <Badge variant="secondary" className="bg-secondary/20 hover:bg-secondary/30 transition-colors font-bold px-3 py-1">
                                                            {trainer.clients.length} Clients
                                                        </Badge>
                                                    </td>
                                                    <td className="py-5 px-6 text-right pr-6">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <div className="flex flex-col items-end mr-4">
                                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</span>
                                                                <span className="text-sm font-black text-primary">View Feed</span>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={`rounded-full transition-all duration-500 ${expandedTrainerId === trainer._id ? 'bg-primary text-white rotate-180 scale-110 shadow-lg shadow-primary/30' : 'hover:bg-primary/10 hover:text-primary hover:scale-110'}`}
                                                            >
                                                                {expandedTrainerId === trainer._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedTrainerId === trainer._id && (
                                                    <tr>
                                                        <td colSpan={4} className="p-0 overflow-hidden">
                                                            <ReviewList trainerId={trainer._id} />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!loading && response.totalPages > 1 && (
                            <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-4 border-t border-border/40 bg-muted/20">
                                <p className="text-sm text-muted-foreground font-medium">
                                    Page <span className="font-bold text-foreground">{currentPage}</span> of <span className="font-bold">{response.totalPages}</span>
                                    <span className="mx-2 opacity-20">|</span>
                                    Total <span className="font-bold text-foreground">{response.total}</span> Trainers
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 px-4 shadow-sm border-border/40 bg-background/50 hover:bg-background"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </Button>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
                                        {Array.from({ length: Math.min(5, response.totalPages) }, (_, i) => {
                                            const pageNum = currentPage > 3 ? currentPage - 3 + i + 1 : i + 1;
                                            if (pageNum > response.totalPages) return null;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-md shadow-primary/20 scale-110' : 'hover:bg-primary/20 hover:text-primary'}`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 px-4 shadow-sm border-border/40 bg-background/50 hover:bg-background"
                                        onClick={() => setCurrentPage(Math.min(response.totalPages, currentPage + 1))}
                                        disabled={currentPage === response.totalPages}
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminRatingManagement;
