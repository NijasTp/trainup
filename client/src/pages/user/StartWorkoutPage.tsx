import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { getWorkoutSession } from "@/services/workoutService";
import { CheckCircle, Info, Pause, Play, SkipForward } from "lucide-react";

interface IExercise {
  id: string;
  name: string;
  image?: string;
  sets: number;
  weight?: number;
  reps?: string;
  time?: string;
  rest?: string;
  notes?: string;
  isDone?: boolean;
  timeTaken?: number; // Not used in state, but for interface completeness
}

interface IWorkoutSession {
  _id: string;
  name: string;
  givenBy: "trainer" | "user";
  trainerId?: string;
  userId: string;
  date?: string;
  time?: string;
  exercises: IExercise[];
  tags?: string[];
  goal?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseTime {
  exerciseId: string;
  name: string;
  duration: number;
}

function InfoPopup() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:scale-105 transition-all duration-300"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Info className="h-5 w-5 text-primary" />
      </Button>
      {open && (
        <div className="absolute top-12 right-0 w-72 p-5 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-2xl z-20 animate-fade-in">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete each exercise in sequence. Follow the countdown, perform the sets or time, and mark as done to proceed. Use the pause button to pause timers. Track time taken per exercise, add notes, and skip if needed. The UI is fully responsive.
          </p>
        </div>
      )}
    </div>
  );
}

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
  const [phase, setPhase] = useState<"countdown" | "exercise" | "preview">("countdown");
  const [countdown, setCountdown] = useState<number>(3);
  const [timer, setTimer] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewCountdown, setPreviewCountdown] = useState<number>(15);
  const [exerciseTimes, setExerciseTimes] = useState<ExerciseTime[]>([]);
  const [currentExerciseTime, setCurrentExerciseTime] = useState<number>(0);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const lastStartRef = useRef<number | null>(null);
  const whistleSoundRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic preview countdown based on exercise rest time
  useEffect(() => {
    if (session?.exercises[currentExerciseIndex]?.rest) {
      const restTime = parseInt(session.exercises[currentExerciseIndex].rest) || 15;
      setPreviewCountdown(Math.max(5, restTime)); // Minimum 5 seconds
    }
  }, [currentExerciseIndex, session]);

  // Initialize sounds and load session
  useEffect(() => {
    whistleSoundRef.current = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_5b76f6521b.mp3");
    async function fetchSession() {
      setIsLoading(true);
      try {
        const response = await getWorkoutSession(id!);
        setSession({
          ...response,
          exercises: response.exercises.map((ex: IExercise) => ({ ...ex, isDone: false })),
        });
        setExerciseTimes(response.exercises.map((ex: IExercise) => ({
          exerciseId: ex.id,
          name: ex.name,
          duration: 0,
        })));
      } catch (err: any) {
        setError(err.message || "Failed to fetch session");
        toast.error("Failed to load session", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchSession();
  }, [id]);

  // Countdown logic with sound
  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timerId = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (phase === "countdown" && countdown === 0) {
      setPhase("exercise");
      if (session?.exercises[currentExerciseIndex]?.time) {
        const timeStr = session.exercises[currentExerciseIndex].time || "0 min";
        const timeInSeconds = parseInt(timeStr) * 60;
        setTimer(timeInSeconds);
      }
      setAccumulatedTime(0);
      lastStartRef.current = Date.now();
      setCurrentExerciseTime(0);
      setCurrentNotes(session?.exercises[currentExerciseIndex]?.notes || "");
      if (whistleSoundRef.current) {
        whistleSoundRef.current.play().catch(() => console.log("Sound playback failed"));
      }
    }
  }, [phase, countdown, session, currentExerciseIndex]);

  // Exercise timer (for timed exercises)
  useEffect(() => {
    if (phase === "exercise" && timer !== null && timer > 0 && !isPaused) {
      const timerId = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (phase === "exercise" && timer === 0) {
      handleExerciseComplete();
    }
  }, [timer, phase, isPaused]);

  // Current exercise time tracker (excluding pauses)
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

  // Preview timer (rest between exercises)
  useEffect(() => {
    if (phase === "preview" && previewCountdown > 0) {
      const previewTimer = setTimeout(() => setPreviewCountdown(previewCountdown - 1), 1000);
      return () => clearTimeout(previewTimer);
    } else if (phase === "preview" && previewCountdown === 0) {
      setPhase("countdown");
      setCountdown(3);
      setPreviewCountdown(session?.exercises[currentExerciseIndex]?.rest ? parseInt(session.exercises[currentExerciseIndex].rest) || 15 : 15);
    }
  }, [phase, previewCountdown, session, currentExerciseIndex]);

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

  function handleExerciseComplete() {
    if (session) {
      const updatedExercises = [...session.exercises];
      updatedExercises[currentExerciseIndex] = {
        ...updatedExercises[currentExerciseIndex],
        isDone: true,
        notes: currentNotes,
      };
      setSession({ ...session, exercises: updatedExercises });

      const updatedTimes = [...exerciseTimes];
      updatedTimes[currentExerciseIndex].duration = currentExerciseTime;
      setExerciseTimes(updatedTimes);

      if (currentExerciseIndex + 1 < session.exercises.length) {
        setPhase("preview");
        setTimer(null);
        setIsPaused(false);
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      } else {
        const totalWorkoutTime = updatedTimes.reduce((acc, et) => acc + et.duration, 0);
        navigate(`/workouts/${id}/success`, { state: { exerciseTimes: updatedTimes, totalWorkoutTime, isDone: true } });
      }
    }
  }

  function handleSkipExercise() {
    if (session) {
      const updatedExercises = [...session.exercises];
      updatedExercises[currentExerciseIndex] = {
        ...updatedExercises[currentExerciseIndex],
        isDone: true,
      };
      setSession({ ...session, exercises: updatedExercises });

      const updatedTimes = [...exerciseTimes];
      updatedTimes[currentExerciseIndex].duration = 0;
      setExerciseTimes(updatedTimes);

      if (currentExerciseIndex + 1 < session.exercises.length) {
        setPhase("preview");
        setTimer(null);
        setIsPaused(false);
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      } else {
        const totalWorkoutTime = updatedTimes.reduce((acc, et) => acc + et.duration, 0);
        navigate(`/workouts/${id}/success`, { state: { exerciseTimes: updatedTimes, totalWorkoutTime, isComplete: true } });
      }
    }
  }

  function handlePreviousExercise() {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setPhase("preview");
      setTimer(null);
      setIsPaused(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <SiteHeader />
        <main className="relative container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-blue-300 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-300 font-semibold text-lg">Loading your workout...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <SiteHeader />
        <main className="relative container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 rounded-full border border-red-500/30 mb-6">
              <span className="text-red-400 font-semibold text-lg">{error || "Session not found"}</span>
            </div>
            <Button
              onClick={() => navigate("/workouts")}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Back to Workouts
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const progressPercentage = (currentExerciseIndex / session.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 flex flex-col items-center min-h-[calc(100vh-200px)]">
        <div className="flex items-center justify-between w-full max-w-6xl mb-10">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 bg-clip-text text-transparent">
              {session.name}
            </h1>
          </div>
          <InfoPopup />
        </div>

        <div className="w-full max-w-6xl mb-8">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-gray-400 mt-2 text-sm">
            <span>Exercise {currentExerciseIndex + 1} of {session.exercises.length}</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl">
          <div className="lg:w-80 order-last lg:order-first">
            <Card className="bg-gray-800/90 backdrop-blur-md border-blue-500/20 shadow-xl sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-100">Exercise List</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {session.exercises.map((ex, i) => (
                    <li
                      key={i}
                      className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        i === currentExerciseIndex
                          ? "bg-blue-500/20 border border-blue-500/50"
                          : ex.isDone
                          ? "bg-green-500/20 border border-green-500/50"
                          : "bg-gray-700/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-100 font-medium">{ex.name}</span>
                        <div className="flex items-center gap-2">
                          {ex.isDone && <CheckCircle className="h-4 w-4 text-green-400" />}
                          <span className="text-sm text-gray-400">
                            {i < currentExerciseIndex
                              ? formatTime(exerciseTimes[i].duration)
                              : i === currentExerciseIndex
                              ? formatTime(currentExerciseTime)
                              : ""}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {phase === "countdown" && (
              <Card className="bg-gray-800/90 backdrop-blur-md border-blue-500/30 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="text-9xl font-extrabold text-blue-400 animate-pulse">{countdown}</div>
                  <p className="text-2xl text-gray-300 mt-6 font-medium">Get ready for {currentExercise.name}!</p>
                </CardContent>
              </Card>
            )}

            {phase === "preview" && currentExerciseIndex < session.exercises.length && (
              <Card className="bg-gray-800/90 backdrop-blur-md border-blue-500/30 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-gray-100">Coming Up Next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={
                        currentExercise.image
                          ? currentExercise.image.startsWith("http")
                            ? currentExercise.image
                            : `https://wger.de${currentExercise.image}`
                          : "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"
                      }
                      alt={currentExercise.name}
                      className="w-full h-64 md:h-72 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                    />
                    <h3 className="text-2xl font-bold text-gray-100 mt-4">{currentExercise.name}</h3>
                    <div className="text-sm text-gray-400 mt-2">
                      {currentExercise.sets} sets • {currentExercise.reps || currentExercise.time}
                      {currentExercise.weight ? ` • ${currentExercise.weight}kg` : ""}
                      {currentExercise.rest && ` • Rest: ${currentExercise.rest}`}
                      {currentExercise.notes && <p className="mt-2 text-gray-300">Notes: {currentExercise.notes}</p>}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-blue-400">Starting in {previewCountdown} seconds...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {phase === "exercise" && (
              <Card className="bg-gray-800/90 backdrop-blur-md border-blue-500/30 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-gray-100">{currentExercise.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <img
                    src={
                      currentExercise.image
                        ? currentExercise.image.startsWith("http")
                          ? currentExercise.image
                          : `https://wger.de${currentExercise.image}`
                        : "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"
                    }
                    alt={currentExercise.name}
                    className="w-full h-64 md:h-72 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                  />
                  <div className="text-center text-gray-400">
                    {currentExercise.sets} sets • {currentExercise.reps || currentExercise.time}
                    {currentExercise.weight ? ` • ${currentExercise.weight}kg` : ""}
                    {currentExercise.rest && ` • Rest: ${currentExercise.rest}`}
                  </div>
                  <div className="text-center">
                    <p className="text-lg text-gray-300">Time Elapsed: {formatTime(currentExerciseTime)}</p>
                    {currentExercise.time && timer !== null && (
                      <p className="text-5xl font-extrabold text-blue-400 mt-2">
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="text-gray-300 font-medium">Notes:</label>
                    <Textarea
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-gray-100"
                      placeholder="Add or edit notes for this exercise..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {currentExerciseIndex > 0 && (
                      <Button
                        onClick={handlePreviousExercise}
                        variant="outline"
                        className="flex-1 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/70 hover:scale-105 font-semibold py-6 transition-all duration-300"
                      >
                        Previous
                      </Button>
                    )}
                    <Button
                      onClick={togglePause}
                      variant="outline"
                      className="flex-1 bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30 hover:scale-105 transition-all duration-300"
                    >
                      {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                      {isPaused ? "Resume" : "Pause"}
                    </Button>
                    <Button
                      onClick={handleSkipExercise}
                      variant="outline"
                      className="flex-1 bg-yellow-500/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 hover:scale-105 transition-all duration-300"
                    >
                      <SkipForward className="h-5 w-5 mr-2" />
                      Skip
                    </Button>
                    <Button
                      onClick={handleExerciseComplete}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 hover:scale-105 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Mark as Done
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}