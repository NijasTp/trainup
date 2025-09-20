// File: AddSessionPage.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Dumbbell, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "use-debounce";
import { createWorkoutSession } from "@/services/workoutService";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InfoModal } from "@/components/user/general/InfoModal";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import * as z from "zod";
import type { AddedExercise, WgerExerciseInfo, WgerExerciseSuggestion, WorkoutSessionPayload } from "@/interfaces/user/addWorkoutSession";

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
    console.log(suggestion.data.image);
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
                        Add
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
    exercise: AddedExercise;
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
                            className={`h-16 w-16 object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"
                                }`}
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

const sessionSchema = z.object({
    name: z.string().min(1, { message: "Session name is required" }),
    givenBy: z.literal("user"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Invalid time format (HH:mm)" }),
    goal: z.string().optional(),
    exercises: z.array(z.object({
        id: z.string(),
        name: z.string(),
        sets: z.number(),
        reps: z.string().optional(),
        time: z.string().optional(),
        weight: z.number().optional(),
        image: z.string(),
    })).min(1, { message: "At least one exercise is required" }),
});

const baseExerciseSchema = z.object({
    sets: z.number().int().min(1, { message: "Sets must be at least 1" }),
});

export default function AddSessionPage() {
    const [sessionName, setSessionName] = useState<string>("");
    const [sessionDate, setSessionDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [sessionTime, setSessionTime] = useState<string>(format(new Date(), "HH:mm"));
    const [sessionGoal, setSessionGoal] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [suggestions, setSuggestions] = useState<WgerExerciseSuggestion[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<WgerExerciseInfo | null>(null);
    const [addedExercises, setAddedExercises] = useState<AddedExercise[]>([]);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [sets, setSets] = useState<number>(3);
    const [reps, setReps] = useState<string>("10-12");
    const [time, setTime] = useState<string>("30 min");
    const [weight, setWeight] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (debouncedQuery) {
            fetchSuggestions(debouncedQuery);
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery]);

    async function fetchSuggestions(term: string) {
        setIsSuggestionsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://wger.de/api/v2/exercise/search/?term=${term}&language=2`);
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

    async function handleAddClick(exerciseId: string, exerciseName: string) {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://wger.de/api/v2/exerciseinfo/${exerciseId}/?language=2`);
            if (!response.ok) throw new Error("Failed to fetch exercise details");
            const data = await response.json();
            setSelectedExercise({ ...data, name: exerciseName });
            setModalOpen(true);
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

    function handleAddToSession() {
        if (selectedExercise) {
            const isCardio = selectedExercise.category === 15;
            const isWeighted = selectedExercise.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7);

            let exerciseSchema = baseExerciseSchema;
            if (isCardio) {
                exerciseSchema = exerciseSchema.extend({
                    time: z.string().min(1, { message: "Time is required for cardio exercises" }),
                });
            } else {
                exerciseSchema = exerciseSchema.extend({
                    reps: z.string().min(1, { message: "Reps are required for non-cardio exercises" }),
                });
            }
            if (isWeighted) {
                exerciseSchema = exerciseSchema.extend({
                    weight: z.number().nonnegative({ message: "Weight must be non-negative" }),
                });
            }

            try {
                exerciseSchema.parse({
                    sets,
                    reps: isCardio ? undefined : reps,
                    time: isCardio ? time : undefined,
                    weight: isWeighted ? weight : undefined,
                });
            } catch (e: any) {
                if (e instanceof z.ZodError) {
                    const errorMessages = e.issues.map((err) => err.message).join("\n");
                    toast.error(`Validation failed:\n${errorMessages}`);
                } else {
                    toast.error("An unexpected error occurred during validation");
                }
                return;
            }

            const newExercise: AddedExercise = {
                id: selectedExercise.id.toString(),
                name: selectedExercise.name,
                sets,
                reps: isCardio ? undefined : reps,
                time: isCardio ? time : undefined,
                weight: isWeighted ? weight : undefined,
                image:
                    selectedExercise.images?.find((img) => img.is_main)?.image ||
                    selectedExercise.images?.[0]?.image ||
                    "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp",
            };
            setAddedExercises([...addedExercises, newExercise]);
            setModalOpen(false);
        }
    }

    async function handleCreateSession() {
        const payload: WorkoutSessionPayload = {
            name: sessionName,
            givenBy: "user",
            date: sessionDate,
            time: sessionTime,
            goal: sessionGoal,
            exercises: addedExercises.map((ex) => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                time: ex.time,
                weight: ex.weight,
                image: ex.image,
            })),
        };

        try {
            sessionSchema.parse(payload);
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                const errorMessages = e.issues.map((err) => err.message).join("\n");
                toast.error(`Validation failed:\n${errorMessages}`);
            } else {
                toast.error("An unexpected error occurred during validation");
            }
            return;
        }

        setIsLoading(true);
        try {
            await createWorkoutSession(payload);
            toast.success("Workout session created!", { description: "Your session has been added to your plan." });
            navigate("/workouts");
        } catch (err: any) {
            setError(err.message || "Error creating workout session");
            toast.error("Failed to create session", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    }

    function handleRemoveExercise(id: string) {
        setAddedExercises(addedExercises.filter((ex) => ex.id !== id));
    }

    const isWeighted =
        selectedExercise?.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7);
    const isCardio = selectedExercise?.category === 15;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <SiteHeader />
            <main className="relative container mx-auto px-4 py-12 space-y-8">
                <div className="flex items-center justify-between w-full">
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                        Create New Workout Session
                    </h1>
                    <InfoModal modalMessage="Create a new workout session by adding details, searching for exercises, and customizing them. Once added, you can save the session to your plan." />
                </div>

                <section className="space-y-6">
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-foreground">Session Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="session-name" className="text-foreground font-medium">
                                    Session Name
                                </Label>
                                <Input
                                    id="session-name"
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    placeholder="e.g., Morning Strength Training"
                                    className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                                />
                            </div>
                            <div>
                                <Label htmlFor="session-goal" className="text-foreground font-medium">
                                    Session Goal
                                </Label>
                                <Input
                                    id="session-goal"
                                    value={sessionGoal}
                                    onChange={(e) => setSessionGoal(e.target.value)}
                                    placeholder="e.g., Build muscle and increase strength"
                                    className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="session-date" className="text-foreground font-medium">
                                        Date
                                    </Label>
                                    <Input
                                        id="session-date"
                                        type="date"
                                        value={sessionDate}
                                        onChange={(e) => setSessionDate(e.target.value)}
                                        className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="session-time" className="text-foreground font-medium">
                                        Time
                                    </Label>
                                    <Input
                                        id="session-time"
                                        type="time"
                                        value={sessionTime}
                                        onChange={(e) => setSessionTime(e.target.value)}
                                        className="bg-transparent border-border/50 focus-visible:ring-2 focus-visible:ring-primary/30"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                        Added Exercises
                    </h2>
                    {addedExercises.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {addedExercises.map((ex, index) => (
                                <AddedExerciseCard
                                    key={ex.id}
                                    exercise={ex}
                                    index={index}
                                    onRemove={() => handleRemoveExercise(ex.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                                    <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">No exercises added</h3>
                                <p>Search and add exercises below to build your session.</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                        Search Exercises
                    </h2>
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
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {suggestions.map((sug) => (
                                <ExerciseSuggestionCard
                                    key={sug.data.id}
                                    suggestion={sug}
                                    onAdd={() => handleAddClick(sug.data.base_id, sug.value)}
                                    isLoading={isLoading}
                                />
                            ))}
                        </div>
                    )}
                    {!isSuggestionsLoading && !error && suggestions.length === 0 && searchQuery && (
                        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <div className="w-24 h-24 mx-auto bg-muted/30 rounded-full flex items-center justify-center mb-6">
                                    <Dumbbell className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground">No exercises found</h3>
                                <p>Try a different search term or check your spelling.</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                <Button
                    onClick={handleCreateSession}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-semibold py-6"
                    disabled={!sessionName || addedExercises.length === 0 || isLoading}
                >
                    {isLoading ? "Creating..." : "Create Session"}
                </Button>
            </main>
            <SiteFooter />

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl bg-card/80 backdrop-blur-sm border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-foreground">
                            Add {selectedExercise?.name || "Exercise"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {selectedExercise?.description && (
                            <div
                                className="text-muted-foreground prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: selectedExercise.description }}
                            />
                        )}
                        {selectedExercise?.images && selectedExercise.images.length > 0 && (
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
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleAddToSession}
                            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Add to Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}