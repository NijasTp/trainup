import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Dumbbell, Utensils, Save, Loader2, ChevronDown, ChevronUp, Sparkles, Clock, Target, Box } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import API from "@/lib/axios";
import type { DietTemplate, Exercise, Meal, WorkoutTemplate, TemplateDay } from "@/interfaces/admin/iAdminEditTemplate";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const EditTemplate = () => {
  const { id, template: templateType } = useParams<{ id: string; template: "workout" | "diet" }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<WorkoutTemplate | DietTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(0);
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

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
      const endpoint = templateType === "workout" ? `/template/workout/${id}` : `/template/diet/${id}`;
      const response = await API.get(endpoint);
      const data = response.data;
      if (!data.days) data.days = [];
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
      const endpoint = templateType === "workout" ? `/template/workout/${id}` : `/template/diet/${id}`;
      await API.patch(endpoint, template);
      toast.success("Blueprint synchronized successfully!");
      navigate('/admin/templates');
    } catch (error: any) {
      toast.error("Protocol synchronization failed");
    } finally {
      setSaving(false);
    }
  };

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
  };

  const handleAddExercise = (dayIndex: number) => {
    setEditingDayIndex(dayIndex);
    setEditingItemIndex(null);
    setExerciseForm({ name: '', sets: 3, reps: '10-12', weight: 0, rest: '60s', notes: '' });
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
    if (editingItemIndex !== null) exercises[editingItemIndex] = exerciseForm;
    else exercises.push(exerciseForm);
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

  const handleAddMeal = (dayIndex: number) => {
    setEditingDayIndex(dayIndex);
    setEditingItemIndex(null);
    setMealForm({ name: '', time: '', calories: 0, protein: 0, carbs: 0, fats: 0, notes: '' });
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
    if (editingItemIndex !== null) meals[editingItemIndex] = mealForm;
    else meals.push(mealForm);
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
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-zinc-500 font-black tracking-widest uppercase animate-pulse">Initializing Blueprint Editor...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!template) return null;

  return (
    <AdminLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/admin/templates')} variant="ghost" className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 p-0 transition-transform hover:-translate-x-1">
                <ArrowLeft size={18} />
              </Button>
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] tracking-widest">
                EDITOR MODE
              </Badge>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white italic tracking-tight uppercase">
              {templateType === "workout" ? "WORKOUT ARCHITECT" : "NUTRITION DESIGNER"}
            </h1>
            <p className="text-zinc-500 font-medium">Fine-tuning the {template.title} protocol</p>
          </div>
          <div className="flex items-center gap-4 w-full xl:w-auto">
            <Button onClick={() => navigate('/admin/templates')} className="flex-1 xl:flex-none bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 font-black italic rounded-2xl h-14 px-8">
              BACK
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 xl:flex-none bg-primary hover:bg-primary/90 text-black font-black italic rounded-2xl h-14 px-10 shadow-[0_10px_30px_rgba(var(--primary),0.3)] transition-all hover:scale-105 active:scale-95">
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={20} />}
              SAVE PROTOCOL
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-10">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 sticky top-8">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">Base Configuration</h3>
                <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Global blueprint metadata</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1">Archive Title</Label>
                  <Input value={template.title} onChange={(e) => setTemplate({ ...template, title: e.target.value } as any)} className="bg-zinc-900/50 border-white/5 h-14 px-6 rounded-2xl text-white font-black italic text-lg focus:ring-1 focus:ring-primary/20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1">Goal Vector</Label>
                    <div className="relative">
                      <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                      <Input value={template.goal || ''} onChange={(e) => setTemplate({ ...template, goal: e.target.value } as any)} className="bg-zinc-900/50 border-white/5 h-12 pl-12 rounded-2xl text-white font-bold text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1">Factor</Label>
                    <div className="relative">
                      {templateType === "workout" ? <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} /> : <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />}
                      <Input value={templateType === "workout" ? ((template as WorkoutTemplate).equipment ? "Hardware" : "Free") : (template as DietTemplate).bodyType || ''} readOnly className="bg-zinc-900/50 border-white/5 h-12 pl-12 rounded-2xl text-white font-bold text-sm opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase ml-1">Blueprint Synopsis</Label>
                  <Textarea value={template.description || ''} onChange={(e) => setTemplate({ ...template, description: e.target.value } as any)} className="bg-zinc-900/50 border-white/5 p-6 rounded-2xl text-white font-medium min-h-[150px] resize-none focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                  <span>Day Count</span>
                  <span className="text-primary">{template.days?.length || 0} PHASED UNITS</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (template.days?.length || 0) * 14.28)}%` }} className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white italic uppercase leading-none">Phased Protocol</h3>
                  <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mt-1">Timeline Management</p>
                </div>
              </div>
              <Button onClick={addDay} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black italic rounded-xl px-6 h-12">
                <Plus className="mr-2" size={18} /> ADD PHASE
              </Button>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {template.days.map((day, dIdx) => (
                  <motion.div layout key={dIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group">
                    <div onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)} className="p-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-primary text-xl font-black italic shadow-xl group-hover:scale-110 transition-transform">
                          P{day.dayNumber}
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white italic uppercase tracking-tight">Phase {day.dayNumber} Protocol</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">
                              {templateType === "workout" ? `${day.exercises?.length || 0} Exercises Registered` : `${day.meals?.length || 0} Nutrition Nodes`}
                            </span>
                            <div className="h-1 w-1 rounded-full bg-zinc-700" />
                            <Badge className="bg-zinc-900 text-zinc-400 border-zinc-800 text-[8px] font-black tracking-tighter">ACTIVE</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:bg-red-500/10 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={16} />
                        </button>
                        <div className={`h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-300 ${activeDayIndex === dIdx ? "rotate-180" : ""}`}>
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {activeDayIndex === dIdx && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 bg-white/[0.01]">
                          <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {templateType === "workout" ? (
                                <>
                                  <AnimatePresence mode="popLayout">
                                    {day.exercises.map((ex, eIdx) => (
                                      <motion.div layout key={eIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-primary/20 transition-all group/item">
                                        <div className="flex justify-between items-start mb-4">
                                          <div className="space-y-1">
                                            <h5 className="text-white font-black italic uppercase group-hover/item:text-primary transition-colors">{ex.name}</h5>
                                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tight">{ex.sets} SETS • {ex.reps} • {ex.weight}KG</p>
                                          </div>
                                          <div className="flex gap-2">
                                            <button onClick={() => handleEditExercise(dIdx, eIdx)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary">
                                              <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteExercise(dIdx, eIdx)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                        {ex.notes && <p className="text-[10px] text-zinc-600 font-medium italic line-clamp-2">"{ex.notes}"</p>}
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                  <button onClick={() => handleAddExercise(dIdx)} className="p-8 rounded-3xl border-2 border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/[0.02] flex flex-col items-center justify-center gap-3 transition-all text-zinc-500 hover:text-primary min-h-[140px]">
                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                      <Plus size={20} />
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Add Unit</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <AnimatePresence mode="popLayout">
                                    {day.meals.map((meal, mIdx) => (
                                      <motion.div layout key={mIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-primary/20 transition-all group/item">
                                        <div className="flex justify-between items-start mb-4">
                                          <div className="space-y-1 text-left">
                                            <span className="text-[9px] font-black text-primary tracking-widest uppercase">{meal.time}</span>
                                            <h5 className="text-white font-black italic uppercase group-hover/item:text-primary transition-colors leading-tight">{meal.name}</h5>
                                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tight">{meal.calories} KCAL</p>
                                          </div>
                                          <div className="flex gap-2 shrink-0 ml-4">
                                            <button onClick={() => handleEditMeal(dIdx, mIdx)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-primary">
                                              <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDeleteMeal(dIdx, mIdx)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                  <button onClick={() => handleAddMeal(dIdx)} className="p-8 rounded-3xl border-2 border-dashed border-white/5 hover:border-primary/30 hover:bg-primary/[0.02] flex flex-col items-center justify-center gap-3 transition-all text-zinc-500 hover:text-primary min-h-[140px]">
                                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                                      <Plus size={20} />
                                    </div>
                                    <span className="text-[10px] font-black tracking-[0.2em] uppercase">Add Meal</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Exercise Modal */}
        <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
          <DialogContent className="max-w-2xl bg-[#0a0a0b] border-white/10 text-white rounded-[2rem] p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-black">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">
                    {editingItemIndex !== null ? 'Modify Unit' : 'Configure New Unit'}
                  </DialogTitle>
                  <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mt-1">Movement specifications</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Exercise Identity</Label>
                <Input value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} className="bg-zinc-900 border-white/5 h-14 px-4 rounded-xl text-white font-bold italic" placeholder="e.g. Incline DB Press" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Sets / Reps</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) })} className="bg-zinc-900 border-white/5 h-12 rounded-xl text-center font-black" />
                    <span className="text-zinc-600">×</span>
                    <Input value={exerciseForm.reps} onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })} className="bg-zinc-900 border-white/5 h-12 rounded-xl text-center font-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Resistance (KG)</Label>
                  <Input type="number" value={exerciseForm.weight} onChange={(e) => setExerciseForm({ ...exerciseForm, weight: parseFloat(e.target.value) })} className="bg-zinc-900 border-white/5 h-12 rounded-xl font-black" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Movement Notes</Label>
                <Textarea value={exerciseForm.notes} onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} className="bg-zinc-900 border-white/5 rounded-xl min-h-[100px] resize-none" />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSaveExercise} className="w-full bg-primary hover:bg-primary/90 text-black font-black italic rounded-xl h-14 text-lg">
                SAVE SPECIFICATIONS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Meal Modal */}
        <Dialog open={showMealModal} onOpenChange={setShowMealModal}>
          <DialogContent className="max-w-2xl bg-[#0a0a0b] border-white/10 text-white rounded-[2rem] p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-black">
                  <Utensils size={24} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black italic uppercase tracking-tight">
                    {editingItemIndex !== null ? 'Regulate Meal' : 'Establish New Node'}
                  </DialogTitle>
                  <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase mt-1">Caloric & Nutrient input</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Meal Identity</Label>
                  <Input value={mealForm.name} onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })} className="bg-zinc-900 border-white/5 h-14 px-4 rounded-xl text-white font-bold italic" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Timing Node</Label>
                  <Input value={mealForm.time} onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })} className="bg-zinc-900 border-white/5 h-14 px-4 rounded-xl text-white font-bold italic" placeholder="08:00 AM" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[8px] font-black text-zinc-500 uppercase">KCAL</Label>
                  <Input type="number" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: parseInt(e.target.value) })} className="bg-zinc-900 border-white/5 h-12 rounded-xl text-center font-black" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[8px] font-black text-emerald-500 uppercase">PRO (G)</Label>
                  <Input type="number" value={mealForm.protein} onChange={(e) => setMealForm({ ...mealForm, protein: parseFloat(e.target.value) })} className="bg-zinc-900 border-white/5 h-12 rounded-xl text-center font-black text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[8px] font-black text-amber-500 uppercase">CAR (G)</Label>
                  <Input type="number" value={mealForm.carbs} onChange={(e) => setMealForm({ ...mealForm, carbs: parseFloat(e.target.value) })} className="bg-zinc-900 border-white/5 h-12 rounded-xl text-center font-black text-amber-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[8px] font-black text-red-500 uppercase">FAT (G)</Label>
                  <Input type="number" value={mealForm.fats} onChange={(e) => setMealForm({ ...mealForm, fats: parseFloat(e.target.value) })} className="bg-zinc-900 border-white/5 h-12 rounded-xl text-center font-black text-red-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Consumption Notes</Label>
                <Textarea value={mealForm.notes} onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })} className="bg-zinc-900 border-white/5 rounded-xl min-h-[100px] resize-none" />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button onClick={handleSaveMeal} className="w-full bg-primary hover:bg-primary/90 text-black font-black italic rounded-xl h-14 text-lg">
                SAVE NODE
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default EditTemplate;