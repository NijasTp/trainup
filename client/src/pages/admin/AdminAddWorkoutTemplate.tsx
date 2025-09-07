import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash, Save, X, FileText, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/lib/axios";
import { toast } from "react-toastify";
import type { IExercise, IWorkoutTemplate, WgerExercise } from "@/interfaces/admin/adminAddTemplates";


const WorkoutTemplateForm = () => {
    const { id } = useParams<{ id?: string }>();
    const type = 'workout'
    const navigate = useNavigate();
    const [formData, setFormData] = useState<IWorkoutTemplate>({
        name: "",
        goal: "",
        notes: "",
        exercises: [],
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<WgerExercise[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id && type === "workout") {
            const fetchTemplate = async () => {
                try {
                    const response = await API.get(`/workout/admin/workout-templates/${id}`);
                    setFormData(response.data);
                } catch (error) {
                    console.error("Error fetching template:", error);
                    toast.error("Failed to load template");
                }
            };
            fetchTemplate();
        }
    }, [id, type]);

    useEffect(() => {
        if (searchQuery && type === "workout") {
            const fetchExercises = async () => {
                setSearchLoading(true);
                try {
                    const response = await fetch(
                        `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(searchQuery)}&language=2`,
                        {
                            headers: {
                                Accept: "application/json",
                            },
                        }
                    );

                    if (!response.ok) throw new Error("Failed to fetch exercises");

                    const data = await response.json();
                    setSearchResults(data.suggestions || []);
                } catch (error) {
                    console.error("Error fetching WGER exercises:", error);
                    toast.error("Failed to search exercises");
                } finally {
                    setSearchLoading(false);
                }
            };

            const debounce = setTimeout(fetchExercises, 300);
            return () => clearTimeout(debounce);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, type]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleExerciseChange = (index: number, field: keyof IExercise, value: string | number) => {
        setFormData((prev) => {
            const exercises = [...prev.exercises];
            exercises[index] = { ...exercises[index], [field]: value };
            return { ...prev, exercises };
        });
    };

    const addExercise = (exercise: WgerExercise) => {
        setFormData((prev) => ({
            ...prev,
            exercises: [
                ...prev.exercises,
                {
                    id: exercise.data.id,
                    name: exercise.value,
                    image: exercise.data.image,
                    sets: 1,
                    reps: "10-12",
                    weight: "bodyweight",
                },
            ],
        }));
        setSearchQuery("");
        setSearchResults([]);
    };

    const removeExercise = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        if (type !== "workout") {
            toast.error("Diet template creation is not supported");
            return;
        }
        if (!formData.name) {
            toast.error("Template name is required");
            return;
        }
        if (formData.exercises.some((ex) => !ex.name || ex.sets < 1 || !ex.reps || !ex.weight)) {
            toast.error("All exercises must have a name, at least 1 set, reps, and weight");
            return;
        }

        setSaving(true);
        try {
            if (id) {
                await API.patch(`/workout/admin/workout-templates/${id}`, {
                    ...formData,
                    givenBy: "admin",
                });
                toast.success("Template updated successfully");
            } else {
                await API.post("/workout/admin/workout-templates", {
                    ...formData,
                    givenBy: "admin",
                });
                toast.success("Template created successfully");
            }
            navigate("/admin/templates");
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/templates");
    };

    if (type !== "workout") {
        return (
            <AdminLayout>
                <div className="p-8">
                    <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                        <CardHeader>
                            <CardTitle className="text-white">Unsupported Template Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400">Diet template creation is not supported in this form.</p>
                            <Button
                                onClick={handleCancel}
                                className="mt-4 bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
                            >
                                Back to Templates
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8">
                <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center">
                            <FileText className="mr-3 h-8 w-8 text-[#4B8B9B]" />
                            {id ? "Edit Workout Template" : "Add Workout Template"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Template Name */}
                            <div>
                                <label className="text-gray-300 font-medium">Template Name</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter template name"
                                    className="mt-1 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                                />
                            </div>

                            {/* Goal */}
                            <div>
                                <label className="text-gray-300 font-medium">Goal</label>
                                <Input
                                    name="goal"
                                    value={formData.goal}
                                    onChange={handleInputChange}
                                    placeholder="Enter goal (e.g., Build strength)"
                                    className="mt-1 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-gray-300 font-medium">Notes</label>
                                <Textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Enter additional notes"
                                    className="mt-1 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                                />
                            </div>

                            {/* Exercise Search */}
                            <div>
                                <label className="text-gray-300 font-medium">Add Exercises</label>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4B8B9B]" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search exercises (via WGER API)"
                                        className="pl-10 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white placeholder:text-gray-500 focus:border-[#4B8B9B]"
                                    />
                                </div>
                                {searchLoading && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-[#4B8B9B]" />
                                        <span className="ml-2 text-gray-400">Searching...</span>
                                    </div>
                                )}
                                {searchResults.length > 0 && (
                                    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 max-h-60 overflow-y-auto">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                        <CardContent className="p-2 space-y-2">
                                            {searchResults.map((exercise) => (
                                                <div
                                                    key={exercise.data.id}
                                                    className="flex items-center justify-between p-2 rounded-md bg-background/20 hover:bg-background/30 transition-colors cursor-pointer"
                                                    onClick={() => addExercise(exercise)}
                                                >
                                                    {/* Left: Image and Name */}
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={
                                                                exercise.data.image_thumbnail
                                                                    ? `https://wger.de${exercise.data.image_thumbnail}`
                                                                    : "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"
                                                            }
                                                            alt={exercise.value}
                                                            className="w-10 h-10 rounded object-cover"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-foreground font-medium">{exercise.value}</span>
                                                            <span className="text-xs text-muted-foreground">{exercise.data.category}</span>
                                                        </div>
                                                    </div>

                                                    {/* Add Button */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow hover:shadow-lg hover:from-primary/80 hover:to-primary rounded-lg border-0 transition-all duration-300"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Exercise List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Exercises</h3>
                                {formData.exercises.length === 0 ? (
                                    <p className="text-gray-400">No exercises added</p>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.exercises.map((exercise, index) => (
                                            <Card className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-white font-medium">{exercise.name}</h4>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeExercise(index)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="text-gray-300 text-sm">Sets</label>
                                                            <Input
                                                                type="number"
                                                                value={exercise.sets}
                                                                onChange={(e) =>
                                                                    handleExerciseChange(index, "sets", Number(e.target.value))
                                                                }
                                                                min="1"
                                                                className="mt-1 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-gray-300 text-sm">Reps</label>
                                                            <Input
                                                                value={exercise.reps}
                                                                onChange={(e) =>
                                                                    handleExerciseChange(index, "reps", e.target.value)
                                                                }
                                                                placeholder="e.g., 10-12"
                                                                className="mt-1 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-gray-300 text-sm">Weight</label>
                                                            <Input
                                                                value={exercise.weight}
                                                                onChange={(e) =>
                                                                    handleExerciseChange(index, "weight", e.target.value)
                                                                }
                                                                placeholder="e.g., 10kg or bodyweight"
                                                                className="mt-1 bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 text-white border-[#4B8B9B]/30"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save Template
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default WorkoutTemplateForm;