import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, ArrowLeft, Save, X, Loader2, Plus, Trash2 } from "lucide-react";
import API from "@/lib/axios";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

interface TemplateMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  notes?: string;
  nutritions?: { label: string; value: number; unit: string }[];
}

interface USDAFood {
  fdcId: number;
  description: string;
  ingredients?: string;
  foodNutrients: {
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
  }[];
  foodAttributes?: {
    id: number;
    name: string;
    value: string;
  }[];
}

interface USDAResponse {
  totalHits: number;
  currentPage: number;
  totalPages: number;
  foods: USDAFood[];
}

interface DietTemplate {
  title: string;
  description: string;
  meals: TemplateMeal[];
}

export default function TrainerDietTemplateForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [template, setTemplate] = useState<DietTemplate>({
    title: "",
    description: "",
    meals: [],
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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (isEdit) {
      fetchTemplate();
    }
  }, [id, isEdit]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/diet/trainer/diet-templates/${id}`);
      setTemplate(response.data);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsdaFoods = async (query: string, page: number = 1) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${import.meta.env.VITE_USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${itemsPerPage}&pageNumber=${page}`
      );
      if (!response.ok) throw new Error("Failed to fetch USDA food data");

      const data: USDAResponse = await response.json();
      setUsdaFoods(data.foods || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);

      if (!data.foods.length) {
        toast.error("No meals found. Try adding a meal manually below.");
      }
    } catch (err) {
      setError("Failed to fetch USDA food data");
      toast.error("Failed to fetch USDA food data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "title" || name === "description") {
      setTemplate((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewMeal((prev: any) => ({
        ...prev,
        [name]: name === "name" || name === "time" || name === "notes" ? value : parseFloat(value) || 0,
      }));
    }
  };

  const addManualMeal = () => {
    if (!newMeal.name || !newMeal.time) {
      toast.error("Meal name and time are required");
      return;
    }
    setTemplate((prev) => ({
      ...prev,
      meals: [
        ...prev.meals,
        {
          ...newMeal,
          notes: newMeal.notes || "No notes provided.",
        } as TemplateMeal,
      ],
    }));
    setNewMeal({
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      time: "12:00",
      notes: "",
    });
  };

  const addUsdaMeal = (food: USDAFood) => {
    if (!usdaMealTime) {
      toast.error("Please select a time for the meal");
      return;
    }

    const nutrients = food.foodNutrients;
    const calories = nutrients.find((n) => n.nutrientName === "Energy")?.value || 0;
    const protein = nutrients.find((n) => n.nutrientName === "Protein")?.value || 0;
    const carbs = nutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0;
    const fats = nutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0;

    const meal: TemplateMeal = {
      name: food.description,
      calories,
      protein,
      carbs,
      fats,
      time: usdaMealTime,
      notes: food.ingredients || "No ingredients provided.",
      nutritions: nutrients
        .filter((n) => !["Energy", "Protein", "Carbohydrate, by difference", "Total lipid (fat)"].includes(n.nutrientName))
        .map((n) => ({ label: n.nutrientName, value: n.value, unit: n.unitName })),
    };

    setTemplate((prev) => ({
      ...prev,
      meals: [...prev.meals, meal],
    }));
    setSelectedFood(null);
    setUsdaMealTime("12:00");
  };

  const removeMeal = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!template.title) {
      toast.error("Template title is required");
      return;
    }
    if (template.meals.length === 0) {
      toast.error("Please add at least one meal to the template");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await API.patch(`/diet/trainer/diet-templates/${id}`, template);
        toast.success("Diet template updated successfully");
      } else {
        await API.post("/diet/trainer/diet-templates", template);
        toast.success("Diet template created successfully");
      }
      navigate("/trainer/templates");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save diet template");
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit) {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <main className="relative container mx-auto px-4 py-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/trainer/templates")}
              className="group hover:bg-primary/5 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Templates
            </Button>
            <h1 className="text-3xl font-bold text-foreground">
              {isEdit ? "Edit" : "Create"} Diet Template
            </h1>
          </div>

          {/* Template Details */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Template Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={template.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Balanced Diet Plan"
                  className="bg-background/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  value={template.description}
                  onChange={handleInputChange}
                  placeholder="e.g., General balanced diet for daily nutrition"
                  className="bg-background/50 border-border/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Meals in Template */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Meals in Template ({template.meals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {template.meals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No meals added yet.</p>
              ) : (
                <div className="space-y-4">
                  {template.meals.map((meal, index) => (
                    <Card key={index} className="bg-background/30 border-border/50">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex-1 space-y-1">
                          <h3 className="text-foreground font-semibold">{meal.name}</h3>
                          <p className="text-muted-foreground text-sm">
                            {meal.calories} kcal • Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g • Time: {meal.time}
                          </p>
                          {meal.notes && (
                            <p className="text-muted-foreground text-sm">Notes: {meal.notes}</p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => removeMeal(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/trainer/templates")}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
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
            </CardContent>
          </Card>

          {/* Search USDA Foods */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Search USDA Foods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for foods (e.g., chicken)"
                  className="bg-background/50 border-border/50"
                />
                <Button
                  onClick={() => fetchUsdaFoods(searchQuery, 1)}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  Search
                </Button>
              </div>

              {loading && <p className="text-muted-foreground">Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {usdaFoods.length > 0 && (
                <div className="space-y-4">
                  {usdaFoods.map((food) => (
                    <Card
                      key={food.fdcId}
                      className="bg-background/30 border-border/50 cursor-pointer hover:bg-background/40 transition-colors"
                      onClick={() => setSelectedFood(food)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        {food.foodAttributes?.find((attr) => attr.name === "Package Image")?.value && (
                          <img
                            src={food.foodAttributes.find((attr) => attr.name === "Package Image")?.value}
                            alt={food.description}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1 space-y-1">
                          <h3 className="text-foreground font-semibold">{food.description}</h3>
                          <p className="text-muted-foreground text-sm">
                            {food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal • Protein: {food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFood(food);
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Add
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() => {
                        const newPage = Math.max(currentPage - 1, 1);
                        setCurrentPage(newPage);
                        fetchUsdaFoods(searchQuery, newPage);
                      }}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      onClick={() => {
                        const newPage = Math.min(currentPage + 1, totalPages);
                        setCurrentPage(newPage);
                        fetchUsdaFoods(searchQuery, newPage);
                      }}
                      disabled={currentPage === totalPages}
                      variant="outline"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Custom Meal */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Add Custom Meal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Meal Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newMeal.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Chicken Salad"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={newMeal.time}
                    onChange={handleInputChange}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="calories">Calories (kcal)</Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    value={newMeal.calories || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 400"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    name="protein"
                    type="number"
                    value={newMeal.protein || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 25"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    name="carbs"
                    type="number"
                    value={newMeal.carbs || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="fats">Fats (g)</Label>
                  <Input
                    id="fats"
                    name="fats"
                    type="number"
                    value={newMeal.fats || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., 10"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newMeal.notes || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Use skim milk"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
              <Button
                onClick={addManualMeal}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* USDA Food Details Modal */}
      {selectedFood && (
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="bg-card/95 backdrop-blur-md border-border/50 max-w-sm">
            <DialogHeader>
              <DialogTitle>{selectedFood.description}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFood.foodAttributes?.find((attr) => attr.name === "Package Image")?.value && (
                <img
                  src={selectedFood.foodAttributes.find((attr) => attr.name === "Package Image")?.value}
                  alt={selectedFood.description}
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Calories</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Protein</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Carbs</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0}g
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Fat</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0}g
                  </p>
                </div>
              </div>
              {selectedFood.ingredients && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Ingredients</p>
                  <p className="text-xs">{selectedFood.ingredients}</p>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="usdaMealTime">Meal Time</Label>
                <Input
                  id="usdaMealTime"
                  type="time"
                  value={usdaMealTime}
                  onChange={(e) => setUsdaMealTime(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>
              <Button
                onClick={() => addUsdaMeal(selectedFood)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Add to Template
              </Button>
              <Button
                onClick={() => setSelectedFood(null)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <SiteFooter />
    </div>
  );
}