import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
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
import { motion, type Variants } from "framer-motion";
import { toast } from "sonner";
import { getTrainers } from "@/services/userService";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { Link, useNavigate } from "react-router-dom";
import { getWorkoutDays } from "@/services/workoutService";
import { getMealsByDate as getDiet } from "@/services/dietServices";
import { getGymsForUser, type IGym } from "@/services/gymService";
import { ROUTES } from "@/constants/routes";
import type { DietResponse, Trainer, WorkoutSession } from "@/interfaces/user/IHomePage";
import { getWorkoutTemplates } from "@/services/templateService";
import type { IWorkoutTemplate } from "@/interfaces/template/IWorkoutTemplate";

import { useSelector } from "react-redux";
import type { UserType } from "@/redux/slices/userAuthSlice";
import ProfileCompletionModal from "@/components/user/general/ProfileCompletionModal";
import api from "@/lib/axios";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 15
    },
  },
};

const CyberCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={itemVariants}
    className={`bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-b-[6px] hover:border-b-[#262626] hover:border-[#404040] active:translate-y-1.5 active:border-b-[3.5px] active:border-b-[#1f1f1f] ${className}`}
  >
    {children}
  </motion.div>
);

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalDuration = 800;
    const increment = end / (totalDuration / 16);

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
  const [gyms, setGyms] = useState<IGym[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<IWorkoutTemplate[]>([]);
  const [diet, setDiet] = useState<DietResponse | null>(null);
  const [activeTemplates, setActiveTemplates] = useState<IWorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state: { userAuth: { user: UserType | null } }) => state.userAuth.user);
  const streak = user ? user.streak : 0;
  const today = format(new Date(), "yyyy-MM-dd");

  const checkProfileCompletion = useCallback(() => {
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
      user.goals && user.goals?.length > 0,
      user.activityLevel,
    ];

    const completedFields = requiredFields.filter((field) => field && field !== "").length;
    const completionPercentage = (completedFields / requiredFields.length) * 100;

    if (completionPercentage < 70) {
      setShowProfileModal(true);
    }
  }, [user]);

  const fetchHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch trainers
      try {
        const trainerResponse = await getTrainers(1, 5, "");
        setTrainers(trainerResponse.trainers.trainers || []);
      } catch (_err) {
        console.error("Failed to fetch trainers:", _err);
        toast.error("Failed to fetch trainers");
      }

      // Fetch workouts
      try {
        const workoutResponse = await getWorkoutDays(today);
        setWorkouts(workoutResponse.sessions);
      } catch (_err) {
        console.error("Failed to fetch workouts:", _err);
        toast.error("Failed to fetch workouts");
      }

      // Fetch diet
      try {
        const dietResponse = await getDiet(today);
        setDiet(dietResponse);
      } catch (_err) {
        console.error("Failed to fetch diet:", _err);
        toast.error("Failed to fetch diet");
      }

      // Fetch gyms
      try {
        const gymResponse = await getGymsForUser(1, 3);
        setGyms(gymResponse.gyms || []);
      } catch (_err) {
        console.error("Failed to fetch gyms:", _err);
      }

      // Fetch popular templates
      try {
        const goal = user?.goals && user.goals.length > 0 ? user.goals[0] : undefined;
        const templateResponse = await getWorkoutTemplates({ limit: 6, goal });
        setTemplates(templateResponse.templates || []);
      } catch (_err) {
        console.error("Failed to fetch templates:", _err);
      }

      // Fetch active programs from profile
      try {
        const profileResponse = await api.get('/user/get-profile');
        setActiveTemplates(profileResponse.data.activeWorkoutTemplates || []);
      } catch (_err) {
        console.error("Failed to fetch active programs:", _err);
      }

    } catch (errorVal) { const error = errorVal as SafeAny;
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [today, user?.goals]);

  useEffect(() => {
    document.title = "TrainUp - Your Fitness Journey";
    fetchHomeData();
    checkProfileCompletion();
  }, [fetchHomeData, checkProfileCompletion]);

  const calculateDietProgress = () => {
    const manualMeals = diet?.meals || [];
    const templateMeals = diet?.templateMeals || [];

    const consumed = manualMeals.reduce((sum, meal) => sum + (meal.isEaten ? meal.calories : 0), 0);

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
    <div className="min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-x-hidden font-sans">
      
      {/* Vercel-like subtle background highlight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(34,211,238,0.015)_0%,transparent_70%)] rounded-full blur-[90px]"></div>
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
        className="relative max-w-6xl mx-auto px-6 py-16 space-y-20 z-10 flex-1 w-full"
      >
        {/* Hero Section */}
        <section className="text-center space-y-8 pt-6">
          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white font-mono uppercase"
            >
              Transform Your Body.<br />
              <span className="text-[#22d3ee] italic">One Day at a Time.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-[#a3a3a3] text-base max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Master your fitness with <strong className="text-white font-bold">AI-powered workouts</strong>,
              <strong className="text-white font-bold"> personalized nutrition</strong>, and
              <strong className="text-white font-bold"> elite coaching</strong>.
            </motion.p>
          </div>

          <motion.div variants={itemVariants} className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => navigate("/workouts")}
              className="duo-btn-cyan px-8 py-3.5 text-sm"
            >
              Start Today
            </button>
            <button
              onClick={() => navigate("/trainers")}
              className="duo-btn-outline px-8 py-3.5 text-sm"
            >
              Browse Trainers
            </button>
          </motion.div>
        </section>

        {/* Stats Bento Box Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Streak */}
          <CyberCard className="flex flex-col justify-between h-[200px]">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                <Flame className="h-5 w-5 fill-[#22d3ee]/10" />
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider bg-cyan-950/40 text-[#22d3ee] border border-cyan-900/30 uppercase">
                ACTIVE STREAK
              </span>
            </div>
            <div>
              <h3 className="text-[#a3a3a3] text-xs font-mono font-bold uppercase tracking-wider">Current Streak</h3>
              <div className="text-4xl font-extrabold text-white font-mono flex items-baseline gap-1 mt-1">
                <AnimatedNumber value={streak} />
                <span className="text-sm font-bold text-[#a3a3a3]">days</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>TOP 5% THIS WEEK</span>
            </div>
          </CyberCard>

          {/* Card 2: Calories */}
          <CyberCard className="flex flex-col justify-between h-[200px]">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                <Apple className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-[#22d3ee]">
                {Math.round(dietProgress.percentage)}%
              </span>
            </div>
            <div>
              <h3 className="text-[#a3a3a3] text-xs font-mono font-bold uppercase tracking-wider">Calories Consumed</h3>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1 mt-1">
                <AnimatedNumber value={dietProgress.consumed} />
                <span className="text-sm font-bold text-[#a3a3a3]">/ {dietProgress.total} kcal</span>
              </div>
              <div className="w-full h-2 bg-[#0d0d0e] rounded-full mt-3 overflow-hidden border border-[#262626]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(dietProgress.percentage, 100)}%` }}
                  className="h-full bg-cyan-500 rounded-full"
                />
              </div>
            </div>
          </CyberCard>

          {/* Card 3: Workouts */}
          <CyberCard className="flex flex-col justify-between h-[200px]">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                <Dumbbell className="h-5 w-5" />
              </div>
              <Activity className="h-4 w-4 text-neutral-600" />
            </div>
            <div>
              <h3 className="text-[#a3a3a3] text-xs font-mono font-bold uppercase tracking-wider">Workout Progress</h3>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1 mt-1">
                <AnimatedNumber value={workoutProgress.completed} />
                <span className="text-sm font-bold text-[#a3a3a3]">/ {workoutProgress.total} sessions</span>
              </div>
              <p className="text-[10px] text-[#22d3ee] mt-3 font-mono font-bold uppercase tracking-widest leading-none">
                {workoutProgress.total - workoutProgress.completed} REMAINING TODAY
              </p>
            </div>
          </CyberCard>
        </section>

        {/* Active Programs Section */}
        {activeTemplates.length > 0 && (
          <section className="space-y-6">
            <div className="px-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono uppercase">
                Active Programs
              </h2>
              <p className="text-[#a3a3a3] text-xs font-medium">Currently active training protocols from your coach</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeTemplates.map((prog) => (
                <div
                  key={prog._id}
                  onClick={() => navigate(`/workouts/template/${prog._id}`)}
                  className="group duo-selection-card overflow-hidden h-64 flex flex-col justify-between p-6 relative cursor-pointer"
                >
                  <img
                    src={prog.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"}
                    alt={prog.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e]/60 to-transparent" />
                  
                  <div className="relative z-10">
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider bg-cyan-950/40 text-[#22d3ee] border border-cyan-900/30 uppercase">
                      ACTIVE
                    </span>
                  </div>

                  <div className="relative z-10 space-y-1">
                    <h3 className="text-lg font-bold text-white uppercase font-mono group-hover:text-[#22d3ee] transition-colors line-clamp-1">
                      {prog.title}
                    </h3>
                    <p className="text-[9px] font-mono font-bold text-[#a3a3a3] tracking-widest uppercase">
                      BY {prog.createdByType?.toUpperCase() || 'COACH'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Templates Carousel */}
        <section className="space-y-6">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono uppercase">
                Popular Workout Plans
              </h2>
              <p className="text-[#a3a3a3] text-xs font-medium">Expert training templates for every goal</p>
            </div>
            <Link to={ROUTES.USER_ADMIN_WORKOUT_TEMPLATES}>
              <button className="text-xs font-mono font-bold text-[#22d3ee] hover:underline flex items-center gap-1">
                SEE MORE <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide snap-x snap-mandatory">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="min-w-[300px] h-60 rounded-2xl bg-[#171717] border-2 border-[#262626] animate-pulse flex-shrink-0" />
              ))
            ) : templates.length === 0 ? (
              <div className="w-full py-16 text-center bg-[#171717] border-2 border-[#262626] rounded-2xl">
                <Dumbbell className="h-10 w-10 mx-auto text-neutral-600 mb-3" />
                <p className="text-[#a3a3a3] text-sm font-medium font-mono">NO PLANS FOUND</p>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template._id}
                  onClick={() => navigate(ROUTES.USER_TEMPLATE_DETAILS.replace(":id", template._id))}
                  className="min-w-[300px] group duo-selection-card h-60 overflow-hidden flex flex-col justify-between p-6 relative cursor-pointer snap-start flex-shrink-0"
                >
                  <img
                    src={template.image || "https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=800&auto=format&fit=crop"}
                    alt={template.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e]/60 to-transparent" />

                  <div className="relative z-10 flex justify-end">
                    <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-[#171717] border border-[#262626] text-[#22d3ee]">
                      {template.difficultyLevel?.toUpperCase() || "PRO"}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-bold text-white uppercase font-mono group-hover:text-[#22d3ee] transition-colors line-clamp-1">
                      {template.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[9px] font-mono font-bold text-[#a3a3a3]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#22d3ee]" /> {template.days?.length || 0} SESSIONS
                      </span>
                      <span className="flex items-center gap-1 uppercase tracking-wider">
                        <Target className="h-3 w-3 text-[#22d3ee]" /> {template.goal || 'GENERAL'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Featured Trainers */}
        <section className="space-y-6">
          <div className="px-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono uppercase">
              Elite Coaches
            </h2>
            <p className="text-[#a3a3a3] text-xs font-medium">Learn from the best in the industry</p>
          </div>

          {user?.assignedTrainerDetails && (
            <div 
              onClick={() => navigate(ROUTES.MY_TRAINER_PROFILE)}
              className="duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-3xl p-8 relative overflow-hidden cursor-pointer"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.assignedTrainerDetails.profileImage || "/placeholder.svg"} 
                    alt={user.assignedTrainerDetails.name}
                    className="w-36 h-36 rounded-2xl object-cover border-2 border-[#262626] shadow-xl"
                  />
                  <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-4 py-1 rounded-full font-mono font-bold tracking-widest text-[9px] uppercase">
                    My Coach
                  </span>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-white font-mono uppercase">
                      {user.assignedTrainerDetails.name}
                    </h2>
                    <p className="text-[#22d3ee] font-mono font-bold uppercase tracking-widest text-[10px]">
                      {user.assignedTrainerDetails.specialization?.toUpperCase()} • PROFESSIONAL COACH
                    </p>
                  </div>
                  
                  <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-xl font-medium">
                    You are currently training under {user.assignedTrainerDetails.name}. Access active plans, logs, and messaging channels directly.
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(ROUTES.MY_TRAINER_PROFILE); }} 
                      className="duo-btn-cyan px-5 py-2.5 text-xs"
                    >
                      Dashboard
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(ROUTES.USER_CHATS); }} 
                      className="duo-btn-outline px-5 py-2.5 text-xs"
                    >
                      Chat Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!user?.assignedTrainerDetails && (
            <div className="flex justify-end pr-2 -mt-4">
              <Link to="/trainers">
                <button className="text-xs font-mono font-bold text-[#22d3ee] hover:underline flex items-center gap-1">
                  SEE ALL TRAINERS <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-[#171717] border-2 border-[#262626] animate-pulse" />
              ))
            ) : trainers.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-2 bg-[#171717] border-2 border-[#262626] rounded-2xl">
                <Users className="h-10 w-10 mx-auto text-neutral-600" />
                <p className="text-[#a3a3a3] text-sm font-mono font-bold uppercase tracking-wider">NO TRAINERS AVAILABLE</p>
              </div>
            ) : (
              trainers.slice(0, 3).map((trainer) => (
                <div
                  key={trainer._id}
                  className="group duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-3xl overflow-hidden flex flex-col justify-between h-[420px]"
                >
                  <div className="relative h-48 bg-[#0d0d0e] overflow-hidden">
                    <img
                      src={trainer.profileImage || "/placeholder.svg"}
                      alt={trainer.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#171717] border border-[#262626] text-[#22d3ee] text-[9px] font-mono font-bold py-1 px-3 rounded-full uppercase">
                        {trainer.specialty || "Fitness"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 h-8 px-2.5 bg-black/40 border border-[#262626] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-[10px] font-mono font-bold text-white">{trainer.rating}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-white uppercase font-mono tracking-tight leading-none truncate">{trainer.name}</h4>
                      <div className="flex items-center gap-1.5 text-[#a3a3a3] text-xs font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#22d3ee]" />
                        <span className="truncate">{trainer.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                      <div>
                        <p className="text-[8px] text-[#a3a3a3] uppercase font-mono font-bold tracking-widest">Rate Starts At</p>
                        <p className="text-lg font-extrabold text-[#22d3ee] font-mono">
                          {typeof trainer.price === 'object' ? `₹${trainer.price.basic}` : trainer.price}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/trainers/${trainer._id}`)}
                        className="duo-btn-outline px-4 py-2 text-xs"
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Elite Gyms Section */}
        <section className="space-y-6">
          <div className="px-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono uppercase">
              Elite Gyms
            </h2>
            <p className="text-[#a3a3a3] text-xs font-medium">Top-rated fitness centers near you</p>
          </div>

          {user?.activeGymDetails && (
            <div 
              onClick={() => navigate(ROUTES.USER_GYM_DASHBOARD)}
              className="duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-3xl p-8 relative overflow-hidden cursor-pointer"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.activeGymDetails.profileImage || "/placeholder.svg"} 
                    alt={user.activeGymDetails.name}
                    className="w-36 h-36 rounded-2xl object-cover border-2 border-[#262626] shadow-xl"
                  />
                  <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-4 py-1 rounded-full font-mono font-bold tracking-widest text-[9px] uppercase">
                    Active Gym
                  </span>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold text-white font-mono uppercase">
                      {user.activeGymDetails.name}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-[#22d3ee] font-mono font-bold text-xs">
                      <MapPin className="h-3.5 w-3.5" /> {user.activeGymDetails.address || "Main Branch"}
                    </div>
                  </div>
                  
                  <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-xl font-medium">
                    You are an active member of {user.activeGymDetails.name}. Track your attendance splits, notifications, and equipment lists.
                  </p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(ROUTES.USER_GYM_DASHBOARD); }} 
                      className="duo-btn-cyan px-5 py-2.5 text-xs"
                    >
                      Gym Dashboard
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(ROUTES.USER_GYM_EQUIPMENT); }} 
                      className="duo-btn-outline px-5 py-2.5 text-xs"
                    >
                      View Facilities
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!user?.activeGymDetails && (
            <div className="flex justify-end pr-2 -mt-4">
              <Link to={ROUTES.USER_GYMS}>
                <button className="text-xs font-mono font-bold text-[#22d3ee] hover:underline flex items-center gap-1">
                  EXPLORE ALL GYMS <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-[#171717] border-2 border-[#262626] animate-pulse" />
              ))
            ) : gyms.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-2 bg-[#171717] border-2 border-[#262626] rounded-2xl">
                <Dumbbell className="h-10 w-10 mx-auto text-neutral-600" />
                <p className="text-[#a3a3a3] text-sm font-mono font-bold uppercase tracking-wider">NO GYMS REGISTERED</p>
              </div>
            ) : (
              gyms.slice(0, 3).map((gym: IGym & { avgRating?: number, minPlanPrice?: number }) => (
                <div
                  key={gym._id}
                  className="group duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-3xl overflow-hidden flex flex-col justify-between h-[420px]"
                >
                  <div className="relative h-48 bg-[#0d0d0e] overflow-hidden">
                    <img
                      src={gym.profileImage || "/placeholder.svg"}
                      alt={gym.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 h-8 px-2.5 bg-black/40 border border-[#262626] backdrop-blur-md rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="ml-1 text-[10px] font-mono font-bold text-white">{gym.avgRating || 0}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-white uppercase font-mono tracking-tight leading-none truncate">{gym.name}</h4>
                      <div className="flex items-center gap-1.5 text-[#a3a3a3] text-xs font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#22d3ee]" />
                        <span className="truncate">{gym.address || "Main Address"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                      <div>
                        <p className="text-[8px] text-[#a3a3a3] uppercase font-mono font-bold tracking-widest">Starts At</p>
                        <p className="text-lg font-extrabold text-[#22d3ee] font-mono">
                          ₹{gym.minPlanPrice || "---"}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(ROUTES.USER_INDIVIDUAL_GYM.replace(':id', gym._id))}
                        className="duo-btn-outline px-4 py-2 text-xs"
                      >
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Schedule & Nutrition splits */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Workout Schedule */}
          <CyberCard className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold font-mono uppercase text-white">Today's Schedule</h3>
              </div>
              <Link to="/workouts">
                <button className="text-xs font-mono font-bold text-[#a3a3a3] hover:text-[#22d3ee] transition-colors">
                  VIEW FULL
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                [1, 2].map((i) => <div key={i} className="h-16 bg-[#0d0d0e] rounded-xl animate-pulse" />)
              ) : !Array.isArray(workouts) || workouts.length === 0 ? (
                <div className="py-10 text-center space-y-4 bg-[#0d0d0e]/30 rounded-xl border border-[#262626] border-dashed">
                  <Activity className="h-8 w-8 mx-auto text-neutral-600" />
                  <p className="text-xs text-[#a3a3a3] font-mono font-bold uppercase">NO WORKOUTS SCHEDULED</p>
                  <button 
                    onClick={() => navigate("/workouts/add")} 
                    className="duo-btn-outline px-4 py-2 text-[10px]"
                  >
                    Add Session
                  </button>
                </div>
              ) : (
                workouts.slice(0, 3).map((workout) => (
                  <div
                    key={workout._id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${workout.isDone
                      ? "bg-emerald-950/20 border-emerald-900/30"
                      : "bg-[#0d0d0e] border-[#262626]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${workout.isDone ? "bg-emerald-400" : "bg-cyan-500"}`} />
                      <div>
                        <h4 className={`text-sm font-bold ${workout.isDone ? "line-through text-neutral-500" : "text-white"}`}>
                          {workout.name}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-[#a3a3a3] font-mono mt-0.5 font-bold">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {workout.time}</span>
                          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {workout.exercises?.length || 0} SETS</span>
                        </div>
                      </div>
                    </div>
                    {workout.isDone ? (
                      <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 uppercase">
                        DONE
                      </span>
                    ) : (
                      <button 
                        onClick={() => navigate(ROUTES.USER_START_WORKOUT.replace(':id', workout._id))}
                        className="duo-btn-cyan px-3 py-1.5 text-[10px]"
                      >
                        Start
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CyberCard>

          {/* Nutrition plan */}
          <CyberCard className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                  <Apple className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold font-mono uppercase text-white">Nutrition log</h3>
              </div>
              <Link to="/diets">
                <button className="text-xs font-mono font-bold text-[#a3a3a3] hover:text-[#22d3ee] transition-colors">
                  LOG MEAL
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-[#0d0d0e] rounded-xl animate-pulse" />)
              ) : !diet?.meals || diet.meals.length === 0 ? (
                <div className="col-span-full py-10 text-center bg-[#0d0d0e]/30 rounded-xl border border-[#262626] border-dashed">
                  <Apple className="h-8 w-8 mx-auto text-neutral-600 mb-2" />
                  <p className="text-xs text-[#a3a3a3] font-mono font-bold uppercase">NO MEALS LOGGED YET</p>
                </div>
              ) : (
                (diet.meals.length > 0 ? diet.meals : (diet.templateMeals || [])).slice(0, 4).map((meal) => (
                  <div
                    key={meal._id}
                    className={`p-4 rounded-xl border ${meal.isEaten
                      ? "bg-emerald-950/20 border-emerald-900/30"
                      : "bg-[#0d0d0e] border-[#262626]"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <h4 className="font-bold text-xs truncate pr-2 text-white">{meal.name}</h4>
                      <div className={`w-2 h-2 rounded-full ${meal.isEaten ? "bg-emerald-400" : "bg-neutral-600"}`} />
                    </div>
                    <div className="flex items-center justify-between text-[8px] font-mono font-bold uppercase tracking-widest text-[#a3a3a3]">
                      <div className="flex flex-col">
                        <span>CALS</span>
                        <span className="text-white text-xs mt-0.5">{meal.calories}</span>
                      </div>
                      <div className="flex flex-col">
                        <span>PROT</span>
                        <span className="text-white text-xs mt-0.5">{meal.protein}g</span>
                      </div>
                      <div className="flex flex-col">
                        <span>TIME</span>
                        <span className="text-white text-xs mt-0.5">{meal.time}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CyberCard>
        </section>

        {/* Quick Actions Grid */}
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-white font-mono uppercase px-2">
            Quick Actions
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Start Workout", desc: "Launch active session", icon: Dumbbell, path: "/workouts" },
              { title: "Log Nutrition", desc: "Track daily intake", icon: Apple, path: "/diets" },
              { title: "Find Coaches", desc: "Expert personalized help", icon: Users, path: "/trainers" },
              { title: "Analytics", desc: "View detailed progress", icon: Award, path: "/dashboard" },
            ].map((action, i) => (
              <div
                key={i}
                onClick={() => navigate(action.path)}
                className="group cursor-pointer duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-3xl p-6"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0d0d0e] border border-[#262626] flex items-center justify-center text-[#22d3ee] group-hover:text-white group-hover:bg-[#22d3ee] transition-colors">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white uppercase font-mono tracking-wide">{action.title}</h4>
                    <p className="text-[#a3a3a3] text-xs font-medium mt-0.5">{action.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </motion.main>
      
      <SiteFooter />
    </div>
  );
}
