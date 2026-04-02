import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, Save, X, FileText, Loader2, Dumbbell, Calendar, ChevronDown, ImagePlus, Layers, Settings } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/lib/axios";
import { toast } from "react-toastify";
import type { IExercise, IWorkoutTemplate, WgerExercise } from "@/interfaces/admin/adminAddTemplates";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageCropper from "@/components/common/ImageCropper";


const AdminAddWorkoutTemplate = ({ mode = "admin" }: { mode?: "admin" | "trainer" }) => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const Layout = mode === "trainer" ? TrainerLayout : AdminLayout;
    const [formData, setFormData] = useState<IWorkoutTemplate & { imageFile?: Blob }>({
        title: "",
        description: "",
        image: "",
        type: 'series',
        repetitions: 1,
        difficultyLevel: 'intermediate',
        requiredEquipment: [],
        isPublic: true,
        days: []
    } as any);
    const [searchQuery, setSearchQuery] = useState("");
    const [allSearchResults, setAllSearchResults] = useState<WgerExercise[]>([]);
    const [displayedSearchResults, setDisplayedSearchResults] = useState<WgerExercise[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [perPage] = useState<number>(5);
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);


    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    const response = await API.get(`/template/workout/${id}`);
                    setFormData(response.data);
                } catch (error: unknown) {
                    console.error("Error fetching template:", error);
                    toast.error("Failed to load template");
                }
            };
            fetchTemplate();
        }
    }, [id]);

    useEffect(() => {
        if (searchQuery) {
            const fetchExercises = async () => {
                setSearchLoading(true);
                try {
                    const response = await fetch(
                        `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(searchQuery)}&language=2`,
                        {
                            headers: { Accept: "application/json" },
                        }
                    );
                    if (!response.ok) throw new Error("Failed to fetch exercises");
                    const data = await response.json();
                    setAllSearchResults(data.suggestions || []);
                    setPage(1);
                } catch (error) {
                    console.error("Error fetching WGER exercises:", error);
                } finally {
                    setSearchLoading(false);
                }
            };
            const debounce = setTimeout(fetchExercises, 300);
            return () => clearTimeout(debounce);
        } else {
            setAllSearchResults([]);
            setDisplayedSearchResults([]);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (formData.type === 'one-time') {
            if (formData.days.length > 1) {
                setFormData(prev => ({ ...prev, days: [prev.days[0]], repetitions: 1 }));
                toast.info("Truncated to 1 day for one-time session protocol");
            } else if (formData.repetitions !== 1) {
                setFormData(prev => ({ ...prev, repetitions: 1 }));
            }
        }
    }, [formData.type, formData.days.length, formData.repetitions]);

    useEffect(() => {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setDisplayedSearchResults(allSearchResults.slice(start, end));
    }, [page, allSearchResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: (name === 'repetitions' || name === 'duration') ? (parseInt(value) || 0) : value
        }));
    };

    const addDay = () => {
        if (formData.type === 'one-time' && formData.days.length >= 1) {
            toast.warning("One-time sessions are limited to 1 day architecture");
            return;
        }
        setFormData(prev => ({
            ...prev,
            days: [
                ...prev.days,
                { dayNumber: prev.days.length + 1, exercises: [] }
            ]
        }));
        setActiveDayIndex(formData.days.length);
    };

    const removeDay = (index: number) => {
        setFormData(prev => ({
            ...prev,
            days: prev.days.filter((_, i) => i !== index).map((day, i) => ({ ...day, dayNumber: i + 1 }))
        }));
        if (activeDayIndex === index) setActiveDayIndex(null);
    };

    const addExerciseToDay = (dayIndex: number, exercise: WgerExercise) => {
        setFormData(prev => {
            const newDays = [...prev.days];
            newDays[dayIndex].exercises.push({
                exerciseId: exercise.data.id.toString(),
                name: exercise.value,
                image: exercise.data.image_thumbnail ? `https://wger.de${exercise.data.image_thumbnail}` : undefined,
                sets: 3,
                reps: "10-12"
            });
            return { ...prev, days: newDays };
        });
        setSearchQuery("");
        setAllSearchResults([]);
    };

    const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
        setFormData(prev => {
            const newDays = [...prev.days];
            newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
            return { ...prev, days: newDays };
        });
    };

    const updateExercise = <K extends keyof IExercise>(dayIndex: number, exIndex: number, field: K, value: IExercise[K]) => {
        setFormData(prev => {
            const newDays = [...prev.days];
            newDays[dayIndex].exercises[exIndex] = { ...newDays[dayIndex].exercises[exIndex], [field]: value };
            return { ...prev, days: newDays };
        });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempImage(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        setFormData(prev => ({ ...prev, imageFile: croppedBlob, image: URL.createObjectURL(croppedBlob) }));
        setShowCropper(false);
    };

    const handleSave = async () => {
        if (!formData.title) {
            toast.error("Blueprint Title (Name) is required");
            return;
        }
        if (!formData.image) {
            toast.error("Visual Signature (Image) is mandatory");
            return;
        }
        if (formData.days.length === 0) {
            if (formData.type === 'one-time') {
                // Auto add the single day if session is one-time but no days yet
                formData.days = [{ dayNumber: 1, exercises: [] }];
            } else {
                toast.error("Add at least one training day to the architecture");
                return;
            }
        }

        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'days') {
                    data.append('days', JSON.stringify(formData.days));
                } else if (key === 'requiredEquipment') {
                    data.append('requiredEquipment', JSON.stringify(formData.requiredEquipment));
                } else if (key === 'imageFile') {
                    if (formData.imageFile) {
                        data.append('image', formData.imageFile as Blob, 'template.jpg');
                    }
                } else if (key === 'image') {
                    if (!formData.imageFile && formData.image) {
                        data.append('image', String(formData.image));
                    }
                } else if (key !== 'durationDays' && formData[key as keyof typeof formData] !== undefined) {
                    data.append(key, String(formData[key as keyof typeof formData]));
                }
            });

            if (id) {
                await API.patch(`/template/workout/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Blueprint archived successfully");
            } else {
                await API.post("/template/workout", data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("New blueprint forged");
            }
            navigate(mode === 'trainer' ? "/trainer/templates" : "/admin/templates");
        } catch (error: unknown) {
            toast.error("Process failed in the forge");
            console.log(error)
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-cyan-500/20 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                            <Dumbbell className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                                {id ? "Update" : "Create"} <span className="text-cyan-400">Template</span>
                            </h1>
                            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                                Workout Plan Builder
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(mode === 'trainer' ? "/trainer/templates" : "/admin/templates")}
                            className="flex-1 md:flex-none border-white/5 text-gray-400 font-black italic uppercase text-xs hover:bg-white/5"
                        >
                            Abort
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 md:flex-none bg-cyan-500 hover:bg-cyan-400 text-black font-black italic uppercase text-xs px-10 h-14 rounded-2xl shadow-[0_0_20_rgba(6,182,212,0.3)] transition-all hover:scale-105"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Template
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-[1fr_380px] gap-10">
                    <div className="space-y-10">
                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-0">
                            <CardHeader className="bg-white/5 p-8 border-b border-white/10">
                                <CardTitle className="text-white text-xl font-black italic uppercase tracking-widest flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-cyan-400" /> Template Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-10">
                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                                        <ImagePlus size={16} className="text-cyan-400" />
                                        Cover Image (Required)
                                    </label>
                                    <div className="relative group cursor-pointer aspect-[21/9] rounded-[2rem] overflow-hidden border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all bg-black/40">
                                        {formData.image ? (
                                            <div className="relative h-full w-full">
                                                <img src={formData.image} alt="Template" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <Button onClick={() => document.getElementById('imageInput')?.click()} variant="outline" className="bg-white/10 border-white/20 text-white font-black italic uppercase text-[10px] rounded-xl">Replace Visualization</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div onClick={() => document.getElementById('imageInput')?.click()} className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 group-hover:text-cyan-400 transition-colors">
                                                <ImagePlus size={48} className="opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                                <p className="font-black uppercase tracking-widest text-[10px]">Select Template Header Image</p>
                                            </div>
                                        )}
                                        <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Template Title</label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="E.G., STRENGTH FOUNDATION"
                                            className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Template Type</label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v: 'one-time' | 'series') => {
                                                const newDays = v === 'one-time' ? formData.days.slice(0, 1) : formData.days;
                                                setFormData(p => ({ ...p, type: v, repetitions: v === 'one-time' ? 1 : p.repetitions, days: newDays }));
                                                if (v === 'one-time' && newDays.length === 0) {
                                                    setFormData(p => ({ ...p, days: [{ dayNumber: 1, exercises: [] }] }));
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm">
                                                <SelectValue placeholder="Selection" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                                                <SelectItem value="one-time">One-Time Workout</SelectItem>
                                                <SelectItem value="series">Recurring Program</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Intensity Level</label>
                                        <Select
                                            value={formData.difficultyLevel}
                                            onValueChange={(v: 'beginner' | 'intermediate' | 'advanced') => setFormData(p => ({ ...p, difficultyLevel: v }))}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm">
                                                <SelectValue placeholder="Intensity" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Plan Repetitions</label>
                                        <div className="relative group">
                                            <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 transition-colors group-focus-within:text-cyan-400" />
                                            <Input
                                                type="number"
                                                value={formData.repetitions}
                                                disabled={formData.type === 'one-time'}
                                                onChange={(e) => setFormData({ ...formData, repetitions: parseInt(e.target.value) })}
                                                className="bg-black/40 border-white/10 h-16 pl-14 rounded-2xl text-white font-black italic uppercase text-sm disabled:opacity-30 disabled:grayscale transition-all"
                                            />
                                            {formData.type === 'one-time' && (
                                                <div className="absolute -bottom-5 left-2 text-[8px] text-cyan-500/50 font-black uppercase italic">Disabled for one-time sessions</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Visibility Status</label>
                                        <div className="flex items-center gap-3 h-16 bg-black/40 border border-white/10 rounded-2xl px-5">
                                            <span className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest mr-auto">Make Template Public</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isPublic}
                                                    onChange={(e) => setFormData(p => ({ ...p, isPublic: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-12 h-6 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                                        <Settings size={16} className="text-cyan-400" />
                                        Required Equipment
                                    </label>
                                    <div className="flex flex-wrap gap-2 min-h-[64px] p-5 bg-black/40 border border-white/10 rounded-2xl items-center">
                                        {formData.requiredEquipment.map((eq, i) => (
                                            <Badge key={i} className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 gap-2 pr-2 font-black italic uppercase text-[10px] tracking-widest rounded-lg h-8">
                                                {eq}
                                                <X size={12} className="cursor-pointer hover:text-white transition-colors" onClick={() => setFormData(p => ({ ...p, requiredEquipment: p.requiredEquipment.filter((_, j) => i !== j) }))} />
                                            </Badge>
                                        ))}
                                        <Input
                                            placeholder="+ ADD EQUIPMENT (ENTER)"
                                            className="flex-1 bg-transparent border-0 h-8 text-[10px] font-black italic uppercase text-white focus-visible:ring-0 p-0 placeholder:text-gray-700"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.currentTarget.value).trim();
                                                    if (val && !formData.requiredEquipment.includes(val)) {
                                                        setFormData(p => ({ ...p, requiredEquipment: [...p.requiredEquipment, val] }));
                                                        e.currentTarget.value = '';
                                                    }
                                                    e.preventDefault();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Template Description</label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="OUTLINE THE CORE GOALS FOR THIS TEMPLATE..."
                                        className="bg-black/40 border-white/10 text-white min-h-[160px] rounded-[2rem] font-black italic uppercase text-xs p-8 tracking-widest leading-relaxed focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Training Days */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                    <Calendar className="h-6 w-6 text-cyan-400" /> Workout Schedule
                                </h3>
                                {formData.type !== 'one-time' && (
                                    <Button onClick={addDay} className="bg-white/5 border border-white/10 text-white hover:bg-cyan-500 hover:text-black font-black italic uppercase text-[10px] h-10 px-6 rounded-xl transition-all">
                                        <Plus className="h-4 w-4 mr-2" /> Add Training Day
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {formData.days.map((day, dIdx) => (
                                    <div key={dIdx} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-2xl group/day">
                                        <div
                                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                                            onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)}
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="bg-cyan-500 h-10 w-10 rounded-2xl flex items-center justify-center font-black italic text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                                                    {day.dayNumber}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-black italic uppercase text-lg tracking-tight">Day {day.dayNumber}</h4>
                                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest italic">{day.exercises.length} Exercises Added</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {formData.type !== 'one-time' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-10 w-10 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                                                        onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                <div className={cn("h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition-transform duration-300", activeDayIndex === dIdx ? "rotate-180" : "rotate-0")}>
                                                    <ChevronDown className="text-gray-500 h-5 w-5" />
                                                </div>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {activeDayIndex === dIdx && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-visible"
                                                >
                                                    <div className="p-10 border-t border-white/5 space-y-8 bg-black/20 font-outfit">
                                                        {day.exercises.length === 0 ? (
                                                            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] text-gray-600 space-y-4">
                                                                <Layers className="h-10 w-10 mx-auto opacity-20" />
                                                                <p className="font-black uppercase italic tracking-[0.3em] text-[10px]">No Exercises Added for this Day</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 font-outfit">
                                                                {day.exercises.map((ex, eIdx) => (
                                                                    <div key={eIdx} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex flex-wrap lg:grid lg:grid-cols-[1fr_repeat(3,120px)_40px] gap-6 items-center group/ex hover:border-cyan-500/20 transition-all font-outfit">
                                                                        <div>
                                                                            <div className="font-black text-white italic uppercase tracking-tight text-sm mb-1">{ex.name}</div>
                                                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">Exercise Details</div>
                                                                        </div>

                                                                        <div className="flex flex-col gap-2 font-outfit">
                                                                            <span className="text-[9px] font-black text-gray-500 uppercase italic tracking-widest">Sets</span>
                                                                            <Input
                                                                                type="number"
                                                                                value={ex.sets}
                                                                                onChange={(e) => updateExercise(dIdx, eIdx, 'sets', parseInt(e.target.value))}
                                                                                className="h-10 bg-black/40 border-white/5 text-white text-xs font-black italic text-center rounded-xl"
                                                                            />
                                                                        </div>
                                                                        <div className="flex flex-col gap-2 font-outfit">
                                                                            <span className="text-[9px] font-black text-gray-500 uppercase italic tracking-widest">Reps / Duration</span>
                                                                            <Input
                                                                                placeholder="10-12 or 60s"
                                                                                value={ex.reps}
                                                                                onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)}
                                                                                className="h-10 bg-black/40 border-white/5 text-white text-xs font-black italic px-4 rounded-xl"
                                                                            />
                                                                        </div>

                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-10 w-10 text-gray-600 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl self-end"
                                                                            onClick={() => removeExerciseFromDay(dIdx, eIdx)}
                                                                        >
                                                                            <X className="h-5 w-5" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <div className="relative pt-8 border-t border-white/5">
                                                            <div className="flex items-center gap-4 mb-4">
                                                                <Search className="h-5 w-5 text-gray-600" />
                                                                <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Search Exercises</h5>
                                                            </div>
                                                            <Input
                                                                placeholder="SEARCH FOR EXERCISES..."
                                                                className="h-14 bg-black/40 border-white/5 text-xs rounded-2xl pl-6 font-black italic uppercase tracking-widest focus:ring-cyan-500/30"
                                                                value={activeDayIndex === dIdx ? searchQuery : ''}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />

                                                            {searchLoading && (
                                                                <div className="flex items-center justify-center p-8">
                                                                    <div className="h-6 w-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                                                </div>
                                                            )}

                                                            <AnimatePresence>
                                                                {activeDayIndex === dIdx && searchQuery && displayedSearchResults.length > 0 && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        className="absolute z-50 w-full mt-4 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-3xl overflow-hidden max-h-80 overflow-y-auto backdrop-blur-3xl"
                                                                    >
                                                                        {displayedSearchResults.map((suggestion) => (
                                                                            <div
                                                                                key={suggestion.data.id}
                                                                                className="p-4 hover:bg-cyan-500/10 cursor-pointer flex items-center gap-4 border-b border-white/5 last:border-0 transition-colors group/item"
                                                                                onClick={() => addExerciseToDay(dIdx, suggestion)}
                                                                            >
                                                                                <div className="h-12 w-12 rounded-xl bg-black/40 overflow-hidden ring-1 ring-white/5">
                                                                                    <img
                                                                                        src={suggestion.data.image_thumbnail ? `https://wger.de${suggestion.data.image_thumbnail}` : "https://via.placeholder.com/48"}
                                                                                        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform font-outfit"
                                                                                        alt=""
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="text-white text-xs font-black italic uppercase">{suggestion.value}</p>
                                                                                    <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mt-0.5">{suggestion.data.category}</p>
                                                                                </div>
                                                                                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/item:bg-cyan-500 group-hover/item:text-black transition-all">
                                                                                    <Plus className="h-4 w-4" />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-8">
                        <Card className="bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-8 shadow-2xl sticky top-36 overflow-hidden">
                            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-500/5 blur-[60px] rounded-full" />
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">
                                Template <span className="text-cyan-400">Metrics</span>
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Total Duration</span>
                                    <span className="text-cyan-400 font-black italic text-sm">{formData.days.length * formData.repetitions} DAYS</span>
                                </div>
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Repetitions</span>
                                    <span className="text-white font-black italic text-sm">{formData.repetitions}x Cycles</span>
                                </div>
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Training Days</span>
                                    <span className="text-white font-black italic text-sm font-outfit">{formData.days.length} DAYS</span>
                                </div>
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Total Exercises</span>
                                    <span className="text-white font-black italic text-sm">
                                        {formData.days.reduce((acc, day) => acc + day.exercises.length, 0)} TOTAL
                                    </span>
                                </div>
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Equipment Required</span>
                                    <span className="text-cyan-400 font-black italic text-sm">{formData.requiredEquipment.length} ITEMS</span>
                                </div>
                            </div>

                            <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 italic">Training Tips</h4>
                                <ul className="space-y-4">
                                    {[
                                        "3-5 training days yield highest user retention.",
                                        "Detailed descriptions increase template effectiveness.",
                                        "One-time sessions are optimized for quick execution."
                                    ].map((tip, i) => (
                                        <li key={i} className="flex gap-3 text-[10px] text-gray-500 font-bold italic uppercase leading-relaxed font-outfit">
                                            <div className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full mt-1 shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            {showCropper && tempImage && (
                <ImageCropper
                    image={tempImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setShowCropper(false)}
                    aspectRatio={16 / 9}
                />
            )}
        </Layout>
    );
};


export default AdminAddWorkoutTemplate;