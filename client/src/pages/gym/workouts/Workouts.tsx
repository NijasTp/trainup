
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Dumbbell,
    Trash2,
    Edit3,
    X,
    PlusCircle,
    Zap,
    Target,
    Settings2,
    Lock,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockWorkoutTemplates } from '../data/mock';
import type { WorkoutTemplate } from '../types';

const WorkoutTemplates = () => {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [templates, setTemplates] = useState<WorkoutTemplate[]>(mockWorkoutTemplates);
    const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            if (editingTemplate.id) {
                setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
            } else {
                setTemplates([{ ...editingTemplate, id: Date.now().toString() }, ...templates]);
            }
            setView('list');
            setEditingTemplate(null);
        }
    };

    const addExercise = () => {
        if (editingTemplate) {
            setEditingTemplate({
                ...editingTemplate,
                exercises: [...editingTemplate.exercises, { name: '', sets: 0, reps: '', order: editingTemplate.exercises.length + 1 }]
            });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">WORKOUT TEMPLATES</h1>
                    <p className="text-gray-500">Design training frameworks for your members</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingTemplate({
                            id: '',
                            name: '',
                            exercises: [],
                            category: 'Strength',
                            restrictedPlanIds: []
                        });
                        setView('builder');
                    }}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                    <Plus size={18} className="mr-2" /> Create Template
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-primary/10 rounded-3xl text-primary border border-primary/20">
                                        <ClipboardList size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingTemplate(template); setView('builder'); }}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-500 transition-colors"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setTemplates(templates.filter(t => t.id !== template.id))}
                                            className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <Badge className="bg-white/5 border border-white/10 text-gray-500 text-[10px] uppercase font-black tracking-widest px-2 py-1 mb-2">
                                    {template.category}
                                </Badge>
                                <h3 className="text-2xl font-black text-white mb-6 group-hover:text-primary transition-colors">{template.name}</h3>

                                <div className="space-y-3 mb-8">
                                    {template.exercises.slice(0, 3).map((ex, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                            <ChevronRight size={14} className="text-primary" />
                                            <span className="font-bold">{ex.name}</span>
                                            <span className="text-gray-600 ml-auto">{ex.sets}x{ex.reps}</span>
                                        </div>
                                    ))}
                                    {template.exercises.length > 3 && (
                                        <p className="text-xs text-gray-600 font-bold ml-6">+ {template.exercises.length - 3} more exercises</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <Lock size={12} className="text-orange-500" />
                                    <span>{template.restrictedPlanIds.length > 0 ? `${template.restrictedPlanIds.length} Restrictions` : 'Public Template'}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="builder"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8">
                                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                    <h2 className="text-2xl font-black italic">{editingTemplate?.id ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</h2>
                                    <Dumbbell className="text-primary" />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Template Name</label>
                                        <Input
                                            value={editingTemplate?.name}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate!, name: e.target.value })}
                                            className="bg-white/5 border-white/10 h-12 rounded-xl"
                                            placeholder="e.g. Advanced Push Day"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Exercises</label>
                                            <button
                                                type="button"
                                                onClick={addExercise}
                                                className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-xs font-black uppercase tracking-widest"
                                            >
                                                <PlusCircle size={14} /> Add Exercise
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {editingTemplate?.exercises.map((ex, i) => (
                                                <div key={i} className="flex gap-3 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group">
                                                    <span className="text-gray-600 font-black italic">{i + 1}</span>
                                                    <Input
                                                        value={ex.name}
                                                        onChange={(e) => {
                                                            const newEx = [...editingTemplate.exercises];
                                                            newEx[i].name = e.target.value;
                                                            setEditingTemplate({ ...editingTemplate, exercises: newEx });
                                                        }}
                                                        className="bg-transparent border-0 h-10 px-0 focus-visible:ring-0 font-bold"
                                                        placeholder="Exercise Name"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={ex.sets}
                                                            onChange={(e) => {
                                                                const newEx = [...editingTemplate.exercises];
                                                                newEx[i].sets = parseInt(e.target.value);
                                                                setEditingTemplate({ ...editingTemplate, exercises: newEx });
                                                            }}
                                                            className="bg-white/5 border-white/10 w-16 h-10 rounded-lg text-center font-bold"
                                                            placeholder="Sets"
                                                        />
                                                        <span className="text-gray-500">x</span>
                                                        <Input
                                                            value={ex.reps}
                                                            onChange={(e) => {
                                                                const newEx = [...editingTemplate.exercises];
                                                                newEx[i].reps = e.target.value;
                                                                setEditingTemplate({ ...editingTemplate, exercises: newEx });
                                                            }}
                                                            className="bg-white/5 border-white/10 w-20 h-10 rounded-lg text-center font-bold"
                                                            placeholder="Reps"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newEx = editingTemplate.exercises.filter((_, idx) => idx !== i);
                                                            setEditingTemplate({ ...editingTemplate, exercises: newEx });
                                                        }}
                                                        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500/50 hover:text-red-500"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Settings2 size={18} className="text-primary" /> Settings
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Category</label>
                                        <select
                                            value={editingTemplate?.category}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate!, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 h-12 rounded-xl px-4 outline-none focus:border-primary/50 text-sm font-bold active:bg-[#030303]"
                                        >
                                            <option value="Strength">Strength</option>
                                            <option value="Cardio">Cardio</option>
                                            <option value="HIIT">HIIT</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Plan Visibility</label>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <Lock size={16} className="text-gray-500 group-hover:text-primary transition-colors" />
                                                <span className="text-sm font-bold">Restrict Plans</span>
                                            </div>
                                            <Badge className="bg-white/10 text-gray-400">0 Plans</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => handleSave({ preventDefault: () => { } } as any)}
                                    className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    Save Template
                                </Button>
                                <Button
                                    onClick={() => setView('list')}
                                    variant="outline"
                                    className="h-14 rounded-2xl border-white/10 bg-white/5 text-lg font-bold"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutTemplates;
