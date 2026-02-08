import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Briefcase,
    MapPin,
    Edit3,
    Trash2,
    X,
    DollarSign,
    Search,
    Loader2,
    AlertCircle,
    ChevronLeft,
    PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getGymJobs,
    createGymJob,
    updateGymJob,
    deleteGymJob
} from '@/services/gymService';
import { toast } from 'react-hot-toast';

const Jobs = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingJob, setEditingJob] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (view === 'list') {
            fetchJobs();
        }
    }, [page, view]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await getGymJobs(page, 10, searchTerm);
            setJobs(data.jobs);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobs();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (view === 'editor' && editingJob) {
                if (editingJob._id) {
                    await updateGymJob(editingJob._id, editingJob);
                    toast.success('Job updated');
                } else {
                    await createGymJob(editingJob);
                    toast.success('Job posted');
                }
                setView('list');
                setEditingJob(null);
            }
        } catch (error) {
            toast.error('Failed to save job');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) return;
        try {
            await deleteGymJob(id);
            toast.success('Job deleted');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to delete job');
        }
    };

    const addRequirement = () => {
        if (editingJob) {
            setEditingJob({
                ...editingJob,
                requirements: [...(editingJob.requirements || []), '']
            });
        }
    };

    const updateRequirement = (index: number, value: string) => {
        if (editingJob) {
            const newReqs = [...editingJob.requirements];
            newReqs[index] = value;
            setEditingJob({ ...editingJob, requirements: newReqs });
        }
    };

    const removeRequirement = (index: number) => {
        if (editingJob) {
            setEditingJob({
                ...editingJob,
                requirements: editingJob.requirements.filter((_: any, i: number) => i !== index)
            });
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white italic">CAREER OPPORTUNITIES</h1>
                            <p className="text-gray-500">Post and manage job vacancies in your gym</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingJob({
                                    title: '',
                                    description: '',
                                    requirements: [],
                                    salary: '',
                                    type: 'Trainer',
                                    location: 'On-site',
                                    isActive: true
                                });
                                setView('editor');
                            }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] w-full md:w-auto"
                        >
                            <Plus size={18} className="mr-2" /> Post Job
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </form>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-gray-500 font-bold tracking-widest uppercase italic">Searching Vacancies...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/5 border border-white/10 rounded-[2.5rem]">
                            <AlertCircle className="text-zinc-600" size={60} />
                            <p className="text-gray-500 font-bold tracking-widest uppercase italic">No active job posts</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {jobs.map((job) => (
                                        <motion.div
                                            key={job._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            whileHover={{ y: -5 }}
                                            className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group border-r-4 border-r-primary/10"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                                                        <Briefcase size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{job.title}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className="bg-primary/20 text-primary border-0 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                                                                {job.type}
                                                            </Badge>
                                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                                                <MapPin size={12} /> {job.location}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingJob(job); setView('editor'); }}
                                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(job._id)}
                                                        className="p-3 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium line-clamp-3 italic">
                                                "{job.description}"
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {(job.requirements || []).map((req: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-tight text-gray-400">
                                                        • {req}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Compensation</span>
                                                    <span className="text-white font-black flex items-center gap-1"><DollarSign size={14} className="text-primary" /> {job.salary}</span>
                                                </div>
                                                {!job.isActive && (
                                                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
                                                )}
                                                <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-primary hover:text-black hover:border-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all italic">
                                                    View Applicants
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-8">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${page === i + 1
                                                ? 'bg-primary text-black'
                                                : 'bg-white/5 border border-white/10 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { setView('list'); setEditingJob(null); }}
                                className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-gray-400 hover:text-white transition-all shadow-xl"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-black italic text-white">
                                {editingJob?._id ? 'MODIFY JOB POSTING' : 'CREATE NEW OPENING'}
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Role Title</label>
                                    <Input
                                        required
                                        value={editingJob?.title}
                                        onChange={(e) => setEditingJob({ ...editingJob!, title: e.target.value })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                                        placeholder="e.g. Head Coach"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Position Type</label>
                                        <select
                                            value={editingJob?.type}
                                            onChange={(e) => setEditingJob({ ...editingJob!, type: e.target.value as any })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 h-12 rounded-xl px-4 outline-none focus:ring-1 focus:ring-primary/30 text-white text-sm font-bold uppercase tracking-tight"
                                        >
                                            <option value="Trainer">Trainer</option>
                                            <option value="Staff">Staff</option>
                                            <option value="Manager">Manager</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Location</label>
                                        <select
                                            value={editingJob?.location}
                                            onChange={(e) => setEditingJob({ ...editingJob!, location: e.target.value as any })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 h-12 rounded-xl px-4 outline-none focus:ring-1 focus:ring-primary/30 text-white text-sm font-bold uppercase tracking-tight"
                                        >
                                            <option value="On-site">On-site</option>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Salary / Compensation</label>
                                    <Input
                                        value={editingJob?.salary}
                                        onChange={(e) => setEditingJob({ ...editingJob!, salary: e.target.value })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl text-white outline-none focus:ring-1 focus:ring-primary/30"
                                        placeholder="e.g. $50k - $70k / Year"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Job Description</label>
                                    <textarea
                                        required
                                        value={editingJob?.description}
                                        onChange={(e) => setEditingJob({ ...editingJob!, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[120px] outline-none focus:ring-1 focus:ring-primary/30 text-white text-sm font-medium resize-none"
                                        placeholder="Describe the role, impact, and daily tasks..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1 italic">Key Requirements</label>
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="text-primary hover:text-primary/80 transition-colors"
                                    >
                                        <PlusCircle size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(editingJob?.requirements || []).map((req: string, i: number) => (
                                        <div key={i} className="flex gap-2 group">
                                            <Input
                                                value={req}
                                                onChange={(e) => updateRequirement(i, e.target.value)}
                                                className="bg-white/5 border-white/10 h-10 rounded-xl text-sm"
                                                placeholder={`Requirement #${i + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeRequirement(i)}
                                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!editingJob?.requirements || editingJob.requirements.length === 0) && (
                                        <p className="text-center py-8 text-xs text-gray-600 font-bold uppercase tracking-widest italic animate-pulse">Add some requirements...</p>
                                    )}
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingJob({ ...editingJob!, isActive: !editingJob!.isActive })}
                                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-lg ${editingJob?.isActive ? 'bg-primary/10 border-primary text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${editingJob?.isActive ? 'bg-primary' : 'bg-red-500'} animate-pulse`} />
                                        {editingJob?.isActive ? 'Listing is Active' : 'Listing is Paused'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    type="button"
                                    onClick={() => { setView('list'); setEditingJob(null); }}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-[1.25rem] border-white/10 bg-white/5 text-gray-500 hover:text-white font-black uppercase italic tracking-widest transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-black text-lg font-black uppercase italic tracking-widest shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    {editingJob?._id ? 'Update Listing' : 'Publish Job'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default Jobs;

