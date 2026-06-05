import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trash2,
    Edit3,
    X,
    Zap,
    ClipboardList,
    Search,
    Loader2,
    AlertCircle,
    ChevronLeft,
    Calendar,
    Layout,
    Plus,
    Lock,
    Edit,
    Dumbbell,
    Settings
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
import { useDebounce } from 'use-debounce';
import { searchExercises } from '@/services/exerciseService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const WorkoutTemplates = () => {
    const [view, setView] = useState<'list' | 'builder'>('list');
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Search and Suggestions States
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Exercise Config Dialog States
    const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
    const [showExerciseModal, setShowExerciseModal] = useState(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

    const [sets, setSets] = useState<number>(3);
    const [reps, setReps] = useState<string>("10-12");
    const [weight, setWeight] = useState<string>("0");
    const [rest, setRest] = useState<string>("60s");
    const [notes, setNotes] = useState<string>("");

    useEffect(() => {
        if (view === 'list') {
            fetchTemplates();
        }
    }, [page, view]);

    useEffect(() => {
        if (debouncedQuery) {
            const fetchSuggestions = async () => {
                setSearching(true);
                try {
                    const results = await searchExercises(debouncedQuery);
                    setSuggestions(results || []);
                } catch (err) {
                    console.error(err);
                } finally {
                    setSearching(false);
                }
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await getGymWorkoutTemplates(page, 9, searchTerm);
            setTemplates(data.templates || []);
            setTotalPages(data.totalPages || 1);
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

    const startEditing = (template: any) => {
        const compatible = { ...template };
        compatible.type = 'one-time';
        compatible.repetitions = 1;
        if (!compatible.days || compatible.days.length === 0) {
            compatible.days = [{ dayNumber: 1, exercises: [] }];
        } else if (compatible.days.length > 1) {
            compatible.days = [compatible.days[0]];
        }
        if (!compatible.targetBodyParts) {
            compatible.targetBodyParts = [];
        }
        if (!compatible.requiredEquipment) {
            compatible.requiredEquipment = [];
        }
        if (!compatible.difficultyLevel) {
            compatible.difficultyLevel = 'intermediate';
        }
        if (!compatible.image) {
            compatible.image = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
        }
        setEditingTemplate(compatible);
        setView('builder');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (view === 'builder' && editingTemplate) {
                if (!editingTemplate.title) {
                    toast.error('Title is required');
                    return;
                }
                if (!editingTemplate.days || editingTemplate.days[0].exercises.length === 0) {
                    toast.error('Add at least one exercise to the template');
                    return;
                }
                // Force compatibility fields just in case
                const payload = {
                    ...editingTemplate,
                    type: 'one-time',
                    repetitions: 1,
                    image: editingTemplate.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
                };
                if (payload._id) {
                    await updateGymWorkoutTemplate(payload._id, payload);
                    toast.success('Template updated');
                } else {
                    await createGymWorkoutTemplate(payload);
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

    const handleAddExerciseClick = () => {
        setEditingExerciseIndex(null);
        setSelectedExercise(null);
        setSearchQuery("");
        setSets(3);
        setReps("10-12");
        setWeight("0");
        setRest("60s");
        setNotes("");
        setShowExerciseModal(true);
    };

    const handleEditExercise = (exIndex: number) => {
        if (!editingTemplate) return;
        const ex = editingTemplate.days[0].exercises[exIndex];
        setEditingExerciseIndex(exIndex);
        setSelectedExercise(ex.exerciseData || ex);
        setSets(ex.sets);
        setReps(ex.reps || "10-12");
        setWeight(ex.weight || "0");
        setRest(ex.rest || "60s");
        setNotes(ex.notes || "");
        setShowExerciseModal(true);
    };

    const handleSaveExercise = () => {
        if (!editingTemplate || !selectedExercise) return;
        const newDays = [...editingTemplate.days];
        const exercises = [...(newDays[0].exercises || [])];

        const payload: any = {
            exerciseId: selectedExercise.exerciseId || selectedExercise.id,
            name: selectedExercise.name,
            image: selectedExercise.gifUrl || selectedExercise.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
            sets: sets,
            reps: reps,
            weight: weight,
            rest: rest,
            notes: notes,
            gifUrl: selectedExercise.gifUrl,
            bodyParts: selectedExercise.bodyParts,
            targetMuscles: selectedExercise.targetMuscles,
            secondaryMuscles: selectedExercise.secondaryMuscles,
            equipments: selectedExercise.equipments,
            instructions: selectedExercise.instructions,
            description: selectedExercise.description || '',
            exerciseData: selectedExercise
        };

        if (editingExerciseIndex !== null) {
            exercises[editingExerciseIndex] = payload;
        } else {
            exercises.push(payload);
        }

        newDays[0].exercises = exercises;
        setEditingTemplate({ ...editingTemplate, days: newDays });
        setShowExerciseModal(false);
        setSelectedExercise(null);
        setEditingExerciseIndex(null);
        setSearchQuery('');
        toast.success(editingExerciseIndex !== null ? 'Exercise configuration updated' : 'New exercise synchronized');
    };

    const removeExercise = (exIndex: number) => {
        if (editingTemplate) {
            const newDays = [...editingTemplate.days];
            newDays[0].exercises = newDays[0].exercises.filter((_: any, i: number) => i !== exIndex);
            setEditingTemplate({ ...editingTemplate, days: newDays });
            toast.success('Exercise module removed');
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
                                    difficultyLevel: 'intermediate',
                                    goal: 'Strength',
                                    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
                                    type: 'one-time',
                                    repetitions: 1,
                                    requiredEquipment: [],
                                    days: [{ dayNumber: 1, exercises: [] }],
                                    targetBodyParts: []
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
                                                        onClick={() => startEditing(template)}
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
                                                    1 DAY (ONE-TIME)
                                                </Badge>
                                            </div>

                                            <h3 className="text-2xl font-black text-white mb-4 group-hover:text-primary transition-colors italic tracking-tight relative z-10">
                                                {template.title}
                                            </h3>

                                            <div className="space-y-4 mb-8 relative z-10">
                                                {(template.days || []).slice(0, 1).map((day: any, i: number) => (
                                                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <Calendar size={12} /> DAY {day.dayNumber}
                                                        </p>
                                                        <div className="space-y-2">
                                                            {(day.exercises || []).slice(0, 3).map((ex: any, j: number) => (
                                                                <div key={j} className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                                                                    <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                                                                    <span>{ex.name}</span>
                                                                    <span className="text-zinc-600 text-[10px] ml-auto">{ex.sets}x{ex.reps}</span>
                                                                </div>
                                                            ))}
                                                            {(day.exercises || []).length > 3 && (
                                                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest ml-4">+ {day.exercises.length - 3} More Exercises</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 relative z-10">
                                                <Lock size={12} className={(template.requiredEquipment && template.requiredEquipment.length > 0) ? "text-orange-500" : "text-emerald-500"} />
                                                <span>{(template.requiredEquipment && template.requiredEquipment.length > 0) ? 'Equipment Required' : 'Bodyweight Only'}</span>
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
                                <p className="text-zinc-500 font-medium">Configure exercises, intensity, and progression details</p>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                onClick={() => { setView('list'); setEditingTemplate(null); }}
                                className="flex-1 md:px-8 h-14 rounded-2xl border border-white/5 bg-zinc-900/50 text-zinc-500 hover:text-white font-black uppercase italic tracking-widest transition-all text-xs"
                            >
                                Discard
                            </button>
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
                                            <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Difficulty Level</label>
                                            <select
                                                value={editingTemplate?.difficultyLevel || 'intermediate'}
                                                onChange={(e) => setEditingTemplate({ ...editingTemplate!, difficultyLevel: e.target.value })}
                                                className="w-full bg-zinc-900 border border-white/5 h-14 rounded-2xl px-5 outline-none focus:ring-1 focus:ring-primary/40 text-white text-sm font-black uppercase tracking-tight italic"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Target Body Parts Selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic">Target Body Parts</label>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {["abs", "arm", "chest", "leg", "back", "shoulder"].map((part) => {
                                                const isSelected = editingTemplate?.targetBodyParts?.includes(part);
                                                return (
                                                    <button
                                                        key={part}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = editingTemplate.targetBodyParts || [];
                                                            const updated = current.includes(part)
                                                                ? current.filter((p: string) => p !== part)
                                                                : [...current, part];
                                                            setEditingTemplate({ ...editingTemplate, targetBodyParts: updated });
                                                        }}
                                                        className={cn(
                                                            "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                                                            isSelected
                                                                ? "bg-primary text-black border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] scale-105"
                                                                : "bg-zinc-900 text-zinc-400 border-white/5 hover:border-white/10 hover:text-white"
                                                        )}
                                                    >
                                                        {part}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Required Equipment */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-zinc-600 uppercase tracking-widest pl-1 italic flex items-center gap-2">
                                            <Settings size={14} className="text-primary" /> Required Equipment
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 min-h-[44px] p-3 bg-zinc-900 border border-white/5 rounded-2xl items-center">
                                            {(editingTemplate?.requiredEquipment || []).map((eq: string, i: number) => (
                                                <Badge key={i} className="bg-primary/10 text-primary border-primary/25 gap-1.5 pr-1.5 font-black italic uppercase text-[9px] tracking-widest rounded-lg h-7">
                                                    {eq}
                                                    <X size={10} className="cursor-pointer hover:text-white transition-colors" onClick={() => setEditingTemplate({ ...editingTemplate, requiredEquipment: editingTemplate.requiredEquipment.filter((_: any, j: number) => i !== j) })} />
                                                </Badge>
                                            ))}
                                            <Input
                                                placeholder="+ ADD EQUIPMENT (ENTER)"
                                                className="flex-1 bg-transparent border-0 h-6 text-[9px] font-black italic uppercase text-white focus-visible:ring-0 p-0 placeholder:text-zinc-700"
                                                onKeyDown={(e: any) => {
                                                    if (e.key === 'Enter') {
                                                        const val = (e.currentTarget.value).trim();
                                                        if (val && !editingTemplate.requiredEquipment.includes(val)) {
                                                            setEditingTemplate({
                                                                ...editingTemplate,
                                                                requiredEquipment: [...(editingTemplate.requiredEquipment || []), val]
                                                            });
                                                            e.currentTarget.value = '';
                                                        }
                                                        e.preventDefault();
                                                    }
                                                }}
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
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Exercises on Day 1 */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black italic flex items-center gap-3 text-white">
                                    <Zap size={20} className="text-primary" /> DAY 1 PROTOCOL
                                </h3>
                            </div>

                            <div className="space-y-12">
                                <div className="bg-zinc-950/40 border border-white/5 rounded-[3rem] p-8 shadow-2xl relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-primary text-black flex items-center justify-center rounded-2xl font-black italic text-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                                            1
                                        </div>
                                        <h4 className="text-xl font-black italic text-white uppercase tracking-tight">TRAINING SESSION</h4>
                                    </div>

                                    <div className="space-y-4">
                                        {((editingTemplate?.days?.[0]?.exercises) || []).map((ex: any, eIndex: number) => (
                                            <div key={eIndex} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-zinc-900/50 p-6 rounded-[2rem] border border-white/5 group shadow-lg">
                                                <div className="flex items-center gap-4 flex-1 w-full min-w-0">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                                                        <img src={ex.image || ex.gifUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="text-white font-black italic uppercase group-hover:text-primary transition-colors truncate pr-2">{ex.name}</h5>
                                                        <p className="text-[9px] text-zinc-500 font-black uppercase italic tracking-widest mt-1 capitalize">Target: {ex.targetMuscles?.[0] || "General"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 w-full md:w-auto">
                                                    <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5 text-center min-w-[50px]">
                                                        <span className="text-[7px] font-black text-zinc-500 uppercase italic tracking-widest block">Sets</span>
                                                        <span className="text-xs font-black italic text-primary">{ex.sets}</span>
                                                    </div>
                                                    <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5 text-center min-w-[70px]">
                                                        <span className="text-[7px] font-black text-zinc-500 uppercase italic tracking-widest block">Reps</span>
                                                        <span className="text-xs font-black italic text-white truncate max-w-[60px] inline-block">{ex.reps}</span>
                                                    </div>
                                                    <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5 text-center min-w-[50px]">
                                                        <span className="text-[7px] font-black text-zinc-500 uppercase italic tracking-widest block">Load</span>
                                                        <span className="text-xs font-black italic text-white">{ex.weight || "0"}</span>
                                                    </div>
                                                    <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/5 text-center min-w-[50px]">
                                                        <span className="text-[7px] font-black text-zinc-500 uppercase italic tracking-widest block">Rest</span>
                                                        <span className="text-xs font-black italic text-white uppercase">{ex.rest || "60s"}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditExercise(eIndex)}
                                                            className="p-2.5 text-zinc-500 hover:text-primary transition-colors bg-zinc-950 border border-white/5 rounded-xl"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExercise(eIndex)}
                                                            className="p-2.5 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-950 border border-white/5 rounded-xl"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleAddExerciseClick}
                                            className="w-full py-6 mt-4 border-2 border-dashed border-white/5 rounded-[2rem] text-zinc-700 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all text-sm font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 group"
                                        >
                                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                            DEPLOY DRILL
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Exercise Search and Configuration Dialog */}
            <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
                <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
                    <DialogHeader className="mb-10">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                                <Dumbbell size={28} />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                                    {editingExerciseIndex !== null ? 'Modify Unit' : 'Configure New Unit'}
                                </DialogTitle>
                                <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mt-1 italic">Mechanical Specification Phase</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-8">
                        {editingExerciseIndex === null && !selectedExercise ? (
                            <div className="space-y-6">
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                                    <Input
                                        placeholder="SEARCH EXERCISE (e.g. BENCH PRESS)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/40 border-white/10 h-16 pl-14 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                {searching && (
                                    <div className="flex items-center gap-3 justify-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span className="text-xs font-black uppercase text-zinc-500 tracking-widest animate-pulse">Querying ExerciseDB...</span>
                                    </div>
                                )}

                                {!searching && suggestions.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-4 bg-black/40 rounded-2xl border border-white/5">
                                        {suggestions.map((suggestion) => (
                                            <div
                                                key={suggestion.exerciseId}
                                                onClick={() => {
                                                    setSelectedExercise(suggestion);
                                                }}
                                                className="group relative cursor-pointer bg-[#0c0c0e] border border-white/5 hover:border-primary/40 rounded-xl p-3 flex flex-col gap-2 overflow-hidden"
                                            >
                                                <div className="relative w-full aspect-square bg-black/60 rounded-lg overflow-hidden border border-white/5">
                                                    <img src={suggestion.gifUrl} alt={suggestion.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white text-[11px] line-clamp-1 capitalize">{suggestion.name}</h5>
                                                    <Badge className="bg-primary/10 text-primary border-0 text-[7px] px-1 uppercase font-black">{suggestion.bodyParts?.[0]}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {selectedExercise && (
                                    <div className="grid grid-cols-[120px_1fr] gap-4 bg-black/40 p-4 border border-white/5 rounded-2xl items-center">
                                        <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                                            <img src={selectedExercise.gifUrl || selectedExercise.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="space-y-1.5 text-[11px] text-zinc-400">
                                            <h4 className="text-white font-black uppercase italic text-sm capitalize">{selectedExercise.name}</h4>
                                            <div><span className="font-bold text-zinc-500 uppercase tracking-wider text-[8px]">Target: </span><span className="text-white capitalize">{selectedExercise.targetMuscles?.join(", ") || selectedExercise.targetMuscles}</span></div>
                                            <div><span className="font-bold text-zinc-500 uppercase tracking-wider text-[8px]">Equipment: </span><span className="text-white capitalize">{selectedExercise.equipments?.join(", ") || selectedExercise.equipments}</span></div>
                                            {editingExerciseIndex === null && (
                                                <button type="button" onClick={() => setSelectedExercise(null)} className="text-[10px] text-primary font-bold hover:underline">Change Exercise Selection</button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1 italic">Volume Grid</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase italic">Sets</span>
                                                <Input type="number" value={sets} onChange={(e) => setSets(parseInt(e.target.value) || 1)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase italic">Reps / Duration</span>
                                                <Input value={reps} onChange={(e) => setReps(e.target.value)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" placeholder="10-12 or 60s" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1 italic">Tension Matrix</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase italic">Load (KG)</span>
                                                <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" />
                                            </div>
                                            <div className="space-y-2">
                                                <span className="text-[8px] font-black text-zinc-600 uppercase italic">Rest Period</span>
                                                <Input value={rest} onChange={(e) => setRest(e.target.value)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" placeholder="60s" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1 italic">Field Directives</Label>
                                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-black border-white/10 p-6 rounded-2xl text-white font-medium min-h-[100px] resize-none focus:ring-1 focus:ring-primary/50 italic text-xs tracking-widest" placeholder="FOCUS ON CONTROLLED NEGATIVES..." />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="mt-10">
                        <Button onClick={handleSaveExercise} disabled={!selectedExercise} className="w-full bg-primary hover:bg-primary/90 text-black font-black italic rounded-2xl h-16 text-lg uppercase shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] disabled:opacity-50">
                            Synchronize Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkoutTemplates;

