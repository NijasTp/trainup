
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { InfoModal } from "@/components/user/general/InfoModal";
import api from "@/lib/axios";
import { Link } from "react-router-dom";
import { markEaten } from "@/services/dietServices";
import { toast } from "react-toastify";
import type { ApiResponse, Meal } from "@/interfaces/user/IDiets";
import Aurora from "@/components/ui/Aurora";


export default function Diets() {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [trainerDiet, setTrainerDiet] = useState<Meal[]>([]);
  const [userDiet, setUserDiet] = useState<Meal[]>([]);
  const [currentView] = useState<'self' | 'trainer'>('self');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingMeal, setConfirmingMeal] = useState<{ id: string; isTrainer: boolean; isTemplate?: boolean } | null>(null);


  const isMealMissed = (meal: Meal) => {
    if (meal.isEaten) return false;
    const now = new Date();
    const [hours, minutes] = meal.time.split(':').map(Number);
    const mealDate = new Date();
    mealDate.setHours(hours, minutes, 0, 0);
    return now > mealDate;
  };

  // Fetch meals
  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      try {
        const response = await api.post<ApiResponse>('/diet/', {
          date: selectedDate,
        });

        const data = response.data;
        const meals = data.meals || [];
        const templateMeals = data.templateMeals || [];



        const trainerMeals = meals
          .filter((meal) => meal.source === 'trainer' || meal.source === 'admin')
          .map((meal) => ({
            ...meal,
            image: meal.image || 'https://worldfoodtour.co.uk/wp-content/uploads/2013/06/neptune-placeholder-48.jpg',
            description: meal.description || 'No description available.',
          }));

        // If no trainer meals, and we have template meals, use them
        if (trainerMeals.length === 0 && templateMeals.length > 0) {
          trainerMeals.push(...templateMeals.map(m => ({
            ...m,
            image: m.image || 'https://worldfoodtour.co.uk/wp-content/uploads/2013/06/neptune-placeholder-48.jpg',
            description: m.description || `From template: ${data.templateName}`,
            isTemplate: true
          })));
        }

        const userMeals = meals
          .filter((meal) => meal.source === 'user')
          .map((meal) => ({
            ...meal,
            image: meal.image || 'https://worldfoodtour.co.uk/wp-content/uploads/2013/06/neptune-placeholder-48.jpg',
            description: meal.description || 'No description available.',
          }));

        setTrainerDiet(trainerMeals);
        setUserDiet(userMeals);
        setLoading(false);
      } catch (err) {
        setError('Error fetching meals. Please try again later.');
        setLoading(false);
      }
    };

    fetchMeals();
  }, [selectedDate]);

  const handleMarkEaten = async () => {
    if (!confirmingMeal) return;
    const { id: mealId, isTrainer } = confirmingMeal;

    // Optimistic Update
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (isTrainer) {
      setTrainerDiet((prev) =>
        prev.map((meal) =>
          meal._id === mealId
            ? { ...meal, isEaten: !meal.isEaten, eatenTime: !meal.isEaten ? time : undefined }
            : meal
        )
      );
    } else {
      setUserDiet((prev) =>
        prev.map((meal) =>
          meal._id === mealId
            ? { ...meal, isEaten: !meal.isEaten, eatenTime: !meal.isEaten ? time : undefined }
            : meal
        )
      );
    }

    setConfirmingMeal(null);

    try {
      await markEaten(now.toISOString().split('T')[0], mealId)
      toast.success("Meal marked as eaten!");
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.error || 'Failed to mark meal as eaten');
    }
  };

  const checkTimeAndInitiate = (meal: Meal, isTrainer: boolean) => {
    if (meal.isEaten) {
      setConfirmingMeal({ id: meal._id, isTrainer });
      return;
    }

    const now = new Date();
    const [hours, minutes] = meal.time.split(':').map(Number);
    const mealDate = new Date();
    mealDate.setHours(hours, minutes, 0, 0);

    // Difference in minutes
    const diffInMinutes = (mealDate.getTime() - now.getTime()) / (1000 * 60);

    // If diffInMinutes > 10, it is MORE than 10 minutes before meal time.
    if (diffInMinutes > 10) {
      toast.warning("You can only mark this meal as eaten 10 minutes before the scheduled time.");
      return;
    }

    setConfirmingMeal({ id: meal._id, isTrainer });
  };

  const meals = currentView === 'trainer' ? trainerDiet : userDiet;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading meals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#020617", "#0f172a", "#020617"]}
          amplitude={1.1}
          blend={0.6}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
      </div>

      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-12 flex-1">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Your Food Logs & Nutrition
            </h1>
            <InfoModal modalMessage="Click the 'Mark Eaten' button only after you have actually eaten the meal. This helps track your progress accurately." />
          </div>
          <p className="my-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Log your meals, check your macro intake, and track your daily nutrition over time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-primary/30 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none transition-all duration-300"
            />
            <Link to={`/diets/add?date=${selectedDate}`}>
              <Button
                variant="default"
                className="relative px-6 py-3 font-medium transition-all duration-300 w-full sm:w-auto"
              >
                Log Food +
              </Button>
            </Link>
          </div>
        </div>

        {/* Meals Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground text-center">
            Meals Logged
          </h2>
          <div className="space-y-4">
            {meals.length === 0 ? (
              <p className="text-center text-muted-foreground">No meals assigned for this category.</p>
            ) : (
              meals.map((meal) => (
                <Card
                  key={meal._id}
                  className={`group relative bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer ${meal.isEaten
                    ? "bg-green-500/10 border-green-500/50"
                    : isMealMissed(meal)
                      ? "bg-red-500/10 border-red-500/50"
                      : ""
                    }`}
                  onClick={() => setSelectedMeal(meal)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <CardContent className="flex items-center gap-4 p-6">
                    {meal.image && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={meal.image}
                          alt={meal.name}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        {meal.isEaten && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <h3 className="text-xl font-semibold text-foreground">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {meal.calories} kcal • Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fat: {meal.fats}g • Time: {meal.time}
                      </p>
                      {meal.isEaten && meal.eatenTime ? (
                        <p className="text-xs text-green-500 font-medium">Eaten at {meal.eatenTime}</p>
                      ) : isMealMissed(meal) ? (
                        <p className="text-xs text-red-500 font-medium">Missed</p>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        checkTimeAndInitiate(meal, currentView === 'trainer');
                      }}
                      className={`px-4 py-2 font-medium transition-all duration-300 ${isMealMissed(meal)
                        ? "bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
                        : "hover:bg-primary/10 border-primary/30"
                        }`}
                    >
                      {isMealMissed(meal) ? "Missed" : "Mark Eaten"}
                    </Button>

                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Meal Details Modal */}
      {selectedMeal && (
        <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
          <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
                {selectedMeal.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              {selectedMeal.image && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <img
                    src={selectedMeal.image}
                    alt={selectedMeal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              )}
              {selectedMeal.description && (
                <p className="text-muted-foreground leading-relaxed">{selectedMeal.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Calories</p>
                  <p className="text-2xl font-bold text-primary">{selectedMeal.calories} kcal</p>
                </div>
                <div className="space-y-1 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Protein</p>
                  <p className="text-2xl font-bold text-primary">{selectedMeal.protein}g</p>
                </div>
                <div className="space-y-1 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Carbs</p>
                  <p className="text-2xl font-bold text-primary">{selectedMeal.carbs}g</p>
                </div>
                <div className="space-y-1 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Fat</p>
                  <p className="text-2xl font-bold text-primary">{selectedMeal.fats}g</p>
                </div>
              </div>
              <div className="space-y-1 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">Scheduled Time</p>
                <p className="text-lg font-bold text-primary">{selectedMeal.time}</p>
              </div>
              {selectedMeal.isEaten && selectedMeal.eatenTime ? (
                <div className="text-center text-green-500 font-medium">
                  Eaten at {selectedMeal.eatenTime}
                </div>
              ) : isMealMissed(selectedMeal) ? (
                <div className="text-center text-red-500 font-medium">
                  Missed
                </div>
              ) : null}
              <Button
                onClick={() => setSelectedMeal(null)}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <AlertDialog open={!!confirmingMeal} onOpenChange={(open) => !open && setConfirmingMeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this meal as {confirmingMeal &&
                (currentView === 'trainer' ? trainerDiet : userDiet).find(m => m._id === confirmingMeal.id)?.isEaten
                ? 'uneaten'
                : 'eaten'
              }?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkEaten}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
