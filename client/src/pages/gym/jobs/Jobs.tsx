
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Briefcase,
    MapPin,
    Edit3,
    Trash2,
    X,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockJobs } from '../data/mock';
import type { Job } from '../types';

const Jobs = () => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingJob) {
            if (editingJob.id) {
                setJobs(jobs.map(j => j.id === editingJob.id ? editingJob : j));
            } else {
                setJobs([{ ...editingJob, id: Date.now().toString() }, ...jobs]);
            }
            setView('list');
            setEditingJob(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">CAREER OPPORTUNITIES</h1>
                    <p className="text-gray-500">Post and manage job vacancies in your gym</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingJob({
                            id: '',
                            title: '',
                            description: '',
                            requirements: [],
                            salary: '',
                            type: 'Trainer',
                            location: 'On-site'
                        });
                        setView('editor');
                    }}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                    <Plus size={18} className="mr-2" /> Post Job
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
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
                                            onClick={() => setJobs(jobs.filter(j => j.id !== job.id))}
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
                                    {job.requirements.map((req, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-400">
                                            • {req}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Salary Range</span>
                                        <span className="text-white font-black flex items-center gap-1"><DollarSign size={14} className="text-primary" /> {job.salary}</span>
                                    </div>
                                    <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-primary hover:text-black hover:border-primary rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                                        View Applicants
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8"
                    >
                        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                            <h2 className="text-2xl font-black italic">{editingJob?.id ? 'EDIT JOB POSTING' : 'NEW JOB OPENING'}</h2>
                            <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6 md:col-span-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Job Title</label>
                                    <Input
                                        value={editingJob?.title}
                                        onChange={(e) => setEditingJob({ ...editingJob!, title: e.target.value })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                        placeholder="e.g. Senior Fitness Trainer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Role Type</label>
                                <select
                                    value={editingJob?.type}
                                    onChange={(e) => setEditingJob({ ...editingJob!, type: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 outline-none focus:border-primary/50 text-sm font-bold"
                                >
                                    <option value="Trainer">Trainer</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Salary Range</label>
                                <Input
                                    value={editingJob?.salary}
                                    onChange={(e) => setEditingJob({ ...editingJob!, salary: e.target.value })}
                                    className="bg-white/5 border-white/10 h-12 rounded-xl text-sm"
                                    placeholder="e.g. $40k - $60k / Year"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Job Description</label>
                                <textarea
                                    value={editingJob?.description}
                                    onChange={(e) => setEditingJob({ ...editingJob!, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[120px] outline-none focus:border-primary/50 text-sm font-medium"
                                    placeholder="Describe the role and responsibilities..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4 md:col-span-2">
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
                                    Post Vacancy
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Jobs;
