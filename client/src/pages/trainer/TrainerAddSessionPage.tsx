"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Plus, ArrowLeft, Trash2 } from "lucide-react";
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
  index,
  onRemove,
}: {
  exercise: Exercise;
  index: number;
  onRemove: () => void;
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
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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

export default function TrainerAddSessionPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [allSuggestions, setAllSuggestions] = useState<WgerExerciseSuggestion[]>([]);
  const [displayedSuggestions, setDisplayedSuggestions] = useState<WgerExerciseSuggestion[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<WgerExerciseInfo | null>(null);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<string>("10-12");
  const [timeDuration, setTimeDuration] = useState<string>("30 min");
  const [weight, setWeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showExerciseSearch, setShowExerciseSearch] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(8);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (debouncedQuery && showExerciseSearch && !selectedExercise) {
      fetchSuggestions(debouncedQuery);
      setPage(1);
    } else {
      setAllSuggestions([]);
      setDisplayedSuggestions([]);
    }
  }, [debouncedQuery, showExerciseSearch, selectedExercise]);

  useEffect(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setDisplayedSuggestions(allSuggestions.slice(start, end));
  }, [page, allSuggestions]);

  async function fetchSession() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get(`/workout/sessions/${sessionId}`);
      const session = response.data;
      setName(session.name);
      setTime(session.time);
      setGoal(session.goal || "");
      setNotes(session.notes || "");
      setDate(session.date);
      setExercises(session.exercises || []);
    } catch (err: any) {
      setError("Failed to fetch session");
      toast.error("Failed to load session", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSuggestions(term: string) {
    setIsSuggestionsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://wger.de/api/v2/exercise/search/?term=${term}&language=2`);
      if (!response.ok) throw new Error("Failed to fetch exercise suggestions");
      const data = await response.json();
      setAllSuggestions(data.suggestions || []);
    } catch (err: any) {
      setError(err.message || "Error fetching exercise suggestions");
      console.error('err', err);
      toast.error("Failed to load suggestions", { description: err.message });
    } finally {
      setIsSuggestionsLoading(false);
    }
  }

  async function handleSelectExercise(exerciseId: string, exerciseName: string) {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching exercise:", exerciseId);
      const response = await fetch(`https://wger.de/api/v2/exerciseinfo/${exerciseId}/?language=2`);
      if (!response.ok) {
        throw new Error(`Failed to fetch exercise details: ${response.status}`);
      }
      const data = await response.json();
      setSelectedExercise({ ...data, name: exerciseName });
      setShowConfig(true);
      setSets(3);
      setReps("10-12");
      setTimeDuration("30 min");
      setWeight(0);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Error fetching exercise details");
      toast.error("Failed to load exercise details", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddExercise() {
    if (selectedExercise) {
      const newExercise: Exercise = {
        id: selectedExercise.id.toString(),
        name: selectedExercise.name,
        sets,
        reps: selectedExercise.category === 15 ? undefined : reps,
        time: selectedExercise.category === 15 ? timeDuration : undefined,
        weight:
          selectedExercise.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7)
            ? weight
            : undefined,
        image:
          selectedExercise.images?.find((img) => img.is_main)?.image ||
          selectedExercise.images?.[0]?.image ||
          "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp",
      };
      setExercises([...exercises, newExercise]);
      setSelectedExercise(null);
      setShowConfig(false);
      setSearchQuery("");
      toast.success(`Added ${newExercise.name} to session`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !time.trim() || !date.trim()) {
      toast.error("Session name, time, and date are required");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (sessionId) {
        // Update existing session
        await API.patch(`/workout/sessions/${sessionId}`, {
          name,
          date,
          time,
          goal,
          notes,
          exercises,
        });
        toast.success("Session updated");
      } else {
        // Create new session
        await API.post("/workout/trainer-create-workout-session", {
          clientId,
          date,
          name,
          time,
          goal,
          notes,
          exercises,
        });
        toast.success("Session created");
      }
      navigate(`/trainer/workout/${clientId}`);
    } catch (err: any) {
      toast.error(sessionId ? "Failed to update session" : "Failed to create session");
      setError(sessionId ? "Failed to update session" : "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  }

  const isWeighted =
    selectedExercise?.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7);
  const isCardio = selectedExercise?.category === 15;
  const totalPages = Math.ceil(allSuggestions.length / perPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <section className="flex flex-col items-start gap-4">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {sessionId ? "Edit Workout Session" : "Add New Workout Session"}
            </h1>
            <Button
              variant="ghost"
              className="group hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate(`/trainer/workout/${clientId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Workouts
            </Button>
          </div>
        </section>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Loading session...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full border border-destructive/20 mb-4">
              <span className="text-destructive font-medium">{error}</span>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-foreground">Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-background/50 border-border/50"
                    disabled={!!sessionId}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Session Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Strength"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Time</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Goal</Label>
                  <Input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g., Build muscle"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Notes</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Focus on form"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                {exercises.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-foreground">Added Exercises</Label>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                      {exercises.map((exercise, idx) => (
                        <AddedExerciseCard
                          key={exercise.id}
                          exercise={exercise}
                          index={idx}
                          onRemove={() => setExercises(exercises.filter((_, i) => i !== idx))}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {!showExerciseSearch && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
                    onClick={() => setShowExerciseSearch(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Exercise
                  </Button>
                )}
                {showExerciseSearch && !showConfig && (
                  <div className="space-y-4">
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
                    {!isSuggestionsLoading && !error && displayedSuggestions.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {displayedSuggestions.map((sug) => (
                          <ExerciseSuggestionCard
                            key={sug.data.id}
                            suggestion={sug}
                            onAdd={() => handleSelectExercise(sug.data.base_id, sug.value)}
                            isLoading={isLoading}
                          />
                        ))}
                      </div>
                    )}
                    {!isSuggestionsLoading && !error && allSuggestions.length > 0 && (
                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="outline"
                          disabled={page === 1 || isSuggestionsLoading}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                          Previous
                        </Button>
                        <span className="text-muted-foreground">
                          Page {page} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          disabled={page >= totalPages || isSuggestionsLoading}
                          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                    {!isSuggestionsLoading && !error && allSuggestions.length === 0 && searchQuery && (
                      <div className="text-center py-8 text-muted-foreground">
                        <h3 className="text-lg font-semibold text-foreground">No exercises found</h3>
                        <p>Try a different search term or check your spelling.</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-border/50"
                      onClick={() => setShowExerciseSearch(false)}
                    >
                      Back to Session Details
                    </Button>
                  </div>
                )}
                {showExerciseSearch && showConfig && selectedExercise && (
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
                            value={timeDuration}
                            onChange={(e) => setTimeDuration(e.target.value)}
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
                        type="button"
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
                        type="button"
                        onClick={handleAddExercise}
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Add to Session
                      </Button>
                    </div>
                  </div>
                )}
                {!showExerciseSearch && (
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!name.trim() || !time.trim() || !date.trim()}
                  >
                    {sessionId ? "Update Session" : "Create Session"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}