import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  TrendingUp,
  Users,
  Apple,
  Dumbbell,
  Clock,
  Star,
  ChevronRight,
  MapPin,
  Target,
  Award,
  Activity,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { getTrainers } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { Link, useNavigate } from "react-router-dom";
import { getWorkoutDays } from "@/services/workoutService";
import { getMealsByDate as getDiet } from "@/services/dietServices";
import type { DietResponse, Trainer, WorkoutSession } from "@/interfaces/user/homeInterface";
import { useSelector } from "react-redux";


export default function HomePage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [diet, setDiet] = useState<DietResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.userAuth.user)
  const streak = user ? user.streak : 0

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    document.title = "TrainUp - Your Fitness Journey";
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {

    setIsLoading(true);
    try {
      try {
        const trainerResponse = await getTrainers(1, 5, "");
        setTrainers(trainerResponse.trainers.trainers || []);
      } catch (err: any) {
        console.error("Failed to fetch trainers:", err);
        toast.error("Failed to fetch trainers");
      }

      try {
        const workoutResponse = await getWorkoutDays(today);
        setWorkouts(workoutResponse.sessions);
      } catch (err: any) {
        console.error("Failed to fetch workouts:", err);
        toast.error("Failed to fetch workouts");
      }

      try {
        const dietResponse = await getDiet(today);
        setDiet(dietResponse);
      } catch (err: any) {
        console.error("Failed to fetch diet:", err);
        toast.error("Failed to fetch diet");

      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDietProgress = () => {
    if (!diet?.meals || !Array.isArray(diet.meals)) return { consumed: 0, total: 0, percentage: 0 };

    const consumed = diet.meals.reduce((sum, meal) => sum + (meal.isEaten ? meal.calories : 0), 0);
    const total = diet.meals.reduce((sum, meal) => sum + meal.calories, 0);
    const percentage = total > 0 ? (consumed / total) * 100 : 0;

    return { consumed, total, percentage };
  };

  const calculateWorkoutProgress = () => {
    if (!Array.isArray(workouts)) return { completed: 0, total: 0, percentage: 0 };

    const completed = workouts.filter((w) => w.isDone).length;
    const total = workouts.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  };

  const dietProgress = calculateDietProgress();
  const workoutProgress = calculateWorkoutProgress();


  return (
    <div className="container min-h-screen bg-gradient-to-br from-background absolute inset-0 via-background/95 to-secondary/20">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

      <SiteHeader />
      <Button className="fixed bottom-8 right-8 z-50" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
      <main className="relative container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{streak} Day Streak!</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Welcome Back, Champion!
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to crush today's goals? Let's see what's on your fitness agenda.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{streak} days</div>
              {streak > 0 ? (<p className="text-xs text-green-700">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Keep it going!
              </p>) : (<p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                Keep practicing, you can do it!
              </p>)}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Nutrition</CardTitle>
              <Apple className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dietProgress.consumed}/{dietProgress.total} cal
              </div>
              <Progress value={dietProgress.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(dietProgress.percentage)}% completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Workouts</CardTitle>
              <Dumbbell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {workoutProgress.completed}/{workoutProgress.total}
              </div>
              <Progress value={workoutProgress.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(workoutProgress.percentage)}% completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Workouts */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <CardTitle>Today's Workouts</CardTitle>
            </div>
            <Link to="/workouts">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : !Array.isArray(workouts) || workouts.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No workouts scheduled for today</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/workouts/add")}>
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Add Workout
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {workouts.slice(0, 3).map((workout) => (
                  <div
                    key={workout._id}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${workout.isDone ? "bg-green-500" : "bg-yellow-500"}`} />
                      <div>
                        <h4 className="font-medium">{workout.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {workout.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {workout.exercises?.length} exercises
                          </span>
                          {workout.givenBy === "trainer" && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              Trainer
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant={workout.isDone ? "secondary" : "default"} size="sm">
                      {workout.isDone ? "Completed" : "Start"}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Diet */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-600" />
              <CardTitle>Today's Meals</CardTitle>
            </div>
            <Link to="/diets">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : !diet?.meals || !Array.isArray(diet.meals) || diet.meals.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Apple className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No meals planned for today</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/diets/add")}>
                  <Apple className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {diet.meals.slice(0, 6).map((meal) => (
                  <div key={meal._id} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{meal.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${meal.isEaten ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Calories:</span>
                        <span className="font-medium">{meal.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protein:</span>
                        <span className="font-medium">{meal.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium">{meal.time}</span>
                      </div>
                    </div>
                    {meal.source === "trainer" && (
                      <Badge variant="secondary" className="text-xs mt-2">
                        <Users className="h-3 w-3 mr-1" />
                        Trainer
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Featured Trainers */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Featured Trainers</CardTitle>
            </div>
            <Link to="/trainers">
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : trainers.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">No trainers available at the moment</p>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Trainers
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {trainers.slice(0, 3).map((trainer) => (
                  <div
                    key={trainer.id}
                    className="group relative overflow-hidden bg-secondary/30 rounded-lg border border-border/30 hover:border-border transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={trainer.profileImage || "/placeholder.svg"}
                        alt={trainer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-medium">{trainer.rating}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="font-semibold text-white mb-1">{trainer.name}</h4>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{trainer.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {trainer.specialty}
                        </Badge>
                        <span className="font-bold text-primary">{trainer.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{trainer.bio}</p>
                      <Button className="w-full mt-3" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Start Workout</h4>
                <p className="text-sm text-muted-foreground">Begin today's session</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Apple className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Log Meal</h4>
                <p className="text-sm text-muted-foreground">Track your nutrition</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Find Trainer</h4>
                <p className="text-sm text-muted-foreground">Get expert guidance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="flex items-center gap-3 p-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">View Progress</h4>
                <p className="text-sm text-muted-foreground">Check your stats</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
