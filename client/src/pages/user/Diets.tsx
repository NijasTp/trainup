import { useState, useEffect } from "react";
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
import { CheckCircle2, ChevronRight, Apple, Info } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { InfoModal } from "@/components/user/general/InfoModal";
import api from "@/lib/axios";
import { Link } from "react-router-dom";
import { markEaten } from "@/services/dietServices";
import { toast } from "react-toastify";
import type { ApiResponse, Meal } from "@/interfaces/user/IDiets";

type SafeAny = any;

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
      } catch (_err) {
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
    } catch (errorVal) {
      const err = errorVal as SafeAny;
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
      <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
          <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing nutrition logs...</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/20 rounded-xl border border-red-900/30 mb-4">
            <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider">{error}</span>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />

      <main className="relative container mx-auto px-6 py-12 space-y-10 flex-1 z-10 max-w-5xl w-full">
        {/* Header Section */}
        <section className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-8 md:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="bg-cyan-500/5 text-[#22d3ee] border border-[#22d3ee]/20 py-0.5 px-2.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                NUTRITION PROTOCOL
              </span>
              <InfoModal modalMessage="Click the 'Mark Eaten' button only after you have actually eaten the meal. This helps track your progress accurately." />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-mono text-white uppercase tracking-tight leading-none">
              NUTRITION MATRIX
            </h1>
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
              Log your meals, check your macro intake, and track your daily nutrition to fuel your workout routines.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-44 h-12 px-4 bg-[#0d0d0e] border-2 border-[#262626] focus:border-[#22d3ee] rounded-xl text-white font-mono text-xs uppercase tracking-wider outline-none transition-colors"
            />
            <Link to={`/diets/add?date=${selectedDate}`} className="w-full sm:w-auto">
              <button
                className="duo-btn-cyan h-12 px-6 text-xs font-mono font-bold uppercase tracking-wider w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                Log Food <ChevronRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>

        {/* Meals Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#171717] border border-[#262626] rounded-lg text-[#22d3ee]">
              <Apple className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-extrabold font-mono uppercase text-white tracking-wide">MEALS SCHEDULED FOR THIS SECTOR</h2>
          </div>

          <div className="space-y-4">
            {meals.length === 0 ? (
              <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl py-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 bg-[#0d0d0e] border border-[#262626] rounded-full flex items-center justify-center text-neutral-600">
                  <Apple className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold font-mono text-white uppercase tracking-tight">No Meals Logged</h3>
                  <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
                    Your nutrition ledger is empty for this date.
                  </p>
                </div>
              </div>
            ) : (
              meals.map((meal) => {
                const isMissed = isMealMissed(meal);
                const isEaten = meal.isEaten;
                
                let statusClasses = "border-[#262626] border-b-[#1f1f1f] bg-[#171717]";
                if (isEaten) statusClasses = "border-emerald-500 border-b-emerald-600 bg-emerald-950/10";
                else if (isMissed) statusClasses = "border-red-500 border-b-red-600 bg-red-950/10";

                return (
                  <div
                    key={meal._id}
                    className={`group relative duo-card-3d border-2 border-b-[5px] hover:border-neutral-500 hover:border-b-[7px] hover:border-b-[#262626] rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${statusClasses}`}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {meal.image && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#262626] flex-shrink-0 bg-[#0d0d0e]">
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                          />
                          {isEaten && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <h3 className="text-base font-extrabold font-mono text-white uppercase tracking-tight">{meal.name}</h3>
                        <p className="text-xs font-mono text-neutral-400 uppercase">
                          {meal.calories} kcal • P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g • Time: {meal.time}
                        </p>
                        {isEaten && meal.eatenTime ? (
                          <span className="inline-block bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase mt-1">EATEN AT {meal.eatenTime}</span>
                        ) : isMissed ? (
                          <span className="inline-block bg-red-950/30 text-red-400 border border-red-900/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase mt-1">MISSED</span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        checkTimeAndInitiate(meal, currentView === 'trainer');
                      }}
                      className={`h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider shrink-0 w-full sm:w-auto ${
                        isMissed 
                          ? "duo-btn-outline border-red-500 text-red-400" 
                          : isEaten 
                            ? "duo-btn-outline border-emerald-500 text-emerald-400"
                            : "duo-btn-cyan"
                      }`}
                    >
                      {isMissed ? "Missed" : isEaten ? "Eaten" : "Mark Eaten"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Meal Details Modal */}
      {selectedMeal && (
        <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
          <DialogContent className="max-w-md bg-[#171717] border-2 border-[#262626] rounded-2xl p-6 text-white font-mono">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-extrabold font-mono text-white uppercase tracking-tight">
                {selectedMeal.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedMeal.image && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-[#262626]">
                  <img
                    src={selectedMeal.image}
                    alt={selectedMeal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {selectedMeal.description && (
                <div className="p-4 bg-[#0d0d0e] border border-[#262626] rounded-xl space-y-1">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" /> Description
                  </p>
                  <p className="text-xs text-neutral-200">{selectedMeal.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Calories</p>
                  <p className="text-base font-extrabold text-[#22d3ee] mt-1">{selectedMeal.calories} kcal</p>
                </div>
                <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Protein</p>
                  <p className="text-base font-extrabold text-[#22d3ee] mt-1">{selectedMeal.protein}g</p>
                </div>
                <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Carbohydrates</p>
                  <p className="text-base font-extrabold text-[#22d3ee] mt-1">{selectedMeal.carbs}g</p>
                </div>
                <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Fats</p>
                  <p className="text-base font-extrabold text-[#22d3ee] mt-1">{selectedMeal.fats}g</p>
                </div>
              </div>

              <div className="p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl flex items-center justify-between">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Scheduled Time</span>
                <span className="text-sm font-extrabold text-white">{selectedMeal.time}</span>
              </div>

              {selectedMeal.isEaten && selectedMeal.eatenTime ? (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-center text-emerald-400 rounded-xl font-bold text-xs uppercase">
                  Eaten at {selectedMeal.eatenTime}
                </div>
              ) : isMealMissed(selectedMeal) ? (
                <div className="p-3 bg-red-950/20 border border-red-900/30 text-center text-red-400 rounded-xl font-bold text-xs uppercase">
                  Missed
                </div>
              ) : null}

              <button
                onClick={() => setSelectedMeal(null)}
                className="duo-btn-cyan w-full h-12 text-xs font-mono font-bold uppercase tracking-wider mt-2"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!confirmingMeal} onOpenChange={(open) => !open && setConfirmingMeal(null)}>
        <AlertDialogContent className="bg-[#171717] border-2 border-[#262626] rounded-2xl text-white font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-extrabold text-white uppercase tracking-tight">Confirm Action</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-neutral-400 uppercase tracking-wide">
              Are you sure you want to mark this meal as {confirmingMeal &&
                (currentView === 'trainer' ? trainerDiet : userDiet).find(m => m._id === confirmingMeal.id)?.isEaten
                ? 'uneaten'
                : 'eaten'
              }?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel className="duo-btn-gray h-11 px-5 border-[#262626] text-neutral-300">Cancel</AlertDialogCancel>
            <AlertDialogAction className="duo-btn-cyan h-11 px-5" onClick={handleMarkEaten}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
