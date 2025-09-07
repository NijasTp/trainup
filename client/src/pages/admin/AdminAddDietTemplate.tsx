import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import API from "@/lib/axios";
import { type TemplateMeal } from "@/interfaces/admin/templateManagement";

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

export default function NewDietTemplate() {
  const [template, setTemplate] = useState({
    title: "",
    description: "",
    meals: [] as TemplateMeal[],
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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 5;

  const fetchUsdaFoods = async (query: string, page: number = 1) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<USDAResponse>(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${import.meta.env.VITE_USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${itemsPerPage}&pageNumber=${page}`
      );
      setUsdaFoods(response.data.foods || []);
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
      if (!response.data.foods.length) {
        toast.error("No meals found. Try adding a meal manually below.");
      }
    } catch (err) {
      setError("Failed to fetch USDA food data");
      setLoading(false);
      toast.error("Failed to fetch USDA food data");
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
    setLoading(true);
    try {
      console.log('the template that is about to be sent', template);
      const res = await API.post("/diet/admin/templates", template);
      console.log('response from backend', res);
      toast.success("Diet template created successfully");
      setTemplate({ title: "", description: "", meals: [] });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create diet template");
      toast.error(err.response?.data?.error || "Failed to create diet template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Create New Diet Template</h1>
          <p className="text-gray-400">Build a diet template by searching USDA foods or adding meals manually.</p>
        </div>

        <Card className="bg-[#111827] border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">Template Details</CardTitle>
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
                className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">Meals in Template</CardTitle>
          </CardHeader>
          <CardContent>
            {template.meals.length === 0 ? (
              <p className="text-gray-400">No meals added yet.</p>
            ) : (
              <div className="space-y-4">
                {template.meals.map((meal, index) => (
                  <Card key={index} className="bg-[#1F2A44]/50 border-[#4B8B9B]/30">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-white font-semibold">{meal.name}</h3>
                        <p className="text-gray-300 text-sm">
                          {meal.calories} kcal • Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g • Time: {meal.time}
                        </p>
                        {meal.notes && (
                          <p className="text-gray-300 text-sm">Notes: {meal.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => removeMeal(index)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
            >
              Save Template
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">Search USDA Foods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for foods (e.g., chicken)"
                className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
              />
              <Button
                onClick={() => fetchUsdaFoods(searchQuery, 1)}
                disabled={loading}
                className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
              >
                Search
              </Button>
            </div>
            {loading && <p className="text-gray-400">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {usdaFoods.length > 0 && (
              <div className="space-y-4">
                {usdaFoods.map((food) => (
                  <Card
                    key={food.fdcId}
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 cursor-pointer"
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
                        <h3 className="text-white font-semibold">{food.description}</h3>
                        <p className="text-gray-300 text-sm">
                          {food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal • Protein: {food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFood(food);
                        }}
                        className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
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
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-gray-400">
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
                    className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white">Add Custom Meal</CardTitle>
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                />
              </div>
            </div>
            <Button
              onClick={addManualMeal}
              disabled={loading}
              className="bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
            >
              Add Meal
            </Button>
          </CardContent>
        </Card>
      </main>

      {selectedFood && (
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white max-w-sm">
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
                  <p className="text-xs font-medium text-gray-400">Calories</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Protein</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Carbs</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0}g
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Fat</p>
                  <p className="text-sm font-bold">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0}g
                  </p>
                </div>
              </div>
              {selectedFood.ingredients && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Ingredients</p>
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
                  className="bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
                />
              </div>
              <Button
                onClick={() => addUsdaMeal(selectedFood)}
                className="w-full bg-[#4B8B9B] hover:bg-[#4B8B9B]/80"
              >
                Add to Template
              </Button>
              <Button
                onClick={() => setSelectedFood(null)}
                variant="outline"
                className="w-full bg-[#1F2A44]/50 border-[#4B8B9B]/30 text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}