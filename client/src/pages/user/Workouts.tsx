import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Plus, Target, CheckCircle, XCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { format, isToday, addDays, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

import { toast } from "sonner";
import { getWorkoutDays, getAllSessions } from "@/services/workoutService";
import { WorkoutCalendar } from "@/components/user/workouts/WorkoutCalendar";

import type { WorkoutSession, WorkoutDay } from "@/interfaces/user/IWorkouts";
import Aurora from "@/components/ui/Aurora";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateUser } from "@/redux/slices/userAuthSlice";
import API from "@/lib/axios";
import { stopWorkoutTemplate } from "@/services/templateService";


function formatTime(seconds: number | undefined): string {
  if (!seconds) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function FilterButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link to="/workouts/browse">
        <Button
          variant="outline"
          className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
        >
          Browse Templates
        </Button>
      </Link>
      <Link to="/workouts/add">
        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" /> Add Session
        </Button>
      </Link>
    </div>
  );
}

function WorkoutSessionCard({
  session,
  index,
  focusedSessionId,
}: {
  session: WorkoutSession;
  index: number;
  focusedSessionId: string | null;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate if Start button should be shown (allow starting scheduled workouts anytime on the scheduled day)
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const isSessionToday = session.date === todayStr;
  const isSessionPast = session.date < todayStr;
  const canStartSession = isSessionToday && !session.isDone;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 ${focusedSessionId === session._id ? "border-primary/50 shadow-primary/25" : ""
            }`}
          style={{
            animationDelay: `${index * 100}ms`,
            animation: "slideUp 0.6s ease-out forwards",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Dumbbell className="h-5 w-5 text-primary" />
                {session.name} ({session.time})
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      session.givenBy === "trainer"
                        ? "bg-primary/90 text-primary-foreground shadow-lg"
                        : session.givenBy === "admin"
                          ? "bg-purple-500/90 text-white shadow-lg"
                          : "bg-secondary/90 text-foreground shadow-lg"
                    }
                  >
                    {session.givenBy === "trainer" ? "Trainer" : session.givenBy === "admin" ? "Admin" : "You"}
                  </Badge>
                  {session.isDone ? (
                    <Badge className="bg-green-500/90 text-white shadow-lg flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Done
                    </Badge>
                  ) : isSessionPast ? (
                    <Badge className="bg-red-500/90 text-white shadow-lg flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      Missed
                    </Badge>
                  ) : null}
                </div>
              </CardTitle>
              <div className="flex gap-2">
                {canStartSession && !session.isDone && (
                  <Link to={`/workouts/${session._id}/start`}>
                    <Button
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Start
                    </Button>
                  </Link>
                )}
                {!isSessionPast && !session.isDone && session.givenBy === 'user' && (
                  <Link to={`/workouts/${session._id}`}>
                    <Button
                      variant="outline"
                      className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                    >
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {session.exercises.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {session.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/20"
                  >
                    <div className="relative w-16 h-16">
                      {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center rounded-md">
                          <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <img
                        src={exercise.image || 'https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp'}
                        alt={exercise.name}
                        className={`h-16 w-16 object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                          }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                      />

                    </div>
                    <div>
                      <p className="font-medium text-foreground">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.sets} sets • {exercise.reps}
                        {exercise.weight ? ` • ${exercise.weight}kg` : ""}
                        {exercise.timeTaken ? ` • Time: ${formatTime(exercise.timeTaken)}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No exercises added to this session yet.</p>
            )}
            {session.goal && (
              <div className="mt-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Goal: {session.goal}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card/80 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img
              src={session.exercises[0]?.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"}
              alt={session.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <DialogTitle className="text-2xl font-bold text-white drop-shadow-lg mb-2">
                {session.name} ({session.time})
              </DialogTitle>
              <div className="flex items-center gap-4 text-white/90">
                <Badge
                  className={
                    session.givenBy === "trainer"
                      ? "bg-primary/90 text-primary-foreground"
                      : session.givenBy === "admin"
                        ? "bg-purple-500/90 text-white"
                        : "bg-secondary/90 text-foreground"
                  }
                >
                  {session.givenBy === "trainer" ? "Trainer" : session.givenBy === "admin" ? "Admin" : "You"}
                </Badge>
                {session.isDone ? (
                  <Badge className="bg-green-500/90 text-white flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Done
                  </Badge>
                ) : isSessionPast ? (
                  <Badge className="bg-red-500/90 text-white flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    Missed
                  </Badge>
                ) : null}
                {session.goal && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">{session.goal}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {session.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex items-center gap-4 p-4 border-b border-border/60"
            >
              <img
                src={exercise.image || 'https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp'}
                alt={exercise.name}
                className="h-24 w-24 object-cover rounded-md"
                loading="lazy"
              />
              <div className="flex-1">
                <p className="font-medium text-foreground">{exercise.name}</p>
                <p className="text-sm text-muted-foreground">
                  {exercise.sets} sets • {exercise.reps}
                  {exercise.weight ? ` • ${exercise.weight}kg` : ""}
                  {exercise.timeTaken ? ` • Time: ${formatTime(exercise.timeTaken)}` : ""}
                </p>
              </div>
            </div>
          ))}
          {session.notes && (
            <div className="p-4">
              <p className="font-semibold text-foreground">Notes:</p>
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          )}
        </div>
        {canStartSession && !session.isDone && (
          <div className="sticky bottom-0 bg-background py-4">
            <Link to={`/workouts/${session._id}/start`}>
              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Session
              </Button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function WorkoutPage() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.userAuth.user);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter] = useState<"trainer" | "user" | "admin">("user");
  const [dailyWorkouts, setDailyWorkouts] = useState<WorkoutDay[]>([]);
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([]);
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await API.get('/user/profile-page');
      if (res.data.user) {
        dispatch(updateUser(res.data.user));
      }
    } catch (_err) {
      console.error("Failed to load user profile in workouts", _err);
    }
  }, [dispatch]);

  const handleStopActiveTemplate = async (templateId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const confirmed = window.confirm("Are you sure you want to abandon this training protocol? All progress on this plan will be lost.");
    if (!confirmed) return;
    try {
      await stopWorkoutTemplate(templateId);
      await fetchUserProfile();
      await fetchWorkouts();
      toast.success("Training protocol stopped successfully!");
    } catch (_err) {
      toast.error("Failed to stop training protocol");
    }
  };


  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getWorkoutDays(format(selectedDate, "yyyy-MM-dd"));
      const workoutDay = response ? [response] : [{ _id: "", userId: "", date: format(selectedDate, "yyyy-MM-dd"), sessions: [] }];
      setDailyWorkouts(workoutDay);
    } catch (err: unknown) {
      setError("Failed to fetch workouts");
      console.error("API error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load workouts";
      toast.error("Failed to load workouts", { description: errorMessage });
      setDailyWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const fetchAllHistory = useCallback(async () => {
    try {
      const data = await getAllSessions();
      if (data && data.sessions) {
        setAllSessions(data.sessions);
      }
    } catch (_err: unknown) {
      console.error("Failed to fetch history:", _err);
    }
  }, []);

  useEffect(() => {
    document.title = "TrainUp - Your Daily Workouts";
    fetchWorkouts();
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchAllHistory();
  }, [fetchAllHistory]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (isToday(selectedDate)) {
      const todayWorkouts = dailyWorkouts.find(
        (dw) => dw.date === format(selectedDate, "yyyy-MM-dd")
      );
      if (todayWorkouts?.sessions.length) {
        const now = new Date().toTimeString().slice(0, 5);
        const closestSession = todayWorkouts.sessions
          .filter((session) => filter === "user" ? ["user", "admin", "trainer"].includes(session.givenBy) : session.givenBy === filter)
          .reduce((prev, curr) => {
            const prevDiff = Math.abs(
              parseInt(prev.time.replace(":", "")) - parseInt(now.replace(":", ""))
            );
            const currDiff = Math.abs(
              parseInt(curr.time.replace(":", "")) - parseInt(now.replace(":", ""))
            );
            return currDiff < prevDiff ? curr : prev;
          }, todayWorkouts.sessions[0]);
        setFocusedSessionId(closestSession?._id || null);
      } else {
        setFocusedSessionId(null);
      }
    } else {
      setFocusedSessionId(null);
    }
  }, [selectedDate, dailyWorkouts, filter]);

  const filteredSessions = dailyWorkouts.find(
    (dw) => dw.date === format(selectedDate, "yyyy-MM-dd")
  )?.sessions.filter((session) =>
    filter === "user" ? ["user", "admin", "trainer"].includes(session.givenBy) : session.givenBy === filter
  ) || [];

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
      <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1">
        <section className="flex flex-col gap-6">
          {/* Date Navigation & Popover */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange("prev")}
                  className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent min-w-[200px] text-center">
                    {format(selectedDate, "MMMM d")}
                  </h1>

                  <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                      >
                        <CalendarIcon className="h-4 w-4 text-primary" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-fit p-0 border-border/50 bg-card/95 backdrop-blur-md">
                      <WorkoutCalendar
                        sessions={allSessions}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                          setSelectedDate(date);
                          setIsCalendarOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange("next")}
                  className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <FilterButtons />
            </div>

            {/* STUNNING PREMIUM GLASSMORPHIC ACTIVE PROGRAMS WIDGET */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary animate-pulse" />
                  Active Training Protocols
                </h2>
                {user?.activeWorkoutTemplates && user.activeWorkoutTemplates.length > 0 && (
                  <Badge className="bg-primary/10 border border-primary/20 text-primary uppercase font-bold text-[10px] tracking-widest px-3 py-1 rounded-full">
                    {user.activeWorkoutTemplates.length} Active
                  </Badge>
                )}
              </div>

              {user?.activeWorkoutTemplates && user.activeWorkoutTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.activeWorkoutTemplates.map((t: any) => {
                    // Find if today's date has a mapped day for this active template
                    const dw = dailyWorkouts.find(dw => dw.date === format(selectedDate, "yyyy-MM-dd"));
                    const todayDayNumber = dw?.templateName === t.title ? dw?.templateDay : null;
                    const todaySession = dw?.sessions?.find((s: any) => s.notes?.includes(`From active template: ${t.title}`) || s.name?.startsWith(t.title));
                    const isTodaySessionDone = todaySession?.isDone || false;
                    
                    // Estimate overall progress based on actual completed sessions
                    const daysTotal = t.daysCount || 12;
                    const completedSessions = allSessions.filter((s: any) => 
                      s.isDone && 
                      (s.templateId === t.templateId || s.name?.startsWith(t.title) || s.notes?.includes(t.title))
                    );
                    const completedCount = completedSessions.length;
                    const currentProgressDay = Math.min(completedCount + 1, daysTotal);
                    const progressPercent = Math.min(Math.round((completedCount / daysTotal) * 100), 100);

                    return (
                      <Link
                        key={t.templateId}
                        to={`/workouts/active-protocol/${t.templateId}`}
                        className="block relative overflow-hidden group bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-primary/30 rounded-[2.5rem] p-6 space-y-6 transition-all duration-300 shadow-xl"
                      >
                        {/* Radial glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>

                        <div className="relative flex gap-4">
                          <img
                            src={t.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"}
                            alt={t.title}
                            className="w-20 h-20 object-cover rounded-2xl border border-white/5"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-slate-900 border-white/10 text-primary font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-md">
                                {t.scheduleType === 'weekly' ? 'Weekly Days' : 'Contiguous Rolling'}
                              </Badge>
                              {t.assignedBy === 'trainer' && (
                                <Badge className="bg-blue-500/90 hover:bg-blue-600 text-white font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-md shadow-lg border-0">
                                  Added by Trainer
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight leading-tight">
                              {t.title}
                            </h3>
                            {t.scheduleType === 'weekly' && (
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Days: {t.weeklyDays?.map((d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar & Session Tracking */}
                        <div className="relative space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-400">
                            <span>
                              {todayDayNumber ? (
                                <span className="text-primary font-black italic">
                                  TODAY: Day {todayDayNumber} {isTodaySessionDone ? " (COMPLETED)" : ""}
                                </span>
                              ) : (
                                <span>Day {currentProgressDay} of {daysTotal}</span>
                              )}
                            </span>
                            <span>{progressPercent}% COMPLETE</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="relative flex items-center justify-between pt-2 border-t border-white/5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Started: {format(new Date(t.startDate), "MMM d, yyyy")}
                          </span>

                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={(e) => handleStopActiveTemplate(t.templateId, e)}
                              className="h-9 w-9 rounded-xl border-white/10 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all duration-300"
                              title="Abandon Program"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black italic uppercase text-slate-300">No Active Protocols</h3>
                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                      Accelerate your strength gains and conditioning. Explore our expert-designed programs.
                    </p>
                  </div>
                  <Link to="/workouts/browse">
                    <Button className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-primary/10 mt-2">
                      Browse Templates
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Loading your workouts...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full border border-destructive/20 mb-4">
              <span className="text-destructive font-medium">{error}</span>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredSessions.length ? (
          <section className="space-y-6">
            {filteredSessions.map((session, index) => (
              <WorkoutSessionCard
                key={session._id}
                session={session}
                index={index}
                focusedSessionId={focusedSessionId}
              />
            ))}
          </section>
        ) : (
          !isLoading && !error && (
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardContent className="py-16 text-center text-muted-foreground">
                <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">No workouts scheduled</h3>
                <p>
                  No workouts scheduled for this day.
                </p>
              </CardContent>
            </Card>
          )
        )}
      </main>
      <SiteFooter />
    </div >
  );
}