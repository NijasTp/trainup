import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Flame, Check, Trophy, Calendar, Compass, Award, Lock, Shield } from "lucide-react";
import { updateProfile } from "@/services/userService";
import { updateUser } from "@/redux/slices/userAuthSlice";
import confetti from "canvas-confetti";

export default function OnboardingChallenge() {
  const [generating, setGenerating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.userAuth.user);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      setGenerating(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (!user) return null;

  const weeklyWorkouts = user.weeklyAvailability || 4;

  const workoutTypes = [
    { name: "Full Body Strength Split", duration: user.workoutDuration || 60, type: "STRENGTH" },
    { name: "HIIT Conditioning Routine", duration: user.workoutDuration || 60, type: "CARDIO" },
    { name: "Active Recovery & Mobility", duration: 30, type: "RECOVERY" },
    { name: "Core & Stability Split", duration: user.workoutDuration || 60, type: "CORE" },
    { name: "Lower Body Force Split", duration: user.workoutDuration || 60, type: "STRENGTH" },
    { name: "Upper Body Hypertrophy Split", duration: user.workoutDuration || 60, type: "STRENGTH" },
  ];

  const generateSchedule = () => {
    const schedule = [];
    let typeIndex = 0;
    const totalWeeks = 3;
    for (let week = 1; week <= totalWeeks; week++) {
      const days = [];
      for (let day = 1; day <= 7; day++) {
        const isWorkout = day <= weeklyWorkouts;
        if (isWorkout) {
          const workout = workoutTypes[typeIndex % workoutTypes.length];
          days.push({
            day: `Day ${(week - 1) * 7 + day}`,
            name: workout.name,
            duration: `${workout.duration} mins`,
            type: workout.type,
            status: "Locked"
          });
          typeIndex++;
        } else {
          days.push({
            day: `Day ${(week - 1) * 7 + day}`,
            name: "Rest & Hydrate",
            duration: "24 hrs",
            type: "REST",
            status: "Rest"
          });
        }
      }
      schedule.push({ week, days });
    }
    return schedule;
  };

  const schedule = generateSchedule();

  const handleStartJourney = async () => {
    setIsSaving(true);
    try {
      // Confetti celebration!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });

      const submitData = new FormData();
      submitData.append("onboardingCompleted", "true");
      submitData.append("onboardingStep", "completed");
      
      const response = await updateProfile(submitData);
      dispatch(updateUser(response.user));
      
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (_err) {
      navigate("/home");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0d0e] text-[#f5f5f5] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      
      {/* Background radial highlight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.02)_0%,transparent_70%)] rounded-full blur-[80px]"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10 my-8">
        {generating ? (
          <div className="bg-[#171717] border-2 border-[#262626] border-bottom-5 p-10 rounded-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-cyan-500/20 bg-cyan-500/5">
                <Trophy className="h-10 w-10 text-[#22d3ee]" />
                <div className="absolute inset-0 rounded-full border-t-2 border-[#22d3ee] animate-spin"></div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-mono tracking-wider uppercase text-white flex items-center justify-center gap-2">
                <Flame className="h-4 w-4 text-[#22d3ee] animate-bounce" />
                Generating Plan
              </h2>
              <p className="text-[#a3a3a3] text-xs font-mono">Assembling 21-day kickstart challenge...</p>
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
                CHALLENGE LOG GENERATED
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono uppercase">YOUR KICKSTART QUESTS</h1>
              <p className="text-[#a3a3a3] text-xs font-mono">Tailored 21-day program based on your commitment</p>
            </div>

            <div className="bg-[#171717] border-2 border-[#262626] border-bottom-5 rounded-2xl overflow-hidden">
              <div className="border-b border-[#262626] p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-white text-lg font-mono uppercase tracking-wider font-extrabold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#22d3ee]" />
                    QUEST MAP split
                  </h2>
                  <p className="text-[#a3a3a3] text-xs font-medium">Week 1 split preview: {weeklyWorkouts} active quests / week</p>
                </div>
                <Award className="h-6 w-6 text-[#22d3ee]" />
              </div>

              <div className="p-6 space-y-6">
                
                {/* Quest Nodes Grid */}
                <div className="space-y-3">
                  <span className="text-[#a3a3a3] font-mono text-[10px] font-bold uppercase tracking-wider">WEEK 1 QUEST NODES</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {schedule[0].days.map((day, idx) => {
                      const isRest = day.type === "REST";
                      
                      return (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-xl border flex flex-col justify-between h-28 relative transition-all duration-200 ${
                            isRest 
                              ? "bg-[#0d0d0e] border-[#1f1f1f] text-[#a3a3a3]" 
                              : "bg-[#171717] border-[#262626] cursor-pointer hover:border-[#404040] hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(34,211,238,0.08)] active:translate-y-0.5"
                          }`}
                        >
                          {/* Node Type Indicators */}
                          <div className="flex justify-between items-start font-mono text-[9px] font-bold">
                            <span className={isRest ? "text-[#a3a3a3]" : "text-[#22d3ee]"}>{day.day.toUpperCase()}</span>
                            <span className="text-neutral-500 font-semibold">{day.type}</span>
                          </div>

                          <div className="space-y-1">
                            <div className={`text-[10px] font-extrabold line-clamp-2 ${isRest ? "text-neutral-400" : "text-white"}`}>
                              {day.name}
                            </div>
                            <div className="text-[9px] text-[#a3a3a3] font-mono font-bold flex items-center gap-1">
                              {isRest ? (
                                <>
                                  <Shield className="w-3 h-3" />
                                  <span>24 HRS REST</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3 text-[#a3a3a3]" />
                                  <span>{day.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Directives details card */}
                <div className="p-5 rounded-xl bg-[#0d0d0e] border border-[#262626] space-y-3">
                  <div className="flex items-center gap-2 font-mono font-bold text-[#22d3ee] text-xs uppercase tracking-wider">
                    <Compass className="h-4 w-4 fill-cyan-400/10" />
                    Quest Directives
                  </div>
                  <ul className="space-y-2 text-xs text-[#a3a3a3] font-medium">
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#22d3ee] mt-0.5 flex-shrink-0 stroke-[3]" />
                      <span><strong>Active Streak Tracker:</strong> Daily activity updates calibrate your commitment streak.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-[#22d3ee] mt-0.5 flex-shrink-0 stroke-[3]" />
                      <span><strong>Progression Unlock:</strong> Complete week 1 quests to access advanced routines.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartJourney}
                    disabled={isSaving}
                    className="duo-btn-cyan w-full py-4 text-sm"
                  >
                    {isSaving ? "INITIALIZING..." : "LAUNCH FITNESS JOURNEY"}
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
