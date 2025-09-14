import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Dumbbell, Utensils, Save, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import API from "@/lib/axios";
import type { DietTemplate, Exercise, Meal, WorkoutTemplate } from "@/interfaces/admin/iAdminEditTemplate";


const EditTemplate = () => {
  const { id, templateType } = useParams<{ id: string; templateType: "workout" | "diet" }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<WorkoutTemplate | DietTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);

  const [exerciseForm, setExerciseForm] = useState<Exercise>({
    id: '',
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
        ? `/workout/admin/workout-templates/${id}` 
        : `/diet/admin/templates/${id}`;
      const response = await API.get(endpoint);
      setTemplate(response.data.template || response.data);
    } catch (error: any) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
      navigate('/admin/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const endpoint = templateType === "workout" 
        ? `/workout/admin/workout-templates/${id}` 
        : `/diet/admin/templates/${id}`;
      
      await API.put(endpoint, template);
      toast.success("Template updated successfully!");
      navigate('/admin/templates');
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const handleAddExercise = () => {
    setEditingExerciseIndex(null);
    setExerciseForm({
      id: Date.now().toString(),
      name: '',
      sets: 3,
      reps: '10-12',
      weight: 0,
      rest: '60s',
      notes: ''
    });
    setShowExerciseModal(true);
  };

  const handleEditExercise = (index: number) => {
    const exercise = (template as WorkoutTemplate).exercises[index];
    setEditingExerciseIndex(index);
    setExerciseForm(exercise);
    setShowExerciseModal(true);
  };

  const handleSaveExercise = () => {
    if (!template || templateType !== 'workout') return;
    
    const workoutTemplate = template as WorkoutTemplate;
    const updatedExercises = [...workoutTemplate.exercises];
    
    if (editingExerciseIndex !== null) {
      updatedExercises[editingExerciseIndex] = exerciseForm;
    } else {
      updatedExercises.push(exerciseForm);
    }
    
    setTemplate({ ...workoutTemplate, exercises: updatedExercises });
    setShowExerciseModal(false);
  };

  const handleDeleteExercise = (index: number) => {
    if (!template || templateType !== 'workout') return;
    
    const workoutTemplate = template as WorkoutTemplate;
    const updatedExercises = workoutTemplate.exercises.filter((_, i) => i !== index);
    setTemplate({ ...workoutTemplate, exercises: updatedExercises });
  };

  const handleAddMeal = () => {
    setEditingMealIndex(null);
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

  const handleEditMeal = (index: number) => {
    const meal = (template as DietTemplate).meals[index];
    setEditingMealIndex(index);
    setMealForm(meal);
    setShowMealModal(true);
  };

  const handleSaveMeal = () => {
    if (!template || templateType !== 'diet') return;
    
    const dietTemplate = template as DietTemplate;
    const updatedMeals = [...dietTemplate.meals];
    
    if (editingMealIndex !== null) {
      updatedMeals[editingMealIndex] = mealForm;
    } else {
      updatedMeals.push(mealForm);
    }
    
    setTemplate({ ...dietTemplate, meals: updatedMeals });
    setShowMealModal(false);
  };

  const handleDeleteMeal = (index: number) => {
    if (!template || templateType !== 'diet') return;
    
    const dietTemplate = template as DietTemplate;
    const updatedMeals = dietTemplate.meals.filter((_, i) => i !== index);
    setTemplate({ ...dietTemplate, meals: updatedMeals });
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
              <>
                <div>
                  <Label htmlFor="name" className="text-white">Template Name</Label>
                  <Input
                    id="name"
                    value={(template as WorkoutTemplate).name || ''}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value } as WorkoutTemplate)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="goal" className="text-white">Goal</Label>
                  <Input
                    id="goal"
                    value={(template as WorkoutTemplate).goal || ''}
                    onChange={(e) => setTemplate({ ...template, goal: e.target.value } as WorkoutTemplate)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-white">Notes</Label>
                  <Textarea
                    id="notes"
                    value={(template as WorkoutTemplate).notes || ''}
                    onChange={(e) => setTemplate({ ...template, notes: e.target.value } as WorkoutTemplate)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="title" className="text-white">Template Title</Label>
                  <Input
                    id="title"
                    value={(template as DietTemplate).title || ''}
                    onChange={(e) => setTemplate({ ...template, title: e.target.value } as DietTemplate)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={(template as DietTemplate).description || ''}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value } as DietTemplate)}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content Section */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {templateType === 'workout' ? 'Exercises' : 'Meals'}
            </CardTitle>
            <Button
              onClick={templateType === 'workout' ? handleAddExercise : handleAddMeal}
              className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {templateType === 'workout' ? 'Exercise' : 'Meal'}
            </Button>
          </CardHeader>
          <CardContent>
            {templateType === 'workout' ? (
              <div className="space-y-4">
                {(template as WorkoutTemplate).exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{exercise.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {exercise.sets} sets • {exercise.reps || exercise.time}
                            {exercise.weight ? ` • ${exercise.weight}kg` : ''}
                            {exercise.rest && ` • Rest: ${exercise.rest}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditExercise(index)}
                            className="border-[#4B8B9B]/30 text-white hover:bg-[#4B8B9B]/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExercise(index)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {(template as DietTemplate).meals.map((meal, index) => (
                  <Card key={index} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{meal.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {meal.time} • {meal.calories} kcal
                            {meal.protein && ` • ${meal.protein}g protein`}
                            {meal.carbs && ` • ${meal.carbs}g carbs`}
                            {meal.fats && ` • ${meal.fats}g fats`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMeal(index)}
                            className="border-[#4B8B9B]/30 text-white hover:bg-[#4B8B9B]/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMeal(index)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise Modal */}
        <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
          <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExerciseIndex !== null ? 'Edit Exercise' : 'Add Exercise'}
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
                {editingMealIndex !== null ? 'Edit Meal' : 'Add Meal'}
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