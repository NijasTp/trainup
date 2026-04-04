import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Clock,
    Target,
    Play,
    Activity,
    Flame,
    X,
    Dumbbell
} from "lucide-react";
import { getWorkoutTemplateById, toggleWorkoutTemplate, startWorkoutTemplate } from "@/services/templateService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import { toast } from "sonner";
import type { RootState } from "@/redux/store";
import API from "@/lib/axios";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";
import { cn } from "@/lib/utils";

export default function TemplateDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [template, setTemplate] = useState<IWorkoutTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((state: RootState) => state.userAuth.user);

    useEffect(() => {
        if (id) {
            fetchTemplateDetails();
        }
    }, [id]);

    async function fetchTemplateDetails() {
        setIsLoading(true);
        try {
            const response = await getWorkoutTemplateById(id!);
            // Handle possible wrapper or direct object
            setTemplate(response.template || response);
        } catch (err) {
            toast.error("Failed to load template details");
        } finally {
            setIsLoading(false);
        }
    }

    const refreshProfile = async () => {
        try {
            const res = await API.get('/user/get-profile');
            if (res.data.user) {
                dispatch(updateUser(res.data.user));
            }
        } catch (e) {
            console.error("Failed to refresh profile", e);
        }
    };

    const handleToggleTemplate = async () => {
        if (!template) return;
        try {
            const isActive = isTemplateActive(template._id);

            if (template.type === 'one-time' && !isActive) {
                // One-time templates can be started directly as a session
                const res = await startWorkoutTemplate(template._id);
                if (res.sessionId) {
                    toast.success("Workout session created!");
                    navigate(`/workouts/${res.sessionId}/start`);
                }
                return;
            }

            const action = isActive ? "stopped" : "started";
            const res = await toggleWorkoutTemplate(template._id);
            await refreshProfile();

            if (res.sessionId) {
                toast.success("Workout session created!");
                navigate(`/workouts/${res.sessionId}/start`);
                return;
            }

            toast.success(`Successfully ${action} ${template.title}!`);
        } catch (err) {
            toast.error("Failed to update template status");
        }
    };

    const isTemplateActive = (templateId: string) => {
        return user?.activeWorkoutTemplates?.some(t => t.templateId === templateId) || user?.activeWorkoutTemplate === templateId;
    };

    const difficultyColors = {
        beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        advanced: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium italic tracking-widest uppercase">Preparing Training Plan...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white">
                <SiteHeader />
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="p-6 bg-slate-900/50 rounded-full text-slate-500">
                        <Dumbbell className="h-16 w-16" />
                    </div>
                    <h2 className="text-3xl font-black italic">PLAN NOT FOUND</h2>
                    <Button onClick={() => navigate("/workouts/browse")} variant="outline" className="rounded-full px-8 h-12">
                        Back to Library
                    </Button>
                </div>
            </div>
        );
    }

    const isActive = isTemplateActive(template._id);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0d1117", "#020617"]} amplitude={1.1} blend={0.6} />
            </div>

            <SiteHeader />

            <main className="relative z-10 flex-1 container mx-auto px-4 py-12 pb-24">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-12">
                    {/* Header Layout */}
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <div className="w-full lg:w-1/2 space-y-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-[3rem] blur opacity-75 transition duration-1000"></div>
                                <div className="relative h-[400px] md:h-[550px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900">
                                    <img
                                        src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
                                        alt={template.title}
                                        className="w-full h-full object-cover transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                                    <button
                                        onClick={() => navigate(-1)}
                                        className="absolute top-8 left-8 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-black/60 transition-all text-white group"
                                    >
                                        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                                    </button>

                                    <div className="absolute top-8 right-8">
                                        <Badge className={cn("backdrop-blur-md border-0 py-2.5 px-6 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl", difficultyColors[template.difficultyLevel] || difficultyColors.intermediate)}>
                                            {template.difficultyLevel}
                                        </Badge>
                                    </div>

                                    <div className="absolute bottom-10 left-10 right-10">
                                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                                            {template.title}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: Clock, label: "Duration", value: template.type === 'one-time' ? "Singular" : `${template.days?.length} Sessions` },
                                    { icon: Target, label: "Goal", value: template.goal || "Fitness" },
                                    { icon: Flame, label: "Intensity", value: "Optimal" },
                                    { icon: Activity, label: "Type", value: template.type === 'one-time' ? "Quick" : "Series" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] text-center space-y-1 backdrop-blur-sm">
                                        <stat.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-xs font-black text-white uppercase tracking-tighter">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">Overview</h2>
                                </div>
                                <p className="text-xl text-slate-400 leading-relaxed font-light">
                                    {template.description || "Achieve your results with this precision-crafted training cycle. Stay consistent, follow the steps, and watch your progress unfold."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black italic tracking-tight uppercase">What You Need</h2>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(template.requiredEquipment?.length ? template.requiredEquipment : ['Standard Gym Access']).map((req, i) => (
                                        <Badge key={i} variant="outline" className="px-5 py-2.5 border-white/10 bg-white/5 text-slate-300 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                                            {req}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    onClick={handleToggleTemplate}
                                    className={cn(
                                        "w-full h-24 rounded-[2.5rem] text-2xl font-black italic tracking-widest transition-all shadow-2xl overflow-hidden group relative border-0",
                                        isActive
                                            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20"
                                            : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                                    )}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-4 uppercase">
                                        {isActive ? (
                                            <><X className="h-7 w-7" /> STOP PROGRAM</>
                                        ) : template.type === 'one-time' ? (
                                            <><Play className="h-7 w-7" /> START WORKOUT</>
                                        ) : (
                                            <><Play className="h-7 w-7" /> START PROGRAM</>
                                        )}
                                    </span>
                                </Button>
                                <p className="text-center text-slate-500 text-xs mt-6 font-bold uppercase tracking-[0.2em]">
                                    {isActive ? "Program is currently active in your My Workouts" : template.type === 'one-time' ? "Start this session immediately" : "Add this rotation to your weekly schedule"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-10 pt-10">
                        <div className="flex items-center justify-between border-b border-white/10 pb-8">
                            <div className="flex items-center gap-4">
                                <Dumbbell className="h-10 w-10 text-primary" />
                                <h2 className="text-4xl font-black italic tracking-tight uppercase">
                                    {template.type === 'one-time' ? "Workout Breakdown" : "Program Schedule"}
                                </h2>
                            </div>
                            <Badge className="bg-white/5 text-slate-400 border-white/10 px-6 py-2 rounded-full font-bold">
                                {template.days?.length || 0} {template.type === 'one-time' ? 'Total' : 'Weekly'} Sessions
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {template.days?.map((day) => (
                                <motion.div
                                    key={day.dayNumber}
                                    whileHover={{ y: -10 }}
                                    className="group relative bg-[#0a0a10] border border-white/10 rounded-[3rem] p-10 space-y-8 hover:border-primary/30 transition-all shadow-xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black italic text-2xl">
                                            #{day.dayNumber}
                                        </div>
                                        <Badge className="bg-slate-900 border-white/10 text-slate-500 font-black tracking-widest text-[10px] uppercase px-4 py-1.5">
                                            SESSION
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1 italic">Title</p>
                                        <h3 className="text-2xl font-black text-white uppercase italic">{day.name || "Training Session"}</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {(day.exercises || []).map((ex, eIdx) => (
                                            <div key={eIdx} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight">{ex.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Exercise {eIdx + 1}</span>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <span className="text-xs font-black text-primary">{ex.sets} SETS</span>
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-tighter">{ex.reps || "8-12 REPS"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </main>

            <SiteFooter />
        </div>
    );
}
