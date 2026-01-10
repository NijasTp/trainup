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

const WorkoutTemplateForm = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<IWorkoutTemplate>({
        title: "",
        description: "",
        duration: 7,
        goal: "",
        equipment: false,
        bodyType: "",
        days: [],
        difficulty: 'Intermediate'
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [allSearchResults, setAllSearchResults] = useState<WgerExercise[]>([]);
    const [displayedSearchResults, setDisplayedSearchResults] = useState<WgerExercise[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [perPage] = useState<number>(5);
    const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            const fetchTemplate = async () => {
                try {
                    const response = await API.get(`/template/workout/${id}`);
                    setFormData(response.data);
                } catch (error) {
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
                reps: "10-12",
                allowWeight: true
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

    const updateExercise = (dayIndex: number, exIndex: number, field: keyof IExercise, value: any) => {
        setFormData(prev => {
            const newDays = [...prev.days];
            newDays[dayIndex].exercises[exIndex] = { ...newDays[dayIndex].exercises[exIndex], [field]: value };
            return { ...prev, days: newDays };
        });
    };

    const handleSave = async () => {
        if (!formData.title || !formData.goal || !formData.bodyType) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (formData.days.length === 0) {
            toast.error("Add at least one day to the template");
            return;
        }

        setSaving(true);
        try {
            if (id) {
                await API.patch(`/template/workout/${id}`, formData);
                toast.success("Template updated successfully");
            } else {
                await API.post("/template/workout", formData);
                toast.success("Template created successfully");
            }
            navigate("/admin/templates");
        } catch (error) {
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
                            <CardContent className="p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Template Title</label>
                                        <Input
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Ultimate Hypertrophy"
                                            className="bg-slate-950 border-slate-800 text-white focus:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Goal</label>
                                        <Select value={formData.goal} onValueChange={(v) => setFormData(p => ({ ...p, goal: v }))}>
                                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                                <SelectValue placeholder="Select Goal" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                                                <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                                                <SelectItem value="Strength">Strength</SelectItem>
                                                <SelectItem value="Endurance">Endurance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Body Type</label>
                                        <Select value={formData.bodyType} onValueChange={(v) => setFormData(p => ({ ...p, bodyType: v }))}>
                                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="Ectomorph">Ectomorph</SelectItem>
                                                <SelectItem value="Mesomorph">Mesomorph</SelectItem>
                                                <SelectItem value="Endomorph">Endomorph</SelectItem>
                                                <SelectItem value="General">General</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Difficulty</label>
                                        <Select value={formData.difficulty} onValueChange={(v: any) => setFormData(p => ({ ...p, difficulty: v }))}>
                                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                                                <SelectValue placeholder="Difficulty" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Cycle Duration (Days)</label>
                                        <Input
                                            type="number"
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            className="bg-slate-950 border-slate-800 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400">Description</label>
                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Briefly describe this program..."
                                        className="bg-slate-950 border-slate-800 text-white min-h-[100px]"
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
                                    <div key={dIdx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
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
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-slate-500">Time:</span>
                                                                    <Input
                                                                        placeholder="30s"
                                                                        value={ex.time}
                                                                        onChange={(e) => updateExercise(dIdx, eIdx, 'time', e.target.value)}
                                                                        className="w-20 h-8 bg-slate-900 border-slate-800"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={ex.allowWeight}
                                                                        onChange={(e) => updateExercise(dIdx, eIdx, 'allowWeight', e.target.checked)}
                                                                        className="h-4 w-4 rounded accent-primary"
                                                                    />
                                                                    <span className="text-xs text-slate-500">Weight</span>
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
                                    <span className="text-slate-400">Target Type</span>
                                    <span className="text-primary font-bold">{formData.bodyType || 'Not set'}</span>
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
        </AdminLayout>
    );
};

export default WorkoutTemplateForm;