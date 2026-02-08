import { useState, useEffect } from 'react';
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
    ClipboardList,
    Search,
    Loader2,
    AlertCircle,
    ChevronLeft,
    Calendar,
    Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    getGymWorkoutTemplates,
    createGymWorkoutTemplate,
    updateGymWorkoutTemplate,
    deleteGymWorkoutTemplate
} from '@/services/gymService';
import { toast } from 'react-hot-toast';

const WorkoutTemplates = () => {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (view === 'list') {
            fetchTemplates();
        }
    }, [page, view]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await getGymWorkoutTemplates(page, 9, searchTerm);
            setTemplates(data.templates);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchTemplates();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (view === 'builder' && editingTemplate) {
                if (editingTemplate._id) {
                    await updateGymWorkoutTemplate(editingTemplate._id, editingTemplate);
                    toast.success('Template updated');
                } else {
                    await createGymWorkoutTemplate(editingTemplate);
                    toast.success('Template created');
                }
                setView('list');
                setEditingTemplate(null);
            }
        } catch (error) {
            toast.error('Failed to save template');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this workout template?')) return;
        try {
            await deleteGymWorkoutTemplate(id);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const addDay = () => {
        if (editingTemplate) {
            setEditingTemplate({
                ...editingTemplate,
                days: [...(editingTemplate.days || []), { dayNumber: (editingTemplate.days?.length || 0) + 1, exercises: [] }]
            });
        }
    };

    const addExercise = (dayIndex: number) => {
        if (editingTemplate) {
            const newDays = [...editingTemplate.days];
            newDays[dayIndex].exercises.push({ name: '', sets: 1, reps: '', exerciseId: 'manual' });
            setEditingTemplate({ ...editingTemplate, days: newDays });
        }
    };

    const updateExercise = (dayIndex: number, exIndex: number, field: string, value: any) => {
        if (editingTemplate) {
            const newDays = [...editingTemplate.days];
            newDays[dayIndex].exercises[exIndex][field] = value;
            setEditingTemplate({ ...editingTemplate, days: newDays });
        }
    };

    const removeExercise = (dayIndex: number, exIndex: number) => {
        if (editingTemplate) {
            const newDays = [...editingTemplate.days];
            newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter((_: any, i: number) => i !== exIndex);
            setEditingTemplate({ ...editingTemplate, days: newDays });
        }
    };

    const removeDay = (dayIndex: number) => {
        if (editingTemplate) {
            const newDays = editingTemplate.days.filter((_: any, i: number) => i !== dayIndex)
                .map((day: any, i: number) => ({ ...day, dayNumber: i + 1 }));
            setEditingTemplate({ ...editingTemplate, days: newDays });
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {view === 'list' ? (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white italic tracking-tight">WORKOUT BLUEPRINTS</h1>
                            <p className="text-gray-500 font-medium">Design professional training routines for your elite members</p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingTemplate({
                                    title: '',
                                    description: '',
                                    duration: 7,
                                    goal: 'Strength',
                                    equipment: true,
                                    days: []
                                });
                                setView('builder');
                            }}
                            className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-black italic rounded-xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] w-full md:w-auto transition-all hover:scale-105"
                        >
                            <Plus size={18} className="mr-2" /> NEW TEMPLATE
                        </Button>
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-[28rem] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Find templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 h-14 pl-14 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/40 text-lg font-medium"
                        />
                    </form>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-900/50 border border-white/5 rounded-[3rem]">
                            <div className="relative">
                                <Loader2 className="animate-spin text-primary" size={48} />
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                            </div>
                            <p className="text-zinc-500 font-black tracking-[0.3em] uppercase italic text-sm">Synchronizing Data...</p>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-zinc-900/50 border border-white/5 rounded-[3rem] text-center">
                            <AlertCircle className="text-zinc-800" size={80} />
                            <div>
                                <p className="text-zinc-500 font-black tracking-[0.2em] uppercase italic text-xl">Blueprint Library Empty</p>
                                <p className="text-zinc-600 font-bold mt-2">Start by creating your first training framework</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {templates.map((template) => (
                                        <motion.div
                                            key={template._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -8 }}
                                            className="bg-zinc-900/40 border border-white/5 hover:border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden group transition-all"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />

                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
                                                    <ClipboardList size={28} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => { setEditingTemplate(template); setView('builder'); }}
                                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all border border-white/5 shadow-xl"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(template._id)}
                                                        className="p-3 bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all border border-white/5 shadow-xl"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                                                <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-black tracking-widest px-3 py-1 uppercase italic">
                                                    {template.goal}
                                                </Badge>
                                                <Badge className="bg-zinc-800 text-zinc-400 border-0 text-[10px] font-black tracking-widest px-3 py-1 uppercase italic">
                                                    {template.duration} DAYS
                                                </Badge>
                                            </div>

                                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-primary transition-colors italic tracking-tight relative z-10">
                                                {template.title}
                                            </h3>

                                            <div className="space-y-4 mb-8 relative z-10">
                                                {(template.days || []).slice(0, 2).map((day: any, i: number) => (
                                                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Calendar size={12} /> DAY {day.dayNumber}
                                                        </p>
                                                        <div className="space-y-2">
                                                            {day.exercises.slice(0, 2).map((ex: any, j: number) => (
                                                                <div key={j} className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                                                                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                                                                    <span>{ex.name}</span>
                                                                    <span className="text-zinc-600 text-[10px] ml-auto">{ex.sets}x{ex.reps}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                {template.days?.length > 2 && (
                                                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest ml-4">+ {template.days.length - 2} More Training Days</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 relative z-10">
                                                <Lock size={12} className={template.equipment ? "text-orange-500" : "text-emerald-500"} />
                                                <span>{template.equipment ? 'Equipment Required' : 'Bodyweight Only'}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center gap-3 mt-12">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-12 h-12 rounded-2xl font-black transition-all shadow-xl flex items-center justify-center ${page === i + 1
                                                ? 'bg-primary text-black scale-110'
                                                : 'bg-zinc-900 border border-white/5 text-zinc-600 hover:text-white hover:border-white/10'
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
                    key="builder"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-6xl mx-auto space-y-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-10 gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => { setView('list'); setEditingTemplate(null); }}
                                className="p-4 bg-zinc-900 border border-white/10 rounded-[1.5rem] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-2xl group"
                            >
                                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h2 className="text-3xl font-black italic text-white tracking-tight uppercase">
                                    {editingTemplate?._id ? `Refining Workflow: ${editingTemplate.title}` : 'Architecting New Routine'}
                                </h2>
                                <p className="text-zinc-500 font-medium">Configure exercises, intensity, and progression cycles</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button
                                onClick={() => { setView('list'); setEditingTemplate(null); }}
                                variant="outline"
                                className="flex-1 md:px-8 h-14 rounded-2xl border-white/5 bg-zinc-900/50 text-zinc-500 hover:text-white font-black uppercase italic tracking-widest transition-all"
                            >
                                Discard
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-[1.5] md:px-12 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-black uppercase italic tracking-widest shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all"
                            >
                                Deploy Blueprint
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT COLUMN: Metadata */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-zinc-950 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                                <h3 className="text-xl font-black italic flex items-center gap-3 text-white">
                                    <Layout size={20} className="text-primary" /> CORE CONFIG
                                </h3>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Blueprint Title</label>
                                        <Input
                                            required
                                            value={editingTemplate?.title}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate!, title: e.target.value })}
                                            className="bg-white/5 border-white/5 h-14 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/40 text-lg font-bold italic"
                                            placeholder="e.g. TITAN STRENGTH V1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Target Goal</label>
                                            <select
                                                value={editingTemplate?.goal}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate!, goal: e.target.value })}
                                                className="w-full bg-zinc-900 border border-white/5 h-14 rounded-2xl px-5 outline-none focus:ring-1 focus:ring-primary/40 text-white text-sm font-black uppercase tracking-tight italic"
                                            >
                                                <option value="Strength">Strength</option>
                                                <option value="Hypertrophy">Hypertrophy</option>
                                                <option value="Fat Loss">Fat Loss</option>
                                                <option value="Endurance">Endurance</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Cycle Days</label>
                                            <Input
                                                type="number"
                                                value={editingTemplate?.duration}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate!, duration: parseInt(e.target.value) })}
                                                className="bg-white/5 border-white/5 h-14 rounded-2xl text-white outline-none focus:ring-1 focus:ring-primary/40 text-center font-black italic"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Mission Overview</label>
                                        <textarea
                                            required
                                            value={editingTemplate?.description}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate!, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 min-h-[160px] outline-none focus:ring-1 focus:ring-primary/40 text-white text-sm font-medium resize-none shadow-xl"
                                            placeholder="Outline the strategy behind this program..."
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setEditingTemplate({ ...editingTemplate!, equipment: !editingTemplate!.equipment })}
                                        className={`w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl border transition-all font-black text-[11px] uppercase tracking-[0.25em] italic shadow-2xl ${editingTemplate?.equipment ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-zinc-800/50 border-white/5 text-zinc-500'
                                            }`}
                                    >
                                        <Lock size={16} className={editingTemplate?.equipment ? "text-orange-500" : "text-zinc-600"} />
                                        {editingTemplate?.equipment ? 'HARDWARE INTENSIVE' : 'BODYWEIGHT ONLY'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Days & Exercises */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black italic flex items-center gap-3 text-white">
                                    <Zap size={20} className="text-primary" /> TRAINING PHASES
                                </h3>
                                <button
                                    type="button"
                                    onClick={addDay}
                                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 text-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest italic shadow-xl"
                                >
                                    <PlusCircle size={16} /> ADD DAY
                                </button>
                            </div>

                            <div className="space-y-12">
                                <AnimatePresence mode="popLayout">
                                    {(editingTemplate?.days || []).map((day: any, dIndex: number) => (
                                        <motion.div
                                            key={dIndex}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-zinc-950/40 border border-white/5 rounded-[3rem] p-8 shadow-2xl relative"
                                        >
                                            <div className="absolute top-8 right-8">
                                                <button
                                                    type="button"
                                                    onClick={() => removeDay(dIndex)}
                                                    className="p-3 bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="w-12 h-12 bg-primary text-black flex items-center justify-center rounded-2xl font-black italic text-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                                                    {day.dayNumber}
                                                </div>
                                                <h4 className="text-xl font-black italic text-white uppercase tracking-tight">TRAINING SESSION</h4>
                                            </div>

                                            <div className="space-y-4">
                                                {day.exercises.map((ex: any, eIndex: number) => (
                                                    <div key={eIndex} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 group shadow-lg">
                                                        <div className="flex items-center gap-4 flex-1 w-full">
                                                            <span className="text-zinc-600 font-black italic text-lg">{eIndex + 1}</span>
                                                            <Input
                                                                value={ex.name}
                                                                onChange={(e) => updateExercise(dIndex, eIndex, 'name', e.target.value)}
                                                                className="bg-transparent border-0 h-12 px-0 focus-visible:ring-0 text-white font-black italic text-lg w-full"
                                                                placeholder="MISSION OBJECTIVE (EXERCISE)"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                                            <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-white/5">
                                                                <span className="text-[10px] font-black text-zinc-600 uppercase italic">SETS</span>
                                                                <Input
                                                                    type="number"
                                                                    value={ex.sets}
                                                                    onChange={(e) => updateExercise(dIndex, eIndex, 'sets', parseInt(e.target.value))}
                                                                    className="bg-transparent border-0 w-12 h-10 text-center font-black text-primary p-0"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-zinc-950 px-4 py-2 rounded-xl border border-white/5 flex-1 md:flex-none md:w-32">
                                                                <span className="text-[10px] font-black text-zinc-600 uppercase italic">REPS</span>
                                                                <Input
                                                                    value={ex.reps}
                                                                    onChange={(e) => updateExercise(dIndex, eIndex, 'reps', e.target.value)}
                                                                    className="bg-transparent border-0 w-full h-10 text-center font-black text-primary p-0"
                                                                    placeholder="e.g. 10-12"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExercise(dIndex, eIndex)}
                                                                className="p-3 text-zinc-700 hover:text-red-500 transition-colors"
                                                            >
                                                                <X size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => addExercise(dIndex)}
                                                    className="w-full py-6 mt-4 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-700 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all text-sm font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 group"
                                                >
                                                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                                    DEPLOY DRILL
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {(!editingTemplate?.days || editingTemplate.days.length === 0) && (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] opacity-50">
                                        <Calendar size={48} className="text-zinc-800 mb-4" />
                                        <p className="text-zinc-600 font-black uppercase italic tracking-widest">Blueprint currently unphased</p>
                                        <p className="text-zinc-700 text-sm mt-2">Initialize your first training day above</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default WorkoutTemplates;

