import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { toast } from "react-toastify";
import { InfoModal } from "@/components/user/general/InfoModal";
import { ChevronLeft, ChevronRight, Search, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { deleteMeal, getMealsByDate } from "@/services/dietServices";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import type { Meal } from "@/interfaces/user/IUserAddDiet";
import type { USDAFood, USDAResponse } from "@/interfaces/common/IUSDA";

type SafeAny = any;

const mealSchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  calories: z.number().min(0, "Calories must be non-negative"),
  protein: z.number().min(0, "Protein must be non-negative"),
  carbs: z.number().min(0, "Carbs must be non-negative"),
  fats: z.number().min(0, "Fats must be non-negative"),
  time: z.string().min(1, "Time is required"),
  description: z.string().optional(),
});

export default function UserAddDiet() {
  const queryParams = new URLSearchParams(window.location.search);
  const initialDate = queryParams.get("date") || new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<string>(initialDate);
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
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchExistingMeals = async () => {
      setLoading(true);
      try {
        const response = await getMealsByDate(date);
        setMeals(response.meals || []);
        setLoading(false);
      } catch (errVal) {
        const err = errVal as SafeAny;
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
    } catch (_err) {
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

  const previewCustomMeal = () => {
    const result = mealSchema.safeParse(newMeal);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        toast.error(issue.message);
      });
      return;
    }
    setShowCustomModal(true);
  };

  const addCustomMeal = () => {
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
    setShowCustomModal(false);
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
    setUsdaMealTime("12:00");
  };

  const removeMeal = async (index: number, meal: Meal) => {
    if (meal._id) {
      try {
        await deleteMeal(date, meal._id);
        toast.success("Meal removed successfully");
      } catch (errVal) {
        const err = errVal as SafeAny;
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
      navigate('/diets');
    } catch (errVal) {
      const err = errVal as SafeAny;
      setError(err.response?.data?.error || "Failed to update diet day");
      toast.error(err.response?.data?.error || "Failed to update diet day");
    } finally {
      setLoading(false);
    }
  };

  const paginatedFoods = usdaFoods;

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-6 py-12 space-y-8 flex-1 z-10 max-w-4xl w-full">
        {/* Header Section */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="bg-cyan-500/5 text-[#22d3ee] border border-[#22d3ee]/20 py-0.5 px-2.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                LEDGER CONFIG
              </span>
              <InfoModal modalMessage="Search for meals using the USDA database or add them manually. If no search results appear, try adding a meal manually below." />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold font-mono text-white uppercase tracking-tight leading-none">
              ADD NUTRITION ENTRIES
            </h1>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
              Create and record meals in your daily log database. Search USDA index or input metrics manually.
            </p>
          </div>

          <div className="flex flex-col gap-1 w-full md:w-auto font-mono">
            <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Selected Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-44 h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
            />
          </div>
        </section>

        {/* Added Meals List */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#262626] pb-4">
            <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">MEAL RECORD LEDGER</h3>
            <span className="bg-neutral-800 text-neutral-400 border border-[#262626] py-0.5 px-2.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              {meals.length} ENTRIES
            </span>
          </div>

          {meals.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 uppercase italic tracking-wide text-center py-6">No meals staged for this date.</p>
          ) : (
            <div className="space-y-3 font-mono">
              {meals.map((meal, index) => (
                <div
                  key={meal._id || index}
                  className="flex items-center justify-between gap-4 p-4 bg-[#0d0d0e] border border-[#262626] rounded-xl"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-extrabold text-white uppercase truncate">{meal.name}</h4>
                    <p className="text-[10px] text-neutral-400 uppercase mt-0.5">
                      {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g • Time: {meal.time}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMeal(index, meal)}
                    className="duo-btn-outline h-9 px-4 text-[10px] font-mono font-bold uppercase border-red-500 text-red-400 shrink-0 flex items-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || meals.every((m) => m._id)}
            className="duo-btn-cyan w-full h-12 text-xs font-mono font-bold uppercase tracking-wider"
          >
            Save Diet Plan
          </button>
        </section>

        {/* USDA Search */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#262626] pb-4">
            <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">SEARCH USDA DATABASE</h3>
            <InfoModal modalMessage="Search for foods in the USDA database. Click a food to view details and add it to your diet plan." />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-[#22d3ee] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food entries (e.g., lean beef)..."
                className="w-full h-12 pl-11 pr-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white font-mono text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>
            <button
              onClick={() => fetchUsdaFoods(searchQuery, 1)}
              disabled={loading}
              className="duo-btn-cyan h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider shrink-0"
            >
              Search
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
            </div>
          )}

          {error && <p className="text-xs font-mono text-red-400 uppercase tracking-wider text-center">{error}</p>}

          {paginatedFoods.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-3 font-mono">
                {paginatedFoods.map((food) => (
                  <div
                    key={food.fdcId}
                    className="group relative duo-card-3d bg-[#0d0d0e] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] hover:border-[#404040] hover:border-b-[7px] hover:border-b-[#262626] rounded-xl p-4 transition-all duration-300 cursor-pointer flex items-center justify-between gap-4"
                    onClick={() => setSelectedFood(food)}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-white uppercase truncate">{food.description}</h4>
                      <p className="text-[10px] text-neutral-400 uppercase mt-0.5">
                        {food.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal • P: {food.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFood(food);
                      }}
                      className="duo-btn-cyan h-9 px-4 text-[10px] font-mono font-bold uppercase shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 font-mono">
                <button
                  onClick={() => {
                    const newPage = Math.max(currentPage - 1, 1);
                    setCurrentPage(newPage);
                    fetchUsdaFoods(searchQuery, newPage);
                  }}
                  disabled={currentPage === 1}
                  className="duo-btn-gray h-9 px-4 text-[10px] font-bold uppercase shrink-0 flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => {
                    const newPage = Math.min(currentPage + 1, totalPages);
                    setCurrentPage(newPage);
                    fetchUsdaFoods(searchQuery, newPage);
                  }}
                  disabled={currentPage === totalPages}
                  className="duo-btn-gray h-9 px-4 text-[10px] font-bold uppercase shrink-0 flex items-center gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Manual Meal Input */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-[#262626] pb-4">
            <h3 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">ADD CUSTOM ENTRY</h3>
            <InfoModal modalMessage="Enter the nutritional details manually if you can't find your meal in the search results." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Meal Name</label>
              <input
                type="text"
                name="name"
                value={newMeal.name}
                onChange={handleInputChange}
                placeholder="e.g., Whey Protein Shake"
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Target Time</label>
              <input
                type="time"
                name="time"
                value={newMeal.time}
                onChange={handleInputChange}
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Calories (kcal)</label>
              <input
                type="number"
                name="calories"
                value={newMeal.calories || ""}
                onChange={handleInputChange}
                placeholder="e.g., 250"
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Protein (g)</label>
              <input
                type="number"
                name="protein"
                value={newMeal.protein || ""}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Carbohydrates (g)</label>
              <input
                type="number"
                name="carbs"
                value={newMeal.carbs || ""}
                onChange={handleInputChange}
                placeholder="e.g., 5"
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Fats (g)</label>
              <input
                type="number"
                name="fats"
                value={newMeal.fats || ""}
                onChange={handleInputChange}
                placeholder="e.g., 2"
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={newMeal.description || ""}
                onChange={handleInputChange}
                placeholder="e.g., Mixed with cold water"
                className="w-full h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs uppercase tracking-wider outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={previewCustomMeal}
            disabled={loading}
            className="duo-btn-cyan w-full h-12 text-xs font-mono font-bold uppercase tracking-wider"
          >
            Preview & Add Meal
          </button>
        </section>
      </main>
      
      <SiteFooter />

      {/* Custom Meal Preview Modal */}
      {showCustomModal && (
        <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
          <DialogContent className="max-w-sm bg-[#171717] border-2 border-[#262626] rounded-2xl p-6 text-white font-mono">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-base font-extrabold font-mono text-white uppercase tracking-tight">
                {newMeal.name || "Custom Meal"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Calories</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1">{newMeal.calories || 0} kcal</p>
                </div>
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Protein</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1">{newMeal.protein || 0}g</p>
                </div>
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Carbs</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1">{newMeal.carbs || 0}g</p>
                </div>
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Fats</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1">{newMeal.fats || 0}g</p>
                </div>
              </div>
              
              {newMeal.description && (
                <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl space-y-1">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Description</p>
                  <p className="text-xs text-neutral-200">{newMeal.description}</p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Confirm Target Time</label>
                <input
                  type="time"
                  name="time"
                  value={newMeal.time || ""}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs outline-none transition-colors"
                />
              </div>

              <button
                onClick={addCustomMeal}
                className="duo-btn-cyan w-full h-11 text-xs font-bold uppercase tracking-wider mt-2"
              >
                Add to Diet
              </button>
              
              <button
                onClick={() => setShowCustomModal(false)}
                className="duo-btn-gray w-full h-11 text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* USDA Meal Details Modal */}
      {selectedFood && (
        <Dialog open={!!selectedFood} onOpenChange={() => setSelectedFood(null)}>
          <DialogContent className="max-w-sm bg-[#171717] border-2 border-[#262626] rounded-2xl p-6 text-white font-mono">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-base font-extrabold font-mono text-white uppercase tracking-tight">
                {selectedFood.description}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFood.foodAttributes?.find((attr) => attr.name === "Package Image")?.value && (
                <img
                  src={selectedFood.foodAttributes.find((attr) => attr.name === "Package Image")?.value}
                  alt={selectedFood.description}
                  className="w-full h-32 object-cover rounded-xl border border-[#262626]"
                />
              )}
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Calories</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1 text-cyan-400">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Energy")?.value || 0} kcal
                  </p>
                </div>
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Protein</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1 text-cyan-400">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Protein")?.value || 0}g
                  </p>
                </div>
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Carbs</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1 text-cyan-400">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0}g
                  </p>
                </div>
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Fat</p>
                  <p className="text-sm font-extrabold text-[#22d3ee] mt-1 text-cyan-400">
                    {selectedFood.foodNutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0}g
                  </p>
                </div>
              </div>

              {selectedFood.ingredients && (
                <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl space-y-1">
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Ingredients</p>
                  <p className="text-[10px] text-neutral-300 leading-normal line-clamp-3">{selectedFood.ingredients}</p>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Select Target Meal Time</label>
                <input
                  type="time"
                  value={usdaMealTime}
                  onChange={(e) => setUsdaMealTime(e.target.value)}
                  className="w-full h-11 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white text-xs outline-none transition-colors"
                />
              </div>

              <button
                onClick={() => addUsdaMeal(selectedFood)}
                className="duo-btn-cyan w-full h-11 text-xs font-bold uppercase tracking-wider mt-2"
              >
                Add to Diet
              </button>
              
              <button
                onClick={() => setSelectedFood(null)}
                className="duo-btn-gray w-full h-11 text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}