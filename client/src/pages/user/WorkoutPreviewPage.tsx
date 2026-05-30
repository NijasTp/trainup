import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Play,
    Activity,
    Dumbbell,
    Calendar as CalendarIcon,
    Check
} from "lucide-react";
import { getWorkoutTemplateById, startWorkoutTemplate } from "@/services/templateService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import Aurora from "@/components/ui/Aurora";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WorkoutPreviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [template, setTemplate] = useState<IWorkoutTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [scheduleType, setScheduleType] = useState<'contiguous' | 'weekly'>('contiguous');
    const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTemplateDetails();
        }
    }, [id]);

    async function fetchTemplateDetails() {
        setIsLoading(true);
        try {
            const response = await getWorkoutTemplateById(id!);
            setTemplate(response.template || response);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to load template details");
        } finally {
            setIsLoading(false);
        }
    }

    const handleStartWorkout = async () => {
        if (!template) return;
        try {
            if (!template.days || template.days.length === 0) {
                toast.error("This template has no workout days assigned. You cannot activate an empty protocol.");
                return;
            }

            if (template.type === 'one-time') {
                const res = await startWorkoutTemplate(template._id);
                if (res.sessionId) {
                    toast.success("Workout session created!");
                    navigate(`/workouts/${res.sessionId}/start`);
                }
                return;
            }

            // Series templates open the scheduler
            setIsScheduleOpen(true);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to start workout");
        }
    };

    const confirmStartTemplate = async () => {
        if (!template) return;
        try {
            if (scheduleType === 'weekly' && weeklyDays.length === 0) {
                toast.error("Please select at least one day for weekly scheduling");
                return;
            }
            await startWorkoutTemplate(template._id, scheduleType, weeklyDays);
            setIsScheduleOpen(false);
            setIsSuccessOpen(true);
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to start workout program schedule");
        }
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium italic tracking-widest uppercase">Analyzing Plan...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center px-6">
                    <div className="p-6 bg-slate-900/50 rounded-full text-slate-500">
                        <Dumbbell className="h-16 w-16" />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase">Workout Not Found</h2>
                    <Button onClick={() => navigate("/workouts/browse")} variant="outline" className="rounded-full px-8 h-12 border-white/10">
                        Back to Library
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0d1117", "#020617"]} amplitude={1.1} blend={0.6} />
            </div>

            <SiteHeader />

            <main className="relative z-10 flex-1 container mx-auto px-4 py-8 pb-32">
                <div className="max-w-4xl mx-auto space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between"
                    >
                        <Button
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-12 hover:bg-white/10 group"
                        >
                            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Back
                        </Button>
                        <Badge className="bg-primary/10 text-primary border-primary/20 py-2 px-6 rounded-full font-black uppercase tracking-widest text-[10px]">
                            Previewing Session
                        </Badge>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Summary Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-12 relative group"
                        >
                            <div className="relative h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
                                <img
                                    src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
                                    alt={template.title}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                                <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                                            {template.title}
                                        </h1>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold uppercase tracking-widest text-[10px] px-4 py-1">
                                                {template.type === 'one-time' ? 'Quick' : 'Program'}
                                            </Badge>
                                            <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-bold uppercase tracking-widest text-[10px] px-4 py-1">
                                                {template.difficultyLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Duration</p>
                                            <p className="text-xl font-black text-white uppercase tracking-tighter">
                                                {template.days?.[0]?.exercises?.length * 5 || 25} MINS
                                            </p>
                                        </div>
                                        <div className="w-px h-10 bg-white/10"></div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Intake</p>
                                            <p className="text-xl font-black text-primary uppercase tracking-tighter">
                                                {template.days?.[0]?.exercises?.length || 0} Drills
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Drill Breakdown */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-12 space-y-8"
                        >
                            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Activity className="h-6 w-6 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tight">Execution Strategy</h2>
                            </div>

                            <div className="space-y-4">
                                {(template.days?.[0]?.exercises || []).map((ex, idx) => (
                                    <motion.div 
                                        key={idx}
                                        whileHover={{ x: 10 }}
                                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-6 group hover:border-primary/30 transition-all"
                                    >
                                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                            <img src={ex.image || "https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=800&auto=format&fit=crop"} className="w-full h-full object-cover" />
                                            <div className="absolute top-2 left-2 bg-black/60 rounded-lg w-6 h-6 flex items-center justify-center text-[10px] font-black text-white backdrop-blur-md">
                                                {idx + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1 flex justify-between items-center pr-4">
                                            <div>
                                                <h3 className="text-xl font-black italic uppercase text-white group-hover:text-primary transition-colors">{ex.name}</h3>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1 italic">Target Performance</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-black text-white">{ex.sets}</span>
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sets</span>
                                                </div>
                                                <span className="text-xs font-black text-primary uppercase tracking-tighter">{ex.reps || "8-12 REPS"}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                    >
                        <Button
                            onClick={handleStartWorkout}
                            className="w-full h-24 rounded-[3rem] text-2xl font-black italic tracking-widest shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] bg-primary hover:bg-primary/90 text-slate-950 border-0 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-4 uppercase">
                                <Play className="h-8 w-8 fill-current group-hover:scale-110 transition-transform" />
                                EXECUTE SESSION
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* STUNNING GLASS SCHEDULING DIALOG */}
            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <DialogContent className="max-w-xl bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 text-white">
                    <DialogHeader>
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                            <CalendarIcon className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black italic tracking-tight text-center uppercase">
                            Configure Training Protocol
                        </DialogTitle>
                        <p className="text-slate-400 text-sm text-center">
                            Select how you want to schedule the template days to fit your routine.
                        </p>
                    </DialogHeader>

                    <div className="space-y-6 py-6">
                        {/* Selector Tabs */}
                        <div className="grid grid-cols-2 gap-4 p-1.5 bg-white/5 border border-white/5 rounded-3xl">
                            <button
                                onClick={() => setScheduleType('contiguous')}
                                className={cn(
                                    "py-4 rounded-2xl font-black italic text-xs tracking-wider transition-all uppercase",
                                    scheduleType === 'contiguous'
                                        ? "bg-primary text-white shadow-lg"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Contiguous Rolling
                            </button>
                            <button
                                onClick={() => setScheduleType('weekly')}
                                className={cn(
                                    "py-4 rounded-2xl font-black italic text-xs tracking-wider transition-all uppercase",
                                    scheduleType === 'weekly'
                                        ? "bg-primary text-white shadow-lg"
                                        : "text-slate-400 hover:text-white"
                                )}
                            >
                                Custom Weekly
                            </button>
                        </div>

                        {/* Contiguous Detail */}
                        {scheduleType === 'contiguous' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 text-center text-slate-400 text-sm leading-relaxed"
                            >
                                Days roll sequentially one after another. Perfect for daily progression or dynamic rest patterns.
                            </motion.div>
                        )}

                        {/* Custom Weekly days checklist */}
                        {scheduleType === 'weekly' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">
                                    Choose targeted training days
                                </p>
                                <div className="flex justify-center gap-2">
                                    {[
                                        { label: "S", value: 0 },
                                        { label: "M", value: 1 },
                                        { label: "T", value: 2 },
                                        { label: "W", value: 3 },
                                        { label: "T", value: 4 },
                                        { label: "F", value: 5 },
                                        { label: "S", value: 6 },
                                    ].map((day) => {
                                        const isSelected = weeklyDays.includes(day.value);
                                        return (
                                            <button
                                                key={day.value}
                                                onClick={() => {
                                                    if (weeklyDays.includes(day.value)) {
                                                        setWeeklyDays(weeklyDays.filter(d => d !== day.value));
                                                    } else {
                                                        setWeeklyDays([...weeklyDays, day.value].sort());
                                                    }
                                                }}
                                                className={cn(
                                                    "w-12 h-12 rounded-full font-black text-sm flex items-center justify-center border transition-all duration-300 shadow-md",
                                                    isSelected
                                                        ? "bg-primary border-primary text-slate-950 scale-110 shadow-primary/20"
                                                        : "bg-white/5 border-white/10 text-slate-400 hover:border-slate-500 hover:text-white"
                                                )}
                                            >
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-semibold">
                                    Training mapped on: {weeklyDays.length > 0 ? weeklyDays.map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ") : "No days selected"}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsScheduleOpen(false)}
                            className="flex-1 h-14 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase text-xs tracking-wider"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmStartTemplate}
                            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/20"
                        >
                            Activate Protocol
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* STUNNING GLASS SUCCESS CONFIRMATION OVERLAY */}
            <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <DialogContent className="max-w-md bg-slate-950/90 backdrop-blur-2xl border border-primary/30 rounded-[3rem] p-10 text-white text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-2xl shadow-primary/30 border border-primary/20">
                            <Check className="h-12 w-12" />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-blue-500">
                                Protocol Engaged
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                                Training flow integrated
                            </p>
                        </div>

                        <div className="p-5 rounded-3xl bg-white/5 border border-white/5 text-slate-300 space-y-2 text-left text-xs font-semibold">
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500 uppercase">Template:</span>
                                <span className="text-white uppercase font-black">{template?.title}</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-slate-500 uppercase">Schedule Type:</span>
                                <span className="text-primary uppercase font-black">{scheduleType === 'weekly' ? 'Custom Weekly' : 'Contiguous Rolling'}</span>
                            </div>
                            {scheduleType === 'weekly' && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase">Training Days:</span>
                                    <span className="text-white font-black">{weeklyDays.map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}</span>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={() => {
                                setIsSuccessOpen(false);
                                navigate("/workouts");
                            }}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/20 animate-bounce"
                        >
                            Begin Protocol
                        </Button>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
