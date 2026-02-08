import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Megaphone,
    Trash2,
    Edit3,
    X,
    Search,
    Loader2,
    AlertCircle,
    Image as ImageIcon,
    ChevronLeft,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getGymAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} from '@/services/gymService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Announcements = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAnn, setEditingAnn] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (view === 'list') {
            fetchAnnouncements();
        }
    }, [page, view]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await getGymAnnouncements(page, 10, searchTerm);
            setAnnouncements(data.announcements);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchAnnouncements();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', editingAnn.title);
            formData.append('description', editingAnn.description);
            formData.append('isActive', editingAnn.isActive ? 'true' : 'false');
            if (imageFile) formData.append('image', imageFile);

            if (editingAnn._id) {
                await updateAnnouncement(editingAnn._id, formData);
                toast.success('Announcement updated');
            } else {
                await createAnnouncement(formData);
                toast.success('Announcement published');
            }
            setView('list');
            setEditingAnn(null);
            setImageFile(null);
            setPreviewUrl(null);
        } catch (error) {
            toast.error('Failed to save announcement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            toast.success('Announcement removed');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tight uppercase">Broadcast Center</h1>
                            <p className="text-gray-500 font-medium">Manage gym-wide communication and important updates</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingAnn({
                                    title: '',
                                    description: '',
                                    isActive: true
                                });
                                setView('editor');
                            }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-black italic rounded-xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105"
                        >
                            <Plus size={18} className="mr-2" /> NEW BROADCAST
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-[28rem] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Filter broadcasts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900/50 border-white/5 h-14 pl-14 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/40 text-lg font-medium"
                        />
                    </form>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-900/50 border border-white/5 rounded-[3rem]">
                            <Loader2 className="animate-spin text-primary" size={48} />
                            <p className="text-zinc-500 font-black tracking-widest uppercase italic text-sm">Loading Signal...</p>
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-900/50 border border-white/5 rounded-[3rem] text-center">
                            <AlertCircle className="text-zinc-800" size={80} />
                            <div>
                                <p className="text-zinc-500 font-black tracking-widest uppercase italic text-xl">No Active Broadcasts</p>
                                <p className="text-zinc-600 font-bold mt-2">Publish your first update to get started</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <AnimatePresence mode="popLayout">
                                {announcements.map((ann) => (
                                    <motion.div
                                        key={ann._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all flex flex-col"
                                    >
                                        {ann.image && (
                                            <div className="h-48 relative overflow-hidden">
                                                <img src={ann.image} alt={ann.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                                            </div>
                                        )}
                                        <div className="p-8 flex-1">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-xl">
                                                        <Megaphone size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={`${ann.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'} border-0 text-[10px] font-black tracking-widest px-2 py-0.5 uppercase italic`}>
                                                                {ann.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                            </Badge>
                                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{format(new Date(ann.createdAt), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                        <h3 className="text-xl font-black text-white italic tracking-tight group-hover:text-primary transition-colors">{ann.title}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingAnn(ann); setView('editor'); if (ann.image) setPreviewUrl(ann.image); }}
                                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all border border-white/5"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ann._id)}
                                                        className="p-3 bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all border border-white/5"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-zinc-400 font-medium leading-relaxed mb-6 line-clamp-3 italic">
                                                {ann.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-3 mt-12">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-12 h-12 rounded-2xl font-black transition-all flex items-center justify-center ${page === i + 1
                                        ? 'bg-primary text-black'
                                        : 'bg-zinc-900 border border-white/5 text-zinc-600 hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="flex items-center gap-6 mb-10">
                        <button
                            onClick={() => { setView('list'); setEditingAnn(null); setImageFile(null); setPreviewUrl(null); }}
                            className="p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">
                                {editingAnn?._id ? 'Refine Broadcast' : 'Deploy New Signal'}
                            </h2>
                            <p className="text-zinc-500 font-medium">Configure your communication message and media</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Broadcast Headline</label>
                                    <Input
                                        required
                                        value={editingAnn?.title}
                                        onChange={(e) => setEditingAnn({ ...editingAnn!, title: e.target.value })}
                                        className="bg-white/5 border-white/5 h-14 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/40 font-bold italic"
                                        placeholder="Enter headline..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Status</label>
                                    <button
                                        type="button"
                                        onClick={() => setEditingAnn({ ...editingAnn!, isActive: !editingAnn!.isActive })}
                                        className={`w-full h-14 rounded-2xl border transition-all font-black text-xs uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 ${editingAnn?.isActive ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'
                                            }`}
                                    >
                                        <Clock size={16} /> {editingAnn?.isActive ? 'SIGNAL ACTIVE' : 'SIGNAL INACTIVE'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Media Attachment (Optional)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all ${previewUrl ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'
                                        }`}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem]" />
                                        ) : (
                                            <>
                                                <ImageIcon size={40} className="text-zinc-800" />
                                                <p className="text-zinc-600 font-black uppercase text-xs tracking-widest">Select Visual Data</p>
                                            </>
                                        )}
                                    </div>
                                    {previewUrl && (
                                        <button
                                            type="button"
                                            onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                                            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black rounded-full text-white z-20"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Broadcast Payload (Message)</label>
                                <textarea
                                    required
                                    value={editingAnn?.description}
                                    onChange={(e) => setEditingAnn({ ...editingAnn!, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 min-h-[200px] outline-none focus:ring-1 focus:ring-primary/40 text-white text-sm font-medium resize-none shadow-xl italic"
                                    placeholder="Draft your signal here..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                onClick={() => { setView('list'); setEditingAnn(null); }}
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl border-white/5 bg-zinc-900/50 text-zinc-500 hover:text-white font-black uppercase italic tracking-widest transition-all"
                            >
                                ABORT
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-black uppercase italic tracking-widest shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all"
                            >
                                PUBLISH SIGNAL
                            </Button>
                        </div>
                    </form>
                </motion.div>
            )}
        </div>
    );
};

export default Announcements;
