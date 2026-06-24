import { useState, useEffect, useCallback } from "react";
import { Dumbbell, Plus, Target, CheckCircle, XCircle, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";

import { format, isToday, addDays, subDays } from "date-fns";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

import { toast } from "sonner";
import { getWorkoutDays, getAllSessions } from "@/services/workoutService";
import { WorkoutCalendar } from "@/components/user/workouts/WorkoutCalendar";

import type { WorkoutSession, WorkoutDay } from "@/interfaces/user/IWorkouts";

import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import API from "@/lib/axios";

type SafeAny = any;

function formatTime(seconds: number | undefined): string {
  if (!seconds) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function FilterButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link to="/workouts/browse">
        <button
          className="duo-btn-outline h-11 px-5 text-xs font-mono font-bold uppercase tracking-wider"
        >
          Browse Templates
        </button>
      </Link>
      <Link to="/workouts/add">
        <button className="duo-btn-cyan h-11 px-5 text-xs font-mono font-bold uppercase tracking-wider flex items-center">
          <Plus className="h-4 w-4 mr-1.5" /> Add Session
        </button>
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

  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const isSessionToday = session.date === todayStr;
  const isSessionPast = session.date < todayStr;
  const canStartSession = isSessionToday && !session.isDone;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={`group relative duo-card-3d bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] hover:border-[#404040] hover:border-b-[7px] hover:border-b-[#262626] rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col gap-4 ${
            focusedSessionId === session._id ? "border-[#22d3ee] border-b-[#06b6d4]" : ""
          }`}
          style={{
            animationDelay: `${index * 100}ms`,
            animation: "slideUp 0.6s ease-out forwards",
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-mono text-white uppercase tracking-tight">
                  {session.name} ({session.time})
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="bg-[#0d0d0e] border border-[#262626] text-neutral-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    {session.givenBy === "trainer" ? "Trainer" : session.givenBy === "admin" ? "Admin" : "You"}
                  </span>
                  {session.isDone ? (
                    <span className="bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Done
                    </span>
                  ) : isSessionPast ? (
                    <span className="bg-red-950/30 text-red-400 border border-red-900/40 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Missed
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
              {canStartSession && !session.isDone && (
                <Link to={`/workouts/${session._id}/start`} className="w-full sm:w-auto">
                  <button className="duo-btn-cyan h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider w-full sm:w-auto">
                    Start
                  </button>
                </Link>
              )}
              {!isSessionPast && !session.isDone && session.givenBy === 'user' && (
                <Link to={`/workouts/${session._id}`} className="w-full sm:w-auto">
                  <button className="duo-btn-outline h-10 px-5 text-xs font-mono font-bold uppercase tracking-wider w-full sm:w-auto">
                    Edit
                  </button>
                </Link>
              )}
            </div>
          </div>

          {session.exercises.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
              {session.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center gap-4 p-3 bg-[#0d0d0e] border border-[#262626] rounded-xl hover:border-neutral-700 transition-colors"
                >
                  <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-[#262626] bg-[#171717]">
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-[#171717] flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-neutral-600 animate-pulse" />
                      </div>
                    )}
                    <img
                      src={exercise.gifUrl || exercise.image || 'https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp'}
                      alt={exercise.name}
                      className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold font-mono text-xs text-white uppercase truncate">{exercise.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase mt-0.5">
                      {exercise.sets} Sets • {exercise.reps}
                      {exercise.weight ? ` • ${exercise.weight}kg` : ""}
                      {exercise.timeTaken ? ` • ${formatTime(exercise.timeTaken)}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 font-mono text-xs uppercase tracking-wide">No exercises added to this session yet.</p>
          )}

          {session.goal && (
            <div className="flex items-center gap-2 bg-[#0d0d0e] border border-[#262626] rounded-xl px-3 py-2 mt-1 self-start">
              <Target className="h-4 w-4 text-[#22d3ee]" />
              <p className="text-[10px] font-mono font-bold text-neutral-300 uppercase tracking-wide">Goal: {session.goal}</p>
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#171717] border-2 border-[#262626] rounded-2xl p-6 text-white">
        <DialogHeader className="mb-4">
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#262626]">
            <img
              src={session.exercises[0]?.gifUrl || session.exercises[0]?.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"}
              alt={session.name}
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/40 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-extrabold font-mono text-white uppercase tracking-tight drop-shadow-md mb-2">
                {session.name} ({session.time})
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#171717]/80 backdrop-blur-sm border border-[#262626] text-neutral-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  {session.givenBy === "trainer" ? "Trainer" : session.givenBy === "admin" ? "Admin" : "You"}
                </span>
                {session.isDone ? (
                  <span className="bg-emerald-950/80 backdrop-blur-sm text-emerald-400 border border-emerald-900/40 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Done
                  </span>
                ) : isSessionPast ? (
                  <span className="bg-red-950/80 backdrop-blur-sm text-red-400 border border-red-900/40 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> Missed
                  </span>
                ) : null}
                {session.goal && (
                  <div className="flex items-center gap-1 bg-[#171717]/80 backdrop-blur-sm border border-[#262626] rounded px-2 py-0.5 text-[9px] font-mono uppercase text-neutral-300">
                    <Target className="h-3 w-3 text-[#22d3ee]" />
                    <span>{session.goal}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 font-mono">
          <h4 className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">DRIVES & PROTOCOLS</h4>
          {session.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex flex-col gap-3 p-4 bg-[#0d0d0e] border border-[#262626] rounded-xl"
            >
              <div className="flex items-center gap-4">
                <img
                  src={exercise.gifUrl || exercise.image || 'https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp'}
                  alt={exercise.name}
                  className="h-20 w-20 object-cover rounded-lg border border-[#262626]"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-sm text-white uppercase truncate">{exercise.name}</p>
                  <p className="text-xs text-neutral-400 uppercase mt-1">
                    {exercise.sets} Sets • {exercise.reps}
                    {exercise.weight ? ` • ${exercise.weight}kg` : ""}
                    {exercise.timeTaken ? ` • Time: ${formatTime(exercise.timeTaken)}` : ""}
                  </p>
                </div>
              </div>
              
              {exercise.setDetails && exercise.setDetails.length > 0 && (
                <div className="pl-4 border-l-2 border-[#22d3ee]/30 space-y-2 mt-1">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">Set Breakdown:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    {exercise.setDetails.map((set) => (
                      <div key={set.setNumber} className="bg-[#171717] border border-[#262626] p-2 rounded-lg text-neutral-300">
                        <span className="font-bold text-[#22d3ee]">Set {set.setNumber}:</span> {formatTime(set.duration)}
                        {set.restDuration > 0 && (
                          <div className="text-[9px] text-neutral-500 mt-0.5">Rest: {set.restDuration}s</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {session.notes && (
            <div className="p-4 bg-[#0d0d0e] border border-[#262626] rounded-xl space-y-1">
              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">SESSION NOTES</p>
              <p className="text-xs text-neutral-200">{session.notes}</p>
            </div>
          )}
        </div>

        {canStartSession && !session.isDone && (
          <div className="mt-6 pt-4 border-t border-[#262626]">
            <Link to={`/workouts/${session._id}/start`}>
              <button className="duo-btn-cyan w-full h-12 text-sm font-mono font-bold uppercase tracking-wider">
                Start Session
              </button>
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function WorkoutPage() {
  const dispatch = useDispatch();

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
    } catch (errVal) {
      const err = errVal as SafeAny;
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
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />
      
      <main className="relative container mx-auto px-6 py-12 space-y-8 flex-1 z-10 max-w-5xl w-full">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleDateChange("prev")}
                className="duo-btn-gray h-11 w-11 flex items-center justify-center rounded-xl shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-extrabold font-mono text-white uppercase tracking-tight text-center min-w-[150px]">
                  {format(selectedDate, "MMMM d")}
                </h1>

                <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="duo-btn-outline h-11 w-11 flex items-center justify-center rounded-xl shrink-0"
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-fit p-4 border-2 border-[#262626] bg-[#171717] rounded-2xl text-white">
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

              <button
                onClick={() => handleDateChange("next")}
                className="duo-btn-gray h-11 w-11 flex items-center justify-center rounded-xl shrink-0"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <FilterButtons />
          </div>
        </section>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
            <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing quest logs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/20 rounded-xl border border-red-900/30">
              <span className="text-red-400 font-mono text-xs font-bold uppercase tracking-wider">{error}</span>
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
            <div className="bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl py-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-[#0d0d0e] border border-[#262626] rounded-full flex items-center justify-center text-neutral-600">
                <Dumbbell className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold font-mono text-white uppercase tracking-tight">No Workouts Logged</h3>
                <p className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
                  Your workout matrix is clean for this date.
                </p>
              </div>
            </div>
          )
        )}
      </main>
      
      <SiteFooter />
    </div>
  );
}