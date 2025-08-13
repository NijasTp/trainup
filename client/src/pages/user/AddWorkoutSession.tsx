import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SiteHeader, SiteFooter } from "./HomePage";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "use-debounce";
import { createWorkoutSession } from "@/services/workoutService";

interface WgerExerciseSuggestion {
    value: string;
    data: {
        id: string;
        base_id: string;
        name: string;
        category: string;
        image: string;
        image_thumbail: string
    };
}

interface WgerExerciseInfo {
    id: number;
    name: string;
    description: string;
    category: number;
    equipment?: number[];
    images?: { image: string; is_main: boolean }[];
    muscles?: number[];
}

interface AddedExercise {
    id: string;
    name: string;
    sets: number;
    reps?: string;
    time?: string;
    weight?: number;
    image?: string; 
}


export interface Exercise {
  id?: string;
  name: string;
  sets?: number;
  reps?: string;
  time?: string;
  weight?: number;
  image?: string;
}

export interface WorkoutSessionPayload {
  name: string;
  givenBy?: 'trainer' | 'user'; 
  date?: string;
  time?: string;
  goal?: string;
  notes?: string;
  exercises?: Exercise[];
}

export default function AddSessionPage() {
    const [sessionName, setSessionName] = useState<string>("");
    const [sessionDate, setSessionDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [sessionTime, setSessionTime] = useState<string>(format(new Date(), "HH:mm"));
    const [sessionGoal, setSessionGoal] = useState<string>(""); // Added goal state
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (debouncedQuery) {
            fetchSuggestions(debouncedQuery);
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery]);

    const fetchSuggestions = async (term: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://wger.de/api/v2/exercise/search/?term=${term}&language=2`);
            if (!response.ok) throw new Error("Failed to fetch exercise suggestions");
            const data = await response.json();
            setSuggestions(data.suggestions || []);
        } catch (error: any) {
            setError(error.message || "Error fetching exercise suggestions");
            console.error("Error fetching suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = async (exerciseId: string, exerciseName: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`https://wger.de/api/v2/exerciseinfo/${exerciseId}/?language=2`);
            if (!response.ok) throw new Error("Failed to fetch exercise details");
            const data = await response.json();
            setSelectedExercise({ ...data, name: exerciseName });
            console.log('Selected exercise:', selectedExercise);
            setModalOpen(true);
            // Reset form
            setSets(3);
            setReps("10-12");
            setTime("30 min");
            setWeight(0);
        } catch (error: any) {
            setError(error.message || "Error fetching exercise details");
            console.error("Error fetching exercise info:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToSession = () => {
        if (selectedExercise) {
            const newExercise: AddedExercise = {
                id: selectedExercise.id.toString(),
                name: selectedExercise.name,
                sets,
                reps: selectedExercise.category === 15 ? undefined : reps,
                time: selectedExercise.category === 15 ? time : undefined,
                weight:
                    selectedExercise.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7)
                        ? weight
                        : undefined,
                image: selectedExercise.images?.find((img) => img.is_main)?.image ||
                    selectedExercise.images?.[0]?.image || undefined // Added image
            };
            setAddedExercises([...addedExercises, newExercise]);
            setModalOpen(false);
        }
    };

    const handleCreateSession = async () => {
        const payload: WorkoutSessionPayload = {
            name: sessionName,
            date: sessionDate,
            time: sessionTime,
            goal: sessionGoal,
            exercises: addedExercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                time: ex.time,
                weight: ex.weight,
                image: ex.image
            })),
        };
    
        try {
            console.log('Creating workout session:', payload);
            const data = await createWorkoutSession(payload);
            console.log('Workout created:', data);
            // Optional: redirect or update state
        } catch (err) {
            console.error('Error creating workout:', err);
        }
    };

    const isWeighted = selectedExercise?.equipment && selectedExercise.equipment.length > 0 && !selectedExercise.equipment.includes(7);
    const isCardio = selectedExercise?.category === 15;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="container py-6 space-y-8 animate-fade-in">
                <h1 className="text-2xl font-semibold">Add New Session</h1>

                <section className="space-y-4">
                    <div>
                        <Label htmlFor="session-name">Session Name</Label>
                        <Input
                            id="session-name"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            placeholder="e.g., Morning Strength"
                        />
                    </div>
                    <div>
                        <Label htmlFor="session-goal">Session Goal</Label>
                        <Input
                            id="session-goal"
                            value={sessionGoal}
                            onChange={(e) => setSessionGoal(e.target.value)}
                            placeholder="e.g., Increase endurance"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <Label htmlFor="session-date">Date</Label>
                            <Input
                                id="session-date"
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="session-time">Time</Label>
                            <Input
                                id="session-time"
                                type="time"
                                value={sessionTime}
                                onChange={(e) => setSessionTime(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Search Exercises</h2>
                    <Input
                        placeholder="Search for exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isLoading && <p className="text-muted-foreground">Loading...</p>}
                    {error && <p className="text-destructive">{error}</p>}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                        {suggestions.map((sug) => (
                            <Card key={sug.data.id} className="hover-scale">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{sug.value}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge>{sug.data.category}</Badge>

                                    <Button
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() => handleAddClick(sug.data.base_id, sug.value)}
                                        disabled={isLoading}
                                    >
                                        Add
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold">Added Exercises</h2>
                    {addedExercises.length > 0 ? (
                        <div className="space-y-4">
                            {addedExercises.map((ex) => (
                                <Card key={ex.id}>
                                    <CardContent className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-2">
                                            <Dumbbell className="h-5 w-5 text-accent" />
                                            <span>{ex.name}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {ex.sets} sets • {ex.reps || ex.time}
                                            {ex.weight ? ` • ${ex.weight}kg` : ""}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No exercises added yet.</p>
                    )}
                </section>

                <Button
                    onClick={handleCreateSession}
                    className="w-full bg-accent text-accent-foreground"
                    disabled={!sessionName || addedExercises.length === 0}
                >
                    Create Session
                </Button>
            </main>
            <SiteFooter />

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add {selectedExercise?.name || "Exercise"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedExercise?.description && (
                            <div dangerouslySetInnerHTML={{ __html: selectedExercise.description }} />
                        )}
                        {selectedExercise?.images && selectedExercise.images.length > 0 && (
                            <img
                                src={
                                    selectedExercise.images.find((img) => img.is_main)?.image ||
                                    selectedExercise.images[0].image ||
                                    ""
                                }
                                alt={selectedExercise.name || "Exercise"}
                                className="w-full h-48 object-cover rounded-md"
                            />
                        )}
                        <div>
                            <Label htmlFor="sets">Sets</Label>
                            <Input
                                id="sets"
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(Number(e.target.value))}
                                min="1"
                            />
                        </div>
                        {isCardio ? (
                            <div>
                                <Label htmlFor="time">Time</Label>
                                <Input
                                    id="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    placeholder="e.g., 30 min"
                                />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="reps">Reps</Label>
                                <Input
                                    id="reps"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    placeholder="e.g., 10-12"
                                />
                            </div>
                        )}
                        {isWeighted && (
                            <div>
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(Number(e.target.value))}
                                    min="0"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddToSession}>Add to Session</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}