import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Plus, Trash, Save, Search, Utensils, Calendar, ChevronDown, ChevronUp, X, Loader2 } from "lucide-react";
import API from "@/lib/axios";
import type { TemplateMeal, IDietTemplate } from "@/interfaces/admin/templateManagement";
import type { USDAFood, USDAResponse } from "@/interfaces/common/IUSDA";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewDietTemplate() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Partial<IDietTemplate>>({
    title: "",
    description: "",
    duration: 7,
    goal: "",
    bodyType: "",
    days: [],
  });

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
  const [totalPages, setTotalPages] = useState<number>(1);
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const itemsPerPage = 5;

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
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to fetch USDA food data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate((prev) => ({ ...prev, [name]: name === 'duration' ? parseInt(value) || 0 : value }));
  };

  const addDay = () => {
    setTemplate(prev => ({
      ...prev,
      days: [...(prev.days || []), { dayNumber: (prev.days?.length || 0) + 1, meals: [] }]
    }));
    setActiveDayIndex((template.days?.length || 0));
  };

  const removeDay = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      days: prev.days?.filter((_, i) => i !== index).map((d, i) => ({ ...d, dayNumber: i + 1 }))
    }));
    if (activeDayIndex === index) setActiveDayIndex(null);
  };

  const addMealToDay = (dayIndex: number, meal: TemplateMeal) => {
    setTemplate(prev => {
      const newDays = [...(prev.days || [])];
      newDays[dayIndex].meals.push(meal);
      return { ...prev, days: newDays };
    });
    setNewMeal({ name: "", calories: 0, protein: 0, carbs: 0, fats: 0, time: "12:00", notes: "" });
    setSelectedFood(null);
  };

  const removeMealFromDay = (dayIndex: number, mealIndex: number) => {
    setTemplate(prev => {
      const newDays = [...(prev.days || [])];
      newDays[dayIndex].meals = newDays[dayIndex].meals.filter((_, i) => i !== mealIndex);
      return { ...prev, days: newDays };
    });
  };

  const addUsdaMeal = (food: USDAFood) => {
    if (activeDayIndex === null) return;
    const nutrients = food.foodNutrients;
    const meal: TemplateMeal = {
      name: food.description,
      calories: nutrients.find((n) => n.nutrientName === "Energy")?.value || 0,
      protein: nutrients.find((n) => n.nutrientName === "Protein")?.value || 0,
      carbs: nutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0,
      fats: nutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0,
      time: usdaMealTime,
      notes: food.ingredients || "",
      nutritions: nutrients
        .filter((n) => !["Energy", "Protein", "Carbohydrate, by difference", "Total lipid (fat)"].includes(n.nutrientName))
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

  const handleSubmit = async () => {
    if (!template.title || !template.goal || !template.bodyType) {
      toast.error("Template title, goal and body type are required");
      return;
    }
    if (!template.days || template.days.length === 0) {
      toast.error("Please add at least one day to the template");
      return;
    }
    setSaving(true);
    try {
      if (id) {
        await API.patch(`/template/diet/${id}`, template);
        toast.success("Diet template updated successfully");
      } else {
        await API.post("/template/diet", template);
        toast.success("Diet template created successfully");
      }
      navigate("/admin/templates");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save diet template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{id ? "Edit Diet Template" : "New Diet Template"}</h1>
              <p className="text-slate-500 text-sm">Create nutrition plans for your users</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/templates")} className="border-slate-800 text-slate-400">Cancel</Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
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
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Template Title</label>
                    <Input
                      name="title"
                      value={template.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Lean Bulk Plan"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Goal</label>
                    <Select value={template.goal} onValueChange={(v) => setTemplate(p => ({ ...p, goal: v }))}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Select Goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                        <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Body Type</label>
                    <Select value={template.bodyType} onValueChange={(v) => setTemplate(p => ({ ...p, bodyType: v }))}>
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
                    <label className="text-sm font-medium text-slate-400">Duration (Days)</label>
                    <Input
                      type="number"
                      name="duration"
                      value={template.duration}
                      onChange={handleInputChange}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Description</label>
                  <Input
                    name="description"
                    value={template.description}
                    onChange={handleInputChange}
                    placeholder="Briefly describe this plan..."
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" /> Meal Schedule
                </h3>
                <Button onClick={addDay} variant="outline" className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Add Diet Day
                </Button>
              </div>

              <div className="space-y-4">
                {template.days?.map((day, dIdx) => (
                  <div key={dIdx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-md">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => setActiveDayIndex(activeDayIndex === dIdx ? null : dIdx)}
                    >
                      <div className="flex items-center gap-4">
                        <Badge className="bg-orange-500 h-8 w-8 rounded-lg flex items-center justify-center font-black p-0">
                          {day.dayNumber}
                        </Badge>
                        <h4 className="text-white font-bold">Diet Day {day.dayNumber}</h4>
                        <span className="text-slate-500 text-sm">({day.meals.length} Meals)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-500"
                          onClick={(e) => { e.stopPropagation(); removeDay(dIdx); }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        {activeDayIndex === dIdx ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                      </div>
                    </div>

                    {activeDayIndex === dIdx && (
                      <div className="p-6 border-t border-slate-800 space-y-4">
                        {day.meals.length === 0 ? (
                          <p className="text-slate-500 text-center py-4">No meals added for this day</p>
                        ) : (
                          <div className="space-y-3">
                            {day.meals.map((meal, mIdx) => (
                              <div key={mIdx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center group">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-500 font-bold text-sm tracking-tighter">{meal.time}</span>
                                    <h5 className="text-white font-medium">{meal.name}</h5>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-red-500"
                                  onClick={() => removeMealFromDay(dIdx, mIdx)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-4 border-t border-slate-800 gap-4 flex flex-col sm:flex-row">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1 border-slate-800 text-slate-400 rounded-xl">
                                <Search className="h-4 w-4 mr-2" /> Search Foods (USDA)
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Search Nutrition Database</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex gap-2">
                                  <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search foods..."
                                    className="bg-slate-950 border-slate-800"
                                  />
                                  <Button onClick={() => fetchUsdaFoods(searchQuery)}>Search</Button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto space-y-2">
                                  {loading ? <p>Loading...</p> : usdaFoods.map(food => (
                                    <div
                                      key={food.fdcId}
                                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-800"
                                      onClick={() => setSelectedFood(food)}
                                    >
                                      <div>
                                        <p className="text-sm font-medium">{food.description}</p>
                                        <p className="text-xs text-slate-500">
                                          {food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value} kcal
                                        </p>
                                      </div>
                                      <Plus className="h-4 w-4 text-orange-500" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="flex-1 bg-slate-800 text-white rounded-xl hover:bg-slate-700">
                                <Plus className="h-4 w-4 mr-2" /> Custom Meal
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-800 text-white">
                              <DialogHeader>
                                <DialogTitle>Add Custom Meal</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                  <Label>Meal Name</Label>
                                  <Input value={newMeal.name} onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))} className="bg-slate-950 border-slate-800" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Time</Label>
                                  <Input type="time" value={newMeal.time} onChange={e => setNewMeal(p => ({ ...p, time: e.target.value }))} className="bg-slate-950 border-slate-800" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Calories</Label>
                                  <Input type="number" value={newMeal.calories} onChange={e => setNewMeal(p => ({ ...p, calories: parseInt(e.target.value) || 0 }))} className="bg-slate-950 border-slate-800" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Protein</Label>
                                  <Input type="number" value={newMeal.protein} onChange={e => setNewMeal(p => ({ ...p, protein: parseInt(e.target.value) || 0 }))} className="bg-slate-950 border-slate-800" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Carbs</Label>
                                  <Input type="number" value={newMeal.carbs} onChange={e => setNewMeal(p => ({ ...p, carbs: parseInt(e.target.value) || 0 }))} className="bg-slate-950 border-slate-800" />
                                </div>
                              </div>
                              <Button onClick={addManualMeal} className="mt-4 bg-orange-500 hover:bg-orange-600">Add to Day</Button>
                            </DialogContent>
                          </Dialog>
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
              <h3 className="text-lg font-bold text-white mb-4">Nutritional Focus</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Days</span>
                  <span className="text-white font-bold">{template.days?.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Type</span>
                  <span className="text-orange-500 font-bold">{template.bodyType || 'General'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {selectedFood && (
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Add {selectedFood.description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meal Time</Label>
                <Input type="time" value={usdaMealTime} onChange={e => setUsdaMealTime(e.target.value)} className="bg-slate-950 border-slate-800" />
              </div>
              <Button className="w-full bg-orange-500" onClick={() => addUsdaMeal(selectedFood)}>Add to Training Day {template.days?.[activeDayIndex || 0]?.dayNumber}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}