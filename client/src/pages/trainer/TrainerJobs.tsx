import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    DollarSign,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { getTrainerJobs, toggleShowInterest } from '@/services/gymService';
import TrainerSiteHeader from '@/components/trainer/general/TrainerHeader';
import { SiteFooter } from '@/components/user/home/UserSiteFooter';
import type { IGymJob } from '@/services/gymService';

export default function TrainerJobs() {
    const [jobs, setJobs] = useState<IGymJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [togglingInterestId, setTogglingInterestId] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
    }, [page]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await getTrainerJobs(page, 9, searchTerm);
            setJobs(data.jobs);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load job opportunities');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
    };

    const handleToggleInterest = async (jobId: string) => {
        try {
            setTogglingInterestId(jobId);
            const response = await toggleShowInterest(jobId);
            setJobs(prev =>
                prev.map(job =>
                    job._id === jobId
                        ? { ...job, hasShowedInterest: response.hasShowedInterest }
                        : job
                )
            );
            if (response.hasShowedInterest) {
                toast.success('Your interest has been logged. The gym owner will review your profile!');
            } else {
                toast.success('Your interest registration has been removed.');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update interest status');
        } finally {
            setTogglingInterestId(null);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#030303] text-white flex flex-col font-outfit overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

            <TrainerSiteHeader />

            <main className="relative container mx-auto px-6 py-12 flex-1 space-y-10 max-w-7xl">
                {/* Header Section */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
                        Career Openings
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base font-medium max-w-2xl">
                        Discover job vacancies posted by gyms. Review qualifications, compensation, and log your interest to allow owners to pin and inspect your credentials.
                    </p>
                </div>

                {/* Filter and Search Bar */}
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors h-5 w-5" />
                        <Input
                            placeholder="Search by job title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-cyan-500/30 w-full"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="h-12 px-6 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl shadow-lg transition-all"
                    >
                        Search
                    </Button>
                </form>

                {/* Main Content Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                        <Loader2 className="animate-spin text-cyan-400" size={40} />
                        <p className="text-gray-400 font-bold tracking-widest uppercase italic">Loading job listings...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                        <AlertCircle className="text-zinc-600" size={60} />
                        <p className="text-gray-400 font-bold tracking-widest uppercase italic">No career opportunities found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {jobs.map((job, idx) => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                        whileHover={{ y: -6 }}
                                        className="bg-white/5 border border-white/10 hover:border-cyan-500/30 rounded-3xl p-6 relative overflow-hidden group flex flex-col justify-between transition-all"
                                    >
                                        {/* Card Accent Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="space-y-4">
                                            {/* Gym Logo & Header Info */}
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                                    {job.gymId?.logo ? (
                                                        <img src={job.gymId.logo} alt="Gym Logo" className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <Building2 size={24} />
                                                    )}
                                                </div>
                                                <div className="space-y-1 min-w-0">
                                                    <h3 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors truncate">{job.title}</h3>
                                                    <p className="text-gray-400 text-xs font-semibold truncate uppercase tracking-widest">{job.gymId?.name || "Corporate Gym"}</p>
                                                </div>
                                            </div>

                                            {/* Badges & Meta */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] uppercase font-bold tracking-widest">
                                                    {job.type}
                                                </Badge>
                                                {job.location && (
                                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <MapPin size={12} className="text-cyan-400" /> {job.location}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-400 text-sm leading-relaxed font-medium line-clamp-3 italic">
                                                "{job.description}"
                                            </p>

                                            {/* Requirements */}
                                            {job.requirements && job.requirements.length > 0 && (
                                                <div className="space-y-1.5 pt-2">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Key Requirements:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {job.requirements.map((req, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black uppercase text-gray-400">
                                                                • {req}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Compensation</span>
                                                <span className="text-white font-black text-sm flex items-center gap-0.5">
                                                    <DollarSign size={13} className="text-cyan-400" /> {job.salary || "Neg."}
                                                </span>
                                            </div>

                                            <Button
                                                disabled={togglingInterestId === job._id}
                                                onClick={() => handleToggleInterest(job._id)}
                                                className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                                    job.hasShowedInterest
                                                        ? "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
                                                        : "bg-cyan-500 hover:bg-cyan-600 text-black shadow-lg"
                                                }`}
                                            >
                                                {togglingInterestId === job._id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : job.hasShowedInterest ? (
                                                    <>
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Interested
                                                    </>
                                                ) : (
                                                    "Interested?"
                                                )}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination Section */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 pt-6">
                                <Button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    variant="outline"
                                    className="border-white/10 hover:border-cyan-500/50 hover:bg-white/5"
                                >
                                    Previous
                                </Button>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    variant="outline"
                                    className="border-white/10 hover:border-cyan-500/50 hover:bg-white/5"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <SiteFooter />
        </div>
    );
}
