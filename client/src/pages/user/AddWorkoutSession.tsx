import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format, isBefore, parse, startOfDay } from "date-fns";
import { Dumbbell, Trash2, Calendar, Clock, Plus, ChevronLeft, ChevronRight, Sparkles, Award, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "use-debounce";
import { createWorkoutSession } from "@/services/workoutService";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { InfoModal } from "@/components/user/general/InfoModal";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import * as z from "zod";
import type { AddedExercise, WgerExerciseInfo, WgerExerciseSuggestion, WorkoutSessionPayload } from "@/interfaces/user/IAddWorkoutSession";
import { searchExercises } from "@/services/exerciseService";

// Premium Suggestion Card
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
        <Card className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-violet-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1.5 rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="p-5 flex flex-col h-full justify-between space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="text-base font-bold text-slate-100 line-clamp-1 group-hover:text-white transition-colors">
                            {suggestion.value}
                        </h4>
                        <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-sm capitalize shrink-0">
                            {suggestion.data.bodyParts?.[0] || "Exercise"}
                        </Badge>
                    </div>
                    {suggestion.data.targetMuscles && (
                        <p className="text-xs text-slate-400 font-medium capitalize line-clamp-1">
                            Target: {suggestion.data.targetMuscles.join(", ")}
                        </p>
                    )}
                </div>

                <div className="relative w-full aspect-square bg-slate-950/40 rounded-xl overflow-hidden border border-white/5">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <Dumbbell className="h-10 w-10 text-violet-400/40 animate-pulse" />
                        </div>
                    )}
                    <img
                        src={suggestion.data.gifUrl || "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"}
                        alt={suggestion.value}
                        className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>

                <Button
                    variant="outline"
                    className="w-full bg-slate-950/60 hover:bg-gradient-to-r hover:from-violet-600 hover:to-indigo-600 text-slate-300 hover:text-white border border-white/10 hover:border-transparent rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 py-5 font-semibold text-sm"
                    onClick={onAdd}
                    disabled={isLoading}
                >
                    <Plus className="h-4 w-4" /> Add Exercise
                </Button>
            </div>
        </Card>
    );
}

