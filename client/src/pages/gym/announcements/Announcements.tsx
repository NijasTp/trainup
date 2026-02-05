
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Megaphone,
    Trash2,
    Edit3,
    X,
    Users,
    Target,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockAnnouncements } from '../data/mock';
import { Announcement } from '../types';

const Announcements = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
    const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAnn) {
            if (editingAnn.id) {
                setAnnouncements(announcements.map(a => a.id === editingAnn.id ? editingAnn : a));
            } else {
                setAnnouncements([{ ...editingAnn, id: Date.now().toString() }, ...announcements]);
            }
            setView('list');
            setEditingAnn(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">ANNOUNCEMENTS</h1>
                    <p className="text-gray-500">Communicate gym updates and events</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingAnn({
                            id: '',
                            title: '',
                            description: '',
                            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            target: 'all'
                        });
                        setView('editor');
                    }}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                    <Plus size={18} className="mr-2" /> New Announcement
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {announcements.map((ann) => (
                            <motion.div
                                key={ann.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                                            <Megaphone size={20} />
                                        </div>
                                        <div>
                                            <Badge className="bg-white/5 border border-white/10 text-gray-400 text-[10px] uppercase font-bold tracking-widest px-2 py-1 mb-1">
                                                {ann.target.toUpperCase()}
                                            </Badge>
                                            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{ann.title}</h3>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingAnn(ann); setView('editor'); }}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))}
                                            className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3 font-medium">
                                    {ann.description}
                                </p>

                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-t border-white/5 pt-4">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {ann.date}</span>
                                    <span className="flex items-center gap-1"><Target size={12} /> {ann.target} members</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                            <h2 className="text-2xl font-black italic">{editingAnn?.id ? 'EDIT ANNOUNCEMENT' : 'NEW ANNOUNCEMENT'}</h2>
                            <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Title</label>
                                <Input
                                    value={editingAnn?.title}
                                    onChange={(e) => setEditingAnn({ ...editingAnn!, title: e.target.value })}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    placeholder="Summarize the update..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Audience</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['all', 'trainers', 'members'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setEditingAnn({ ...editingAnn!, target: t as any })}
                                            className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${editingAnn?.target === t
                                                    ? 'bg-primary border-primary text-black'
                                                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Message Content</label>
                                <textarea
                                    value={editingAnn?.description}
                                    onChange={(e) => setEditingAnn({ ...editingAnn!, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[200px] outline-none focus:border-primary/50 text-sm font-medium"
                                    placeholder="Write your announcement here..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setView('list')}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 text-lg font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    Publish Now
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Announcements;
