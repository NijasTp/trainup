"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Dumbbell, Plus, Target, ArrowLeft, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import API from "@/lib/axios";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

interface WgerExerciseSuggestion {
  value: string;
  data: {
    id: string;
    base_id: string;
    name: string;
    category: string;
    image: string;
    image_thumbnail: string;
  };
}

interface WgerExerciseInfo {
  id: number;
  name: string;
  description: string;
  category: number;
  equipment?: number[];
  images?: { image: string; is_main: boolean }[];
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps?: string;
  time?: string;
  weight?: number;
  image?: string;
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
}

interface WorkoutDay {
  _id: string;
  userId: string;
  date: string;
  sessions: WorkoutSession[];
}

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
      <Label htmlFor="date-picker" className="text-muted-foreground font-medium">
        Select Date:
      </Label>
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

function ExerciseSuggestionCard({
  suggestion,
  onAdd,
  isLoading,
}: {
  suggestion: WgerExerciseSuggestion;
  onAdd: () => void;
  isLoading: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-foreground">{suggestion.value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant="secondary" className="bg-white text-black border-0 shadow-lg">
            {suggestion.data.category}
          </Badge>
          <div className="relative w-full h-32">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center rounded-md">
                <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            <img
              src={
                suggestion.data.image
                  ? `https://wger.de${suggestion.data.image}`
                  : suggestion.data.image_thumbnail
                    ? `https://wger.de${suggestion.data.image_thumbnail}`
                    : "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"
              }
              alt={suggestion.value}
              className={`w-full h-32 object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            onClick={onAdd}
            disabled={isLoading}
          >
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddedExerciseCard({
  exercise,
  index
}: {
  exercise: Exercise;
  index: number;
  sessionId: string;
  onExerciseRemoved: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);



  return (
    <Card
      className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "slideUp 0.6s ease-out forwards",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Dumbbell className="h-5 w-5 text-primary" />
            {exercise.name}
          </CardTitle>

        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 animate-pulse flex items-center justify-center rounded-md">
                <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            <img
              src={exercise.image || "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"}
              alt={exercise.name}
              className={`h-16 w-16 object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {exercise.sets} sets • {exercise.reps || exercise.time}
            {exercise.weight ? ` • ${exercise.weight}kg` : ""}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExerciseSearchModal({
  sessionId,
  onExerciseAdded,
}: {
  sessionId: string;
  onExerciseAdded: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [suggestions, setSuggestions] = useState<WgerExerciseSuggestion[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<WgerExerciseInfo | null>(null);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<string>("10-12");
  const [time, setTime] = useState<string>("30 min");
  const [weight, setWeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  useEffect(() => {
    if (debouncedQuery && !selectedExercise) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery, selectedExercise]);

  async function fetchSuggestions(term: string) {
    setIsSuggestionsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/wger/exercise/search/?term=${term}&language=2`);
      if (!response.ok) throw new Error("Failed to fetch exercise suggestions");
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || "Error fetching exercise suggestions");
      toast.error("Failed to load suggestions", { description: err.message });
    } finally {
      setIsSuggestionsLoading(false);
    }
  }

  async function handleSelectExercise(exerciseId: string, exerciseName: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/wger/exerciseinfo/${exerciseId}/?language=2`);
      if (!response.ok) throw new Error("Failed to fetch exercise details");
      const data = await response.json();
      setSelectedExercise({ ...data, name: exerciseName });
      setShowConfig(true);
      setSets(3);
      setReps("10-12");
      setTime("30 min");
      setWeight(0);
    } catch (err: any) {
      setError(err.message || "Error fetching exercise details");
      toast.error("Failed to load exercise details", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddToSession() {
    if (selectedExercise) {
      try {
        const newExercise: Exercise = {
          id: selectedExercise.id.toString(),
          name: selectedExercise.name,
          sets,
          reps: selectedExercise.category === 15 ? undefined : reps,
          time: selectedExercise.category === 15 ? time : undefined,
          weight:
            selectedExercise.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7)
              ? weight
              : undefined,
          image:
            selectedExercise.images?.find((img) => img.is_main)?.image ||
            selectedExercise.images?.[0]?.image ||
            "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp",
        };
        await API.patch(`/workout/sessions/${sessionId}`, {
          exercises: [newExercise],
        });
        onExerciseAdded();
        toast.success(`Added ${selectedExercise.name} to session`);
        setSelectedExercise(null);
        setShowConfig(false);
        setSearchQuery("");
      } catch (err: any) {
        toast.error("Failed to add exercise");
      }
    }
  }

  const isWeighted =
    selectedExercise?.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7);
  const isCardio = selectedExercise?.category === 15;

  return (
    <Dialog>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card/80 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle>{showConfig ? `Configure ${selectedExercise?.name}` : "Search Exercises"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!showConfig && (
            <>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-1 shadow-lg">
                  <Input
                    placeholder="Search for exercises... (e.g., Squats, Bench Press)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-4 pr-4 py-6 bg-transparent border-0 text-base font-medium placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
              {isSuggestionsLoading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-muted-foreground font-medium">Searching exercises...</p>
                </div>
              )}
              {error && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full border border-destructive/20 mb-4">
                    <span className="text-destructive font-medium">{error}</span>
                  </div>
                </div>
              )}
              {!isSuggestionsLoading && !error && suggestions.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {suggestions.map((sug) => (
                    <ExerciseSuggestionCard
                      key={sug.data.id}
                      suggestion={sug}
                      onAdd={() => handleSelectExercise(sug.data.base_id, sug.value)}
                      isLoading={isLoading}
                    />
                  ))}
                </div>
              )}
              {!isSuggestionsLoading && !error && suggestions.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <h3 className="text-lg font-semibold text-foreground">No exercises found</h3>
                  <p>Try a different search term or check your spelling.</p>
                </div>
              )}
            </>
          )}
          {showConfig && selectedExercise && (
            <div className="space-y-6">
              {selectedExercise.description && (
                <div
                  className="text-muted-foreground prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedExercise.description }}
                />
              )}
              {selectedExercise.images && selectedExercise.images.length > 0 && (
                <img
                  src={
                    selectedExercise.images.find((img) => img.is_main)?.image ||
                    selectedExercise.images[0].image ||
                    "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"
                  }
                  alt={selectedExercise.name || "Exercise"}
                  className="w-full h-64 object-cover rounded-md"
                />
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sets" className="text-foreground font-medium">
                    Sets
                  </Label>
                  <Input
                    id="sets"
                    type="number"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    min="1"
                    className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
                {isCardio ? (
                  <div>
                    <Label htmlFor="time" className="text-foreground font-medium">
                      Time
                    </Label>
                    <Input
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="e.g., 30 min"
                      className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="reps" className="text-foreground font-medium">
                      Reps
                    </Label>
                    <Input
                      id="reps"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="e.g., 10-12"
                      className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                )}
                {isWeighted && (
                  <div>
                    <Label htmlFor="weight" className="text-foreground font-medium">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      min="0"
                      className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedExercise(null);
                    setShowConfig(false);
                    setSearchQuery("");
                  }}
                  className="border-border/50"
                >
                  Back to Search
                </Button>
                <Button
                  onClick={handleAddToSession}
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add to Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WorkoutSessionCard({
  session,
  index,
  onExerciseAdded,
  clientId,
}: {
  session: WorkoutSession;
  index: number;
  onExerciseAdded: () => void;
  clientId: string;
}) {
  const navigate = useNavigate();

  return (
    <Card
      className="group relative overflow-hidden bg-card/40 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
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
            <Badge className="bg-primary/90 text-primary-foreground shadow-lg">Trainer</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
              onClick={() => navigate(`/trainer/workout/add-session/${clientId}?sessionId=${session._id}`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <ExerciseSearchModal sessionId={session._id} onExerciseAdded={onExerciseAdded} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {session.exercises.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {session.exercises.map((exercise, idx) => (
              <AddedExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={idx}
                sessionId={session._id}
                onExerciseRemoved={onExerciseAdded}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-4">No exercises in this session yet.</p>
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

export default function TrainerAddWorkoutPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyWorkouts, setDailyWorkouts] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDate && clientId) {
      fetchWorkouts();
    } else {
      setDailyWorkouts([]);
    }
  }, [selectedDate, clientId]);

  async function fetchWorkouts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get(`/workout/trainer-get-days/${selectedDate}`, {
        params: { clientId },
      });
      const workoutDay = response.data
        ? [response.data]
        : [{ _id: "", userId: clientId!, date: selectedDate!, sessions: [] }];
      setDailyWorkouts(workoutDay);
    } catch (err: any) {
      setError("Failed to fetch workouts");
      toast.error("Failed to load workouts", { description: err.message });
      setDailyWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }

  const sessionsForDate = dailyWorkouts
    .find((dw) => dw.date === selectedDate)
    ?.sessions.filter((session) => session.givenBy === "trainer") || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <main className="relative container mx-auto px-4 py-12 space-y-8 flex-1">
        <section className="flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Assign Workout for Client
            </h1>
            <Button
              variant="ghost"
              className="group hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate(`/trainer/user/${clientId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Client Details
            </Button>
          </div>
          <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </section>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Loading workouts...</p>
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
                Sessions for {format(new Date(selectedDate), "MMMM d, yyyy")}
              </h2>
              <Button
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate(`/trainer/workout/add-session/${clientId}`)}
                disabled={!selectedDate}
              >
                <Plus className="h-4 w-4 mr-2" /> Add New Session
              </Button>
            </div>
            {sessionsForDate.length > 0 ? (
              sessionsForDate.map((session, index) => (
                <WorkoutSessionCard
                  key={session._id}
                  session={session}
                  index={index}
                  onExerciseAdded={fetchWorkouts}
                  clientId={clientId!}
                />
              ))
            ) : (
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                    <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">No sessions found</h3>
                  <p className="mb-4">No trainer-assigned workout sessions for this day.</p>
                  <Button
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate(`/trainer/workout/add-session/${clientId}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Session
                  </Button>
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
                <p>Please select a date to view or assign workout sessions.</p>
              </CardContent>
            </Card>
          )
        )}
      </main>
      <SiteFooter />
    </div>
  );
}