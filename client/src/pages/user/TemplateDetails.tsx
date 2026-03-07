import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    Clock,
    Target,
    Play,
    CheckCircle2,
    Info,
    Activity,
    Flame,
    Star,
    X,
    Dumbbell
} from "lucide-react";
import { getWorkoutTemplateById, toggleWorkoutTemplate } from "@/services/templateService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import { toast } from "react-toastify";
import type { RootState } from "@/redux/store";
import API from "@/lib/axios";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";

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
            setTemplate(response.template);
        } catch (err) {
            toast.error("Failed to load template details");
            console.error(err);
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
            const action = isActive ? "stopped" : "started";

            await toggleWorkoutTemplate(template._id);
            await refreshProfile();

            toast.success(`Successfully ${action} ${template.name}!`);
        } catch (err) {
            toast.error("Failed to update template status");
        }
    };

    const isTemplateActive = (templateId: string) => {
        if (user?.activeWorkoutTemplates?.some(t => t.templateId === templateId)) return true;
        if (user?.activeWorkoutTemplate === templateId) return true;
        return false;
    };

    if (isLoading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium italic tracking-widest">ANALYZING PLAN...</p>
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
                    <h2 className="text-3xl font-black italic">TEMPLATE NOT FOUND</h2>
                    <Button onClick={() => navigate("/workouts/browse")} variant="outline" className="rounded-full px-8 h-12">
                        Back to Templates
                    </Button>
                </div>
            </div>
        );
    }

    const isActive = isTemplateActive(template._id);

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0d1117", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
            </div>

            <SiteHeader />

            <main className="relative z-10 flex-1 container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto space-y-12"
                >
                    {/* Header Area */}
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        {/* Image Section */}
                        <div className="w-full lg:w-1/2 space-y-6">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-600/30 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                                    <img
                                        src={template.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
                                        alt={template.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                                    <button
                                        onClick={() => navigate(-1)}
                                        className="absolute top-6 left-6 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-black/60 transition-all text-white group"
                                    >
                                        <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                                    </button>

                                    <div className="absolute top-6 right-6">
                                        <Badge className="bg-primary/90 backdrop-blur-md text-white border-0 py-2 px-6 rounded-full font-bold shadow-xl">
                                            {template.difficulty || 'Intermediate'}
                                        </Badge>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 space-y-2">
                                        <div className="flex items-center gap-2 text-primary font-bold">
                                            <Star className="h-5 w-5 fill-current" />
                                            <span className="text-xl">4.9 Rating</span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                                            {template.name}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: Clock, label: "Duration", value: `${template.duration} Days` },
                                    { icon: Target, label: "Goal", value: template.goal },
                                    { icon: Flame, label: "Intensity", value: "High" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center space-y-1 backdrop-blur-sm">
                                        <stat.icon className="h-5 w-5 mx-auto text-primary" />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-sm font-black text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info & Action Section */}
                        <div className="w-full lg:w-1/2 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                                    <h2 className="text-2xl font-black italic tracking-tight">MISSION OVERVIEW</h2>
                                </div>
                                <p className="text-lg text-slate-400 leading-relaxed font-light">
                                    {template.description || "This specialized program is engineered to fast-track your progress through precision-crafted workout cycles. Master the movements, stay consistent, and unlock your true potential."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                                    <h2 className="text-2xl font-black italic tracking-tight">REQUIREMENTS</h2>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(template.equipmentNeeded || ['Standard Gym', 'Free Weights', 'Resistance Bands']).map((req, i) => (
                                        <Badge key={i} variant="outline" className="px-4 py-2 border-white/10 bg-white/5 text-slate-300 rounded-xl font-medium">
                                            {req}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button
                                    onClick={handleToggleTemplate}
                                    className={`w-full h-20 rounded-[2rem] text-xl font-black italic tracking-widest transition-all shadow-2xl overflow-hidden group relative ${isActive
                                        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                                        : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                                        }`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {isActive ? (
                                            <><X className="h-6 w-6" /> ABORT PROGRAM</>
                                        ) : (
                                            <><Play className="h-6 w-6" /> COMMENCE TRAINING</>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </Button>
                                <p className="text-center text-slate-500 text-xs mt-4 font-medium uppercase tracking-widest">
                                    {isActive ? "Program is currently active in your schedule" : "Ready to start your transformation?"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Training Schedule Section */}
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <div className="flex items-center gap-3">
                                <Activity className="h-8 w-8 text-primary" />
                                <h2 className="text-3xl font-black italic tracking-tight uppercase">Training Protocol</h2>
                            </div>
                            <Badge variant="outline" className="border-primary/20 text-primary px-4 py-1">
                                {template.days?.length || 0} Sessions
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {template.days?.map((day) => (
                                <motion.div
                                    key={day.dayNumber}
                                    whileHover={{ y: -5 }}
                                    className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-4xl font-black italic text-white/10 group-hover:text-primary/20 transition-colors">#{day.dayNumber}</span>
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-primary uppercase tracking-[0.2em] italic">Session Name</p>
                                        <h3 className="text-xl font-bold text-white">{day.name}</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {(day.exercises || []).map((ex, eIdx) => (
                                            <div key={eIdx} className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-200">{ex.name}</span>
                                                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Drill #{eIdx + 1}</span>
                                                </div>
                                                <Badge className="bg-slate-900 border-white/10 text-primary text-[10px]">
                                                    {ex.sets}x{ex.reps || "8-12"}
                                                </Badge>
                                            </div>
                                        ))}
                                        {(!day.exercises || day.exercises.length === 0) && (
                                            <p className="text-slate-600 text-sm italic py-4 text-center">No exercises defined for this session</p>
                                        )}
                                    </div>

                                    {day.workoutName && (
                                        <div className="pt-4 flex items-center gap-2 text-xs text-slate-500 font-medium italic">
                                            <Info className="h-3 w-3" />
                                            <span>Based on {day.workoutName}</span>
                                        </div>
                                    )}
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
