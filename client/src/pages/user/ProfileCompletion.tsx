import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { updateProfile } from "@/services/userService";
import { updateUser } from "@/redux/slices/userAuthSlice";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Dumbbell, 
  Flame, 
  Calendar, 
  Heart, 
  Trophy, 
  Lock, 
  Activity 
} from "lucide-react";

// SVG Asset Imports
import fitnessTrackingSvg from "@/assets/2dAnimation/fitness-tracking.svg";
import goalsSvg from "@/assets/2dAnimation/goals.svg";
import beginnerSvg from "@/assets/2dAnimation/beginner.svg";
import intermediateSvg from "@/assets/2dAnimation/intermediate.svg";
import advancedSvg from "@/assets/2dAnimation/advanced.svg";
import dateCheckSvg from "@/assets/2dAnimation/date-check.svg";
import planReadySvg from "@/assets/2dAnimation/plan-ready.svg";
import letsgooSvg from "@/assets/2dAnimation/letsgoo.svg";

// Goal Options (5 goals, including Build Confidence)
const goalOptions = [
  {
    id: "Build Muscle",
    title: "Build Muscle",
    description: "Unlock Strength Challenges",
    icon: Dumbbell,
    xpReward: 100,
  },
  {
    id: "Lose Weight",
    title: "Lose Weight",
    description: "Unlock Fat Burn Missions",
    icon: Flame,
    xpReward: 100,
  },
  {
    id: "Stay Consistent",
    title: "Stay Consistent",
    description: "Unlock Consistency Trials",
    icon: Calendar,
    xpReward: 100,
  },
  {
    id: "Improve Health",
    title: "Improve Health",
    description: "Unlock Vitality Quests",
    icon: Heart,
    xpReward: 100,
  },
  {
    id: "Build Confidence",
    title: "Build Confidence",
    description: "Unlock Self-Esteem Quests",
    icon: Trophy,
    xpReward: 100,
  }
];

// Difficulty Options
const difficultyOptions = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Start small and build momentum.",
    badge: "EASY",
    xpReward: 50,
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Balanced progression and volume.",
    badge: "MEDIUM",
    xpReward: 100,
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Push harder and earn maximum rewards.",
    badge: "HARD",
    xpReward: 150,
  }
];

