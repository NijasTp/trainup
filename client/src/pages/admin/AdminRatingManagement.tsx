import React from "react";
import { useState, useEffect, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Loader2, Star, Users, ChevronDown, Activity, Sparkles, ShieldCheck, Quote } from "lucide-react";
import { getTrainers, getTrainerReviews } from "@/services/adminService";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { TrainerResponse } from "@/interfaces/admin/adminTrainerManagement";
import type { PaginatedReviews } from "@/interfaces/admin/adminRatingManagement";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ReviewList = ({ trainerId }: { trainerId: string }) => {
    const [reviewsResponse, setReviewsResponse] = useState<PaginatedReviews>({ reviews: [], total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const limit = 6;

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
        <div className="p-8 bg-zinc-950/50 border-t border-white/5 space-y-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                        CRITIQUE FEEDBACK LOOP
                    </h3>
                </div>
                <div className="flex gap-3 items-center w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                        <Input
                            placeholder="FILTER TESTIMONIALS..."
                            value={searchInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="h-10 pl-10 bg-black/40 border-white/5 rounded-xl text-[10px] font-black italic tracking-wider placeholder:text-zinc-700 focus:ring-1 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">Synchronizing Feed...</p>
                </div>
            ) : reviewsResponse.reviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-[2rem]">
                    <Quote className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">No archival records for this operative.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <AnimatePresence mode="popLayout">
                            {reviewsResponse.reviews.map((review, rIdx) => (
                                <motion.div
                                    key={review._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: rIdx * 0.05 }}
                                    className="relative group h-full"
                                >
                                    <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.08] transition-all duration-500 h-full flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-primary/5">
                                                        <AvatarImage src={review.userId.profileImage || review.userId.profilePicture} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                                                            {(review.userId.firstName || review.userId.name || "U").substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black italic text-white uppercase leading-none">
                                                            {review.userId.firstName ? `${review.userId.firstName} ${review.userId.lastName}` : review.userId.name}
                                                        </span>
                                                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                                                            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl">
                                                    <Star className="h-3 w-3 text-primary fill-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                                    <span className="text-[11px] font-black text-primary tracking-tighter">{review.rating.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Quote size={20} className="absolute -top-2 -left-2 text-primary/10 opacity-50" />
                                                <p className="text-xs text-zinc-400 font-medium leading-relaxed pl-4 italic line-clamp-3">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </div>
                                        {review.subscriptionPlan && (
                                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                                <Badge className="bg-zinc-900 text-zinc-500 border-white/5 px-3 py-1 font-black text-[8px] tracking-[0.2em] uppercase">
                                                    {review.subscriptionPlan} PROTOCOL
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <p className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">
                            Archived {reviewsResponse.reviews.length} / {reviewsResponse.total} Testimonials
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-20 transition-all text-white"
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <div className="h-10 px-4 flex items-center bg-white/5 border border-white/5 rounded-xl">
                                <span className="text-[10px] font-black italic text-primary">{page}</span>
                                <span className="text-[10px] font-black text-zinc-700 px-1">/</span>
                                <span className="text-[10px] font-black text-white">{reviewsResponse.pages}</span>
                            </div>
                            <Button
                                onClick={() => setPage((p) => Math.min(reviewsResponse.pages, p + 1))}
                                disabled={page >= reviewsResponse.pages}
                                className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-20 transition-all text-white"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
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
                    "all",
                    "all"
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
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={120} className="text-primary rotate-12" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Star size={20} />
                            </div>
                            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                                FEEDBACK ANALYTICS
                            </Badge>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black text-white italic tracking-tight uppercase">
                            RATING <span className="text-primary">MAINFRAME</span>
                        </h1>
                        <p className="text-zinc-500 font-medium">Monitoring operative influence and user satisfaction metrics</p>
                    </div>

                    <div className="relative z-10 w-full xl:w-auto">
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-3xl border border-white/5">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase leading-none">Global Impact</span>
                                <span className="text-2xl font-black text-white italic tabular-nums leading-none mt-1">4.8</span>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-black">
                                <Sparkles size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-sm">
                    <div className="md:col-span-12 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="SEARCH OPERATIVES BY IDENTITY OR SECURE DIGITS..."
                            value={searchInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="h-16 pl-16 bg-zinc-900/50 border-white/5 rounded-2xl text-white font-black italic tracking-wider placeholder:text-zinc-600 focus:ring-1 focus:ring-primary/20 transition-all uppercase text-sm"
                        />
                        <Button
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 px-6 bg-primary hover:bg-primary/90 text-black font-black italic rounded-xl hidden sm:flex items-center gap-2"
                        >
                            INITIATE SCAN
                            <ShieldCheck size={16} />
                        </Button>
                    </div>
                </div>

                {/* Interactive Table Container */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/[0.02] text-zinc-500 border-b border-white/5">
                                <tr className="h-20">
                                    <th className="text-[10px] font-black tracking-[0.2em] uppercase text-left pl-10">OPERATIVE IDENTITY</th>
                                    <th className="text-[10px] font-black tracking-[0.2em] uppercase text-center">INFLUENCE RATING</th>
                                    <th className="text-[10px] font-black tracking-[0.2em] uppercase text-center">ACTIVE COHORT</th>
                                    <th className="text-[10px] font-black tracking-[0.2em] uppercase text-right pr-10">ARCHIVE ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="h-96">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase animate-pulse">Scanning Neural Network...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : response.trainers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="h-96 text-center">
                                            <div className="space-y-2 opacity-20">
                                                <Users size={60} className="mx-auto text-zinc-500" />
                                                <p className="text-zinc-500 font-black italic uppercase">No Operative Data Synchronized</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    response.trainers.map((trainer) => (
                                        <React.Fragment key={trainer._id}>
                                            <motion.tr
                                                layout
                                                onClick={() => toggleExpand(trainer._id)}
                                                className={`group cursor-pointer transition-all duration-300 h-28 ${expandedTrainerId === trainer._id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}`}
                                            >
                                                <td className="pl-10">
                                                    <div className="flex items-center gap-5">
                                                        <div className="relative">
                                                            <Avatar className="h-14 w-14 border-2 border-white/5 ring-4 ring-primary/0 group-hover:ring-primary/10 transition-all duration-500">
                                                                <AvatarImage src={trainer.profileImage} alt={trainer.name} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-black text-lg italic">
                                                                    {trainer.name.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {trainer.rating >= 4.5 && (
                                                                <div className="absolute -top-1 -right-1 bg-primary w-4 h-4 rounded-full border-4 border-zinc-950 flex items-center justify-center">
                                                                    <Sparkles size={8} className="text-black" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-black italic text-lg uppercase tracking-tight group-hover:text-primary transition-colors">{trainer.name}</span>
                                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{trainer.email}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex text-primary">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        size={14}
                                                                        className={`${star <= Math.round(trainer.rating) ? 'fill-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'fill-transparent text-zinc-800'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-xl font-black italic text-white leading-none">{trainer.rating.toFixed(1)}</span>
                                                        </div>
                                                        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(trainer.rating / 5) * 100}%` }}
                                                                className="h-full bg-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="text-center">
                                                    <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-white/5 px-4 py-2 font-black italic rounded-xl text-[10px] tracking-widest uppercase">
                                                        #{trainer.clients.length} ASSETS
                                                    </Badge>
                                                </td>

                                                <td className="pr-10 text-right">
                                                    <div className="flex items-center justify-end gap-6">
                                                        <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                            <span className="text-[9px] font-black text-primary tracking-widest uppercase">Inspect Feed</span>
                                                            <span className="text-[8px] text-zinc-600 font-bold uppercase">Click to expand archive</span>
                                                        </div>
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5 ${expandedTrainerId === trainer._id ? 'bg-primary text-black rotate-180 shadow-[0_0_20px_rgba(var(--primary),0.3)]' : 'bg-white/5 text-zinc-500 group-hover:text-white group-hover:bg-white/10'}`}>
                                                            <ChevronDown size={20} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            <AnimatePresence>
                                                {expandedTrainerId === trainer._id && (
                                                    <motion.tr
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <td colSpan={4} className="p-0">
                                                            <ReviewList trainerId={trainer._id} />
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 pb-12">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-4 rounded-[2rem] backdrop-blur-sm">
                        <span className="text-[10px] font-black text-zinc-600 tracking-[0.2em] uppercase">Chronicle Page</span>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <span className="text-primary font-black italic text-lg">{currentPage}</span>
                        <span className="text-zinc-700 font-black italic px-1">/</span>
                        <span className="text-white font-black italic text-lg">{response.totalPages}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-16 px-8 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all text-white font-black italic text-[10px] tracking-widest flex items-center gap-3 uppercase"
                        >
                            <ChevronLeft size={16} />
                            Previous Sequence
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(Math.min(response.totalPages, currentPage + 1))}
                            disabled={currentPage === response.totalPages}
                            className="h-16 px-8 rounded-[2rem] bg-primary hover:bg-primary/90 disabled:opacity-30 transition-all text-black font-black italic text-[10px] tracking-widest flex items-center gap-3 uppercase shadow-[0_10px_30px_rgba(var(--primary),0.2)]"
                        >
                            Next Sequence
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminRatingManagement;
