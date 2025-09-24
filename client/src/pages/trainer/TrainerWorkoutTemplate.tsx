import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Trash, Save, X, FileText, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";

interface Exercise {
  id: string;
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  weight?: string;
}

interface WgerExercise {
  value: string;
  data: {
    id: string;
    base_id: string;
    name: string;
    category: string;
    image: string;
    image_thumbnail: string;
  };
}

interface WorkoutTemplate {
  name: string;
  goal: string;
  notes: string;
  exercises: Exercise[];
}

export default function TrainerWorkoutTemplateForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState<WorkoutTemplate>({
    name: "",
    goal: "",
    notes: "",
    exercises: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WgerExercise[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (searchQuery) {
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
  }, [searchQuery]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/workout/trainer/workout-templates/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
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
      if (isEdit) {
        await API.patch(`/workout/trainer/workout-templates/${id}`, formData);
        toast.success("Template updated successfully");
      } else {
        await API.post("/workout/trainer/workout-templates", formData);
        toast.success("Template created successfully");
      }
      navigate("/trainer/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/trainer/templates");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="group hover:bg-primary/5 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Templates
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit" : "Create"} Workout Template
            </h1>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-3 h-6 w-6 text-primary" />
                Template Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Template Name */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Template Name</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter template name"
                    className="mt-1 bg-background/50 border-border/50"
                  />
                </div>

                {/* Goal */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Goal</Label>
                  <Input
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    placeholder="Enter goal (e.g., Build strength)"
                    className="mt-1 bg-background/50 border-border/50"
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Notes</Label>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Enter additional notes"
                    className="mt-1 bg-background/50 border-border/50"
                  />
                </div>

                {/* Exercise Search */}
                <div>
                  <Label className="text-sm font-medium text-foreground">Add Exercises</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises (via WGER API)"
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                  
                  {searchLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Searching...</span>
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-border/50 rounded-md bg-card/40 backdrop-blur-sm">
                      {searchResults.map((exercise) => (
                        <div
                          key={exercise.data.id}
                          className="flex items-center justify-between p-3 hover:bg-background/20 transition-colors cursor-pointer border-b border-border/30 last:border-b-0"
                          onClick={() => addExercise(exercise)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                exercise.data.image_thumbnail
                                  ? `https://wger.de${exercise.data.image_thumbnail}`
                                  : "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"
                              }
                              alt={exercise.value}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <span className="font-medium text-foreground">{exercise.value}</span>
                              <span className="block text-xs text-muted-foreground">{exercise.data.category}</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exercise List */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Exercises ({formData.exercises.length})
                  </h3>
                  {formData.exercises.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No exercises added yet. Search and add exercises above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {formData.exercises.map((exercise, index) => (
                        <Card key={index} className="bg-background/30 border-border/50">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium text-foreground">{exercise.name}</h4>
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
                                <Label className="text-xs text-muted-foreground">Sets</Label>
                                <Input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    handleExerciseChange(index, "sets", Number(e.target.value))
                                  }
                                  min="1"
                                  className="mt-1 bg-background/50 border-border/50"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Reps</Label>
                                <Input
                                  value={exercise.reps || ""}
                                  onChange={(e) =>
                                    handleExerciseChange(index, "reps", e.target.value)
                                  }
                                  placeholder="e.g., 10-12"
                                  className="mt-1 bg-background/50 border-border/50"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Weight</Label>
                                <Input
                                  value={exercise.weight || ""}
                                  onChange={(e) =>
                                    handleExerciseChange(index, "weight", e.target.value)
                                  }
                                  placeholder="e.g., 10kg or bodyweight"
                                  className="mt-1 bg-background/50 border-border/50"
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
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isEdit ? "Update" : "Create"} Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}