import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getTrainers } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Link, useNavigate } from "react-router-dom";
import { getWorkoutDays } from "@/services/workoutService";
import { getMealsByDate as getDiet } from "@/services/dietServices";
import { ROUTES } from "@/constants/routes";
import type { DietResponse, Trainer, WorkoutSession } from "@/interfaces/user/IHomePage";
import Aurora from "@/components/ui/Aurora";

import { useSelector } from "react-redux";
import ProfileCompletionModal from "@/components/user/general/ProfileCompletionModal";
// import API from "@/lib/axios";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={itemVariants}
    className={`relative group overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-500 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {children}
  </motion.div>
);

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export default function HomePage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [diet, setDiet] = useState<DietResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.userAuth.user);
  const streak = user ? user.streak : 0;

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    document.title = "TrainUp - Your Fitness Journey";
    fetchHomeData();
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = () => {
    if (!user) return;

    const skipped = localStorage.getItem("profileCompletionSkipped");
    const skipDate = localStorage.getItem("profileCompletionSkipDate");

    if (skipped && skipDate) {
      const daysSinceSkip = Math.floor((Date.now() - parseInt(skipDate)) / (1000 * 60 * 60 * 24));
      if (daysSinceSkip < 7) return;
    }

    const requiredFields = [
      user.phone,
      user.age,
      user.gender,
      user.height,
      user.weight,
      user.goals?.length > 0,
      user.activityLevel,
    ];

    const completedFields = requiredFields.filter((field) => field && field !== "").length;
    const completionPercentage = (completedFields / requiredFields.length) * 100;

    if (completionPercentage < 70) {
      setShowProfileModal(true);
    }
  };

  const fetchHomeData = async () => {
    setIsLoading(true);
    try {
      // Fetch trainers
      try {
        const trainerResponse = await getTrainers(1, 5, "");
        setTrainers(trainerResponse.trainers.trainers || []);
      } catch (err: any) {
        console.error("Failed to fetch trainers:", err);
        toast.error("Failed to fetch trainers");
      }

      // Fetch workouts
      try {
        const workoutResponse = await getWorkoutDays(today);
        setWorkouts(workoutResponse.sessions);
      } catch (err: any) {
        console.error("Failed to fetch workouts:", err);
        toast.error("Failed to fetch workouts");
      }

      // Fetch diet
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
    const manualMeals = diet?.meals || [];
    const templateMeals = diet?.templateMeals || [];

    const consumed = manualMeals.reduce((sum, meal) => sum + (meal.isEaten ? meal.calories : 0), 0);

    // If we have manual meals, use them for total. Otherwise use template total.
    let total = manualMeals.reduce((sum, meal) => sum + meal.calories, 0);
    if (total === 0 && templateMeals.length > 0) {
      total = templateMeals.reduce((sum, meal) => sum + meal.calories, 0);
    }

    const percentage = total > 0 ? (consumed / total) * 100 : 0;

    return { consumed, total, percentage, hasTemplate: !!diet?.templateName };
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

      <ProfileCompletionModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 z-10 flex-1"
      >
        {/* Hero Section */}
        <section className="relative text-center space-y-8 pt-8">


          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
            >
              Transform Your Body.<br />
              <span className="bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent animate-gradient-x px-2">
                One Day at a Time.
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Master your fitness with <span className="text-white font-medium">AI-powered workouts</span>,
              <span className="text-white font-medium"> personalized nutrition</span>, and
              <span className="text-white font-medium"> elite coaching</span>.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-lg font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] group relative overflow-hidden"
              onClick={() => navigate("/workouts")}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Today <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-lg font-bold rounded-full transition-all"
              onClick={() => navigate("/trainers")}
            >
              Browse Trainers
            </Button>
          </motion.div>
        </section>

        {/* Stats Overview - Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <GlassCard className="md:col-span-2 lg:col-span-2 flex flex-col justify-between min-h-[200px] border-primary/20 bg-primary/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-primary/20 rounded-2xl">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary bg-primary/10">Active</Badge>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Current Streak</h3>
              <div className="text-5xl font-black text-white flex items-baseline gap-2">
                <AnimatedNumber value={streak} />
                <span className="text-xl font-medium text-gray-500">days</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Top 5% this week</span>
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-2 lg:col-span-2 flex flex-col justify-between min-h-[200px] border-green-500/20 bg-green-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/20 rounded-2xl">
                <Apple className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-xs font-bold text-green-500">{Math.round(dietProgress.percentage)}%</span>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Calories Consumed</h3>
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                <AnimatedNumber value={dietProgress.consumed} />
                <span className="text-lg font-medium text-gray-500">/ {dietProgress.total}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dietProgress.percentage}%` }}
                  className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-4 lg:col-span-2 flex flex-col justify-between min-h-[200px] border-blue-500/20 bg-blue-500/5">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Dumbbell className="h-6 w-6 text-blue-500" />
              </div>
              <Activity className="h-5 w-5 text-blue-500/50" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Workout Progress</h3>
              <div className="text-4xl font-black text-white flex items-baseline gap-2">
                <AnimatedNumber value={workoutProgress.completed} />
                <span className="text-lg font-medium text-gray-500">/ {workoutProgress.total}</span>
              </div>
              <p className="text-xs text-blue-400 mt-2 font-medium uppercase tracking-wider">
                {workoutProgress.total - workoutProgress.completed} sessions remaining today
              </p>
            </div>
          </GlassCard>
        </section>

        {/* Featured Trainers */}
        <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">Elite Coaches</h2>
              <p className="text-gray-500 font-medium">Learn from the best in the industry</p>
            </div>
            <Link to="/trainers">
              <Button variant="link" className="text-primary font-bold gap-1 hover:gap-2 transition-all">
                View All Trainers <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-3xl bg-white/5 animate-pulse border border-white/10" />
              ))
            ) : trainers.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <Users className="h-16 w-16 mx-auto text-white/10" />
                <p className="text-gray-500 text-xl font-medium">No trainers available right now.</p>
              </div>
            ) : (
              trainers.slice(0, 3).map((trainer) => (
                <motion.div
                  key={trainer._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group relative h-[450px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
                >
                  <img
                    src={trainer.profileImage || "/placeholder.svg"}
                    alt={trainer.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 backdrop-blur-md text-white border-0 py-1.5 px-4 rounded-full font-bold shadow-xl">
                      {trainer.specialty}
                    </Badge>
                  </div>

                  <div className="absolute top-4 right-4 h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-xs font-bold">{trainer.rating}</span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    <div>
                      <h4 className="text-2xl font-black text-white">{trainer.name}</h4>
                      <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{trainer.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Starting from</p>
                        <p className="text-xl font-black text-primary">
                          {typeof trainer.price === 'object' ? `₹${trainer.price.basic}` : trainer.price}
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/trainers/${trainer._id}`)}
                        className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-6"
                      >
                        Profile
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Today's Workouts & Diet Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workouts */}
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Dumbbell className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Today's Regimen</h3>
              </div>
              <Link to="/workouts">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View Schedule
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2].map((i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
              ) : !Array.isArray(workouts) || workouts.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <Activity className="h-12 w-12 mx-auto text-white/5" />
                  <p className="text-gray-500">No sessions planned for today.</p>
                  <Button onClick={() => navigate("/workouts/add")} variant="outline" className="rounded-full border-white/10">Add Session</Button>
                </div>
              ) : (
                workouts.slice(0, 3).map((workout) => (
                  <motion.div
                    key={workout._id}
                    whileHover={{ x: 10 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${workout.isDone
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${workout.isDone ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-yellow-500"}`} />
                      <div>
                        <h4 className={`font-bold ${workout.isDone ? "line-through text-gray-500" : "text-white"}`}>
                          {workout.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {workout.time}</span>
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {workout.exercises?.length} sets</span>
                        </div>
                      </div>
                    </div>
                    {workout.isDone ? (
                      <Badge className="bg-green-500/20 text-green-500 border-0">Done</Badge>
                    ) : (
                      <Button size="sm" variant="ghost" className="rounded-full hover:bg-primary/20 hover:text-primary" onClick={() => navigate(ROUTES.USER_START_WORKOUT.replace(':id', workout._id))}>
                        Start
                      </Button>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Diet */}
          <GlassCard className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <Apple className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold">Nutrition Plan</h3>
              </div>
              <Link to="/diets">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Log Meal
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
              ) : !diet?.meals || diet.meals.length === 0 ? (
                <div className="col-span-full py-12 text-center space-y-4">
                  <Apple className="h-12 w-12 mx-auto text-white/5" />
                  <p className="text-gray-500">No meals logged for today.</p>
                </div>
              ) : (
                (diet.meals.length > 0 ? diet.meals : (diet.templateMeals || [])).slice(0, 4).map((meal) => (
                  <motion.div
                    key={meal._id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl border ${meal.isEaten
                      ? "bg-green-500/5 border-green-500/20"
                      : "bg-white/5 border-white/10"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-sm truncate pr-2">{meal.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${meal.isEaten ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-gray-600"}`} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-gray-500">
                      <div className="flex flex-col">
                        <span>Cals</span>
                        <span className="text-white text-sm">{meal.calories}</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Prot</span>
                        <span className="text-white text-sm">{meal.protein}g</span>
                      </div>
                      <div className="flex flex-col">
                        <span>Time</span>
                        <span className="text-white text-sm">{meal.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </section>

        {/* Quick Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black px-2 tracking-tight">Quick Actions</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Start Workout", desc: "Launch active session", icon: Dumbbell, color: "from-blue-600 to-cyan-500", path: "/workouts" },
              { title: "Log Nutrition", desc: "Track daily intake", icon: Apple, color: "from-orange-600 to-amber-500", path: "/diets" },
              { title: "Find Coaches", desc: "Expert personalized help", icon: Users, color: "from-purple-600 to-pink-500", path: "/trainers" },
              { title: "Analytics", desc: "View detailed progress", icon: Award, color: "from-primary to-indigo-500", path: "/dashboard" },
            ].map((action, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => navigate(action.path)}
                className="group cursor-pointer relative overflow-hidden rounded-3xl p-1 bg-white/5 border border-white/10"
              >
                <div className="relative z-10 p-6 flex flex-col gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} p-0.5 shadow-lg group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-shadow`}>
                    <div className="w-full h-full rounded-[14px] bg-black/20 backdrop-blur-sm flex items-center justify-center">
                      <action.icon className="h-7 w-7 text-white fill-[#030303]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-black">{action.title}</h4>
                    <p className="text-gray-500 text-sm font-medium">{action.desc}</p>
                  </div>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </motion.div>
            ))}
          </div>
        </section>
      </motion.main>
      <SiteFooter />
    </div>
  );
}
