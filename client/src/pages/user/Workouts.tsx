import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Dumbbell, Plus, Target, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format, addDays, subDays, isToday, differenceInMinutes, parse } from "date-fns";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { toast } from "sonner";
import { getWorkoutDays } from "@/services/workoutService";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  image?: string;
  timeTaken?: number;
}

interface WorkoutSession {
  _id: string;
  name: string;
  givenBy: "trainer" | "user";
  trainerId?: string;
  date: string;
  time: string;
  exercises: Exercise[];
  goal?: string;
  notes?: string;
  isDone?: boolean;
}

interface WorkoutDay {
  _id: string;
  userId: string;
  date: string;
  sessions: WorkoutSession[];
}

function formatTime(seconds: number | undefined): string {
  if (!seconds) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function DateSelector({
  selectedDate,
  setSelectedDate,
  dateFilter,
  setDateFilter,
}: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
}) {
  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
    setDateFilter(format(newDate, "yyyy-MM-dd"));
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      setDateFilter(e.target.value);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleDateChange("prev")}
        className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
        Workouts for {format(selectedDate, "MMMM d")}
      </h1>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleDateChange("next")}
        className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
        aria-label="Next day"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Input
        type="date"
        value={dateFilter}
        onChange={handleDateInputChange}
        className="w-40 bg-card/80 backdrop-blur-sm border-border/50 text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
      />
    </div>
  );
}

function FilterButtons({ filter, setFilter }: { filter: "trainer" | "user"; setFilter: (value: "trainer" | "user") => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={filter === "trainer" ? "default" : "outline"}
        onClick={() => setFilter("trainer")}
        className={`font-medium ${filter === "trainer" ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg" : "bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"}`}
      >
        Trainer Sessions
      </Button>
      <Button
        variant={filter === "user" ? "default" : "outline"}
        onClick={() => setFilter("user")}
        className={`font-medium ${filter === "user" ? "bg-gradient-to-r from-primary to-primary/90 shadow-lg" : "bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"}`}
      >
        My Sessions
      </Button>
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
  
  // Calculate if Start button should be shown (within 20 minutes of session time)
  const now = new Date();
  const sessionDateTime = parse(`${session.date} ${session.time}`, "yyyy-MM-dd HH:mm", new Date());
  const timeDifference = differenceInMinutes(now, sessionDateTime);
  const canStartSession = Math.abs(timeDifference) <= 20;
  const isSessionPast = timeDifference > 20;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 ${
            focusedSessionId === session._id ? "border-primary/50 shadow-primary/25" : ""
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
                        : "bg-secondary/90 text-foreground shadow-lg"
                    }
                  >
                    {session.givenBy === "trainer" ? "Trainer" : "You"}
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
                {!isSessionPast && !session.isDone && (
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
                        className={`h-16 w-16 object-cover rounded-md transition-opacity duration-500 ${
                          imageLoaded ? "opacity-100" : "opacity-0"
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
                      : "bg-secondary/90 text-foreground"
                  }
                >
                  {session.givenBy === "trainer" ? "Trainer" : "You"}
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
            <Button
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => {
                toast.success(`Started session: ${session.name}`, {
                  description: "Track your progress in the app!",
                });
              }}
            >
              Start Session
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function WorkoutPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<"trainer" | "user">("trainer");
  const [dailyWorkouts, setDailyWorkouts] = useState<WorkoutDay[]>([]);
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "TrainUp - Your Daily Workouts";
    fetchWorkouts();
  }, [selectedDate]);

  async function fetchWorkouts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getWorkoutDays(format(selectedDate, "yyyy-MM-dd"));
      // If response is null (no WorkoutDay found), use an empty array with a default WorkoutDay
      const workoutDay = response ? [response] : [{ _id: "", userId: "", date: format(selectedDate, "yyyy-MM-dd"), sessions: [] }];
      setDailyWorkouts(workoutDay);
      console.log("Fetched workouts:", workoutDay);
    } catch (err: any) {
      setError("Failed to fetch workouts");
      console.error("API error:", err);
      toast.error("Failed to load workouts", { description: err.message });
      setDailyWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isToday(selectedDate)) {
      const todayWorkouts = dailyWorkouts.find(
        (dw) => dw.date === format(selectedDate, "yyyy-MM-dd")
      );
      if (todayWorkouts?.sessions.length) {
        const now = new Date().toTimeString().slice(0, 5);
        const closestSession = todayWorkouts.sessions
          .filter((session) => session.givenBy === filter)
          .reduce((prev, curr) => {
            const prevDiff = Math.abs(
              parseInt(prev.time.replace(":", "")) - parseInt(now.replace(":", ""))
            );
            const currDiff = Math.abs(
              parseInt(curr.time.replace(":", "")) - parseInt(now.replace(":", ""))
            );
            return currDiff < prevDiff ? curr : prev;
          }, todayWorkouts.sessions[0]);
        setFocusedSessionId(closestSession._id);
      } else {
        setFocusedSessionId(null);
      }
    } else {
      setFocusedSessionId(null);
    }
  }, [selectedDate, dailyWorkouts, filter]);

  const filteredSessions = dailyWorkouts.find(
    (dw) => dw.date === format(selectedDate, "yyyy-MM-dd")
  )?.sessions.filter((session) => session.givenBy === filter) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <DateSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
          <FilterButtons filter={filter} setFilter={setFilter} />
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
                <h3 className="text-xl font-semibold text-foreground">No workouts found</h3>
                <p>
                  No {filter === "trainer" ? "trainer-assigned" : "user-created"} workouts scheduled for this day.
                </p>
              </CardContent>
            </Card>
          )
        )}
      </main>
      <SiteFooter />
    </div>
  );
}