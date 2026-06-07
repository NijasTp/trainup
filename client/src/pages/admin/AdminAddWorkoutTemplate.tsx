import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Save, X, FileText, Loader2, Dumbbell, ImagePlus, Layers, Settings, Search, Edit } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/lib/axios";
import { toast } from "react-toastify";
import type { IExercise, IWorkoutTemplate } from "@/interfaces/admin/adminAddTemplates";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import ImageCropper from "@/components/common/ImageCropper";
import { useDebounce } from "use-debounce";
import { searchExercises } from "@/services/exerciseService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const AdminAddWorkoutTemplate = ({ mode = "admin" }: { mode?: "admin" | "trainer" }) => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const Layout = mode === "trainer" ? TrainerLayout : AdminLayout;
    
    const [formData, setFormData] = useState<IWorkoutTemplate & { imageFile?: Blob }>({
        title: "",
        description: "",
        image: "",
        type: 'one-time',
        repetitions: 1,
        difficultyLevel: 'intermediate',
        requiredEquipment: [],
        isPublic: true,
        days: [{ dayNumber: 1, exercises: [] }],
        targetBodyParts: []
    } as SafeAny);

    const [saving, setSaving] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Search and Suggestions States
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [suggestions, setSuggestions] = useState<SafeAny[]>([]);
    const [searching, setSearching] = useState(false);
    
    // Exercise Config Modal States
    const [selectedExercise, setSelectedExercise] = useState<SafeAny | null>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

    const [sets, setSets] = useState<number>(3);
    const [reps, setReps] = useState<string>("10-12");
    const [weight, setWeight] = useState<string>("0");
    const [rest, setRest] = useState<string>("60s");
    const [notes, setNotes] = useState<string>("");

    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    const response = await API.get(`/template/workout/${id}`);
                    const data = response.data;
                    
                    // Force compatibility: default type to one-time and repetitions to 1
                    data.type = 'one-time';
                    data.repetitions = 1;
                    if (!data.days || data.days.length === 0) {
                        data.days = [{ dayNumber: 1, exercises: [] }];
                    } else if (data.days.length > 1) {
                        data.days = [data.days[0]];
                    }
                    if (!data.targetBodyParts) {
                        data.targetBodyParts = [];
                    }
                    setFormData(data);
                } catch (errorVal) { const error = errorVal as SafeAny;
                    console.error("Error fetching template:", error);
                    toast.error("Failed to load template");
                }
            };
            fetchTemplate();
        }
    }, [id]);

    useEffect(() => {
        if (debouncedQuery) {
            const fetchSuggestions = async () => {
                setSearching(true);
                try {
                    const results = await searchExercises(debouncedQuery);
                    setSuggestions(results || []);
                } catch (errVal) { const err = errVal as SafeAny;
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddOrUpdateExercise = () => {
        if (!selectedExercise) return;

        setFormData(prev => {
            const newDays = [...prev.days];
            const exercises = [...newDays[0].exercises];

            const payload: IExercise = {
                exerciseId: selectedExercise.exerciseId,
                name: selectedExercise.name,
                image: selectedExercise.gifUrl || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800",
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
                description: selectedExercise.description || "",
                exerciseData: selectedExercise
            };

            if (editingExerciseIndex !== null) {
                exercises[editingExerciseIndex] = payload;
            } else {
                exercises.push(payload);
            }

            newDays[0].exercises = exercises;
            return { ...prev, days: newDays };
        });

        setShowConfigModal(false);
        setSelectedExercise(null);
        setEditingExerciseIndex(null);
        setSearchQuery("");
        toast.success(editingExerciseIndex !== null ? "Exercise calibration updated" : "New exercise module initialized");
    };

    const removeExercise = (index: number) => {
        setFormData(prev => {
            const newDays = [...prev.days];
            newDays[0].exercises = newDays[0].exercises.filter((_, i) => i !== index);
            return { ...prev, days: newDays };
        });
    };

    const openEditExercise = (index: number) => {
        const ex = formData.days[0].exercises[index];
        setSelectedExercise(ex.exerciseData || ex);
        setSets(ex.sets);
        setReps(ex.reps || "10-12");
        setWeight(ex.weight || "0");
        setRest(ex.rest || "60s");
        setNotes(ex.notes || "");
        setEditingExerciseIndex(index);
        setShowConfigModal(true);
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
        if (formData.days[0].exercises.length === 0) {
            toast.error("Add at least one training exercise to the template");
            return;
        }

        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'days') {
                    data.append('days', JSON.stringify(formData.days));
                } else if (key === 'requiredEquipment') {
                    data.append('requiredEquipment', JSON.stringify(formData.requiredEquipment));
                } else if (key === 'targetBodyParts') {
                    data.append('targetBodyParts', JSON.stringify(formData.targetBodyParts || []));
                } else if (key === 'imageFile') {
                    if (formData.imageFile) {
                        data.append('image', formData.imageFile as Blob, 'template.jpg');
                    }
                } else if (key === 'image') {
                    if (!formData.imageFile && formData.image) {
                        data.append('image', String(formData.image));
                    }
                } else if (formData[key as keyof typeof formData] !== undefined) {
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
        } catch (errorVal) { const error = errorVal as SafeAny;
            toast.error("Process failed in the forge");
            console.log(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
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
                                Workout Plan Builder (One-Time Workout Protocol)
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
                            className="flex-1 md:flex-none bg-cyan-500 hover:bg-cyan-400 text-black font-black italic uppercase text-xs px-10 h-14 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:scale-105"
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
                                                    <Button onClick={(e) => { e.stopPropagation(); document.getElementById('imageInput')?.click(); }} variant="outline" className="bg-white/10 border-white/20 text-white font-black italic uppercase text-[10px] rounded-xl">Replace Visualization</Button>
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
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Difficulty Level</label>
                                        <Select
                                            value={formData.difficultyLevel}
                                            onValueChange={(v: 'beginner' | 'intermediate' | 'advanced') => setFormData(p => ({ ...p, difficultyLevel: v }))}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm">
                                                <SelectValue placeholder="Difficulty" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl overflow-hidden">
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Target Body Parts Selector */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Target Body Parts</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {["abs", "arm", "chest", "leg", "back", "shoulder"].map((part) => {
                                                const isSelected = formData.targetBodyParts?.includes(part);
                                                return (
                                                    <button
                                                        key={part}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = formData.targetBodyParts || [];
                                                            const updated = current.includes(part)
                                                                ? current.filter(p => p !== part)
                                                                : [...current, part];
                                                            setFormData(prev => ({ ...prev, targetBodyParts: updated }));
                                                        }}
                                                        className={cn(
                                                            "px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border",
                                                            isSelected
                                                                ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105"
                                                                : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                                                        )}
                                                    >
                                                        {part}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Required Equipment */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                                            <Settings size={16} className="text-cyan-400" />
                                            Required Equipment
                                        </label>
                                        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-black/40 border border-white/10 rounded-2xl items-center">
                                            {formData.requiredEquipment.map((eq, i) => (
                                                <Badge key={i} className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 gap-2 pr-2 font-black italic uppercase text-[10px] tracking-widest rounded-lg h-8">
                                                    {eq}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            setFormData(p => ({ ...p, requiredEquipment: p.requiredEquipment.filter((_, j) => j !== i) }));
                                                        }}
                                                        className="hover:text-white transition-colors cursor-pointer"
                                                    >
                                                        <X size={12} />
                                                    </button>
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
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Template Description</label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="OUTLINE THE CORE GOALS FOR THIS TEMPLATE..."
                                        className="bg-black/40 border-white/10 text-white min-h-[120px] rounded-[2rem] font-black italic uppercase text-xs p-8 tracking-widest leading-relaxed focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exercise Search and List */}
                        <div className="space-y-8 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                            <div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                    <Dumbbell className="h-6 w-6 text-cyan-400" /> Workout Exercises
                                </h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Design the list of drills for this session</p>
                            </div>

                            {/* Search Box */}
                            <div className="space-y-6">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic block">Add Exercise from database</label>
                                <div className="relative group">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-cyan-400" />
                                    <Input
                                        placeholder="SEARCH DRILLS FROM EXERCISEDB (e.g. DUMBBELL BENCH, PUSHUP)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/40 border-white/10 h-16 pl-14 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                    />
                                </div>

                                {searching && (
                                    <div className="flex items-center gap-3 justify-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                                        <span className="text-xs font-black uppercase text-gray-500 tracking-widest animate-pulse">Querying ExerciseDB...</span>
                                    </div>
                                )}

                                {!searching && suggestions.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto p-4 bg-black/20 rounded-[2rem] border border-white/5">
                                        {suggestions.map((suggestion) => (
                                            <div
                                                key={suggestion.exerciseId}
                                                onClick={() => {
                                                    setSelectedExercise(suggestion);
                                                    setSets(3);
                                                    setReps("10-12");
                                                    setWeight("0");
                                                    setRest("60s");
                                                    setNotes("");
                                                    setEditingExerciseIndex(null);
                                                    setShowConfigModal(true);
                                                }}
                                                className="group relative cursor-pointer bg-[#0c0c0e] border border-white/5 hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between gap-3 overflow-hidden"
                                            >
                                                <div className="relative w-full aspect-square bg-black/60 rounded-xl overflow-hidden border border-white/5 shrink-0">
                                                    <img
                                                        src={suggestion.gifUrl}
                                                        alt={suggestion.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className="font-bold text-white text-xs line-clamp-1 capitalize">{suggestion.name}</h5>
                                                    <div className="flex flex-wrap gap-1">
                                                        <Badge className="bg-cyan-500/10 text-cyan-300 border-0 text-[8px] px-1.5 uppercase font-black">
                                                            {suggestion.bodyParts?.[0] || "drill"}
                                                        </Badge>
                                                        <Badge className="bg-white/5 text-gray-400 border-0 text-[8px] px-1.5 uppercase font-bold">
                                                            {suggestion.targetMuscles?.[0]}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Added Exercises list */}
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic block">Active Exercise Modules</label>
                                {formData.days[0].exercises.length === 0 ? (
                                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] text-gray-600 space-y-4 bg-black/10">
                                        <Layers className="h-10 w-10 mx-auto opacity-20" />
                                        <p className="font-black uppercase italic tracking-[0.3em] text-[10px]">No Exercises Added to Template</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.days[0].exercises.map((ex, index) => (
                                            <div key={index} className="bg-black/40 p-6 rounded-[2rem] border border-white/5 flex flex-wrap lg:grid lg:grid-cols-[80px_1fr_repeat(4,100px)_40px] gap-6 items-center group hover:border-cyan-500/20 transition-all">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-black shrink-0">
                                                    <img src={ex.image} alt={ex.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-white italic uppercase tracking-tight text-sm truncate">{ex.name}</div>
                                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic mt-1 capitalize">Target: {ex.targetMuscles?.[0] || "General"}</div>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-widest block mb-1">Sets</span>
                                                    <span className="text-sm font-black italic text-cyan-400">{ex.sets}</span>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-widest block mb-1">Reps / Duration</span>
                                                    <span className="text-sm font-black italic text-white uppercase">{ex.reps}</span>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-widest block mb-1">Load (KG)</span>
                                                    <span className="text-sm font-black italic text-white">{ex.weight || "0"}</span>
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-widest block mb-1">Rest</span>
                                                    <span className="text-sm font-black italic text-white uppercase">{ex.rest || "60s"}</span>
                                                </div>
                                                <div className="flex gap-2 justify-end self-center">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl" onClick={() => openEditExercise(index)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl" onClick={() => removeExercise(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                    <span className="text-cyan-400 font-black italic text-sm">1 DAY (ONE-TIME)</span>
                                </div>
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Target Parts</span>
                                    <span className="text-white font-black italic text-sm">{formData.targetBodyParts?.length || 0} SECTIONS</span>
                                </div>
                                <div className="flex justify-between items-center group/metric">
                                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-gray-300 transition-colors">Total Exercises</span>
                                    <span className="text-white font-black italic text-sm">
                                        {formData.days[0]?.exercises.length || 0} TOTAL
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
                                        "Body part tags must accurately target templates on homepage widgets.",
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

            {/* Exercise Config Modal */}
            <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
                <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
                    <DialogHeader className="mb-10">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-cyan-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                                <Dumbbell size={28} />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter capitalize">
                                    {selectedExercise?.name}
                                </DialogTitle>
                                <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 italic">Mechanical Specification Phase</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedExercise && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-[160px_1fr] gap-6 bg-black/40 p-4 border border-white/5 rounded-2xl">
                                <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                                    <img src={selectedExercise.gifUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-2.5 text-xs text-gray-400">
                                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Target Muscles: </span><span className="text-white capitalize">{selectedExercise.targetMuscles?.join(", ")}</span></div>
                                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Secondary: </span><span className="text-white capitalize">{selectedExercise.secondaryMuscles?.join(", ")}</span></div>
                                    <div><span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Equipment: </span><span className="text-white capitalize">{selectedExercise.equipments?.join(", ")}</span></div>
                                    <div className="max-h-[90px] overflow-y-auto scrollbar-thin">
                                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Instructions:</span>
                                        <ol className="list-decimal pl-4 mt-1 space-y-1 text-gray-300">
                                            {selectedExercise.instructions?.map((inst: string, idx: number) => (
                                                <li key={idx}>{inst}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Volume Grid</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-gray-600 uppercase italic">Sets</span>
                                            <Input type="number" value={sets} onChange={(e) => setSets(parseInt(e.target.value) || 1)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic text-cyan-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-gray-600 uppercase italic">Reps / Duration</span>
                                            <Input value={reps} onChange={(e) => setReps(e.target.value)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" placeholder="10-12 or 60s" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Tension Matrix</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-gray-600 uppercase italic">Load (KG)</span>
                                            <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-gray-600 uppercase italic">Rest Period</span>
                                            <Input value={rest} onChange={(e) => setRest(e.target.value)} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" placeholder="60s" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Field Directives (Notes)</Label>
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-black border-white/10 p-6 rounded-2xl text-white font-medium min-h-[100px] resize-none focus:ring-1 focus:ring-cyan-500/50 italic text-xs tracking-widest" placeholder="FOCUS ON CONTROLLED NEGATIVES..." />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-10">
                        <Button onClick={handleAddOrUpdateExercise} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black italic rounded-2xl h-16 text-lg uppercase shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]">
                            Synchronize Module
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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