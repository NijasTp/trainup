import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { getWorkoutSession, updateWorkoutSession } from "@/services/workoutService";
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Plus, 
  Check, 
  Clock, 
  Flame,
  Info
} from "lucide-react";
import Aurora from "@/components/ui/Aurora";
import type { IExercise, IWorkoutSession } from "@/interfaces/user/IStartWorkout";

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function StartSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<IWorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  const [phase, setPhase] = useState<"countdown" | "exercise" | "preview">("countdown");
  const [countdown, setCountdown] = useState<number>(3);
  const [timer, setTimer] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [previewCountdown, setPreviewCountdown] = useState<number>(15);
  const [initialPreviewRest, setInitialPreviewRest] = useState<number>(15);
  const [currentExerciseTime, setCurrentExerciseTime] = useState<number>(0);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);

  // Set and rest timings maps
  const [setDurationsMap, setSetDurationsMap] = useState<Record<number, number[]>>({});
  const [restDurationsMap, setRestDurationsMap] = useState<Record<number, number[]>>({});
  
  const lastStartRef = useRef<number | null>(null);
  const whistleSoundRef = useRef<HTMLAudioElement | null>(null);

  const handleWorkoutComplete = useCallback(async (lastSetDuration: number) => {
    if (!session) return;

    // Combine setDurations async state safely
    const finalSetDurationsMap = {
      ...setDurationsMap,
      [currentExerciseIndex]: [...(setDurationsMap[currentExerciseIndex] || []), lastSetDuration]
    };

    const finalRestDurationsMap = {
      ...restDurationsMap
    };

    const updatedExercises = session.exercises.map((ex, exIdx) => {
      const exSetDurations = finalSetDurationsMap[exIdx] || [];
      const exRestDurations = finalRestDurationsMap[exIdx] || [];
      
      const totalTimeTaken = exSetDurations.reduce((sum, d) => sum + d, 0);
      const setDetails = exSetDurations.map((dur, sIdx) => ({
        setNumber: sIdx + 1,
        duration: dur,
        restDuration: exRestDurations[sIdx] || 0
      }));

      return {
        ...ex,
        isDone: true,
        timeTaken: totalTimeTaken,
        setDetails
      };
    });

    const totalWorkoutTime = updatedExercises.reduce((acc, ex) => acc + (ex.timeTaken || 0), 0);

    try {
      setIsLoading(true);
      const response = await updateWorkoutSession(id!, {
        isDone: true,
        exercises: updatedExercises as SafeAny
      });
      toast.success("Workout completed! Amazing effort!");
      navigate(`/workouts/${id}/success`, { 
        state: { 
          exerciseTimes: updatedExercises.map(ex => ({
            exerciseId: ex.id,
            name: ex.name,
            duration: ex.timeTaken || 0
          })), 
          totalWorkoutTime, 
          isDone: true,
          streak: response?.streak
        } 
      });
    } catch (_err) {
      toast.error("Failed to complete workout session on server.");
    } finally {
      setIsLoading(false);
    }
  }, [session, currentExerciseIndex, setDurationsMap, restDurationsMap, id, navigate]);

  const handleSetComplete = useCallback(() => {
    if (!session) return;
    const currentExercise = session.exercises[currentExerciseIndex];
    const duration = currentExerciseTime;

    // Record set duration
    setSetDurationsMap(prev => ({
      ...prev,
      [currentExerciseIndex]: [...(prev[currentExerciseIndex] || []), duration]
    }));

    if (currentSetIndex + 1 < currentExercise.sets) {
      // Go to rest phase between sets of same exercise
      const restTime = currentExercise.rest ? parseInt(currentExercise.rest) || 30 : 30;
      setPhase("preview");
      setTimer(null);
      setIsPaused(false);
      setPreviewCountdown(restTime);
      setInitialPreviewRest(restTime);
    } else {
      // All sets of this exercise are finished!
      if (currentExerciseIndex + 1 < session.exercises.length) {
        // Rest before transitioning to the next exercise
        const restTime = currentExercise.rest ? parseInt(currentExercise.rest) || 30 : 30;
        setPhase("preview");
        setTimer(null);
        setIsPaused(false);
        setPreviewCountdown(restTime);
        setInitialPreviewRest(restTime);
      } else {
        // Last set of last exercise completed! Finish the workout!
        handleWorkoutComplete(duration);
      }
    }
  }, [session, currentExerciseIndex, currentExerciseTime, currentSetIndex, handleWorkoutComplete]);

  const handleRestPhaseEnd = useCallback(() => {
    if (!session) return;
    const currentExercise = session.exercises[currentExerciseIndex];
    const restTaken = initialPreviewRest - previewCountdown;

    // Record rest time taken
    setRestDurationsMap(prev => ({
      ...prev,
      [currentExerciseIndex]: [...(prev[currentExerciseIndex] || []), restTaken]
    }));

    if (currentSetIndex + 1 < currentExercise.sets) {
      // Next set of SAME exercise
      setCurrentSetIndex(prev => prev + 1);
      setPhase("exercise");
      if (currentExercise.time) {
        const timeStr = currentExercise.time || "0 min";
        const timeInSeconds = parseInt(timeStr) * 60;
        setTimer(timeInSeconds);
      } else {
        setTimer(null);
      }
      setAccumulatedTime(0);
      setCurrentExerciseTime(0);
      lastStartRef.current = Date.now();
    } else {
      // Next exercise countdown
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setPhase("countdown");
      setCountdown(3);
    }
  }, [session, currentExerciseIndex, initialPreviewRest, previewCountdown, currentSetIndex]);

  // Initialize sounds and load session
  useEffect(() => {
    whistleSoundRef.current = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_5b76f6521b.mp3");
    async function fetchSession() {
      setIsLoading(true);
      try {
        const response = await getWorkoutSession(id!);
        if (response.isDone) {
          toast.info("This session is already completed!");
          return navigate("/workouts");
        }
        setSession({
          ...response,
          exercises: response.exercises.map((ex: IExercise) => ({ ...ex, isDone: false })),
        });
      } catch (errVal) { const err = errVal as SafeAny;
        setError(err.message || "Failed to fetch session");
        toast.error("Failed to load session", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchSession();
  }, [id, navigate]);

  // Countdown logic with sound
  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (phase === "countdown" && countdown === 0) {
      setPhase("exercise");
      const currentExercise = session?.exercises[currentExerciseIndex];
      if (currentExercise?.time) {
        const timeStr = currentExercise.time || "0 min";
        const timeInSeconds = parseInt(timeStr) * 60;
        setTimer(timeInSeconds);
      } else {
        setTimer(null);
      }
      setAccumulatedTime(0);
      lastStartRef.current = Date.now();
      setCurrentExerciseTime(0);
      if (whistleSoundRef.current) {
        whistleSoundRef.current.play().catch(() => console.log("Sound playback blocked by browser"));
      }
    }
  }, [phase, countdown, session, currentExerciseIndex]);

  // Exercise set timer (for timed exercises)
  useEffect(() => {
    if (phase === "exercise" && timer !== null && timer > 0 && !isPaused) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (phase === "exercise" && timer === 0) {
      handleSetComplete();
    }
  }, [timer, phase, isPaused, handleSetComplete]);

  // Current set elapsed time tracker (excluding pauses)
  useEffect(() => {
    if (phase === "exercise") {
      const interval = setInterval(() => {
        if (!isPaused && lastStartRef.current) {
          const now = Date.now();
          const delta = Math.floor((now - lastStartRef.current) / 1000);
          setCurrentExerciseTime(accumulatedTime + delta);
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setAccumulatedTime(0);
      lastStartRef.current = null;
      setCurrentExerciseTime(0);
    }
  }, [phase, isPaused, accumulatedTime]);

  // Preview timer (rest between sets/exercises)
  useEffect(() => {
    if (phase === "preview" && previewCountdown > 0) {
      const previewTimer = setTimeout(() => setPreviewCountdown(previewCountdown - 1), 1000);
      return () => clearTimeout(previewTimer);
    } else if (phase === "preview" && previewCountdown === 0) {
      handleRestPhaseEnd();
    }
  }, [phase, previewCountdown, handleRestPhaseEnd]);

  function togglePause() {
    if (isPaused) {
      // Resume
      lastStartRef.current = Date.now();
    } else {
      // Pause
      if (lastStartRef.current) {
        const now = Date.now();
        const delta = Math.floor((now - lastStartRef.current) / 1000);
        setAccumulatedTime((prev) => prev + delta);
        lastStartRef.current = null;
      }
    }
    setIsPaused(!isPaused);
  }



  function handleSkipExercise() {
    if (!session) return;
    const currentExercise = session.exercises[currentExerciseIndex];
    
    // Fill remaining sets with 0
    const remainingSetsCount = currentExercise.sets - currentSetIndex;
    const zeroSets = Array(remainingSetsCount).fill(0);
    const zeroRests = Array(remainingSetsCount).fill(0);

    setSetDurationsMap(prev => ({
      ...prev,
      [currentExerciseIndex]: [...(prev[currentExerciseIndex] || []), ...zeroSets]
    }));
    setRestDurationsMap(prev => ({
      ...prev,
      [currentExerciseIndex]: [...(prev[currentExerciseIndex] || []), ...zeroRests]
    }));

    if (currentExerciseIndex + 1 < session.exercises.length) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
      setPhase("countdown");
      setCountdown(3);
    } else {
      const finalSetDurationsMap = {
        ...setDurationsMap,
        [currentExerciseIndex]: [...(setDurationsMap[currentExerciseIndex] || []), ...zeroSets]
      };
      
      const updatedExercises = session.exercises.map((ex, exIdx) => {
        const exSetDurations = finalSetDurationsMap[exIdx] || [];
        const exRestDurations = restDurationsMap[exIdx] || [];
        
        const totalTimeTaken = exSetDurations.reduce((sum, d) => sum + d, 0);
        const setDetails = exSetDurations.map((dur, sIdx) => ({
          setNumber: sIdx + 1,
          duration: dur,
          restDuration: exRestDurations[sIdx] || 0
        }));

        return {
          ...ex,
          isDone: true,
          timeTaken: totalTimeTaken,
          setDetails
        };
      });

      const totalWorkoutTime = updatedExercises.reduce((acc, ex) => acc + (ex.timeTaken || 0), 0);

      setIsLoading(true);
      updateWorkoutSession(id!, {
        isDone: true,
        exercises: updatedExercises as SafeAny
      }).then(() => {
        toast.success("Workout completed!");
        navigate(`/workouts/${id}/success`, { 
          state: { 
            exerciseTimes: updatedExercises.map(ex => ({
              exerciseId: ex.id,
              name: ex.name,
              duration: ex.timeTaken || 0
            })), 
            totalWorkoutTime, 
            isDone: true 
          } 
        });
      }).catch(() => {
        toast.error("Failed to complete session.");
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }

  function handleGoBack() {
    if (!session) return;
    
    if (currentSetIndex > 0) {
      // Move to previous set of the same exercise
      const prevSetIdx = currentSetIndex - 1;
      
      setSetDurationsMap(prev => {
        const arr = prev[currentExerciseIndex] || [];
        return { ...prev, [currentExerciseIndex]: arr.slice(0, -1) };
      });
      setRestDurationsMap(prev => {
        const arr = prev[currentExerciseIndex] || [];
        return { ...prev, [currentExerciseIndex]: arr.slice(0, -1) };
      });

      setCurrentSetIndex(prevSetIdx);
      setPhase("exercise");
      
      const currentExercise = session.exercises[currentExerciseIndex];
      if (currentExercise.time) {
        const timeStr = currentExercise.time || "0 min";
        const timeInSeconds = parseInt(timeStr) * 60;
        setTimer(timeInSeconds);
      } else {
        setTimer(null);
      }
      setAccumulatedTime(0);
      setCurrentExerciseTime(0);
      lastStartRef.current = Date.now();
      toast.info(`Moved back to set ${prevSetIdx + 1}`);
    } else if (currentExerciseIndex > 0) {
      // Move to last set of the previous exercise
      const prevExIdx = currentExerciseIndex - 1;
      const prevExercise = session.exercises[prevExIdx];
      const prevSetIdx = prevExercise.sets - 1;

      setSetDurationsMap(prev => {
        const arr = prev[prevExIdx] || [];
        return { ...prev, [prevExIdx]: arr.slice(0, -1) };
      });
      setRestDurationsMap(prev => {
        const arr = prev[prevExIdx] || [];
        return { ...prev, [prevExIdx]: arr.slice(0, -1) };
      });

      setCurrentExerciseIndex(prevExIdx);
      setCurrentSetIndex(prevSetIdx);
      setPhase("exercise");

      if (prevExercise.time) {
        const timeStr = prevExercise.time || "0 min";
        const timeInSeconds = parseInt(timeStr) * 60;
        setTimer(timeInSeconds);
      } else {
        setTimer(null);
      }
      setAccumulatedTime(0);
      setCurrentExerciseTime(0);
      lastStartRef.current = Date.now();
      toast.info(`Moved back to ${prevExercise.name} - set ${prevSetIdx + 1}`);
    }
  }

  const handleExtendRest = () => {
    setPreviewCountdown((prev) => prev + 10);
    toast.success("Rest extended by 10s!");
  };

  const handleSkipRest = () => {
    toast.info("Rest skipped");
    handleRestPhaseEnd();
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white justify-center items-center font-outfit">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Assembling your workout dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white justify-center items-center font-outfit">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="relative z-10 text-center space-y-6 max-w-md px-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 font-bold uppercase tracking-wider">
            {error || "Session not found or already completed"}
          </div>
          <Button onClick={() => navigate("/workouts")} className="bg-primary hover:bg-primary/90 text-white font-bold uppercase rounded-xl px-8">
            Back to Workouts
          </Button>
        </div>
      </div>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const progressPercentage = (currentExerciseIndex / session.exercises.length) * 100;
  const restRatio = previewCountdown / (initialPreviewRest || 1);
  const strokeDashoffset = 282.6 * (1 - restRatio);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
      </div>

      <SiteHeader />

      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 max-w-5xl flex flex-col space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight text-white flex items-center gap-2 justify-center sm:justify-start">
              <Flame className="h-6 w-6 text-primary animate-pulse" />
              {session.name}
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Intense Training Protocol • Day Progress Action
            </p>
          </div>
          <Link to="/workouts">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase font-bold tracking-wider">
              Quit Session
            </Button>
          </Link>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
            <span>Exercise {currentExerciseIndex + 1} of {session.exercises.length} • Set {currentSetIndex + 1} of {currentExercise.sets}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Workout Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Sidebar Exercise Tracker */}
          <div className="lg:col-span-1 space-y-4 order-last lg:order-first">
            <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Exercise Routine
              </h2>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {session.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                      i === currentExerciseIndex
                        ? "bg-primary/10 border-primary/45 shadow-lg shadow-primary/5 scale-[1.02]"
                        : ex.isDone
                        ? "bg-green-500/5 border-green-500/20 opacity-80"
                        : "bg-white/[0.01] border-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      i === currentExerciseIndex
                        ? "bg-primary text-slate-950"
                        : ex.isDone
                        ? "bg-green-500 text-white"
                        : "bg-white/5 text-slate-400"
                    }`}>
                      {ex.isDone ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white truncate">{ex.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {ex.sets} sets • {ex.reps ? `${ex.reps} reps` : ex.time || "Sets"}
                        {i === currentExerciseIndex && ` (Set ${currentSetIndex + 1}/${ex.sets})`}
                      </p>
                    </div>
                    {i === currentExerciseIndex && (
                      <span className="text-[10px] text-primary font-black italic animate-pulse">ACTIVE</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Phase Execution Panel */}
          <div className="lg:col-span-2">
            
            {/* 1. Countdown Phase */}
            {phase === "countdown" && (
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 text-center shadow-2xl py-12">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 blur rounded-[3rem] pointer-events-none"></div>
                <div className="space-y-6 flex flex-col items-center">
                  <p className="text-sm font-black uppercase tracking-widest text-primary italic animate-bounce">
                    Prepare Muscle Focus
                  </p>
                  
                  {/* exercise gif shown in place of countdown */}
                  <img
                    src={currentExercise.gifUrl || currentExercise.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"}
                    alt={currentExercise.name}
                    className="w-64 h-64 object-cover rounded-[2rem] border border-white/10 shadow-2xl"
                  />

                  {/* countdown underneath image */}
                  <div className="text-6xl md:text-8xl font-black italic uppercase text-primary tracking-tight font-display scale-[1.1] animate-pulse">
                    {countdown}
                  </div>
                  
                  <h3 className="text-xl md:text-3xl font-black text-white italic uppercase tracking-tight max-w-md mx-auto">
                    Get ready for {currentExercise.name}
                  </h3>
                </div>
              </Card>
            )}

            {/* 2. Preview Rest Phase */}
            {phase === "preview" && (
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8 items-center">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-blue-500/5 blur rounded-[3rem] pointer-events-none"></div>

                {/* Rest Circular Timer */}
                <div className="relative flex-shrink-0 flex justify-center items-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="45"
                      className="stroke-white/5"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="45"
                      className="stroke-primary transition-all duration-300"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="282.6"
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="absolute flex flex-col justify-center items-center">
                    <span className="text-3xl font-black text-white italic">{previewCountdown}s</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Rest</span>
                  </div>
                </div>

                {/* Rest details and controls */}
                <div className="flex-1 space-y-6 text-center md:text-left w-full">
                  <div className="space-y-2">
                    <Badge className="bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-md">
                      REST ACTIVE
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white">
                      {currentSetIndex + 1 < currentExercise.sets ? "PREPARE FOR NEXT SET" : "COMING UP NEXT"}
                    </h2>
                    <h3 className="text-lg md:text-xl font-bold text-slate-300">
                      {currentExercise.name} {currentSetIndex + 1 < currentExercise.sets ? `(Set ${currentSetIndex + 2}/${currentExercise.sets})` : ""}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {currentExercise.sets} sets • {currentExercise.reps ? `${currentExercise.reps} reps` : currentExercise.time || "Sets"} • Rest: {currentExercise.rest || 60}s
                    </p>
                  </div>

                  {/* Rest Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button
                      onClick={handleExtendRest}
                      className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs uppercase font-black tracking-wider text-white flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4 text-primary" /> +10s Rest
                    </Button>
                    <Button
                      onClick={handleSkipRest}
                      className="h-12 bg-primary text-slate-950 hover:bg-primary/90 border border-primary/10 rounded-2xl text-xs uppercase font-black tracking-wider flex items-center gap-2"
                    >
                      <SkipForward className="h-4 w-4 fill-current" /> Skip Rest
                    </Button>
                    {(currentSetIndex > 0 || currentExerciseIndex > 0) && (
                      <Button
                        onClick={handleGoBack}
                        variant="ghost"
                        className="h-12 text-slate-400 hover:text-white rounded-2xl text-xs uppercase font-black tracking-wider flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" /> Previous
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* 3. Active Exercise Execution Phase */}
            {phase === "exercise" && (
              <Card className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-blue-500/5 blur rounded-[3rem] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <img
                    src={currentExercise.gifUrl || currentExercise.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"}
                    alt={currentExercise.name}
                    className="w-full md:w-48 h-48 md:h-48 object-cover rounded-[2.5rem] border border-white/10 shadow-xl flex-shrink-0"
                  />
                  <div className="flex-1 space-y-4 text-center md:text-left w-full">
                    <Badge className="bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-md">
                      SET {currentSetIndex + 1} OF {currentExercise.sets} ACTIVE
                    </Badge>
                    <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white leading-tight">
                      {currentExercise.name}
                    </h2>
                    
                    {/* Setup specifications */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-xs font-black uppercase tracking-wider text-slate-400">
                      <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg">Set {currentSetIndex + 1} / {currentExercise.sets}</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg">{currentExercise.reps ? `${currentExercise.reps} Reps` : currentExercise.time || "Sets"}</span>
                      {currentExercise.weight && (
                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg">{currentExercise.weight} kg</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timing stats & clocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b border-white/5">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Set Active Duration</p>
                    <p className="text-3xl font-black text-white italic mt-1">{formatTime(currentExerciseTime)}</p>
                  </div>
                  {currentExercise.time && timer !== null && (
                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                      <p className="text-[10px] text-primary font-black uppercase tracking-wider">Timed Set Target</p>
                      <p className="text-3xl font-black text-primary italic mt-1">{formatTime(timer)}</p>
                    </div>
                  )}
                </div>

                {/* Exercise notes */}
                {currentExercise.notes && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3 items-start">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Coach/Template Notes</p>
                      <p className="text-sm text-slate-300 font-medium mt-1 leading-relaxed">{currentExercise.notes}</p>
                    </div>
                  </div>
                )}

                {/* Active Controls Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {(currentSetIndex > 0 || currentExerciseIndex > 0) && (
                    <Button
                      onClick={handleGoBack}
                      variant="outline"
                      className="h-14 rounded-2xl border-white/10 hover:border-slate-400 bg-white/5 text-slate-300 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 flex-1"
                    >
                      <RotateCcw className="h-4 w-4" /> Go Back
                    </Button>
                  )}
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    className="h-14 rounded-2xl border-primary/20 hover:border-primary/50 bg-primary/5 text-primary text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 flex-1"
                  >
                    {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    onClick={handleSkipExercise}
                    variant="outline"
                    className="h-14 rounded-2xl border-yellow-500/20 hover:border-yellow-500/50 bg-yellow-500/5 text-yellow-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 flex-1"
                  >
                    <SkipForward className="h-4 w-4 fill-current" /> Skip Ex
                  </Button>
                  <Button
                    onClick={handleSetComplete}
                    className="h-14 rounded-2xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/95 hover:to-blue-500/95 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 flex-1 shadow-lg shadow-primary/10"
                  >
                    <Check className="h-4 w-4 stroke-[3px]" /> Complete Set {currentSetIndex + 1}
                  </Button>
                </div>

              </Card>
            )}

          </div>

        </div>

      </main>

      <SiteFooter />
    </div>
  );
}