// Premium Added Card
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
            className="group relative overflow-hidden bg-slate-950/50 backdrop-blur-xl border border-white/5 hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl rounded-2xl"
            style={{
                animationDelay: `${index * 80}ms`,
                animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="p-4 flex gap-4 items-center justify-between">
                <div className="flex gap-4 items-center min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900">
                        {!imageLoaded && (
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                <Dumbbell className="h-6 w-6 text-slate-600 animate-pulse" />
                            </div>
                        )}
                        <img
                            src={exercise.image || "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp"}
                            alt={exercise.name}
                            className={`h-full w-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                        />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <h4 className="font-bold text-sm text-slate-100 truncate pr-2">
                            {exercise.name}
                        </h4>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                            <span className="text-xs font-semibold text-violet-400">
                                {exercise.sets} Sets
                            </span>
                            <span className="text-slate-500 text-[10px]">•</span>
                            <span className="text-xs text-slate-300">
                                {exercise.reps || exercise.time}
                            </span>
                            {exercise.weight ? (
                                <>
                                    <span className="text-slate-500 text-[10px]">•</span>
                                    <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] px-1.5 py-0">
                                        {exercise.weight} kg
                                    </Badge>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 shrink-0"
                    onClick={onRemove}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}

// Zod schemas
const exerciseSchema = z.object({
    id: z.string().min(1, { message: "Exercise ID is required" }),
    name: z.string().min(1, { message: "Exercise name is required" }).max(100, { message: "Exercise name must be 100 characters or less" }),
    sets: z.number().int().min(1, { message: "Sets must be at least 1" }),
    reps: z.string().optional(),
    time: z.string().optional(),
    weight: z.number().nonnegative().optional(),
    image: z.string().optional(),
    exerciseId: z.string().optional(),
    gifUrl: z.string().optional(),
    bodyParts: z.array(z.string()).optional(),
    targetMuscles: z.array(z.string()).optional(),
    secondaryMuscles: z.array(z.string()).optional(),
    equipments: z.array(z.string()).optional(),
    instructions: z.array(z.string()).optional(),
    description: z.string().optional(),
    exerciseData: z.any().optional(),
}).superRefine((data, ctx) => {
    const isCardio = data.bodyParts?.includes("cardio") || data.id?.startsWith("cardio_");
    const isWeighted = data.weight !== undefined;

    if (isCardio) {
        if (!data.time?.trim()) {
            ctx.addIssue({ code: "custom", message: "Time is required for cardio exercises", path: ["time"] });
        } else if (!/^\d+\s*(min|sec|s|m)$/.test(data.time)) {
            ctx.addIssue({ code: "custom", message: "Time must be a number followed by 'min', 'sec', 's', or 'm' (e.g., '30 min')", path: ["time"] });
        }
    } else {
        if (!data.reps?.trim()) {
            ctx.addIssue({ code: "custom", message: "Reps are required for non-cardio exercises", path: ["reps"] });
        } else if (!/^\d+-\d+$|^\d+$/.test(data.reps)) {
            ctx.addIssue({ code: "custom", message: "Reps must be a number or range (e.g., '10' or '10-12')", path: ["reps"] });
        }
    }

    if (isWeighted && data.weight! < 0) {
        ctx.addIssue({ code: "custom", message: "Weight must be non-negative", path: ["weight"] });
    }
});

const sessionSchema = z.object({
    name: z.string().min(1, { message: "Session name is required" }).max(100, { message: "Session name must be 100 characters or less" }),
    givenBy: z.literal("user"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" }).refine(
        (val) => {
            const selectedDate = parse(val, "yyyy-MM-dd", new Date());
            const currentDate = startOfDay(new Date("2025-09-24T15:29:00+05:30"));
            return !isBefore(selectedDate, currentDate);
        },
        { message: "Date cannot be in the past" }
    ),
    time: z.string().regex(/^\d{2}:\d{2}$/, { message: "Invalid time format (HH:mm)" }),
    goal: z.string().max(500, { message: "Goal must be 500 characters or less" }).optional(),
    exercises: z.array(exerciseSchema).min(1, { message: "At least one exercise is required" }),
});

export default function AddSessionPage() {
    const [sessionName, setSessionName] = useState<string>("");
    const [sessionDate, setSessionDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [sessionTime, setSessionTime] = useState<string>(format(new Date(), "HH:mm"));
    const [sessionGoal, setSessionGoal] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedQuery] = useDebounce(searchQuery, 300);
    const [allSuggestions, setAllSuggestions] = useState<WgerExerciseSuggestion[]>([]);
    const [displayedSuggestions, setDisplayedSuggestions] = useState<WgerExerciseSuggestion[]>([]);
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
    const [page, setPage] = useState<number>(1);
    const [perPage] = useState<number>(9);
    const navigate = useNavigate();

    const nameCharCount = sessionName.length;
    const goalCharCount = sessionGoal.length;
    const maxNameChars = 100;
    const maxGoalChars = 500;

    useEffect(() => {
        if (debouncedQuery) {
            fetchSuggestions(debouncedQuery);
            setPage(1);
        } else {
            setAllSuggestions([]);
            setDisplayedSuggestions([]);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setDisplayedSuggestions(allSuggestions.slice(start, end));
    }, [page, allSuggestions]);

    async function fetchSuggestions(term: string) {
        setIsSuggestionsLoading(true);
        setError(null);
        try {
            const exercises = await searchExercises(term);
            const mapped = exercises.map((ex) => ({
                value: ex.name,
                data: ex,
            }));
            setAllSuggestions(mapped);
        } catch (err: any) {
            setError(err.message || "Error fetching exercise suggestions");
            toast.error("Failed to load suggestions");
        } finally {
            setIsSuggestionsLoading(false);
        }
    }

    function handleAddClick(exerciseId: string) {
        const foundSug = allSuggestions.find((sug) => sug.data.exerciseId === exerciseId);
        if (!foundSug) {
            toast.error("Exercise details not found");
            return;
        }
        setSelectedExercise(foundSug.data);
        setModalOpen(true);
        setSets(3);
        setReps("10-12");
        setTime("30 min");
        setWeight(0);
    }

    function handleAddToSession() {
        if (!selectedExercise) return;

        const isCardio = selectedExercise.bodyParts?.includes("cardio") || false;
        const isWeighted =
            selectedExercise.equipments &&
            selectedExercise.equipments.length > 0 &&
            !selectedExercise.equipments.includes("body weight");

        const exerciseData = {
            id: selectedExercise.exerciseId,
            name: selectedExercise.name,
            sets,
            reps: isCardio ? undefined : reps,
            time: isCardio ? time : undefined,
            weight: isWeighted ? weight : undefined,
            image: selectedExercise.gifUrl || "https://myworkout.ai/wp-content/uploads/2023/09/Image-Placeholder.webp",
            exerciseId: selectedExercise.exerciseId,
            gifUrl: selectedExercise.gifUrl,
            bodyParts: selectedExercise.bodyParts,
            targetMuscles: selectedExercise.targetMuscles,
            secondaryMuscles: selectedExercise.secondaryMuscles,
            equipments: selectedExercise.equipments,
            instructions: selectedExercise.instructions,
            description: selectedExercise.description || "",
            exerciseData: selectedExercise,
        };

        const result = exerciseSchema.safeParse(exerciseData);
        if (!result.success) {
            const errorMessages = result.error.issues.map((err) => err.message).join("\n");
            toast.error(`Validation failed:\n${errorMessages}`);
            return;
        }

        setAddedExercises([...addedExercises, { ...result.data, id: `${result.data.id}-${Date.now()}` }]);
        setModalOpen(false);
    }

    async function handleCreateSession() {
        const payload: WorkoutSessionPayload = {
            name: sessionName,
            givenBy: "user",
            date: sessionDate,
            time: sessionTime,
            goal: sessionGoal,
            exercises: addedExercises,
        };

        const [hours, minutes] = sessionTime.split(":").map(Number);
        const selectedDateTime = parse(sessionDate, "yyyy-MM-dd", new Date());
        selectedDateTime.setHours(hours, minutes);
        const currentDateTime = new Date("2025-09-24T15:29:00+05:30");

        if (isBefore(selectedDateTime, currentDateTime)) {
            toast.error("Validation failed: Time cannot be in the past");
            return;
        }

        const result = sessionSchema.safeParse(payload);
        if (!result.success) {
            const errorMessages = result.error.issues.map((err) => err.message).join("\n");
            toast.error(`Validation failed:\n${errorMessages}`);
            return;
        }

        setIsLoading(true);
        try {
            await createWorkoutSession(result.data);
            toast.success("Workout session created!");
            navigate("/workouts");
        } catch (err: any) {
            setError(err.message || "Error creating workout session");
            toast.error("Failed to create session");
        } finally {
            setIsLoading(false);
        }
    }

    function handleRemoveExercise(id: string) {
        setAddedExercises(addedExercises.filter((ex) => ex.id !== id));
    }

    const isWeighted =
        selectedExercise?.equipments &&
        selectedExercise.equipments.length > 0 &&
        !selectedExercise.equipments.includes("body weight");
    const isCardio = selectedExercise?.bodyParts?.includes("cardio") || false;
    const totalPages = Math.ceil(allSuggestions.length / perPage);

    return (
        <div className="relative min-h-screen bg-[#030712] text-white flex flex-col font-outfit overflow-x-hidden selection:bg-violet-600/30 selection:text-violet-200">
            {/* Ambient Background Lights */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

            <SiteHeader />

            <main className="relative container mx-auto px-4 py-8 lg:py-12 space-y-8 lg:space-y-10 flex-1 max-w-7xl">
                {/* Visual Header Banner */}
                <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-slate-900/30 backdrop-blur-xl p-8 lg:p-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-[0_10px_50px_rgba(0,0,0,0.3)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
                    <div className="space-y-3 relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-full text-xs font-semibold tracking-wide">
                            <Sparkles className="h-3.5 w-3.5" /> User Planner Mode
                        </div>
                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-100 via-white to-slate-400 bg-clip-text text-transparent leading-none">
                            Forge Your Perfect Workout
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                            Craft a bespoke training plan by inserting session info, discovering detailed exercises, and customizing rep/set ranges.
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0">
                        <InfoModal modalMessage="Create a new workout session by adding details, searching for exercises, and customizing them. Once added, you can save the session to your plan." />
                    </div>
                </div>

                {/* Bento Grid Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Session Metadata (4 cols on desktop) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-900/30 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-600 to-indigo-600" />
                            <div className="p-6 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-violet-400" /> Session Details
                                    </h3>
                                    <p className="text-slate-400 text-xs">Define name, date, time and active focus target.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="session-name" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                            Session Name
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="session-name"
                                                value={sessionName}
                                                onChange={(e) => setSessionName(e.target.value.slice(0, maxNameChars))}
                                                placeholder="e.g., Hypertrophy Push A"
                                                className="bg-slate-950/40 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all"
                                                maxLength={maxNameChars}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <span className="text-[10px] text-slate-500 font-semibold">
                                                {nameCharCount}/{maxNameChars} chars
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="session-goal" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                            Session Goal / Target
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="session-goal"
                                                value={sessionGoal}
                                                onChange={(e) => setSessionGoal(e.target.value.slice(0, maxGoalChars))}
                                                placeholder="e.g., Chest hypertrophy and tricep focus"
                                                className="bg-slate-950/40 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all"
                                                maxLength={maxGoalChars}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <span className="text-[10px] text-slate-500 font-semibold">
                                                {goalCharCount}/{maxGoalChars} chars
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="session-date" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Date
                                            </Label>
                                            <Input
                                                id="session-date"
                                                type="date"
                                                value={sessionDate}
                                                onChange={(e) => setSessionDate(e.target.value)}
                                                min={format(new Date("2025-09-24"), "yyyy-MM-dd")}
                                                className="bg-slate-950/40 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all text-xs"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="session-time" className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-slate-400" /> Time
                                            </Label>
                                            <Input
                                                id="session-time"
                                                type="time"
                                                value={sessionTime}
                                                onChange={(e) => setSessionTime(e.target.value)}
                                                className="bg-slate-950/40 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Save Action */}
                        <Button
                            onClick={handleCreateSession}
                            className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-6 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] flex items-center justify-center gap-2 group text-sm"
                            disabled={!sessionName || addedExercises.length === 0 || isLoading}
                        >
                            <Play className="h-4 w-4 fill-white group-hover:scale-110 transition-transform" />
                            {isLoading ? "Creating Plan..." : "Publish Session to Plan"}
                        </Button>
                    </div>

                    {/* Right Column: Added Exercises & Exercise Finder (8 cols on desktop) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Section: Added Exercises */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
                                    Added Exercises
                                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-white/5 shrink-0">
                                        {addedExercises.length}
                                    </span>
                                </h3>
                            </div>

                            {addedExercises.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
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
                                <Card className="bg-slate-900/20 backdrop-blur-md border border-dashed border-white/10 rounded-2xl">
                                    <div className="py-10 text-center text-slate-400 space-y-3">
                                        <div className="w-16 h-16 mx-auto bg-slate-950/60 rounded-full flex items-center justify-center border border-white/5">
                                            <Dumbbell className="h-6 w-6 text-slate-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-300 text-sm">Planner is Empty</h4>
                                            <p className="text-xs text-slate-500 max-w-sm mx-auto">Discover and add exercises from the search console below to build your schedule.</p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Section: Search and Discovery Console */}
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-100">
                                    Search and Discover
                                </h3>
                                <p className="text-xs text-slate-400">Search 1,500+ ExerciseDB records directly on the client side with fuzzy matching.</p>
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-1 shadow-lg flex items-center">
                                    <span className="pl-4 shrink-0">
                                        <Sparkles className="h-5 w-5 text-violet-400 animate-pulse" />
                                    </span>
                                    <Input
                                        placeholder="Fuzzy search exercises... (e.g. Squat, Bench Press, Lunge)"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-0 text-slate-100 placeholder:text-slate-500 text-base font-medium py-7 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none w-full"
                                    />
                                </div>
                            </div>

                            {isSuggestionsLoading && (
                                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin" />
                                    </div>
                                    <p className="text-slate-500 font-bold text-xs tracking-wider uppercase animate-pulse">Consulting ExerciseDB...</p>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20 mb-4">
                                        <span className="text-red-400 text-xs font-semibold">{error}</span>
                                    </div>
                                </div>
                            )}

                            {!isSuggestionsLoading && !error && displayedSuggestions.length > 0 && (
                                <div className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                        {displayedSuggestions.map((sug, idx) => (
                                            <ExerciseSuggestionCard
                                                key={`${sug.data.exerciseId}-${idx}`}
                                                suggestion={sug}
                                                onAdd={() => handleAddClick(sug.data.exerciseId)}
                                                isLoading={isLoading}
                                            />
                                        ))}
                                    </div>

                                    {/* Glassmorphic Pagination */}
                                    {allSuggestions.length > perPage && (
                                        <div className="flex justify-between items-center bg-slate-900/20 border border-white/5 rounded-2xl p-3 shadow-md">
                                            <Button
                                                variant="outline"
                                                className="bg-slate-950/60 border-white/5 hover:bg-violet-500/10 text-slate-400 hover:text-white rounded-xl disabled:opacity-40 disabled:hover:bg-slate-950/60"
                                                disabled={page === 1 || isSuggestionsLoading}
                                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                            </Button>
                                            <span className="text-slate-400 text-xs font-bold">
                                                Page {page} of {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                className="bg-slate-950/60 border-white/5 hover:bg-violet-500/10 text-slate-400 hover:text-white rounded-xl disabled:opacity-40 disabled:hover:bg-slate-950/60"
                                                disabled={page >= totalPages || isSuggestionsLoading}
                                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                            >
                                                Next <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!isSuggestionsLoading && !error && allSuggestions.length === 0 && searchQuery && (
                                <Card className="bg-slate-900/10 backdrop-blur-md border border-white/5 rounded-2xl">
                                    <CardContent className="py-16 text-center text-slate-500 space-y-3">
                                        <div className="w-16 h-16 mx-auto bg-slate-950/60 rounded-full flex items-center justify-center border border-white/5">
                                            <Dumbbell className="h-6 w-6 text-slate-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-slate-300 font-bold text-sm">No exercises matched</h3>
                                            <p className="text-xs text-slate-500">Refine search criteria or check spelling.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />

            {/* Premium Configuration Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-2xl bg-[#090D1A]/95 border border-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-indigo-600" />
                    <DialogHeader className="pb-3 border-b border-white/5">
                        <DialogTitle className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-violet-400" />
                            Configure {selectedExercise?.name || "Exercise"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4 max-h-[60vh] overflow-y-auto pr-1">
                        {selectedExercise?.instructions && selectedExercise.instructions.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Instructions</span>
                                <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 text-slate-300 text-xs space-y-2.5 leading-relaxed">
                                    {selectedExercise.instructions.map((inst, i) => (
                                        <p key={i} className="flex gap-2">
                                            <span className="text-violet-400 shrink-0 font-bold">{i + 1}.</span>
                                            <span>{inst}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {selectedExercise?.gifUrl && (
                                <div className="col-span-2 rounded-2xl overflow-hidden border border-white/5 bg-slate-950/40 relative w-full aspect-square">
                                    <img
                                        src={selectedExercise.gifUrl}
                                        alt={selectedExercise.name || "Exercise"}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="sets" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Sets
                                </Label>
                                <Input
                                    id="sets"
                                    type="number"
                                    value={sets}
                                    onChange={(e) => setSets(Number(e.target.value))}
                                    min="1"
                                    className="bg-slate-950/60 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all text-sm font-semibold"
                                />
                            </div>

                            {isCardio ? (
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Time
                                    </Label>
                                    <Input
                                        id="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        placeholder="e.g., 30 min"
                                        className="bg-slate-950/60 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all text-sm font-semibold"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="reps" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Reps
                                    </Label>
                                    <Input
                                        id="reps"
                                        value={reps}
                                        onChange={(e) => setReps(e.target.value)}
                                        placeholder="e.g., 10-12"
                                        className="bg-slate-950/60 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all text-sm font-semibold"
                                    />
                                </div>
                            )}

                            {isWeighted && (
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="weight" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Weight (kg)
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(Number(e.target.value))}
                                        min="0"
                                        className="bg-slate-950/60 border-white/5 focus:border-violet-500/50 text-white rounded-xl focus:ring-violet-500/20 py-5 transition-all text-sm font-semibold"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t border-white/5 flex gap-3">
                        <Button
                            onClick={() => setModalOpen(false)}
                            variant="outline"
                            className="bg-slate-950/40 border-white/5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToSession}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 rounded-xl shadow-lg transition-all"
                        >
                            Add to Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}