export default function ProfileCompletion() {
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("Build Muscle");
  const [selectedDifficulty, setSelectedDifficulty] = useState("intermediate");
  const [selectedDays, setSelectedDays] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.userAuth.user);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`onboarding_simple_progress_${user._id}`);
      if (saved) {
        try {
          const { step: savedStep, goal, difficulty, days } = JSON.parse(saved);
          if (savedStep >= 1 && savedStep <= 6) setStep(savedStep);
          if (goal) setSelectedGoal(goal);
          if (difficulty) setSelectedDifficulty(difficulty);
          if (days) setSelectedDays(days);
        } catch (e) {
          console.error("Error reading saved onboarding state", e);
        }
      }
    }
  }, [user]);

  // Save progress locally
  const saveLocalProgress = (nextStep: number) => {
    if (user) {
      localStorage.setItem(
        `onboarding_simple_progress_${user._id}`,
        JSON.stringify({
          step: nextStep,
          goal: selectedGoal,
          difficulty: selectedDifficulty,
          days: selectedDays
        })
      );
    }
  };

  const handleNext = () => {
    const nextStep = step + 1;
    setStep(nextStep);
    saveLocalProgress(nextStep);
  };

  const handleBack = () => {
    const prevStep = step - 1;
    setStep(prevStep);
    saveLocalProgress(prevStep);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowCelebration(true);
    
    setTimeout(async () => {
      try {
        let mappedGoals = ["General Fitness"];
        if (selectedGoal === "Build Muscle") mappedGoals = ["Muscle Gain", "Strength Training"];
        else if (selectedGoal === "Lose Weight") mappedGoals = ["Weight Loss", "Body Toning"];
        else if (selectedGoal === "Stay Consistent") mappedGoals = ["General Fitness"];
        else if (selectedGoal === "Improve Health") mappedGoals = ["General Fitness", "Endurance"];
        else if (selectedGoal === "Build Confidence") mappedGoals = ["General Fitness", "Mental Wellness"];

        const submitData = new FormData();
        submitData.append("height", "175");
        submitData.append("todaysWeight", "70");
        submitData.append("goalWeight", "70");
        submitData.append("gender", "male");
        submitData.append("age", "25");
        submitData.append("goals", JSON.stringify(mappedGoals));
        submitData.append("activityLevel", "moderately_active");
        submitData.append("workoutExperience", selectedDifficulty);
        submitData.append("weeklyAvailability", selectedDays.toString());
        submitData.append("workoutDuration", "60");
        submitData.append("equipment", "true");
        submitData.append("availableEquipment", "Dumbbells");
        submitData.append("medicalConditions", "None");
        submitData.append("dietaryPreferences", "non-vegetarian");
        
        submitData.append("onboardingStep", "analysis");

        const response = await updateProfile(submitData);
        dispatch(updateUser(response.user));

        if (user) {
          localStorage.removeItem(`onboarding_simple_progress_${user._id}`);
        }

        navigate("/onboarding/analysis");
      } catch (err) {
        toast.error("Profile compilation failed. Please try again.");
        setShowCelebration(false);
        setIsSubmitting(false);
      }
    }, 1800);
  };

  const getXPEarned = () => {
    let xp = 50; // base Welcome XP
    if (step >= 2) xp += 100;
    if (step >= 3) {
      const diffOpt = difficultyOptions.find(d => d.id === selectedDifficulty);
      xp += diffOpt ? diffOpt.xpReward : 100;
    }
    if (step >= 4) xp += selectedDays * 25;
    if (step >= 5) xp += 150;
    return xp;
  };

  const getDifficultySvg = () => {
    if (selectedDifficulty === "beginner") return beginnerSvg;
    if (selectedDifficulty === "advanced") return advancedSvg;
    return intermediateSvg;
  };

  const currentXPEarned = getXPEarned();

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-[#0d0d0e] text-[#f5f5f5] flex flex-col justify-between overflow-x-hidden font-sans relative">
      
      {/* Celebratory Transition Screen */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#09090a]/95 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="space-y-6 max-w-sm"
            >
              <div className="w-20 h-20 bg-cyan-500/10 border-2 border-cyan-500/35 rounded-full flex items-center justify-center mx-auto relative">
                <Trophy className="h-10 w-10 text-[#22d3ee] animate-bounce" />
                <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-[#22d3ee] animate-spin"></div>
              </div>
              
              <div className="space-y-2 px-4 font-outfit">
                <h2 className="text-2xl font-black tracking-tight text-white uppercase">Journey Created!</h2>
                <p className="text-[#a3a3a3] text-sm leading-relaxed font-medium">Configuring targets and creating weekly quests...</p>
              </div>

              <div className="flex justify-center gap-1.5 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Progress HUD */}
      <div className="w-full border-b border-[#1f1f1f] bg-[#09090a] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-[#a3a3a3] font-mono tracking-wider font-bold">
            <span className="flex items-center gap-2 text-white font-outfit font-black text-sm">
              <Activity className="w-4 h-4 text-[#22d3ee]" />
              TRAINUP
            </span>
            <div className="flex items-center gap-6">
              <span>STEP {step} OF 6</span>
              <span className="text-[#22d3ee] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-[#22d3ee]/20" />
                XP: {currentXPEarned}
              </span>
            </div>
          </div>
          
          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-[#171717] rounded-full overflow-hidden border border-[#262626] p-0.5">
            <motion.div 
              initial={{ width: `${((step - 1) / 6) * 100}%` }}
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full bg-cyan-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Spacious Content - Split layout */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 md:py-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            
            {/* PAGE 1: WELCOME SCREEN */}
            {step === 1 && (
              <>
                {/* Left Column: Greeting */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col justify-center items-center lg:items-start">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171717] border border-[#262626] text-[#22d3ee] font-mono text-[9px] tracking-wider uppercase font-bold">
                      <Sparkles className="w-3 h-3 text-[#22d3ee]" />
                      INITIALIZING SESSION
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase font-outfit leading-none">
                      Welcome to <br />
                      <span className="text-[#22d3ee]">TrainUp</span>
                    </h1>
                    <p className="text-[#a3a3a3] text-base md:text-lg font-medium leading-relaxed max-w-md font-inter">
                      Build your training consistency. Earn rewards, log biometrics, and level up your physical avatar.
                    </p>
                  </div>
                  
                  <div className="pt-6 w-full max-w-sm">
                    <button 
                      onClick={handleNext}
                      className="duo-btn-cyan w-full py-4 text-xs font-mono font-bold tracking-wider"
                    >
                      BEGIN QUEST
                    </button>
                  </div>
                </div>
                
                {/* Right Column: Welcome SVG */}
                <div className="lg:col-span-5 flex justify-center items-center order-first lg:order-last">
                  <div className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-none flex justify-center relative group">
                    <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[70px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <img 
                      src={fitnessTrackingSvg} 
                      alt="TrainUp Fitness Onboarding" 
                      className="w-full h-auto max-h-[300px] object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-pulse-cyan" 
                    />
                  </div>
                </div>
              </>
            )}

            {/* PAGE 2: CHOOSE YOUR GOAL */}
            {step === 2 && (
              <>
                {/* Left Column: Form Choices */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-outfit">Choose Your Goal</h1>
                    <p className="text-[#a3a3a3] text-sm md:text-base font-medium max-w-lg leading-relaxed">Select your primary focus area to personalize your daily training splits.</p>
                  </div>

                  <div className="space-y-3 pt-2 w-full max-w-lg">
                    {goalOptions.map(option => {
                      const isSelected = selectedGoal === option.id;
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedGoal(option.id)}
                          className={`duo-selection-card p-4 flex items-center justify-between ${isSelected ? "selected" : ""}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl border transition-colors ${
                              isSelected ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-[#262626] bg-[#0d0d0e] text-[#a3a3a3]"
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-left space-y-0.5">
                              <h3 className="font-extrabold text-[#f5f5f5] text-sm md:text-base leading-none">{option.title}</h3>
                              <p className="text-xs text-[#a3a3a3] font-medium leading-none">{option.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#22d3ee] bg-[#22d3ee]/10 px-2 py-0.5 rounded">
                              +{option.xpReward} XP
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-[#262626]"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Right Column: Goal Illustration */}
                <div className="lg:col-span-5 flex justify-center items-center order-first lg:order-last">
                  <div className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-none flex justify-center relative group">
                    <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[70px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <img 
                      src={goalsSvg} 
                      alt="Goals Setting" 
                      className="w-full h-auto max-h-[300px] object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                    />
                  </div>
                </div>
              </>
            )}

            {/* PAGE 3: CHOOSE YOUR DIFFICULTY */}
            {step === 3 && (
              <>
                {/* Left Column: Form Choices */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-outfit">Choose Your Difficulty</h1>
                    <p className="text-[#a3a3a3] text-sm md:text-base font-medium max-w-lg leading-relaxed">Select the training intensity matrix that fits your capacity.</p>
                  </div>

                  <div className="space-y-3.5 max-w-lg pt-2">
                    {difficultyOptions.map(option => {
                      const isSelected = selectedDifficulty === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => setSelectedDifficulty(option.id)}
                          className={`duo-selection-card p-4 flex items-center justify-between ${isSelected ? "selected" : ""}`}
                        >
                          <div className="space-y-1 pr-4 text-left">
                            <div className="flex items-center gap-2.5">
                              <h3 className="font-extrabold text-[#f5f5f5] text-sm md:text-base leading-none">{option.title}</h3>
                              <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold tracking-wider ${
                                option.badge === "HARD" ? "bg-red-950/40 text-red-400 border border-red-900/30" : 
                                option.badge === "MEDIUM" ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" : 
                                "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                              }`}>
                                {option.badge}
                              </span>
                            </div>
                            <p className="text-xs text-[#a3a3a3] font-medium leading-none">{option.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#22d3ee] bg-[#22d3ee]/10 px-2 py-0.5 rounded">
                              +{option.xpReward} XP
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-[#262626]"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Right Column: Dynamic SVG matching selection */}
                <div className="lg:col-span-5 flex justify-center items-center order-first lg:order-last">
                  <div className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-none flex justify-center relative group">
                    <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[70px] rounded-full opacity-60 pointer-events-none" />
                    <img 
                      src={getDifficultySvg()} 
                      alt="Difficulty Tier" 
                      className="w-full h-auto max-h-[300px] object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                    />
                  </div>
                </div>
              </>
            )}

            {/* PAGE 4: WEEKLY TRAINING GOAL */}
            {step === 4 && (
              <>
                {/* Left Column: Days Toggles & Info */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-outfit">How many days can you train?</h1>
                    <p className="text-[#a3a3a3] text-sm md:text-base font-medium max-w-lg leading-relaxed">Commit to your weekly training objectives. Consistency triggers progress multipliers.</p>
                  </div>

                  <div className="space-y-6 pt-4 max-w-lg">
                    {/* Days Selection Matrix */}
                    <div className="flex justify-between items-center gap-2 px-1">
                      {[1, 2, 3, 4, 5, 6, 7].map(day => {
                        const isActive = selectedDays >= day;
                        const isExactlySelected = selectedDays === day;
                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDays(day)}
                            className={`flex-1 h-12 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${
                              isActive
                                ? "border-[#22d3ee] bg-cyan-500/10 text-white" 
                                : "border-[#262626] bg-[#171717] text-[#a3a3a3] hover:border-[#404040]"
                            } ${isExactlySelected ? "ring-2 ring-[#22d3ee] ring-offset-2 ring-offset-[#0d0d0e]" : ""}`}
                          >
                            <span className="text-base font-extrabold leading-none">{day}</span>
                            <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-[#a3a3a3] mt-1">DAYS</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Info Card */}
                    <div className="p-5 rounded-xl bg-[#171717] border border-[#262626] space-y-3 max-w-xs">
                      <div className="flex justify-between items-center font-mono text-xs text-[#a3a3a3] font-bold">
                        <span>WEEKLY COMMIT</span>
                        <span className="text-[#22d3ee]">{selectedDays} WORKOUTS</span>
                      </div>
                      <div className="h-px bg-[#262626] w-full"></div>
                      <div className="flex justify-between items-center font-mono text-xs font-bold">
                        <span className="text-[#a3a3a3]">ESTIMATED BUDGET</span>
                        <span className="text-[#22d3ee] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 fill-[#22d3ee]/20" />
                          +{selectedDays * 200} XP / WEEK
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Time Commitment Illustration */}
                <div className="lg:col-span-5 flex justify-center items-center order-first lg:order-last">
                  <div className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-none flex justify-center relative group">
                    <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[70px] rounded-full opacity-60 pointer-events-none" />
                    <img 
                      src={dateCheckSvg} 
                      alt="Weekly Calendar Commitment" 
                      className="w-full h-auto max-h-[300px] object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                    />
                  </div>
                </div>
              </>
            )}

            {/* PAGE 5: BUILD YOUR PLAN */}
            {step === 5 && (
              <>
                {/* Left Column: Progress Info */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-outfit">Your plan is calibrated</h1>
                    <p className="text-[#a3a3a3] text-sm md:text-base font-medium max-w-lg leading-relaxed">TrainUp is configuring your training schedule, target parameters, and locking in rewards.</p>
                  </div>

                  <div className="space-y-6 pt-2 max-w-lg">
                    {/* Emblem Level Card */}
                    <div className="p-5 rounded-xl bg-[#171717] border-2 border-[#262626] border-bottom-5 flex items-center justify-between gap-6">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#22d3ee] uppercase">CALIBRATING PROTOCOLS</span>
                        </div>
                        <h3 className="font-extrabold text-white text-base leading-snug">LEVEL 1 RECRUIT STATUS</h3>
                        <p className="text-xs text-[#a3a3a3]">XP Multiplier locked at <strong className="text-[#22d3ee] font-bold">1.0x</strong>. Consistent logs boost multiplier ranks.</p>
                      </div>

                      <div className="w-12 h-12 bg-[#0d0d0e] border border-[#262626] rounded-xl flex items-center justify-center flex-shrink-0 text-[#22d3ee]">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Unlocks Deck */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-mono font-bold text-[#a3a3a3] tracking-wider uppercase">UPCOMING REWARD MILESTONES</span>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { title: "Day 1 Quest", desc: "First Log Milestone" },
                          { title: "Consistent Stack", desc: "Unlock 7-Day Streaks" },
                          { title: "Nutritional Cap", desc: "Log Food Ledger" },
                          { title: "Recruit Master", desc: "Level 2 Rank Unlock" }
                        ].map((unlock, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[#171717]/40 border border-[#262626] flex items-center gap-3 opacity-60">
                            <Lock className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                            <div className="text-[10px] text-left space-y-0.5">
                              <div className="font-extrabold text-[#f5f5f5] leading-tight">{unlock.title}</div>
                              <div className="text-[#a3a3a3] font-medium leading-none">{unlock.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Calibration Illustration */}
                <div className="lg:col-span-5 flex justify-center items-center order-first lg:order-last">
                  <div className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-none flex justify-center relative group">
                    <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[70px] rounded-full opacity-60 pointer-events-none" />
                    <img 
                      src={planReadySvg} 
                      alt="Plan Ready" 
                      className="w-full h-auto max-h-[300px] object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                    />
                  </div>
                </div>
              </>
            )}

            {/* PAGE 6: YOUR JOURNEY BEGINS */}
            {step === 6 && (
              <>
                {/* Left Column: Summary */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase font-outfit">Ready to Start?</h1>
                    <p className="text-[#a3a3a3] text-sm md:text-base font-medium max-w-lg leading-relaxed">Your fitness avatar parameters have been successfully logged. Initialize dashboard below.</p>
                  </div>

                  <div className="space-y-6 pt-2 max-w-lg text-left">
                    <div className="p-5 rounded-xl bg-[#171717] border border-[#262626] space-y-3.5">
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-[#a3a3a3] font-mono font-bold">QUEST OBJECTIVE:</span>
                        <span className="text-white font-extrabold">{selectedGoal.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-[#a3a3a3] font-mono font-bold">INTENSITY TIER:</span>
                        <span className="text-white font-extrabold">{selectedDifficulty.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs md:text-sm">
                        <span className="text-[#a3a3a3] font-mono font-bold">AVAILABILITY:</span>
                        <span className="text-white font-extrabold">{selectedDays} DAYS / WEEK</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono font-bold text-[#a3a3a3]">
                        <span>INITIAL EXPERIENCE TRACK</span>
                        <span className="text-[#22d3ee] font-black">{currentXPEarned} / 500 XP</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#171717] rounded-full overflow-hidden border border-[#262626] p-0.5">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(currentXPEarned / 500) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 w-full max-w-xs mx-auto lg:mx-0">
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="duo-btn-cyan w-full py-4 text-xs font-mono font-bold tracking-wider"
                    >
                      {isSubmitting ? "COMPILING PROFILE..." : "Begin Journey"}
                    </button>
                  </div>
                </div>
                
                {/* Right Column: Final Let's Go Illustration */}
                <div className="lg:col-span-5 flex justify-center items-center order-first lg:order-last">
                  <div className="w-full max-w-[200px] sm:max-w-[240px] lg:max-w-none flex justify-center relative group">
                    <div className="absolute inset-0 bg-[#22d3ee]/5 blur-[70px] rounded-full opacity-60 pointer-events-none" />
                    <img 
                      src={letsgooSvg} 
                      alt="Let's Go Fitness Quest" 
                      className="w-full h-auto max-h-[300px] object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" 
                    />
                  </div>
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      {step > 1 && (
        <div className="w-full bg-[#09090a] border-t border-[#1f1f1f] py-5 sticky bottom-0 z-30">
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="duo-btn-gray px-5 py-3 text-xs font-mono font-bold tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" /> BACK
            </button>

            {step < 6 && (
              <button
                onClick={handleNext}
                className="duo-btn-cyan px-6 py-3 text-xs font-mono font-bold tracking-wider"
              >
                CONTINUE <ArrowRight className="w-4 h-4 ml-2 inline" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
