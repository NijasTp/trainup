import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Check, BrainCircuit, Heart, Zap, Sparkles } from "lucide-react";
import { updateProfile } from "@/services/userService";
import { updateUser } from "@/redux/slices/userAuthSlice";

export default function OnboardingAnalysis() {
  const [loadingStage, setLoadingStage] = useState(0);
  const [stagesDone, setStagesDone] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.userAuth.user);

  const stages = [
    "Current Status Analysis",
    "Creating Your Training Plan",
    "Calculating Weekly Targets",
    "Preparing Your Progress Journey"
  ];

  // Redirect to login if user not available
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Stage timer simulation
  useEffect(() => {
    if (loadingStage < stages.length) {
      const timer = setTimeout(() => {
        setStagesDone(prev => [...prev, loadingStage]);
        setLoadingStage(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [loadingStage]);

  if (!user) return null;

  // Biometric calculations (using default values stored in user)
  const weight = user.weight || 70;
  const height = user.height || 175;
  const age = user.age || 25;
  const gender = user.gender || "male";
  const activityLevel = user.activityLevel || "moderately_active";
  const goals = user.goals || ["General Fitness"];

  // BMI Calculation
  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  let bmiCategory = "Normal";
  let bmiColor = "text-[#22d3ee]";
  if (bmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-[#67e8f9]";
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = "Overweight";
    bmiColor = "text-amber-400";
  } else if (bmi >= 30) {
    bmiCategory = "Obese";
    bmiColor = "text-red-400";
  }

  // BMR & TDEE Calculations
  let bmr = 0;
  if (gender === "male") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else if (gender === "female") {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  } else {
    const bmrMale = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    const bmrFemale = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    bmr = (bmrMale + bmrFemale) / 2;
  }

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  const multiplier = multipliers[activityLevel] || 1.55;
  const tdee = bmr * multiplier;

  let targetCalories = Math.round(tdee);
  let goalText = "Maintenance Target";
  
  if (goals.some((g: string) => g.toLowerCase().includes("loss") || g.toLowerCase().includes("toning") || g.toLowerCase().includes("weight"))) {
    targetCalories = Math.round(tdee - 500);
    goalText = "Caloric Deficit Target";
  } else if (goals.some((g: string) => g.toLowerCase().includes("gain") || g.toLowerCase().includes("strength") || g.toLowerCase().includes("muscle"))) {
    targetCalories = Math.round(tdee + 300);
    goalText = "Caloric Surplus Target";
  }

  const handleNext = async () => {
    setIsSaving(true);
    try {
      const submitData = new FormData();
      submitData.append("onboardingStep", "challenge");
      const response = await updateProfile(submitData);
      dispatch(updateUser(response.user));
      navigate("/onboarding/challenge");
    } catch (_err) {
      navigate("/onboarding/challenge");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0d0e] text-[#f5f5f5] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      
      {/* Vercel Ambient Dark Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.02)_0%,transparent_70%)] rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-xl relative z-10 py-8">
        {loadingStage < stages.length ? (
          <div className="bg-[#171717] border-2 border-[#262626] border-bottom-5 p-10 rounded-2xl text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-cyan-500/20 bg-cyan-500/5">
                <BrainCircuit className="h-10 w-10 text-[#22d3ee] animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-2 border-[#22d3ee] animate-spin"></div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-mono tracking-wider uppercase text-white flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-[#22d3ee] animate-pulse" />
                Analyzing Selections
              </h2>
              <p className="text-[#a3a3a3] text-xs font-mono">Compiling stats for your journey...</p>
            </div>

            <div className="space-y-3.5 text-left max-w-sm mx-auto font-mono text-xs">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1">
                  <div className="flex-shrink-0">
                    {stagesDone.includes(idx) ? (
                      <div className="p-0.5 rounded-full bg-cyan-500/10 text-[#22d3ee]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    ) : loadingStage === idx ? (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-[#22d3ee] border-t-transparent animate-spin"></div>
                    ) : (
                      <div className="h-3.5 w-3.5 rounded-full bg-[#0d0d0e] border-2 border-[#262626]"></div>
                    )}
                  </div>
                  <span className={stagesDone.includes(idx) ? 'text-[#a3a3a3]' : loadingStage === idx ? 'text-[#22d3ee] font-semibold' : 'text-neutral-600'}>
                    {stage.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#171717] border border-[#262626] text-[#22d3ee] font-mono px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
                CALIBRATION COMPLETE
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">YOUR FITNESS PROTOCOL</h1>
              <p className="text-[#a3a3a3] text-xs font-mono">Weekly plan estimates and initial goals</p>
            </div>

            <div className="bg-[#171717] border-2 border-[#262626] border-bottom-5 rounded-2xl overflow-hidden">
              <div className="border-b border-[#262626] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-lg font-mono uppercase tracking-wider font-extrabold">Weekly Metrics</h2>
                  <p className="text-[#a3a3a3] text-xs font-medium">Estimated calculations based on difficulty</p>
                </div>
                <BrainCircuit className="h-6 w-6 text-[#22d3ee]" />
              </div>

              <div className="p-6 space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0d0d0e] border border-[#262626] p-4 rounded-xl space-y-1">
                    <span className="text-[#a3a3a3] text-[10px] uppercase font-mono tracking-wider font-bold">Body Mass Index</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white">{bmi}</span>
                      <span className={`text-[10px] font-bold font-mono ${bmiColor}`}>{bmiCategory.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="bg-[#0d0d0e] border border-[#262626] p-4 rounded-xl space-y-1">
                    <span className="text-[#a3a3a3] text-[10px] uppercase font-mono tracking-wider font-bold">Energy Target</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white">{targetCalories}</span>
                      <span className="text-[#a3a3a3] text-xs font-mono">kcal/day</span>
                    </div>
                  </div>
                </div>

                {/* Summary Narrative */}
                <div className="p-5 rounded-xl bg-[#0d0d0e] border border-[#262626] space-y-3">
                  <div className="flex items-center gap-2 font-mono font-bold text-[#22d3ee] text-xs uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 fill-cyan-400/20" />
                    Estimated Training Parameters
                  </div>
                  <p className="text-xs text-[#d4d4d4] leading-relaxed font-medium">
                    Your workout progression tier is configured at <strong className="text-white capitalize">{user.workoutExperience}</strong>. 
                    To best support your objective of <strong className="text-white">"{goals.join(", ")}"</strong>, your calculated nutrition guidelines recommend a <strong className="text-white">{goalText.toLowerCase()}</strong>.
                  </p>
                  <p className="text-xs text-[#d4d4d4] leading-relaxed font-medium">
                    Weekly training frequency is established at <strong className="text-white">{user.weeklyAvailability} workouts per week</strong>, with an average target duration of <strong className="text-white">{user.workoutDuration} minutes</strong>.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#262626]">
                  <div className="flex items-center gap-3 text-[#a3a3a3] text-[10px] font-mono font-bold">
                    <Heart className="h-3.5 w-3.5 text-[#22d3ee]" />
                    <span>SAFETY CHECKS ACTIVE: "{user.medicalConditions || 'NONE'}"</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#a3a3a3] text-[10px] font-mono font-bold">
                    <Zap className="h-3.5 w-3.5 text-[#22d3ee]" />
                    <span>EQUIPMENT FOCUS: "{user.availableEquipment || 'BASIC'}"</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleNext}
                    disabled={isSaving}
                    className="duo-btn-cyan w-full py-4 text-sm"
                  >
                    {isSaving ? "COMPILING..." : "COMPILE WORKOUT CHALLENGE"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
