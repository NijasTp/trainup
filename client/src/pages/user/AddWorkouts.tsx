import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Plus, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { toast } from "sonner";
import { getWorkoutDays } from "@/services/workoutService";
import { InfoModal } from "@/components/user/general/InfoModal";

import type { WorkoutSession, WorkoutDay } from "@/interfaces/user/IAddWorkouts";


function DateSelector({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: string | null;
  setSelectedDate: (value: string) => void;
}) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="flex items-center gap-4">
      <label htmlFor="date-picker" className="text-muted-foreground font-medium">
        Select Date:
      </label>
      <Input
        id="date-picker"
        type="date"
        value={selectedDate || ""}
        onChange={handleDateChange}
        className="w-40 bg-card/80 backdrop-blur-sm border-border/50 text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
      />
    </div>
  );
}


function WorkoutSessionCard({ session, index }: { session: WorkoutSession; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      className={`group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2`}
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
            <Badge className="bg-secondary/90 text-foreground shadow-lg">You</Badge>
          </CardTitle>
          <Link to={`/workouts/${session._id}`}>
            <Button
              variant="outline"
              className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
            >
              Edit
            </Button>
          </Link>
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
                    src={
                      exercise.image ||
                      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop"
                    }
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
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No exercises in this session yet.</p>
        )}

        {session.goal && (
          <div className="mt-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Goal: {session.goal}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AddWorkoutPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyWorkouts, setDailyWorkouts] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate) {
      fetchWorkouts();
    } else {
      setDailyWorkouts([]);
    }
  }, [selectedDate]);

  async function fetchWorkouts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getWorkoutDays(selectedDate!);
      const workoutDay = response
        ? [response]
        : [{ _id: "", userId: "", date: selectedDate!, sessions: [] }];
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

  const sessionsForDate = dailyWorkouts
    .find((dw) => dw.date === selectedDate)
    ?.sessions.filter((session) => session.givenBy === "user") || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1">
        <section className="flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Add Workout
            </h1>
            <InfoModal modalMessage="View and manage your personal workout sessions. Select a date to see your created sessions or add a new one. Edit sessions to update exercises or details." />
          </div>
          <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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

        {!isLoading && !error && selectedDate ? (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Your Sessions for {format(new Date(selectedDate), "MMMM d, yyyy")}
              </h2>
              <Link to="/workouts/add-session">
                <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" /> Add New Session
                </Button>
              </Link>
            </div>
            {sessionsForDate.length > 0 ? (
              sessionsForDate.map((session, index) => (
                <WorkoutSessionCard key={session._id} session={session} index={index} />
              ))
            ) : (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                    <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">No sessions found</h3>
                  <p className="mb-4">You haven't created any workout sessions for this day.</p>
                  <Link to="/workouts/add-session">
                    <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="h-4 w-4 mr-2" /> Create a Session
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
        ) : (
          !isLoading &&
          !error && (
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardContent className="py-16 text-center text-muted-foreground">
                <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Select a Date</h3>
                <p>Please select a date to view or add your workout sessions.</p>
              </CardContent>
            </Card>
          )
        )}
      </main>
      <SiteFooter />
    </div>
  );
}