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
  Shield, 
  Activity 
} from "lucide-react";

// Goal Options
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
    description: "Balanced progression.",
    badge: "MEDIUM",
    xpReward: 100,
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Push harder and earn more.",
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
              
              <div className="space-y-2 px-4">
                <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Journey Created!</h2>
                <p className="text-[#a3a3a3] text-xs leading-relaxed">Configuring targets and creating weekly quests...</p>
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
        <div className="max-w-2xl mx-auto px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-[#a3a3a3] font-mono tracking-widest font-bold">
            <span className="flex items-center gap-2 text-white">
              <Activity className="w-4 h-4 text-[#22d3ee]" />
              TRAINUP
            </span>
            <div className="flex items-center gap-6">
              <span>STEP {step} OF 6</span>
              <span className="text-[#22d3ee] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-[#22d3ee]/20" />
                XP: {currentXPEarned}
              </span>
            </div>
          </div>
          
          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-[#171717] rounded-full overflow-hidden border border-[#262626]">
            <motion.div 
              initial={{ width: `${((step - 1) / 6) * 100}%` }}
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full bg-cyan-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Main Spacious Content */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full space-y-8"
          >
            
            {/* PAGE 1: WELCOME SCREEN */}
            {step === 1 && (
              <div className="space-y-12 text-center py-6">
                <div className="space-y-4 px-4">
                  <h1 className="text-4xl font-extrabold tracking-tight text-white font-mono uppercase">
                    Welcome to TrainUp
                  </h1>
                  <p className="text-[#a3a3a3] text-sm max-w-md mx-auto leading-relaxed font-medium">
                    Build consistency. Earn XP. Level up your fitness.
                  </p>
                </div>
                
                {/* Premium Abstract HUD Element (replacing SVG stickman) */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="w-40 h-40 rounded-full border-2 border-dashed border-[#262626] flex items-center justify-center relative p-3">
                    <div className="absolute inset-0 rounded-full border border-cyan-500/10 animate-pulse-cyan"></div>
                    <div className="w-full h-full rounded-full bg-[#171717] border border-[#262626] flex flex-col items-center justify-center space-y-1.5">
                      <Shield className="w-10 h-10 text-[#22d3ee]" />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-[#a3a3a3] uppercase">RECRUIT</span>
                      <span className="text-xs font-mono font-bold text-white bg-[#0d0d0e] border border-[#262626] px-2.5 py-0.5 rounded-full">LEVEL 1</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 max-w-xs mx-auto">
                  <button 
                    onClick={handleNext}
                    className="duo-btn-cyan w-full py-4 text-sm"
                  >
                    Begin Journey
                  </button>
                </div>
              </div>
            )}

            {/* PAGE 2: CHOOSE YOUR GOAL */}
            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center space-y-3 px-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">Choose Your Goal</h1>
                  <p className="text-[#a3a3a3] text-sm max-w-md mx-auto leading-relaxed">Select your primary focus area to build your program</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {goalOptions.map(option => {
                    const isSelected = selectedGoal === option.id;
                    const Icon = option.icon;
                    return (
                      <div
                        key={option.id}
                        onClick={() => setSelectedGoal(option.id)}
                        className={`duo-selection-card p-6 flex items-start gap-4 ${isSelected ? "selected" : ""}`}
                      >
                        <div className={`p-3 rounded-xl border-2 transition-colors ${
                          isSelected ? "border-[#22d3ee] bg-cyan-500/5 text-[#22d3ee]" : "border-[#262626] bg-[#0d0d0e] text-[#a3a3a3]"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-[#f5f5f5] text-base leading-none">{option.title}</h3>
                          <p className="text-xs text-[#a3a3a3] font-medium leading-relaxed">{option.description}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#22d3ee] mt-1.5">
                            <Sparkles className="w-3 h-3" /> +{option.xpReward} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAGE 3: CHOOSE YOUR DIFFICULTY */}
            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center space-y-3 px-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">Choose Your Difficulty</h1>
                  <p className="text-[#a3a3a3] text-sm max-w-md mx-auto leading-relaxed">Select the tier matching your execution capacity</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5 max-w-lg mx-auto pt-2">
                  {difficultyOptions.map(option => {
                    const isSelected = selectedDifficulty === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => setSelectedDifficulty(option.id)}
                        className={`duo-selection-card p-5 flex items-center justify-between ${isSelected ? "selected" : ""}`}
                      >
                        <div className="space-y-1.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-bold text-[#f5f5f5] text-base leading-none">{option.title}</h3>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-wider ${
                              option.badge === "HARD" ? "bg-red-950/40 text-red-400 border border-red-900/30" : 
                              option.badge === "MEDIUM" ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" : 
                              "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30"
                            }`}>
                              {option.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#a3a3a3] font-medium leading-relaxed">{option.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-[#22d3ee] bg-[#22d3ee]/10 text-[#22d3ee]" : "border-[#262626]"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAGE 4: WEEKLY TRAINING GOAL */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="text-center space-y-3 px-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">How many days can you train?</h1>
                  <p className="text-[#a3a3a3] text-sm max-w-md mx-auto leading-relaxed">Commit to your weekly training nodes</p>
                </div>

                <div className="max-w-lg mx-auto space-y-10 pt-4">
                  {/* Energy Cells Selection Nodes */}
                  <div className="flex justify-between items-center gap-2.5 px-1.5">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => {
                      const isActive = selectedDays >= day;
                      const isExactlySelected = selectedDays === day;
                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDays(day)}
                          className={`flex-1 h-14 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center transition-all ${
                            isActive
                              ? "border-[#22d3ee] bg-cyan-500/10 text-white" 
                              : "border-[#262626] bg-[#171717] text-[#a3a3a3] hover:border-[#404040]"
                          } ${isExactlySelected ? "ring-2 ring-[#22d3ee] ring-offset-2 ring-offset-[#0d0d0e]" : ""}`}
                        >
                          <span className="text-sm font-bold leading-none">{day}</span>
                          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#a3a3a3] mt-1.5">DAYS</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Box */}
                  <div className="p-6 rounded-xl bg-[#171717] border border-[#262626] space-y-4 max-w-xs mx-auto">
                    <div className="flex justify-between items-center font-mono text-xs text-[#a3a3a3] font-bold">
                      <span>WEEKLY PLAN</span>
                      <span className="text-[#22d3ee]">{selectedDays} DAYS / WEEK</span>
                    </div>

                    <div className="h-px bg-[#262626] w-full"></div>

                    <div className="flex justify-between items-center font-mono text-xs font-bold">
                      <span className="text-[#a3a3a3]">ESTIMATED ACTIVITY</span>
                      <span className="text-[#22d3ee] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 fill-[#22d3ee]/20" />
                        {selectedDays * 200} XP / WEEK
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 5: BUILD YOUR PLAN */}
            {step === 5 && (
              <div className="space-y-8">
                <div className="text-center space-y-3 px-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">Your Journey is Ready</h1>
                  <p className="text-[#a3a3a3] text-sm max-w-md mx-auto leading-relaxed">Creating target profiles and calibration stats</p>
                </div>

                <div className="max-w-md mx-auto space-y-8 pt-4">
                  {/* Level 1 Recruit Emblem Card */}
                  <div className="p-6 rounded-2xl bg-[#171717] border-2 border-[#262626] border-bottom-5 flex items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#22d3ee]" />
                        <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">LEVEL 1 RECRUIT</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-[#a3a3a3]">Weekly split: <strong className="text-[#f5f5f5] font-bold">{selectedDays} Workouts</strong></p>
                        <p className="text-xs text-[#a3a3a3]">Weekly rewards: <strong className="text-[#22d3ee] font-bold">{selectedDays * 200} XP</strong></p>
                      </div>
                    </div>

                    <div className="w-14 h-14 bg-[#0d0d0e] border border-[#262626] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#22d3ee]">
                        <path d="M12 2L2 7l10 15 10-15-10-5z" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <text x="12" y="16" fontSize="10" fontWeight="bold" textAnchor="middle" fill="currentColor" fontFamily="sans-serif">1</text>
                      </svg>
                    </div>
                  </div>

                  {/* Upcoming Unlocks Preview Grid */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-mono font-bold text-[#a3a3a3] tracking-widest uppercase">UPCOMING JOURNEY REWARDS</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: "First Workout", desc: "First Workout Badge" },
                        { title: "7-Day Streak", desc: "7-Day Streak Badge" },
                        { title: "Consistency", desc: "Bronze Badge" },
                        { title: "Tier Expansion", desc: "Level 2 Unlock" }
                      ].map((unlock, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#171717]/50 border border-[#262626] flex items-center gap-3 opacity-60">
                          <Lock className="w-4 h-4 text-[#a3a3a3] flex-shrink-0" />
                          <div className="text-[10px] space-y-0.5">
                            <div className="font-bold text-[#f5f5f5] leading-tight">{unlock.title}</div>
                            <div className="text-[#a3a3a3] font-medium leading-none">{unlock.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 6: YOUR JOURNEY BEGINS */}
            {step === 6 && (
              <div className="space-y-8">
                <div className="text-center space-y-3 px-4">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">Ready to Start?</h1>
                  <p className="text-[#a3a3a3] text-sm max-w-md mx-auto leading-relaxed">Confirm details and instantiate your fitness persona</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-xl mx-auto pt-4">
                  
                  {/* Left Column: Premium Active Badge Emblem */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#171717] border border-[#262626] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_70%)]"></div>
                    <div className="w-24 h-24 bg-[#0d0d0e] border-2 border-cyan-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative">
                      <Shield className="w-12 h-12 text-[#22d3ee] fill-cyan-500/5" />
                      <div className="absolute inset-0 rounded-2xl border border-cyan-500/10 animate-ping opacity-15"></div>
                    </div>
                    <span className="text-[10px] text-[#22d3ee] font-mono font-bold tracking-widest mt-4 uppercase">AVATAR LOGS READY</span>
                  </div>

                  {/* Right Column: Selections Summary */}
                  <div className="space-y-5 flex flex-col justify-between">
                    <div className="p-5 rounded-xl bg-[#171717] border border-[#262626] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#a3a3a3] font-mono font-bold">FITNESS GOAL:</span>
                        <span className="text-white font-bold">{selectedGoal.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#a3a3a3] font-mono font-bold">DIFFICULTY:</span>
                        <span className="text-white font-bold">{selectedDifficulty.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#a3a3a3] font-mono font-bold">WEEKLY PLAN:</span>
                        <span className="text-white font-bold">{selectedDays} WORKOUT DAYS</span>
                      </div>
                    </div>

                    {/* Final Progression Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono font-bold text-[#a3a3a3]">
                        <span>INITIAL PROGRESS TRACK</span>
                        <span className="text-[#22d3ee]">{currentXPEarned} / 500 XP</span>
                      </div>
                      <div className="w-full h-2 bg-[#171717] rounded-full overflow-hidden border border-[#262626]">
                        <div 
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${(currentXPEarned / 500) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 max-w-xs mx-auto">
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="duo-btn-cyan w-full py-4 text-sm"
                  >
                    {isSubmitting ? "COMPILING PROFILE..." : "Begin Journey"}
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      {step > 1 && (
        <div className="w-full bg-[#09090a] border-t border-[#1f1f1f] py-5 sticky bottom-0 z-30">
          <div className="max-w-2xl mx-auto px-6 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="duo-btn-gray px-5 py-3 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" /> BACK
            </button>

            {step < 6 && (
              <button
                onClick={handleNext}
                className="duo-btn-cyan px-6 py-3 text-xs"
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
