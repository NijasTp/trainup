import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Dumbbell, Utensils, Save, Loader2, ChevronDown, Box, ImagePlus, Layers, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import { toast } from "react-toastify";
import API from "@/lib/axios";
import type { DietTemplate, Exercise, Meal, WorkoutTemplate, TemplateDay } from "@/interfaces/admin/iAdminEditTemplate";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ImageCropper from "@/components/common/ImageCropper";

const EditAdminTemplate = ({ mode = "admin" }: { mode?: "admin" | "trainer" }) => {
  const { id, template: templateType } = useParams<{ id: string; template: "workout" | "diet" }>();
  const navigate = useNavigate();
  const Layout = mode === "trainer" ? TrainerLayout : AdminLayout;

  const [template, setTemplate] = useState<(WorkoutTemplate | DietTemplate) & { imageFile?: Blob } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

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

  useEffect(() => {
    if (templateType === 'workout' && template && (template as any).type === 'one-time') {
      if (template.days.length > 1) {
        setTemplate(prev => prev ? ({ ...prev, days: [prev.days[0]], repetitions: 1 }) : null);
        toast.info("Truncated to 1 day for one-time session protocol");
      } else if ((template as any).repetitions !== 1) {
        setTemplate(prev => prev ? ({ ...prev, repetitions: 1 }) : null);
      }
    }
  }, [templateType, template?.days.length, (template as any)?.type, (template as any)?.repetitions]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const endpoint = templateType === "workout" ? `/template/workout/${id}` : `/template/diet/${id}`;
      const response = await API.get(endpoint);
      const data = response.data;
      if (!data.days) data.days = [];
      if (!data.title && data.name) data.title = data.name;
      // Ensure repetitions exists for workouts
      if (templateType === 'workout' && data.repetitions === undefined) data.repetitions = 1;
      setTemplate(data);
    } catch (error: any) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
      navigate(mode === 'trainer' ? '/trainer/templates' : '/admin/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    try {
      setSaving(true);
      const endpoint = templateType === "workout" ? `/template/workout/${id}` : `/template/diet/${id}`;

      const formData = new FormData();
      Object.keys(template).forEach(key => {
        if (key === 'days') {
          formData.append('days', JSON.stringify(template.days));
        } else if (key === 'requiredEquipment') {
          formData.append('requiredEquipment', JSON.stringify((template as WorkoutTemplate).requiredEquipment));
        } else if (key === 'imageFile') {
          formData.append('image', template.imageFile as Blob, 'template.jpg');
        } else if (key !== 'image' && (template as any)[key] !== undefined) {
          formData.append(key, String((template as any)[key]));
        }
      });

      await API.patch(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Blueprint synchronized successfully!");
      navigate(mode === 'trainer' ? '/trainer/templates' : '/admin/templates');
    } catch (error: any) {
      toast.error("Protocol synchronization failed");
    } finally {
      setSaving(false);
    }
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
    setTemplate(prev => prev ? ({ ...prev, imageFile: croppedBlob, image: URL.createObjectURL(croppedBlob) }) : null);
    setShowCropper(false);
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
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-zinc-500 font-black tracking-widest uppercase animate-pulse">Initializing Blueprint Editor...</p>
        </div>
      </Layout>
    );
  }

  if (!template) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-3xl flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              {templateType === "workout" ? <Dumbbell className="h-8 w-8" /> : <Utensils className="h-8 w-8 text-orange-400" />}
            </div>
            <div>
              <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                Synchronize <span className={templateType === 'workout' ? "text-cyan-400" : "text-orange-400"}>Protocol</span>
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                Strategic {templateType === 'workout' ? 'Training' : 'Nutrition'} Calibration
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(mode === 'trainer' ? "/trainer/templates" : "/admin/templates")}
              className="flex-1 md:flex-none border-white/5 text-gray-500 font-black italic uppercase text-xs hover:bg-white/5 h-14 px-8 rounded-2xl"
            >
              Abort Evolution
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "flex-1 md:flex-none font-black italic uppercase text-xs px-10 h-14 rounded-2xl shadow-2xl transition-all hover:scale-105",
                templateType === 'workout'
                  ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20"
                  : "bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20"
              )}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Archive Protocol
            </Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-10">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-0">
              <CardHeader className="bg-white/5 p-8 border-b border-white/10">
                <CardTitle className="text-white text-xl font-black italic uppercase tracking-widest flex items-center gap-3">
                  <Box className={cn("h-6 w-6", templateType === 'workout' ? "text-cyan-400" : "text-orange-400")} /> Core Baseline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {/* Visual Banner */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                    <ImagePlus size={16} className={templateType === 'workout' ? "text-cyan-400" : "text-orange-400"} />
                    Visual Authentication
                  </label>
                  <div className="relative group cursor-pointer aspect-[21/9] rounded-[2rem] overflow-hidden border-2 border-dashed border-white/10 hover:border-white/20 transition-all bg-black/40">
                    <img src={template.image} alt="Banner" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button onClick={() => document.getElementById('imageInput')?.click()} variant="outline" className="bg-white/10 border-white/20 text-white font-black italic uppercase text-[10px] rounded-xl">Refresh Signal</Button>
                    </div>
                    <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Protocol ID</label>
                    <Input
                      value={template.title}
                      onChange={(e) => setTemplate({ ...template, title: e.target.value } as any)}
                      className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  {templateType === 'workout' ? (
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Plan Repetitions</label>
                      <div className="relative group">
                        <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 transition-colors group-focus-within:text-cyan-400" />
                        <Input
                          type="number"
                          value={(template as WorkoutTemplate).repetitions}
                          disabled={(template as any).type === 'one-time'}
                          onChange={(e) => setTemplate({ ...template, repetitions: parseInt(e.target.value) } as any)}
                          className="bg-black/40 border-white/10 h-16 pl-14 rounded-2xl text-white font-black italic uppercase text-sm disabled:opacity-30 disabled:grayscale transition-all"
                        />
                        {(template as any).type === 'one-time' && (
                          <div className="absolute -bottom-5 left-2 text-[8px] text-cyan-500/50 font-black uppercase italic">Disabled for one-time sessions</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Goal Vector</label>
                      <Input
                        value={template.goal}
                        onChange={(e) => setTemplate({ ...template, goal: e.target.value } as any)}
                        className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Directive Description</label>
                  <Textarea
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value } as any)}
                    className="bg-black/40 border-white/10 text-white min-h-[160px] rounded-[2rem] font-black italic uppercase text-xs p-8 tracking-widest leading-relaxed focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                  <Calendar className={cn("h-6 w-6", templateType === 'workout' ? "text-cyan-400" : "text-orange-400")} /> Deployment Schedule
                </h3>
                <Button onClick={addDay} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black italic uppercase text-[10px] h-10 px-6 rounded-xl transition-all">
                  <Plus className="h-4 w-4 mr-2" /> Add Deployment Day
                </Button>
              </div>

              <div className="space-y-6">
                {(template.days || []).map((day, dIdx) => (
                  <div key={dIdx} className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[3rem] shadow-2xl overflow-hidden group/day">
                    <div
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-all"
                      onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "h-10 w-10 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-xl transition-transform group-hover/day:scale-110",
                          templateType === 'workout' ? "bg-cyan-500 text-black shadow-cyan-500/20" : "bg-orange-500 text-white shadow-orange-500/20"
                        )}>
                          {day.dayNumber}
                        </div>
                        <div>
                          <h4 className="text-white font-black italic uppercase text-lg tracking-tight">Phase Cycle {day.dayNumber}</h4>
                          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest italic">
                            {templateType === 'workout' ? `${day.exercises?.length || 0} MODULES INITIALIZED` : `${day.meals?.length || 0} NUTRITION NODES`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
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
                          className="overflow-hidden"
                        >
                          <div className="p-10 border-t border-white/5 space-y-8 bg-black/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {templateType === 'workout' ? (
                                <>
                                  {(day.exercises || []).map((ex, eIdx) => (
                                    <div key={eIdx} className="p-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-cyan-500/20 transition-all group/item space-y-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="text-white font-black italic uppercase group-hover/item:text-cyan-400 transition-colors">{ex.name}</h5>
                                          <p className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest mt-1">Exercise Module</p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button onClick={() => handleEditExercise(dIdx, eIdx)} size="icon" className="h-8 w-8 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-lg transition-all border border-white/5"><Edit size={14} /></Button>
                                          <Button onClick={() => handleDeleteExercise(dIdx, eIdx)} size="icon" className="h-8 w-8 bg-white/5 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-white/5"><Trash2 size={14} /></Button>
                                        </div>
                                      </div>
                                      <div className="flex gap-4">
                                        <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                                          <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-widest block">Sets</span>
                                          <span className="text-xs font-black italic text-white">{ex.sets}</span>
                                        </div>
                                        <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 flex-1">
                                          <span className="text-[8px] font-black text-gray-500 uppercase italic tracking-widest block">Reps / Duration</span>
                                          <span className="text-xs font-black italic text-white uppercase">{ex.reps}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => handleAddExercise(dIdx)} className="p-10 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 flex flex-col items-center justify-center gap-4 transition-all text-gray-600 hover:text-cyan-400 min-h-[160px]">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
                                      <Plus size={24} />
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest uppercase italic">Initialize Module</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {(day.meals || []).map((meal, mIdx) => (
                                    <div key={mIdx} className="p-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-orange-500/20 transition-all group/item space-y-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest block mb-1">{meal.time}</span>
                                          <h5 className="text-white font-black italic uppercase group-hover/item:text-orange-400 transition-colors leading-tight">{meal.name}</h5>
                                          <p className="text-[10px] text-gray-500 font-bold mt-1">{meal.calories} KCAL</p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button onClick={() => handleEditMeal(dIdx, mIdx)} size="icon" className="h-8 w-8 bg-white/5 hover:bg-orange-500 hover:text-white rounded-lg transition-all border border-white/5"><Edit size={14} /></Button>
                                          <Button onClick={() => handleDeleteMeal(dIdx, mIdx)} size="icon" className="h-8 w-8 bg-white/5 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-white/5"><Trash2 size={14} /></Button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button onClick={() => handleAddMeal(dIdx)} className="p-10 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 flex flex-col items-center justify-center gap-4 transition-all text-gray-600 hover:text-orange-400 min-h-[160px]">
                                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
                                      <Plus size={24} />
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest uppercase italic">Inject Nutrition Node</span>
                                  </button>
                                </>
                              )}
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

          <div className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-8 shadow-2xl sticky top-36 overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-white/5 blur-[80px] rounded-full" />
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/10 pb-4 relative z-10">
                Protocol <span className={templateType === 'workout' ? "text-cyan-400" : "text-orange-400"}>Statistics</span>
              </h3>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center group/metric">
                  <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-white transition-colors">Phase Units</span>
                  <span className="text-white font-black italic text-lg">{template.days?.length || 0}</span>
                </div>
                {templateType === 'workout' && (
                  <div className="flex justify-between items-center group/metric">
                    <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-white transition-colors">Net Duration</span>
                    <span className="text-cyan-400 font-black italic text-lg">
                      {(template.days?.length || 0) * ((template as WorkoutTemplate).repetitions || 1)} DAYS
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center group/metric">
                  <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-white transition-colors">Visibility</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black italic uppercase text-[8px] tracking-widest">ENCRYPTED</Badge>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/10 space-y-6 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Technical Memo</h4>
                <ul className="space-y-4">
                  {[
                    "Modifying established protocols may shift metabolic curves.",
                    "Ensure phase sequencing aligns with user objectives.",
                    "Protocol synchronization is verified on Save."
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-[10px] text-gray-500 font-bold italic uppercase leading-relaxed">
                      <div className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", templateType === 'workout' ? "bg-cyan-500" : "bg-orange-500")} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>

        {/* Exercise Modal */}
        <Dialog open={showExerciseModal} onOpenChange={setShowExerciseModal}>
          <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
            <DialogHeader className="mb-10">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Dumbbell size={28} />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                    {editingItemIndex !== null ? 'Modify Unit' : 'Configure New Unit'}
                  </DialogTitle>
                  <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 italic">Mechanical Specification Phase</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Module Identity</Label>
                <Input
                  value={exerciseForm.name}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                  className="bg-black border-white/10 h-16 px-6 rounded-2xl text-white font-black italic text-lg focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="E.G. TITAN SQUATS"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Volume Grid</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-gray-600 uppercase italic">Sets</span>
                      <Input type="number" value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) })} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic text-cyan-400" />
                    </div>
                    <div className="space-y-4">
                      <span className="text-[8px] font-black text-gray-600 uppercase italic">Reps / Duration</span>
                      <Input value={exerciseForm.reps} onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" placeholder="10-12 or 60s" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Tension Matrix</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-gray-600 uppercase italic">Load (KG)</span>
                      <Input type="number" value={exerciseForm.weight} onChange={(e) => setExerciseForm({ ...exerciseForm, weight: parseFloat(e.target.value) })} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-gray-600 uppercase italic">Rest Period</span>
                      <Input value={exerciseForm.rest} onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} className="bg-black border-white/10 h-14 rounded-xl text-center font-black italic" placeholder="60s" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Field Directives</Label>
                <Textarea value={exerciseForm.notes} onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} className="bg-black border-white/10 p-6 rounded-2xl text-white font-medium min-h-[120px] resize-none focus:ring-1 focus:ring-cyan-500/50 italic text-xs tracking-widest" placeholder="FOCUS ON MAXIMAL MOTOR UNIT RECRUITMENT..." />
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button onClick={handleSaveExercise} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black italic rounded-2xl h-16 text-lg uppercase shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02]">
                Synchronize Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Meal Modal */}
        <Dialog open={showMealModal} onOpenChange={setShowMealModal}>
          <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
            <DialogHeader className="mb-10">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Utensils size={28} />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">
                    {editingItemIndex !== null ? 'Regulate Node' : 'Initialize Node'}
                  </DialogTitle>
                  <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1 italic">Metabolic Fuel Specification</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Node Identity</Label>
                  <Input value={mealForm.name} onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })} className="bg-black border-white/10 h-14 px-6 rounded-2xl text-white font-black italic uppercase text-sm" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-500 tracking-[0.2em] uppercase ml-1 italic">Temporal Node</Label>
                  <Input value={mealForm.time} onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })} className="bg-black border-white/10 h-14 px-6 rounded-2xl text-white font-black italic uppercase text-sm" placeholder="08:00 AM" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-[7px] font-black text-gray-500 uppercase italic">KCAL</Label>
                  <Input type="number" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: parseInt(e.target.value) || 0 })} className="bg-black border-white/10 h-12 rounded-xl text-center font-black italic" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[7px] font-black text-emerald-500 uppercase italic">PROTEIN</Label>
                  <Input type="number" value={mealForm.protein} onChange={(e) => setMealForm({ ...mealForm, protein: parseFloat(e.target.value) || 0 })} className="bg-black border-white/10 h-12 rounded-xl text-center font-black italic text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[7px] font-black text-amber-500 uppercase italic">CARBS</Label>
                  <Input type="number" value={mealForm.carbs} onChange={(e) => setMealForm({ ...mealForm, carbs: parseFloat(e.target.value) || 0 })} className="bg-black border-white/10 h-12 rounded-xl text-center font-black italic text-amber-400" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[7px] font-black text-rose-500 uppercase italic">FATS</Label>
                  <Input type="number" value={mealForm.fats} onChange={(e) => setMealForm({ ...mealForm, fats: parseFloat(e.target.value) || 0 })} className="bg-black border-white/10 h-12 rounded-xl text-center font-black italic text-rose-400" />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button onClick={handleSaveMeal} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black italic rounded-2xl h-16 text-lg uppercase shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]">
                Synchronize Node
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
      </div>
    </Layout>
  );
};

export default EditAdminTemplate;