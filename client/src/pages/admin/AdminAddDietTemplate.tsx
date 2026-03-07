import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import API from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Loader2, Utensils, Calendar, Trash2, ChevronDown, ImagePlus, X, Box, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TrainerLayout } from "@/components/trainer/TrainerLayout";
import ImageCropper from "@/components/common/ImageCropper";
import type { TemplateMeal, IDietTemplate } from "@/interfaces/admin/templateManagement";
import type { USDAFood, USDAResponse } from "@/interfaces/common/IUSDA";

export default function NewDietTemplate({ mode = "admin" }: { mode?: "admin" | "trainer" }) {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const Layout = mode === "trainer" ? TrainerLayout : AdminLayout;
  const itemsPerPage = 10;
  const [template, setTemplate] = useState<Partial<IDietTemplate> & { imageFile?: Blob }>({
    title: "",
    description: "",
    duration: 7,
    goal: "",
    bodyType: "",
    isPublic: true,
    days: [],
    image: "",
  });
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const [newMeal, setNewMeal] = useState<Partial<TemplateMeal>>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    time: "12:00",
    notes: "",
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [usdaFoods, setUsdaFoods] = useState<USDAFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
  const [usdaMealTime, setUsdaMealTime] = useState<string>("12:00");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      const fetchTemplate = async () => {
        try {
          const res = await API.get(`/template/diet/${id}`);
          setTemplate(res.data);
        } catch (err) {
          toast.error("Failed to load template");
        }
      };
      fetchTemplate();
    }
  }, [id]);

  const fetchUsdaFoods = async (query: string, page: number = 1) => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get<USDAResponse>(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${import.meta.env.VITE_USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${itemsPerPage}&pageNumber=${page}`
      );
      setUsdaFoods(response.data.foods || []);
    } catch (err) {
      toast.error("Failed to fetch USDA food data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate((prev: any) => ({ ...prev, [name]: name === 'duration' ? parseInt(value) || 0 : value }));
  };

  const addDay = () => {
    setTemplate((prev: any) => ({
      ...prev,
      days: [...(prev.days || []), { dayNumber: (prev.days?.length || 0) + 1, meals: [] }]
    }));
    setActiveDayIndex((template.days?.length || 0));
  };

  const removeDay = (index: number) => {
    setTemplate((prev: any) => ({
      ...prev,
      days: (prev.days || []).filter((_: any, i: number) => i !== index).map((d: any, i: number) => ({ ...d, dayNumber: i + 1 }))
    }));
    if (activeDayIndex === index) setActiveDayIndex(null);
  };

  const addMealToDay = (dayIndex: number, meal: TemplateMeal) => {
    setTemplate((prev: any) => {
      const newDays = [...(prev.days || [])];
      newDays[dayIndex].meals.push(meal);
      return { ...prev, days: newDays };
    });
    setNewMeal({ name: "", calories: 0, protein: 0, carbs: 0, fats: 0, time: "12:00", notes: "" });
    setSelectedFood(null);
  };

  const removeMealFromDay = (dayIndex: number, mealIndex: number) => {
    setTemplate((prev: any) => {
      const newDays = [...(prev.days || [])];
      newDays[dayIndex].meals = newDays[dayIndex].meals.filter((_: any, i: number) => i !== mealIndex);
      return { ...prev, days: newDays };
    });
  };

  const addUsdaMeal = (food: USDAFood) => {
    if (activeDayIndex === null) return;
    const nutrients = food.foodNutrients;
    const meal: TemplateMeal = {
      name: food.description,
      calories: nutrients.find((n: any) => n.nutrientName === "Energy")?.value || 0,
      protein: nutrients.find((n: any) => n.nutrientName === "Protein")?.value || 0,
      carbs: nutrients.find((n: any) => n.nutrientName === "Carbohydrate, by difference")?.value || 0,
      fats: nutrients.find((n: any) => n.nutrientName === "Total lipid (fat)")?.value || 0,
      time: usdaMealTime,
      notes: food.ingredients || "",
      nutritions: nutrients
        .filter((n: any) => !["Energy", "Protein", "Carbohydrate, by difference", "Total lipid (fat)"].includes(n.nutrientName))
        .map((n) => ({ label: n.nutrientName, value: n.value, unit: n.unitName })),
    };
    addMealToDay(activeDayIndex, meal);
  };

  const addManualMeal = () => {
    if (activeDayIndex === null) return;
    if (!newMeal.name || !newMeal.time) {
      toast.error("Meal name and time are required");
      return;
    }
    addMealToDay(activeDayIndex, newMeal as TemplateMeal);
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
    setTemplate(prev => ({ ...prev, imageFile: croppedBlob, image: URL.createObjectURL(croppedBlob) }));
    setShowCropper(false);
  };

  const handleSubmit = async () => {
    if (!template.title || !template.goal || !template.bodyType || !template.image) {
      toast.error("Template title, goal, body type and image are required");
      return;
    }
    if (!template.days || template.days.length === 0) {
      toast.error("Please add at least one day to the template");
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(template).forEach(key => {
        if (key === 'days') {
          data.append('days', JSON.stringify(template.days));
        } else if (key === 'imageFile') {
          data.append('image', template.imageFile as Blob, 'diet_template.jpg');
        } else if (key !== 'image' && template[key as keyof typeof template] !== undefined) {
          data.append(key, String(template[key as keyof typeof template]));
        }
      });

      if (id) {
        await API.patch(`/template/diet/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Diet template updated successfully");
      } else {
        await API.post("/template/diet", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Diet template created successfully");
      }
      navigate(mode === 'trainer' ? "/trainer/templates" : "/admin/templates");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save diet template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-3xl flex items-center justify-center text-orange-400 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
              <Utensils className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                {id ? "Override" : "Forge"} <span className="text-orange-400">Protocol</span>
              </h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                Advanced Metabolic Architecture
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(mode === 'trainer' ? "/trainer/templates" : "/admin/templates")}
              className="flex-1 md:flex-none border-white/5 text-gray-500 font-black italic uppercase text-xs hover:bg-white/5 h-14 px-8 rounded-2xl"
            >
              Abort Mission
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-400 text-white font-black italic uppercase text-xs px-10 h-14 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Synchronize Architecture
            </Button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-10">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-[3rem] overflow-hidden shadow-2xl p-0">
              <CardHeader className="bg-white/5 p-8 border-b border-white/10">
                <CardTitle className="text-white text-xl font-black italic uppercase tracking-widest flex items-center gap-3">
                  <Box className="h-6 w-6 text-orange-400" /> Bio-Metric Baseline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {/* Visual Banner */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2">
                    <ImagePlus size={16} className="text-orange-400" />
                    Protocol Visualization (Mandatory)
                  </label>
                  <div className="relative group cursor-pointer aspect-[21/9] rounded-[2rem] overflow-hidden border-2 border-dashed border-white/10 hover:border-orange-500/50 transition-all bg-black/40">
                    {template.image ? (
                      <div className="relative h-full w-full">
                        <img src={template.image} alt="Template" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Button onClick={() => document.getElementById('imageInput')?.click()} variant="outline" className="bg-white/10 border-white/20 text-white font-black italic uppercase text-[10px] rounded-xl">Refresh Signal</Button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => document.getElementById('imageInput')?.click()} className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 group-hover:text-orange-400 transition-colors">
                        <ImagePlus size={48} className="opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Upload Metabolic Banner</p>
                      </div>
                    )}
                    <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Protocol ID (Title)</label>
                    <Input
                      name="title"
                      value={template.title}
                      onChange={handleInputChange}
                      placeholder="E.G. KETO PRIME"
                      className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm focus:ring-1 focus:ring-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Optimization Objective</label>
                    <Select value={template.goal} onValueChange={(v) => setTemplate(p => ({ ...p, goal: v }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm">
                        <SelectValue placeholder="Select Vector" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white font-black italic uppercase text-xs">
                        <SelectItem value="Weight Loss">Adipose Loss</SelectItem>
                        <SelectItem value="Muscle Gain">Hypertrophy</SelectItem>
                        <SelectItem value="Maintenance">Equilibrium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Somatotype (Body Type)</label>
                    <Select value={template.bodyType} onValueChange={(v) => setTemplate(p => ({ ...p, bodyType: v }))}>
                      <SelectTrigger className="bg-black/40 border-white/10 h-16 rounded-2xl text-white font-black italic uppercase text-sm">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white font-black italic uppercase text-xs">
                        <SelectItem value="Ectomorph">Ectomorph</SelectItem>
                        <SelectItem value="Mesomorph">Mesomorph</SelectItem>
                        <SelectItem value="Endomorph">Endomorph</SelectItem>
                        <SelectItem value="General">Universal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Temporal Cycle (Days)</label>
                    <div className="relative group">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5 group-hover:text-orange-400 transition-colors" />
                      <Input
                        type="number"
                        name="duration"
                        value={template.duration}
                        onChange={handleInputChange}
                        className="bg-black/40 border-white/10 h-16 pl-14 rounded-2xl text-white font-black italic uppercase text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Visibility Status</label>
                    <div className="flex items-center gap-3 h-16 bg-black/40 border border-white/10 rounded-2xl px-5">
                      <span className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest mr-auto">Vault Public</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={template.isPublic}
                          onChange={(e) => setTemplate(p => ({ ...p, isPublic: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-white/5 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white/40 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest italic">Architecture Overview</label>
                  <Textarea
                    name="description"
                    value={template.description}
                    onChange={handleInputChange}
                    placeholder="Describe the metabolic mechanism..."
                    className="bg-black/40 border-white/10 text-white min-h-[160px] rounded-[2rem] font-black italic uppercase text-xs p-8 tracking-widest leading-relaxed focus:ring-1 focus:ring-orange-500/20 transition-all shadow-inner"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-orange-400" /> Deployment Schedule
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
                        <div className="h-10 w-10 rounded-2xl bg-orange-500 flex items-center justify-center font-black italic text-sm text-white shadow-xl shadow-orange-500/20 transition-transform group-hover/day:scale-110">
                          {day.dayNumber}
                        </div>
                        <div>
                          <h4 className="text-white font-black italic uppercase text-lg tracking-tight">Metabolic Phase {day.dayNumber}</h4>
                          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest italic">
                            {(day.meals || []).length} NUTRITION NODES INITIALIZED
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
                              {(day.meals || []).map((meal, mIdx) => (
                                <div key={mIdx} className="p-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 hover:border-orange-500/20 transition-all group/item space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div className="text-left">
                                      <span className="text-[8px] font-black text-orange-400 uppercase tracking-widest block mb-1">{meal.time}</span>
                                      <h5 className="text-white font-black italic uppercase group-hover/item:text-orange-400 transition-colors leading-tight">{meal.name}</h5>
                                      <p className="text-[10px] text-gray-500 font-bold mt-1">{meal.calories} KCAL • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-500 hover:text-rose-500 rounded-lg transition-all border border-white/5"
                                      onClick={() => removeMealFromDay(dIdx, mIdx)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" className="h-[140px] rounded-[2rem] border-2 border-dashed border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 flex flex-col items-center justify-center gap-4 transition-all text-gray-600 hover:text-orange-400">
                                      <Search className="h-8 w-8" />
                                      <span className="text-[10px] font-black tracking-widest uppercase italic">USDA Search</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
                                    <DialogHeader className="mb-8">
                                      <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Nutrition Database</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      <div className="flex gap-4">
                                        <Input
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          placeholder="SEARCH METABOLIC NODES..."
                                          className="bg-black border-white/10 h-14 px-6 rounded-2xl text-white font-black italic uppercase text-xs"
                                        />
                                        <Button onClick={() => fetchUsdaFoods(searchQuery)} className="bg-orange-500 text-white font-black h-14 px-8 rounded-2xl italic uppercase text-xs tracking-widest">Access</Button>
                                      </div>
                                      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                                        {loading ? (
                                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                                            <p className="text-[10px] font-black uppercase italic tracking-widest text-gray-500">Scanning Database...</p>
                                          </div>
                                        ) : usdaFoods.map(food => (
                                          <div
                                            key={food.fdcId}
                                            className="p-5 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-orange-500/50 hover:bg-white/10 transition-all group/item"
                                            onClick={() => setSelectedFood(food)}
                                          >
                                            <div className="text-left">
                                              <p className="text-xs font-black uppercase italic text-white group-hover/item:text-orange-400 transition-colors">{food.description}</p>
                                              <Badge variant="outline" className="mt-2 text-[8px] font-black border-white/10 text-gray-500">
                                                {food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value} KCAL
                                              </Badge>
                                            </div>
                                            <Plus className="h-5 w-5 text-orange-500 group-hover/item:scale-125 transition-transform" />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button className="h-[140px] rounded-[2rem] border-2 border-dashed border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 flex flex-col items-center justify-center gap-4 transition-all text-gray-600 hover:text-orange-400 bg-transparent">
                                      <Plus className="h-8 w-8" />
                                      <span className="text-[10px] font-black tracking-widest uppercase italic">Custom Node</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
                                    <DialogHeader className="mb-8">
                                      <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Custom Node Injection</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-8 mt-4">
                                      <div className="col-span-2 space-y-3">
                                        <Label className="text-[10px] font-black uppercase italic text-gray-500 tracking-widest">Node Identity</Label>
                                        <Input value={newMeal.name} onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))} className="bg-black border-white/10 h-14 px-6 rounded-2xl text-white font-black italic uppercase text-sm" />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase italic text-gray-500 tracking-widest">Temporal Trigger</Label>
                                        <Input type="time" value={newMeal.time} onChange={e => setNewMeal(p => ({ ...p, time: e.target.value }))} className="bg-black border-white/10 h-14 px-6 rounded-2xl text-white font-black italic uppercase text-sm" />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase italic text-gray-500 tracking-widest">KCAL</Label>
                                        <Input type="number" value={newMeal.calories} onChange={e => setNewMeal(p => ({ ...p, calories: parseInt(e.target.value) || 0 }))} className="bg-black border-white/10 h-14 px-6 rounded-2xl text-white font-black italic uppercase text-sm" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-[8px] font-black text-emerald-500 uppercase italic">Protein (g)</Label>
                                        <Input type="number" value={newMeal.protein} onChange={e => setNewMeal(p => ({ ...p, protein: parseInt(e.target.value) || 0 }))} className="bg-black border-white/10 h-12 rounded-xl text-center font-black italic text-emerald-400" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-[8px] font-black text-amber-500 uppercase italic">Carbs (g)</Label>
                                        <Input type="number" value={newMeal.carbs} onChange={e => setNewMeal(p => ({ ...p, carbs: parseInt(e.target.value) || 0 }))} className="bg-black border-white/10 h-12 rounded-xl text-center font-black italic text-amber-400" />
                                      </div>
                                    </div>
                                    <Button onClick={addManualMeal} className="mt-10 bg-orange-500 hover:bg-orange-400 h-16 rounded-2xl font-black italic uppercase shadow-lg shadow-orange-500/20">Synchronize Metabolic Node</Button>
                                  </DialogContent>
                                </Dialog>
                              </div>
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
              <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-orange-500/5 blur-[80px] rounded-full" />
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 border-b border-white/10 pb-4 relative z-10">
                Protocol <span className="text-orange-400">Architecture</span>
              </h3>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center group/metric">
                  <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-white transition-colors">Phase Units</span>
                  <span className="text-white font-black italic text-lg">{template.days?.length || 0} UNITS</span>
                </div>
                <div className="flex justify-between items-center group/metric">
                  <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-white transition-colors">Target Morph</span>
                  <span className="text-orange-400 font-black italic text-sm">{template.bodyType || 'Universal'}</span>
                </div>
                <div className="flex justify-between items-center group/metric">
                  <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest group-hover/metric:text-white transition-colors">Lifespan</span>
                  <span className="text-white font-black italic text-sm font-outfit uppercase">{template.duration} DAYS</span>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/10 space-y-6 relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 italic">Technical Memo</h4>
                <ul className="space-y-4">
                  {[
                    "Modulating macro ratios optimizes metabolic shift.",
                    "Time-restricted feeding nodes improve insulin curves.",
                    "Genetic somatic profiles require specific baseline calibrations."
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3 text-[10px] text-gray-500 font-bold italic uppercase leading-relaxed">
                      <div className="w-1.5 h-1.5 bg-orange-500/60 rounded-full mt-1 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {selectedFood && (
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="max-w-2xl bg-[#0a0a0b] border border-white/10 text-white rounded-[2.5rem] p-10 shadow-3xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Integrate Node: {selectedFood.description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 mt-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase italic text-gray-500 tracking-widest">Temporal Deployment</Label>
                <Input type="time" value={usdaMealTime} onChange={e => setUsdaMealTime(e.target.value)} className="bg-black border-white/10 h-16 px-6 rounded-2xl text-white font-black italic uppercase text-sm" />
              </div>
              <Button className="w-full bg-orange-500 hover:bg-orange-400 h-16 rounded-2xl font-black italic uppercase text-black shadow-lg shadow-orange-500/20" onClick={() => addUsdaMeal(selectedFood)}>
                Link to Protocol Phase {(template.days?.[activeDayIndex || 0] as any)?.dayNumber}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

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
}
