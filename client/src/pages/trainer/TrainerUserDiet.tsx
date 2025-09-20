"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

// Interfaces
export interface Meal {
    _id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    time: string;
    source: "user" | "trainer" | "admin";
    sourceId?: string;
    usedBy?: string;
    description?: string;
    isEaten?: boolean;
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

interface IDietDay {
    _id: string;
    user: string;
    date: string;
    meals: Meal[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

function DateSelector({
    selectedDate,
    setSelectedDate,
}: {
    selectedDate: string;
    setSelectedDate: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-4">
            <Label htmlFor="date-picker" className="text-muted-foreground font-medium">
                Select Date:
            </Label>
            <Input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 bg-card/80 backdrop-blur-sm border-border/50 text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
            />
        </div>
    );
}

function MealCard({
    meal,
    index,
    onRemove,
    onEdit,
}: {
    meal: Meal;
    index: number;
    onRemove: () => void;
    onEdit: () => void;
}) {
    return (
        <Card
            className="group relative overflow-hidden bg-card/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
            style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideUp 0.6s ease-out forwards",
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {meal.calories} kcal • Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fats: {meal.fats}g • Time: {meal.time}
                    </p>
                    {meal.description && (
                        <p className="text-sm text-muted-foreground">Description: {meal.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="hover:bg-primary/10 border-primary/30"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onRemove}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function USDAFoodCard({
    food,
    onSelect,
}: {
    food: USDAFood;
    onSelect: () => void;
}) {
    return (
        <Card
            className="group relative bg-card/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
            onClick={onSelect}
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
                        onSelect();
                    }}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2"
                >
                    Add
                </Button>
            </CardContent>
        </Card>
    );
}

export default function TrainerUserDietPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [newMeal, setNewMeal] = useState<Partial<Meal>>({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        time: "12:00",
        source: "trainer",
        description: "",
        isEaten: false,
    });
    const [editMeal, setEditMeal] = useState<Meal | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [usdaFoods, setUsdaFoods] = useState<USDAFood[]>([]);
    const [selectedFood, setSelectedFood] = useState<USDAFood | null>(null);
    const [usdaMealTime, setUsdaMealTime] = useState<string>("12:00");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [hasDietSession, setHasDietSession] = useState<boolean>(false);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchMeals();
    }, [date, clientId]);

    async function fetchMeals() {
        setLoading(true);
        setError(null);
        try {
            const response = await API.get(`/diet/trainer-get-day/${date}`, {
                params: { userId: clientId },
            });
            const day: IDietDay = response.data;
            console.log('rseponse', response);
            setMeals(day.meals?.filter((m) => m.source === "trainer") || []);
            setHasDietSession(!!day);
        } catch (err: any) {
            if (err.response?.status === 404) {
                try {
                    await API.post(`/diet`, { date, userId: clientId }, { params: { userId: clientId } });
                    const retryResponse = await API.get(`/diet/trainer-get-day/${date}`, {
                        params: { userId: clientId },
                    });
                    const day: IDietDay = retryResponse.data;
                    setMeals(day.meals?.filter((m) => m.source === "trainer") || []);
                    setHasDietSession(!!day);
                } catch (createErr: any) {
                    setError("Failed to create diet day");
                    toast.error("Failed to create diet day", { description: createErr.message });
                }
            } else {
                setError("Failed to fetch diet data");
                toast.error("Failed to fetch diet data", { description: err.message });
            }
        } finally {
            setLoading(false);
        }
    }

    async function createDietSession() {
        setLoading(true);
        setError(null);
        try {
            const response = await API.post(`/diet/trainer-create-diet-session`, {
                date,
                userId: clientId,
            });
            const day: IDietDay = response.data;
            setMeals(day.meals?.filter((m) => m.source === "trainer") || []);
            setHasDietSession(true);
            toast.success("Diet session created successfully");
        } catch (err: any) {
            setError("Failed to create diet session");
            toast.error("Failed to create diet session", { description: err.message });
        } finally {
            setLoading(false);
        }
    }

    async function fetchUsdaFoods(query: string, page: number = 1) {
        if (!query) return;
        setLoading(true);
        setError(null);
        try {
            const API_KEY = import.meta.env.VITE_USDA_API_KEY;

            const response = await fetch(
                `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=${itemsPerPage}&pageNumber=${page}&api_key=${API_KEY}`
            );
            if (!response.ok) throw new Error("Failed to fetch USDA food data");
            const data: USDAResponse = await response.json();
            setUsdaFoods(data.foods || []);
            setCurrentPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 1);
            if (!data.foods.length) {
                toast.error("No meals found. Try adding a meal manually below.");
            }
        } catch (err: any) {
            setError("Failed to fetch USDA food data");
            toast.error("Failed to fetch USDA food data", { description: err.message });
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (editMeal) {
            setEditMeal((prev) => ({
                ...prev!,
                [name]: name === "name" || name === "time" || name === "description" ? value : parseFloat(value) || 0,
            }));
        } else {
            setNewMeal((prev) => ({
                ...prev,
                [name]: name === "name" || name === "time" || name === "description" ? value : parseFloat(value) || 0,
            }));
        }
    };

    async function addManualMeal() {
        if (!newMeal.name || !newMeal.time) {
            toast.error("Meal name and time are required");
            return;
        }
        setLoading(true);
        try {
            const meal: Meal = {
                ...newMeal,
                source: "trainer",
                usedBy: clientId,
                isEaten: false,
                description: newMeal.description || "No description provided.",
            } as Meal;
            const response = await API.post(`/diet/${date}/meals`, meal, {
                params: { userId: clientId },
            });
            setMeals([...meals, { ...meal, _id: response.data.meals[response.data.meals.length - 1]._id }]);
            setNewMeal({
                name: "",
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                time: "12:00",
                source: "trainer",
                isEaten: false,
                description: "",
            });
            toast.success("Meal added successfully");
        } catch (err: any) {
            toast.error("Failed to add meal", { description: err.message });
        } finally {
            setLoading(false);
        }
    }

    async function updateMeal() {
        if (!editMeal || !editMeal._id || !editMeal.name || !editMeal.time) {
            toast.error("Meal name and time are required");
            return;
        }
        setLoading(true);
        try {
            const response = await API.patch(`/diet/${date}/meals/${editMeal._id}`, editMeal, {
                params: { userId: clientId },
            });
            setMeals(meals.map((m) => (m._id === editMeal._id ? { ...editMeal } : m)));
            setEditMeal(null);
            toast.success("Meal updated successfully");
        } catch (err: any) {
            toast.error("Failed to update meal", { description: err.message });
        } finally {
            setLoading(false);
        }
    }

    async function addUsdaMeal(food: USDAFood) {
        if (!usdaMealTime) {
            toast.error("Please select a time for the meal");
            return;
        }
        setLoading(true);
        try {
            const nutrients = food.foodNutrients;
            const meal: Meal = {
                name: food.description,
                calories: nutrients.find((n) => n.nutrientName === "Energy")?.value || 0,
                protein: nutrients.find((n) => n.nutrientName === "Protein")?.value || 0,
                carbs: nutrients.find((n) => n.nutrientName === "Carbohydrate, by difference")?.value || 0,
                fats: nutrients.find((n) => n.nutrientName === "Total lipid (fat)")?.value || 0,
                time: usdaMealTime,
                source: "trainer",
                usedBy: clientId,
                isEaten: false,
                description: food.ingredients || "No ingredients provided.",
            };
            const response = await API.post(`/diet/${date}/meals`, meal, {
                params: { userId: clientId },
            });
            setMeals([...meals, { ...meal, _id: response.data.meals[response.data.meals.length - 1]._id }]);
            setSelectedFood(null);
            setUsdaMealTime("12:00");
            toast.success("Meal added successfully");
        } catch (err: any) {
            toast.error("Failed to add meal", { description: err.message });
        } finally {
            setLoading(false);
        }
    }

    async function removeMeal(index: number, meal: Meal) {
        if (!meal._id) {
            setMeals(meals.filter((_, i) => i !== index));
            return;
        }
        setLoading(true);
        try {
            await API.delete(`/diet/${date}/meals/${meal._id}`, {
                params: { userId: clientId },
            });
            setMeals(meals.filter((_, i) => i !== index));
            toast.success("Meal removed successfully");
        } catch (err: any) {
            toast.error("Failed to remove meal", { description: err.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <main className="relative container mx-auto px-4 py-12 space-y-8">
                <section className="flex flex-col items-start gap-4">
                    <div className="flex items-center justify-between w-full">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                            Assign Diet Plan for Client
                        </h1>
                        <Button
                            variant="ghost"
                            className="group hover:bg-primary/5 transition-all duration-300"
                            onClick={() => navigate(`/trainer/user/${clientId}`)}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Client Details
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <DateSelector selectedDate={date} setSelectedDate={setDate} />
                    </div>
                </section>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-muted-foreground font-medium">Loading diet plan...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full border border-destructive/20 mb-4">
                            <span className="text-destructive font-medium">{error}</span>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Meals List */}
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle>Meals for {date}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {meals.length === 0 ? (
                                    <p className="text-muted-foreground">No meals assigned for this day.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {meals.map((meal, index) => (
                                            <MealCard
                                                key={meal._id || index}
                                                meal={meal}
                                                index={index}
                                                onRemove={() => removeMeal(index, meal)}
                                                onEdit={() => setEditMeal(meal)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* USDA Search */}
                        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
                            <CardHeader>
                                <CardTitle>Search USDA Foods</CardTitle>
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
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2"
                                    >
                                        Search
                                    </Button>
                                </div>
                                {loading && <p className="text-muted-foreground">Loading...</p>}
                                {error && <p className="text-red-500">{error}</p>}
                                {usdaFoods.length > 0 && (
                                    <div className="space-y-4">
                                        {usdaFoods.map((food) => (
                                            <USDAFoodCard
                                                key={food.fdcId}
                                                food={food}
                                                onSelect={() => setSelectedFood(food)}
                                            />
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
                                                className="hover:bg-primary/10 border-primary/30 text-white"
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
                                                className="hover:bg-primary/10 border-primary/30 text-white"
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
                                <CardTitle>Add Custom Meal</CardTitle>
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
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Add Meal
                                </Button>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* USDA Meal Details Modal */}
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
                                        src={selectedFood.foodAttributes.find((attr: any) => attr.name === "Package Image")?.value}
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
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Add to Diet
                                </Button>
                                <Button
                                    onClick={() => setSelectedFood(null)}
                                    variant="outline"
                                    className="w-full hover:bg-primary/10 border-primary/30 text-white"
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Edit Meal Modal */}
                {editMeal && (
                    <Dialog open={!!editMeal} onOpenChange={() => setEditMeal(null)}>
                        <DialogContent className="max-w-sm bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl p-4">
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
                                    Edit Meal: {editMeal.name}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Meal Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={editMeal.name}
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
                                        value={editMeal.time}
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
                                        value={editMeal.calories || ""}
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
                                        value={editMeal.protein || ""}
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
                                        value={editMeal.carbs || ""}
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
                                        value={editMeal.fats || ""}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 10"
                                        className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={editMeal.description || ""}
                                        onChange={handleInputChange}
                                        placeholder="e.g., A delicious homemade meal"
                                        className="max-w-md rounded-md border border-primary/30 bg-card/40 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                                <Button
                                    onClick={updateMeal}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    Update Meal
                                </Button>
                                <Button
                                    onClick={() => setEditMeal(null)}
                                    variant="outline"
                                    className="w-full hover:bg-primary/10 border-primary/30 text-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </main>
            <SiteFooter />
        </div>
    );
}