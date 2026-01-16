import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Dumbbell, Utensils, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import API from "@/lib/axios";
import type { DietTemplate, Exercise, Meal, WorkoutTemplate, TemplateDay } from "@/interfaces/admin/iAdminEditTemplate";
import { Badge } from "@/components/ui/badge";


const EditTemplate = () => {
  const { id, template: templateType } = useParams<{ id: string; template: "workout" | "diet" }>();
  const navigate = useNavigate();

  // We'll use a union type for state, but initialize null
  const [template, setTemplate] = useState<WorkoutTemplate | DietTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);

  // Tracking which item is being edited
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null); // For modal context
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null); // Index within the day's array

  const [exerciseForm, setExerciseForm] = useState<Exercise>({
    name: '',
    sets: 3,
    reps: '10-12',
    weight: 0,
    rest: '60s',
    notes: ''
  });

  const [mealForm, setMealForm] = useState<Meal>({
    name: '',
    time: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    notes: ''
  });

  useEffect(() => {
    if (id && templateType) {
      fetchTemplate();
    }
  }, [id, templateType]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const endpoint = templateType === "workout"
        ? `/template/workout/${id}`
        : `/template/diet/${id}`;
      const response = await API.get(endpoint);
      const data = response.data;

      // Ensure days array exists
      if (!data.days) data.days = [];

      // Normalize 'name' to 'title' (legacy support)
      if (!data.title && data.name) data.title = data.name;

      setTemplate(data);
    } catch (error: any) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
      navigate('/admin/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    try {
      setSaving(true);
      const endpoint = templateType === "workout"
        ? `/template/workout/${id}`
        : `/template/diet/${id}`;

      await API.patch(endpoint, template);
      toast.success("Template updated successfully!");
      navigate('/admin/templates');
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  // --- Day Management ---
  const addDay = () => {
    if (!template) return;
    const newDay: TemplateDay = {
      dayNumber: (template.days?.length || 0) + 1,
      exercises: [],
      meals: []
    };
    const updatedDays = [...(template.days || []), newDay];
    setTemplate({ ...template, days: updatedDays } as any);
    setActiveDayIndex(updatedDays.length - 1);
  };

  const removeDay = (index: number) => {
    if (!template) return;
    const updatedDays = template.days.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setTemplate({ ...template, days: updatedDays } as any);
    if (activeDayIndex === index) setActiveDayIndex(null);
  };

  // --- Exercise Management ---
  const handleAddExercise = (dayIndex: number) => {
    setEditingDayIndex(dayIndex);
    setEditingItemIndex(null);
    setExerciseForm({
      name: '',
      sets: 3,
      reps: '10-12',
      weight: 0,
      rest: '60s',
      notes: ''
    });
    setShowExerciseModal(true);
  };

  const handleEditExercise = (dayIndex: number, exIndex: number) => {
    if (!template) return;
    const exercise = template.days[dayIndex].exercises[exIndex];
    setEditingDayIndex(dayIndex);
    setEditingItemIndex(exIndex);
    setExerciseForm({ ...exercise });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = () => {
    if (!template || editingDayIndex === null) return;

    const updatedDays = [...template.days];
    const day = { ...updatedDays[editingDayIndex] };
    const exercises = [...day.exercises];

    if (editingItemIndex !== null) {
      exercises[editingItemIndex] = exerciseForm;
    } else {
      exercises.push(exerciseForm);
    }

    day.exercises = exercises;
    updatedDays[editingDayIndex] = day;

    setTemplate({ ...template, days: updatedDays } as any);
    setShowExerciseModal(false);
  };

  const handleDeleteExercise = (dayIndex: number, exIndex: number) => {
    if (!template) return;
    const updatedDays = [...template.days];
    updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter((_, i) => i !== exIndex);
    setTemplate({ ...template, days: updatedDays } as any);
  };

  // --- Meal Management ---
  const handleAddMeal = (dayIndex: number) => {
    setEditingDayIndex(dayIndex);
    setEditingItemIndex(null);
    setMealForm({
      name: '',
      time: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      notes: ''
    });
    setShowMealModal(true);
  };

  const handleEditMeal = (dayIndex: number, mealIndex: number) => {
    if (!template) return;
    const meal = template.days[dayIndex].meals[mealIndex];
    setEditingDayIndex(dayIndex);
    setEditingItemIndex(mealIndex);
    setMealForm({ ...meal });
    setShowMealModal(true);
  };

  const handleSaveMeal = () => {
    if (!template || editingDayIndex === null) return;

    const updatedDays = [...template.days];
    const day = { ...updatedDays[editingDayIndex] };
    const meals = [...day.meals];

    if (editingItemIndex !== null) {
      meals[editingItemIndex] = mealForm;
    } else {
      meals.push(mealForm);
    }

    day.meals = meals;
    updatedDays[editingDayIndex] = day;

    setTemplate({ ...template, days: updatedDays } as any);
    setShowMealModal(false);
  };

  const handleDeleteMeal = (dayIndex: number, mealIndex: number) => {
    if (!template) return;
    const updatedDays = [...template.days];
    updatedDays[dayIndex].meals = updatedDays[dayIndex].meals.filter((_, i) => i !== mealIndex);
    setTemplate({ ...template, days: updatedDays } as any);
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#4B8B9B]" />
            <span className="text-white">Loading template...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!template) {
    return (
      <AdminLayout>
        <div className="text-center text-white">
          <p>Template not found</p>
          <Button onClick={() => navigate('/admin/templates')} className="mt-4">
            Back to Templates
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/templates')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {templateType === 'workout' ? (
                <Dumbbell className="h-8 w-8 text-[#4B8B9B]" />
              ) : (
                <Utensils className="h-8 w-8 text-[#4B8B9B]" />
              )}
              Edit {templateType === 'workout' ? 'Workout' : 'Diet'} Template
            </h1>
            <p className="text-gray-400">
              Modify your {templateType} template details and content
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Template Form */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {templateType === 'workout' ? (
              // Workout Template Details
              <>
                <div>
                  <Label htmlFor="title" className="text-white">Template Title</Label>
                  <Input
                    id="title"
                    value={template.title || ''}
                    onChange={(e) => setTemplate({ ...template, title: e.target.value } as any)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal" className="text-white">Goal</Label>
                    <Input
                      id="goal"
                      value={(template as WorkoutTemplate).goal || ''}
                      onChange={(e) => setTemplate({ ...template, goal: e.target.value } as any)}
                      className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipment" className="text-white">Equipment</Label>
                    <div className="flex items-center gap-2 h-10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(template as WorkoutTemplate).equipment || false}
                          onChange={(e) => setTemplate({ ...template, equipment: e.target.checked } as any)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4B8B9B]"></div>
                        <span className="ms-3 text-sm font-medium text-white">{(template as WorkoutTemplate).equipment ? "Required" : "None"}</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={(template as WorkoutTemplate).description || ''}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value } as any)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              // Diet Template Details
              <>
                <div>
                  <Label htmlFor="title" className="text-white">Template Title</Label>
                  <Input
                    id="title"
                    value={template.title || ''}
                    onChange={(e) => setTemplate({ ...template, title: e.target.value } as any)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="goal" className="text-white">Goal</Label>
                    <Input
                      id="goal"
                      value={(template as DietTemplate).goal || ''}
                      onChange={(e) => setTemplate({ ...template, goal: e.target.value } as any)}
                      className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyType" className="text-white">Body Type</Label>
                    <Input
                      id="bodyType"
                      value={(template as DietTemplate).bodyType || ''}
                      onChange={(e) => setTemplate({ ...template, bodyType: e.target.value } as any)}
                      className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={(template as DietTemplate).description || ''}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value } as any)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Structure Section (Days) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {templateType === 'workout' ? <Dumbbell className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}
              Structure
            </h3>
            <Button onClick={addDay} variant="outline" className="border-[#4B8B9B]/50 text-[#4B8B9B] hover:bg-[#4B8B9B]/10 rounded-xl">
              <Plus className="h-4 w-4 mr-2" /> Add Day
            </Button>
          </div>

          <div className="space-y-4">
            {(template.days || []).map((day, dIdx) => (
              <div key={dIdx} className="bg-[#111827] border border-[#4B8B9B]/30 rounded-3xl overflow-hidden shadow-md">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1F2A44]/50 transition-colors"
                  onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)}
                >
                  <div className="flex items-center gap-4">
                    <Badge className="bg-[#4B8B9B] h-8 w-8 rounded-lg flex items-center justify-center font-black p-0">
                      {day.dayNumber}
                    </Badge>
                    <h4 className="text-white font-bold">Day {day.dayNumber}</h4>
                    <span className="text-gray-500 text-sm">
                      {templateType === 'workout'
                        ? `(${day.exercises?.length || 0} Exercises)`
                        : `(${day.meals?.length || 0} Meals)`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {activeDayIndex === dIdx ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                  </div>
                </div>

                {activeDayIndex === dIdx && (
                  <div className="p-6 border-t border-[#4B8B9B]/30 space-y-4">
                    {/* Workout View */}
                    {templateType === 'workout' && (
                      <>
                        <div className="space-y-3">
                          {(day.exercises || []).map((ex, eIdx) => (
                            <div key={eIdx} className="bg-[#1F2A44]/50 p-4 rounded-2xl border border-[#4B8B9B]/30 flex justify-between items-center">
                              <div>
                                <h5 className="text-white font-medium">{ex.name}</h5>
                                <p className="text-gray-400 text-sm">
                                  {ex.sets} sets • {ex.reps} • {ex.weight}kg
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-[#4B8B9B] hover:bg-[#4B8B9B]/10" onClick={() => handleEditExercise(dIdx, eIdx)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteExercise(dIdx, eIdx)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={() => handleAddExercise(dIdx)} className="w-full border-dashed border-2 border-[#4B8B9B]/30 bg-transparent hover:bg-[#4B8B9B]/10 text-[#4B8B9B]">
                          <Plus className="h-4 w-4 mr-2" /> Add Exercise
                        </Button>
                      </>
                    )}

                    {/* Diet View */}
                    {templateType === 'diet' && (
                      <>
                        <div className="space-y-3">
                          {(day.meals || []).map((meal, mIdx) => (
                            <div key={mIdx} className="bg-[#1F2A44]/50 p-4 rounded-2xl border border-[#4B8B9B]/30 flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[#4B8B9B] font-bold text-xs">{meal.time}</span>
                                  <h5 className="text-white font-medium">{meal.name}</h5>
                                </div>
                                <p className="text-gray-400 text-sm">
                                  {meal.calories} kcal
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-[#4B8B9B] hover:bg-[#4B8B9B]/10" onClick={() => handleEditMeal(dIdx, mIdx)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteMeal(dIdx, mIdx)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button onClick={() => handleAddMeal(dIdx)} className="w-full border-dashed border-2 border-[#4B8B9B]/30 bg-transparent hover:bg-[#4B8B9B]/10 text-[#4B8B9B]">
                          <Plus className="h-4 w-4 mr-2" /> Add Meal
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exercise Modal */}
        <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
          <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItemIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="exercise-name">Exercise Name</Label>
                <Input
                  id="exercise-name"
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={exerciseForm.sets}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    value={exerciseForm.reps || ''}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={exerciseForm.weight || 0}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, weight: parseFloat(e.target.value) })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rest">Rest</Label>
                  <Input
                    id="rest"
                    value={exerciseForm.rest || ''}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exercise-notes">Notes</Label>
                <Textarea
                  id="exercise-notes"
                  value={exerciseForm.notes || ''}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveExercise}
                className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
              >
                Save Exercise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Meal Modal */}
        <Dialog open={showMealModal} onOpenChange={setShowMealModal}>
          <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItemIndex !== null ? 'Edit Meal' : 'Add Meal'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="meal-name">Meal Name</Label>
                <Input
                  id="meal-name"
                  value={mealForm.name}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="meal-time">Time</Label>
                  <Input
                    id="meal-time"
                    value={mealForm.time}
                    onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                    placeholder="e.g., Breakfast, 8:00 AM"
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={mealForm.calories}
                    onChange={(e) => setMealForm({ ...mealForm, calories: parseInt(e.target.value) })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={mealForm.protein || 0}
                    onChange={(e) => setMealForm({ ...mealForm, protein: parseFloat(e.target.value) })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={mealForm.carbs || 0}
                    onChange={(e) => setMealForm({ ...mealForm, carbs: parseFloat(e.target.value) })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    type="number"
                    value={mealForm.fats || 0}
                    onChange={(e) => setMealForm({ ...mealForm, fats: parseFloat(e.target.value) })}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="meal-notes">Notes</Label>
                <Textarea
                  id="meal-notes"
                  value={mealForm.notes || ''}
                  onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })}
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveMeal}
                className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
              >
                Save Meal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EditTemplate;