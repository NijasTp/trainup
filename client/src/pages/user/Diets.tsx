import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { InfoModal } from "@/components/user/general/InfoModal";

// Mock data interfaces
interface Meal {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  isEaten: boolean;
  eatenTime?: string;
}

// Mock data
const initialTrainerMeals: Meal[] = [
  {
    id: "1",
    name: "Breakfast Oatmeal",
    image: "https://example.com/oatmeal.jpg",
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 8,
    description: "Nutritious oatmeal with fruits and nuts. Provides sustained energy throughout the morning.",
    isEaten: false,
  },
  {
    id: "2",
    name: "Lunch Grilled Chicken Salad",
    image: "https://example.com/salad.jpg",
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 25,
    description: "Fresh salad with grilled chicken, mixed greens, tomatoes, cucumbers, and light dressing.",
    isEaten: false,
  },
  {
    id: "3",
    name: "Dinner Quinoa Bowl",
    image: "https://example.com/quinoa.jpg",
    calories: 500,
    protein: 20,
    carbs: 70,
    fat: 15,
    description: "Quinoa base with roasted vegetables, avocado, and a tahini sauce for added flavor.",
    isEaten: false,
  },
];

const initialUserMeals: Meal[] = [
  {
    id: "4",
    name: "Snack Apple with Peanut Butter",
    image: "https://example.com/apple-pb.jpg",
    calories: 250,
    protein: 8,
    carbs: 30,
    fat: 15,
    description: "Fresh apple slices paired with natural peanut butter for a quick protein boost.",
    isEaten: false,
  },
  {
    id: "5",
    name: "Evening Yogurt Parfait",
    image: "https://example.com/yogurt.jpg",
    calories: 300,
    protein: 15,
    carbs: 40,
    fat: 10,
    description: "Layered Greek yogurt with fresh berries, granola, and a drizzle of honey.",
    isEaten: false,
  },
];


export default function Diets() {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [trainerDiet, setTrainerDiet] = useState<Meal[]>(initialTrainerMeals);
  const [userDiet, setUserDiet] = useState<Meal[]>(initialUserMeals);
  const [currentView, setCurrentView] = useState<'trainer' | 'self'>('trainer');

  const handleMarkEaten = (mealId: string, isTrainer: boolean) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (isTrainer) {
      setTrainerDiet((prev) =>
        prev.map((meal) =>
          meal.id === mealId 
            ? { ...meal, isEaten: !meal.isEaten, eatenTime: !meal.isEaten ? time : undefined } 
            : meal
        )
      );
    } else {
      setUserDiet((prev) =>
        prev.map((meal) =>
          meal.id === mealId 
            ? { ...meal, isEaten: !meal.isEaten, eatenTime: !meal.isEaten ? time : undefined } 
            : meal
        )
      );
    }
  };

  const meals = currentView === 'trainer' ? trainerDiet : userDiet;
  const otherMealsCount = currentView === 'trainer' ? userDiet.length : trainerDiet.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Your Daily Diet Plan
            </h1>
            <InfoModal modalMessage="Click the 'Mark Eaten' button only after you have actually eaten the meal. This helps track your progress accurately." />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            View your trainer-assigned and self-assigned meals for today. Mark meals as eaten to track your intake.
          </p>
        </div>

        {/* Switch Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setCurrentView('trainer')}
            variant={currentView === 'trainer' ? "default" : "outline"}
            className={`relative px-6 py-3 font-medium transition-all duration-300 ${
              currentView === 'trainer' 
                ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg" 
                : "hover:bg-primary/10 border-primary/30"
            }`}
          >
            Trainer Assigned
            {currentView !== 'trainer' && otherMealsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs">
                {otherMealsCount}
              </Badge>
            )}
          </Button>
          <Button
            onClick={() => setCurrentView('self')}
            variant={currentView === 'self' ? "default" : "outline"}
            className={`relative px-6 py-3 font-medium transition-all duration-300 ${
              currentView === 'self' 
                ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg" 
                : "hover:bg-primary/10 border-primary/30"
            }`}
          >
            Self Assigned
            {currentView !== 'self' && otherMealsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs">
                {otherMealsCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Meals Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground text-center">
            {currentView === 'trainer' ? 'Assigned by Trainer' : 'Assigned by Myself'}
          </h2>
          <div className="space-y-4">
            {meals.map((meal) => (
              <Card
                key={meal.id}
                className={`group relative bg-card/40 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer ${
                  meal.isEaten ? "bg-green-500/10 border-green-500/50" : ""
                }`}
                onClick={() => setSelectedMeal(meal)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <CardContent className="flex items-center gap-4 p-6">
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
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-semibold text-foreground">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground">{meal.calories} kcal • Protein: {meal.protein}g • Carbs: {meal.carbs}g • Fat: {meal.fat}g</p>
                    {meal.isEaten && meal.eatenTime && (
                      <p className="text-xs text-green-500 font-medium">Eaten at {meal.eatenTime}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkEaten(meal.id, currentView === 'trainer');
                    }}
                    className={`px-4 py-2 font-medium transition-all duration-300 ${
                      meal.isEaten 
                        ? "bg-green-500/20 border-green-500 text-green-500 hover:bg-green-500/30" 
                        : "hover:bg-primary/10 border-primary/30"
                    }`}
                  >
                    {meal.isEaten ? "Uneat" : "Mark Eaten"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />

      {/* Meal Details Modal */}
      {selectedMeal && (
        <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
          <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold  bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
                {selectedMeal.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 p-4">
              <div className="relative w-full h-48 rounded-xl overflow-hidden">
                <img
                  src={selectedMeal.image}
                  alt={selectedMeal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <p className="text-muted-foreground leading-relaxed">{selectedMeal.description}</p>
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
                  <p className="text-2xl font-bold text-primary">{selectedMeal.fat}g</p>
                </div>
              </div>
              {selectedMeal.isEaten && selectedMeal.eatenTime && (
                <div className="text-center text-green-500 font-medium">
                  Eaten at {selectedMeal.eatenTime}
                </div>
              )}
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
    </div>
  );
}