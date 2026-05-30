import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, Play, RefreshCw, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/userAuthSlice";
import API from "@/lib/axios";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { getWorkoutDays, createWorkoutSession } from "@/services/workoutService";
import { stopWorkoutTemplate, startWorkoutTemplate } from "@/services/templateService";
import Aurora from "@/components/ui/Aurora";

export default function ActiveProtocolPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.userAuth.user);

  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await API.get('/user/profile-page');
      if (res.data.user) {
        dispatch(updateUser(res.data.user));
      }
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  }, [dispatch]);

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUserProfile();
      
      // Load today's workouts to find virtual session
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const dailyData = await getWorkoutDays(todayStr);
      
      if (dailyData && dailyData.sessions) {
        // Find session linked to this template ID or template name
        const match = dailyData.sessions.find((s: any) => 
          s.notes?.includes("From active template") || 
          s._id.includes(`template-${id}`)
        );
        setTodaySession(match || null);
      }
    } catch (err) {
      toast.error("Failed to load active protocol details");
    } finally {
      setIsLoading(false);
    }
  }, [id, fetchUserProfile]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    if (user?.activeWorkoutTemplates) {
      const found = user.activeWorkoutTemplates.find((t: any) => t.templateId === id) as any;
      if (found) {
        setActiveTemplate(found);
        // Default preview tab to today's active day if present
        if (found.days && found.days.length > 0) {
          setSelectedDayTab(found.days[0].dayNumber);
        }
      }
    }
  }, [user, id]);

  const handleStartWorkout = async () => {
    if (!todaySession) return;
    setIsStarting(true);
    try {
      // If todaySession is virtual (id starts with 'template-'), materialize it
      if (todaySession._id.startsWith("template-")) {
        const sessionPayload = {
          name: todaySession.name,
          givenBy: todaySession.givenBy,
          date: todaySession.date,
          time: todaySession.time,
          exercises: todaySession.exercises.map((ex: any) => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            time: ex.time,
            rest: ex.rest || "60",
            image: ex.image || ""
          })),
          goal: todaySession.goal,
          notes: todaySession.notes,
          isDone: false
        };

        const res = await createWorkoutSession(sessionPayload);
        toast.success("Workout session created successfully!");
        navigate(`/workouts/${res._id}/start`);
      } else {
        // Already materialized
        navigate(`/workouts/${todaySession._id}/start`);
      }
    } catch (err) {
      toast.error("Failed to start workout session");
    } finally {
      setIsStarting(false);
    }
  };

  const handleResetProgress = async () => {
    if (!activeTemplate) return;
    const confirmed = window.confirm("Are you sure you want to reset your progress? This will reset the timeline back to Day 1.");
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await startWorkoutTemplate(
        activeTemplate.originalTemplateId || activeTemplate.templateId, 
        activeTemplate.scheduleType, 
        activeTemplate.weeklyDays
      );
      await loadPageData();
      toast.success("Training protocol progress reset successfully!");
    } catch (err) {
      toast.error("Failed to reset progress");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandonProgram = async () => {
    const confirmed = window.confirm("Are you sure you want to abandon this training protocol? All progress on this plan will be lost.");
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await stopWorkoutTemplate(id);
      await fetchUserProfile();
      toast.success("Abandoned protocol successfully.");
      navigate("/workouts");
    } catch (err) {
      toast.error("Failed to abandon protocol");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !activeTemplate) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white justify-center items-center font-outfit">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-medium">Loading protocol details...</p>
      </div>
    );
  }

  if (!activeTemplate) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white font-outfit">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-6">
          <Dumbbell className="h-16 w-16 text-slate-600 animate-bounce" />
          <h2 className="text-2xl font-black uppercase italic tracking-wider text-slate-200">Protocol Not Found</h2>
          <p className="text-slate-500 max-w-md">This training protocol might have been stopped or completed.</p>
          <Link to="/workouts">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase rounded-xl">
              Back to Workouts
            </Button>
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Calculate Overall Progress
  const daysTotal = activeTemplate.daysCount || 12;
  const start = new Date(activeTemplate.startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentProgressDay = Math.min(diffDays, daysTotal);
  const progressPercent = Math.min(Math.round(((currentProgressDay - 1) / daysTotal) * 100), 100);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
      </div>

      <SiteHeader />
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl space-y-8 flex-1">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link to="/workouts">
            <Button variant="ghost" className="text-slate-400 hover:text-white rounded-xl flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Workouts
            </Button>
          </Link>
          <Badge className="bg-primary/10 border border-primary/20 text-primary uppercase font-bold text-xs px-3 py-1 rounded-full">
            Active Program
          </Badge>
        </div>

        {/* Hero Section Card */}
        <div className="relative overflow-hidden bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8 items-center">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 to-blue-500/5 blur rounded-[3rem] pointer-events-none"></div>
          
          <img
            src={activeTemplate.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
            alt={activeTemplate.title}
            className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-[2.5rem] border-2 border-white/10 shadow-2xl"
          />

          <div className="flex-1 space-y-6 text-center md:text-left w-full">
            <div className="space-y-2">
              <Badge className="bg-slate-900 border border-white/10 text-primary font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-md">
                {activeTemplate.scheduleType === 'weekly' ? 'Weekly Calendar' : 'Contiguous Cycle'}
              </Badge>
              <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight text-white drop-shadow-md">
                {activeTemplate.title}
              </h1>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Started {format(new Date(activeTemplate.startDate), "MMMM d, yyyy")}
              </p>
            </div>

            {/* Progress Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center md:text-left">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Current Progress</p>
                <p className="text-xl font-black text-white italic mt-1">Day {currentProgressDay} <span className="text-xs text-slate-500">/ {daysTotal}</span></p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center md:text-left">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Completed</p>
                <p className="text-xl font-black text-primary italic mt-1">{progressPercent}%</p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2 max-w-xl">
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Today's Workout Focus */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Today's Session Details
            </h2>

            {todaySession ? (
              <Card className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-primary/20 rounded-[2.5rem] p-6 shadow-2xl">
                <div className="absolute top-0 right-0 bg-primary/10 border-l border-b border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl">
                  Active Today
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tight text-white">
                    {todaySession.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Ready to execute • {todaySession.exercises?.length || 0} exercises assigned
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Exercises List */}
                  <div className="divide-y divide-white/5">
                    {todaySession.exercises && todaySession.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                        <img
                          src={ex.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"}
                          alt={ex.name}
                          className="w-16 h-16 object-cover rounded-xl border border-white/5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-base truncate">{ex.name}</p>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {ex.sets} sets • {ex.reps ? `${ex.reps} reps` : ex.time || "Sets"} • Rest: {ex.rest || 60}s
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Big Start button */}
                  <Button
                    onClick={handleStartWorkout}
                    disabled={isStarting || todaySession.isDone}
                    className="w-full h-16 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/95 hover:to-blue-500/95 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    {isStarting 
                      ? "Initializing..." 
                      : todaySession.isDone 
                        ? "Already Done" 
                        : todaySession._id.startsWith("template-") 
                          ? "Start Today's Workout" 
                          : "Resume Today's Workout"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500">
                  <Calendar className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase italic text-slate-300">Rest / Recovery Day</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                    No template workout is scheduled for today. Allow your muscle fibers to heal and recharge. Keep active with light walking or stretching.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Program Days Browse Sidebar */}
          <div className="space-y-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Program Breakdown
            </h2>

            <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 shadow-2xl space-y-6">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Timeline Browser</p>
                <div className="grid grid-cols-4 gap-2">
                  {activeTemplate.days && activeTemplate.days.map((day: any) => (
                    <Button
                      key={day.dayNumber}
                      onClick={() => setSelectedDayTab(day.dayNumber)}
                      variant={selectedDayTab === day.dayNumber ? "default" : "outline"}
                      className={`h-10 rounded-xl font-black uppercase tracking-tight text-xs transition-all duration-300 ${
                        selectedDayTab === day.dayNumber 
                          ? "bg-primary text-slate-950 font-black shadow-lg" 
                          : "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                      }`}
                    >
                      Day {day.dayNumber}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Exercises in Selected Tab */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Day {selectedDayTab} Exercise List
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {activeTemplate.days && activeTemplate.days.find((d: any) => d.dayNumber === selectedDayTab)?.exercises.map((ex: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-10 h-10 rounded-lg bg-white/5 text-primary flex items-center justify-center font-bold text-xs border border-white/5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-200 truncate">{ex.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
                          {ex.sets} sets • {ex.reps ? `${ex.reps} reps` : ex.time || "Sets"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Actions Panel */}
            <Card className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleResetProgress}
                  variant="outline"
                  className="h-11 rounded-xl border-white/10 hover:border-primary/30 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all duration-300 font-bold uppercase text-xs flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Reset Progress
                </Button>
                <Button
                  onClick={handleAbandonProgram}
                  variant="outline"
                  className="h-11 rounded-xl border-white/10 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-500 transition-all duration-300 font-bold uppercase text-xs flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Abandon Plan
                </Button>
              </div>
            </Card>

          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
