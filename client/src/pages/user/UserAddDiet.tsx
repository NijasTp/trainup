import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { InfoModal } from "@/components/user/general/InfoModal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import { deleteMeal, getMealsByDate } from "@/services/dietServices";

// Interfaces based on APIs
export interface Meal {
  _id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  source: "user" | "trainer";
  description?: string;
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

export interface AddMealResponse {
  _id: string;
  user: string;
  date: string;
  meals: Meal[] | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function UserAddDiet() {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    time: "12:00",
    source: "user",
    description: "",
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

  useEffect(() => {
    const fetchExistingMeals = async () => {
      setLoading(true);
      try {
        const response = await getMealsByDate(date);
        setMeals(response.meals || []);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch existing diet data");
        setLoading(false);
        toast.error("Failed to fetch existing diet data");
        console.log('error', err);
      }
    };
    fetchExistingMeals();
  }, [date]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMeal((prev) => ({
      ...prev,
      [name]: name === "name" || name === "time" || name === "description" ? value : parseFloat(value) || 0,
    }));
  };

  // Add manual meal to list
  const addManualMeal = () => {
    if (!newMeal.name || !newMeal.time) {
      toast.error("Meal name and time are required");
      return;
    }
    setMeals((prev) => [
      ...prev,
      {
        ...newMeal,
        source: "user",
        description: newMeal.description || "No description provided.",
      } as Meal,
    ]);
    setNewMeal({
      name: "",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      time: "12:00",
      source: "user",
      description: "",
    });
  };

  // Add USDA meal to list
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

    const meal: Meal = {
      name: food.description,
      calories,
      protein,
      carbs,
      fats,
      time: usdaMealTime,
      source: "user",
      description: food.ingredients || "No ingredients provided.",
    };
    setMeals((prev) => [...prev, meal]);
    setSelectedFood(null);
    setUsdaMealTime("12:00"); // Reset time after adding
  };

  // Remove meal (local or server)
  const removeMeal = async (index: number, meal: Meal) => {
    if (meal._id) {
      try {
        await deleteMeal(date, meal._id);
        toast.success("Meal removed successfully");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to remove meal");
        console.log('error while removing meal', err);
        return;
      }
    }
    setMeals((prev) => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = async () => {
    const newMeals = meals.filter((meal) => !meal._id);
    if (newMeals.length === 0 && meals.length > 0) {
      toast.info("No new meals to save");
      return;
    }
    if (newMeals.length === 0) {
      toast.error("Please add at least one meal");
      return;
    }

    setLoading(true);
    try {
      for (const meal of newMeals) {
        const response = await api.post(`/diet/${date}/meals`, meal);
        setMeals((prev) =>
          prev.map((m) =>
            m === meal ? { ...m, _id: response.data.meals?.find((rm: Meal) => rm.name === m.name)?._id } : m
          )
        );
      }
      toast.success("Diet day updated successfully");
      const updatedResponse = await getMealsByDate(date);
      setMeals(updatedResponse.meals || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update diet day");
      toast.error(err.response?.data?.error || "Failed to update diet day");

    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const paginatedFoods = usdaFoods;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Create Your Diet Plan
            </h1>
            <InfoModal modalMessage="Search for meals using the USDA database or add them manually. If no search results appear, try adding a meal manually below." />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build your diet plan by selecting meals from the USDA database or adding custom meals with your own nutrition values.
          </p>
        </div>

      {/* Date Selection */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="max-w-xs rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
            />
          </CardContent>
        </Card>

        {/* Added Meals List */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Meals for {date}</CardTitle>
          </CardHeader>
          <CardContent>
            {meals.length === 0 ? (
              <p className="text-muted-foreground">No meals added yet.</p>
            ) : (
              <div className="space-y-4">
                {meals.map((meal, index) => (
                  <Card
                    key={meal._id || index}
                    className="group relative bg-card/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">{meal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meal.calories} kcal • Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g • Time: {meal.time}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => removeMeal(index, meal)}
                        className="bg-red-500 hover:bg-red-600 text-black font-semibold"
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
              disabled={loading || meals.every((m) => m._id)}
              className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-black font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Save Diet Plan
            </Button>
          </CardContent>
        </Card>



        {/* USDA Search */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Search USDA Foods</CardTitle>
              <InfoModal modalMessage="Search for foods in the USDA database. Click a food to view details and add it to your diet plan." />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for foods (e.g., chicken)"
                className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
              />
              <Button
                onClick={() => fetchUsdaFoods(searchQuery, 1)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-black font-semibold py-2"
              >
                Search
              </Button>
            </div>
            {loading && <p className="text-muted-foreground">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {paginatedFoods.length > 0 && (
              <div className="space-y-4">
                {paginatedFoods.map((food) => (
                  <Card
                    key={food.fdcId}
                    className="group relative bg-card/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
                    onClick={() => setSelectedFood(food)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    <CardContent className="flex items-center gap-4 p-4">
                      {food.foodAttributes?.find((attr) => attr.name === "Package Image")?.value && (
                        <img
                          src={food.foodAttributes.find((attr) => attr.name === "Package Image")?.value}
                          alt={food.description}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">{food.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          {food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal • Protein: {food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFood(food);
                        }}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-2"
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
                    className="hover:bg-primary/10 border-primary/30 text-black"
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
                    className="hover:bg-primary/10 border-primary/30 text-black"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Meal Input */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Add Custom Meal</CardTitle>
              <InfoModal modalMessage="Enter the nutritional details manually if you can't find your meal in the search results." />
            </div>
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
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
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
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
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
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
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
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
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
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
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
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  value={newMeal.description || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., A delicious homemade meal"
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
                />
              </div>
            </div>
            <Button
              onClick={addManualMeal}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-black font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Add Meal
            </Button>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />

      {/* Meal Details Modal */}
      {selectedFood && (
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="max-w-sm bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl p-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
                {selectedFood.description}
              </DialogTitle>
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
                <div className="space-y-1 p-2 bg-primary/10 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Calories</p>
                  <p className="text-sm font-bold text-primary">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal
                  </p>
                </div>
                <div className="space-y-1 p-2 bg-primary/10 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Protein</p>
                  <p className="text-sm font-bold text-primary">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                  </p>
                </div>
                <div className="space-y-1 p-2 bg-primary/10 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Carbs</p>
                  <p className="text-sm font-bold text-primary">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0}g
                  </p>
                </div>
                <div className="space-y-1 p-2 bg-primary/10 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Fat</p>
                  <p className="text-sm font-bold text-primary">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0}g
                  </p>
                </div>
              </div>
              {selectedFood.ingredients && (
                <div className="space-y-1 p-2 bg-primary/10 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Ingredients</p>
                  <p className="text-xs text-foreground">{selectedFood.ingredients}</p>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="usdaMealTime">Meal Time</Label>
                <Input
                  id="usdaMealTime"
                  type="time"
                  value={usdaMealTime}
                  onChange={(e) => setUsdaMealTime(e.target.value)}
                  className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
                />
              </div>
              <Button
                onClick={() => addUsdaMeal(selectedFood)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add to Diet
              </Button>
              <Button
                onClick={() => setSelectedFood(null)}
                variant="outline"
                className="w-full hover:bg-primary/10 border-primary/30 text-black"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
