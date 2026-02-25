import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash, Save, X, FileText, Loader2, Dumbbell, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/lib/axios";
import { toast } from "react-toastify";
import type { IExercise, IWorkoutTemplate, WgerExercise } from "@/interfaces/admin/adminAddTemplates";
import { Badge } from "@/components/ui/badge";
import ImageCropper from "@/components/common/ImageCropper";
import { ImagePlus, Hash, Layers, Trophy, Settings } from "lucide-react";


const WorkoutTemplateForm = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<IWorkoutTemplate & { imageFile?: Blob }>({
        title: "",
        description: "",
        image: "",
        type: 'series',
        durationDays: 7,
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
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setDisplayedSearchResults(allSearchResults.slice(start, end));
    }, [page, allSearchResults]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const addDay = () => {
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
        if (!formData.title || !formData.image) {
            toast.error("Please fill in all required fields (Title and Image are mandatory)");
            return;
        }
        if (formData.days.length === 0) {
            toast.error("Add at least one day to the template");
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
                } else if (key === 'imageFile') {
                    data.append('image', formData.imageFile as Blob, 'template.jpg');
                } else if (key !== 'image' && formData[key as keyof typeof formData] !== undefined) {
                    data.append(key, String(formData[key as keyof typeof formData]));
                }
            });

            if (id) {
                await API.patch(`/template/workout/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Template updated successfully");
            } else {
                await API.post("/template/workout", data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Template created successfully");
            }
            navigate("/admin/templates");
        } catch (error: unknown) {
            toast.error("Failed to save template");
        } finally {
            setSaving(false);
        }
    };


    return (
        <AdminLayout>
            <div className="p-8 max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                            <Dumbbell className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{id ? "Edit Workout Template" : "New Workout Template"}</h1>
                            <p className="text-slate-500 text-sm">Configure multi-day training programs</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate("/admin/templates")} className="border-slate-800 text-slate-400">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Template
                        </Button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                    <div className="space-y-8">
                        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                            <CardHeader className="border-b border-slate-800">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" /> Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-8">
                                {/* Image Upload Section */}
                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                                        <ImagePlus size={16} className="text-cyan-500" />
                                        Template Banner Image (Mandatory)
                                    </label>
                                    <div className="relative group cursor-pointer aspect-video rounded-3xl overflow-hidden border-2 border-dashed border-white/10 hover:border-cyan-500/50 transition-all bg-black/40">
                                        {formData.image ? (
                                            <div className="relative h-full w-full">
                                                <img src={formData.image} alt="Template" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <Button onClick={() => document.getElementById('imageInput')?.click()} variant="outline" className="bg-white/10 border-white/20 text-white font-black italic uppercase text-[10px]">Change Image</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div onClick={() => document.getElementById('imageInput')?.click()} className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 group-hover:text-cyan-400 transition-colors">
                                                <ImagePlus size={40} className="opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                                <p className="font-black uppercase tracking-widest text-[10px]">Select High-Resolution Banner</p>
                                            </div>
                                        )}
                                        <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Template Title</label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Ultimate Hypertrophy"
                                            className="bg-black/40 border-white/10 h-14 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-cyan-500/50"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Template Type</label>
                                        <Select value={formData.type} onValueChange={(v: 'one-time' | 'series') => setFormData(p => ({ ...p, type: v, durationDays: v === 'one-time' ? 1 : 7 }))}>
                                            <SelectTrigger className="bg-black/40 border-white/10 h-14 rounded-2xl text-white font-black italic uppercase text-sm">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="one-time">One-Time Session</SelectItem>
                                                <SelectItem value="series">Series / Program</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Difficulty Level</label>
                                        <Select
                                            value={formData.difficultyLevel}
                                            onValueChange={(v: 'beginner' | 'intermediate' | 'advanced') => setFormData(p => ({ ...p, difficultyLevel: v }))}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 h-14 rounded-2xl text-white font-black italic uppercase text-sm">
                                                <SelectValue placeholder="Difficulty" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Cycle Duration (Days)</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                                            <Input
                                                type="number"
                                                name="durationDays"
                                                disabled={formData.type === 'one-time'}
                                                value={formData.durationDays}
                                                onChange={handleInputChange}
                                                className="bg-black/40 border-white/10 h-14 pl-12 rounded-2xl text-white font-black italic uppercase text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Visibility</label>
                                        <div className="flex items-center gap-3 h-14 bg-black/40 border border-white/10 rounded-2xl px-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest mr-auto">Public Catalog</span>
                                            <label className="relative inline-flex items-center cursor-pointer scale-90">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isPublic}
                                                    onChange={(e) => setFormData(p => ({ ...p, isPublic: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/20 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                                        <Settings size={16} className="text-cyan-500" />
                                        Required Equipment
                                    </label>
                                    <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-black/40 border border-white/10 rounded-2xl">
                                        {formData.requiredEquipment.map((eq, i) => (
                                            <Badge key={i} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 gap-1 pr-1 font-black italic uppercase text-[9px] tracking-widest">
                                                {eq}
                                                <X size={10} className="cursor-pointer hover:text-white" onClick={() => setFormData(p => ({ ...p, requiredEquipment: p.requiredEquipment.filter((_, j) => i !== j) }))} />
                                            </Badge>
                                        ))}
                                        <Input
                                            placeholder="Add equipment (Press Enter)..."
                                            className="flex-1 bg-transparent border-0 h-6 text-[10px] font-black italic uppercase text-white focus-visible:ring-0 p-0"
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
                                    <label className="text-sm font-black text-gray-500 uppercase tracking-widest italic">Program Blueprint (Description)</label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Briefly describe this program architecture..."
                                        className="bg-black/40 border-white/10 text-white min-h-[120px] rounded-2xl font-black italic uppercase text-xs p-6 tracking-wide"
                                    />
                                </div>
                            </CardContent>


                        </Card>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" /> Training Days
                                </h3>
                                <Button onClick={addDay} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10 rounded-xl">
                                    <Plus className="h-4 w-4 mr-2" /> Add Training Day
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {formData.days.map((day, dIdx) => (
                                    <div key={dIdx} className="bg-slate-900 border border-slate-800 rounded-3xl shadow-md">
                                        <div
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                                            onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <Badge className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center font-black p-0">
                                                    {day.dayNumber}
                                                </Badge>
                                                <h4 className="text-white font-bold">Training Day {day.dayNumber}</h4>
                                                <span className="text-slate-500 text-sm">({day.exercises.length} Exercises)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                                                    onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                                {activeDayIndex === dIdx ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                                            </div>
                                        </div>

                                        {activeDayIndex === dIdx && (
                                            <div className="p-6 border-t border-slate-800 space-y-4">
                                                {day.exercises.length === 0 ? (
                                                    <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                                                        No exercises added for this day yet.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {day.exercises.map((ex, eIdx) => (
                                                            <div key={eIdx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap lg:grid lg:grid-cols-[200px_1fr_120px_120px_120px_40px] gap-4 items-center">
                                                                <div className="font-medium text-white line-clamp-1">{ex.name}</div>
                                                                <div className="flex-1">
                                                                    <Input
                                                                        placeholder="Notes/Reps"
                                                                        value={ex.reps}
                                                                        onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)}
                                                                        className="h-8 bg-slate-900 border-slate-800 text-xs text-slate-300"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-slate-500">Sets:</span>
                                                                    <Input
                                                                        type="number"
                                                                        value={ex.sets}
                                                                        onChange={(e) => updateExercise(dIdx, eIdx, 'sets', parseInt(e.target.value))}
                                                                        className="w-16 h-8 bg-slate-900 border-slate-800"
                                                                    />
                                                                </div>

                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-500 hover:text-red-500"
                                                                    onClick={() => removeExerciseFromDay(dIdx, eIdx)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="relative pt-4 border-t border-slate-800">
                                                    <Search className="absolute left-3 top-7 h-4 w-4 text-slate-500" />
                                                    <Input
                                                        placeholder="Add exercise by name..."
                                                        className="pl-10 bg-slate-950 border-slate-800 text-sm h-10 rounded-xl"
                                                        value={activeDayIndex === dIdx ? searchQuery : ''}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />

                                                    {searchLoading && (
                                                        <div className="flex items-center justify-center p-4">
                                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                        </div>
                                                    )}
                                                    {activeDayIndex === dIdx && searchQuery && displayedSearchResults.length > 0 && (
                                                        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                                            {displayedSearchResults.map((suggestion) => (
                                                                <div
                                                                    key={suggestion.data.id}
                                                                    className="p-3 hover:bg-slate-800 cursor-pointer flex items-center gap-3 border-b border-slate-800 last:border-0"
                                                                    onClick={() => addExerciseToDay(dIdx, suggestion)}
                                                                >
                                                                    <img
                                                                        src={suggestion.data.image_thumbnail ? `https://wger.de${suggestion.data.image_thumbnail}` : "https://via.placeholder.com/40"}
                                                                        className="w-10 h-10 rounded object-cover"
                                                                        alt=""
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="text-white text-sm font-medium">{suggestion.value}</p>
                                                                        <p className="text-slate-500 text-xs">{suggestion.data.category}</p>
                                                                    </div>
                                                                    <Plus className="h-4 w-4 text-primary" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-slate-900 border-slate-800 rounded-3xl p-6 shadow-lg sticky top-8">
                            <h3 className="text-lg font-bold text-white mb-4">Summary</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Days</span>
                                    <span className="text-white font-bold">{formData.days.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Exercises</span>
                                    <span className="text-white font-bold">
                                        {formData.days.reduce((acc, day) => acc + day.exercises.length, 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Equipment</span>
                                    <span className="text-cyan-500 font-bold">{formData.requiredEquipment.length} Items</span>
                                </div>

                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Quick Tips</h4>
                                <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                                    <li>Templates with 3-5 days are most popular.</li>
                                    <li>Add notes to guide the user's form.</li>
                                    <li>Cycle duration defines how long the plan repeats.</li>
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
        </AdminLayout>
    );
};


export default WorkoutTemplateForm;