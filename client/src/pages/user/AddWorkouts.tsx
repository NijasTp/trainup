import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { SiteHeader, SiteFooter } from "./HomePage";
import { Link } from "react-router-dom";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  image?: string;
}

interface WorkoutSession {
  id: string;
  title: string;
  time: string;
  exercises: Exercise[];
  assignedBy: "trainer" | "user";
}

interface DailyWorkouts {
  date: string;
  sessions: WorkoutSession[];
}

const mockWorkouts: DailyWorkouts[] = [
  {
    date: format(new Date(), "yyyy-MM-dd"),
    sessions: [
      {
        id: "1",
        title: "Morning Strength",
        time: "09:00",
        assignedBy: "trainer",
        exercises: [
          {
            id: "e1",
            name: "Squats",
            sets: 3,
            reps: "12",
            weight: 80,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
          },
          {
            id: "e2",
            name: "Bench Press",
            sets: 3,
            reps: "10",
            weight: 60,
            image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e0e?q=80&w=800&auto=format&fit=crop",
          },
        ],
      },
      {
        id: "2",
        title: "Evening Cardio",
        time: "18:00",
        assignedBy: "user",
        exercises: [
          {
            id: "e3",
            name: "Treadmill",
            sets: 1,
            reps: "30 min",
            image: "https://images.unsplash.com/photo-1557330359-8584f1426186?q=80&w=800&auto=format&fit=crop",
          },
          {
            id: "e4",
            name: "Jump Rope",
            sets: 3,
            reps: "1 min",
            image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop",
          },
        ],
      },
    ],
  },
];

export default function AddWorkoutPage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [dailyWorkouts] = useState<DailyWorkouts[]>(mockWorkouts);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const sessionsForDate = dailyWorkouts.find((dw) => dw.date === selectedDate)?.sessions || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container py-6 space-y-8 animate-fade-in">
        <section className="flex flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold">Add Workout Session</h1>
          <div className="flex items-center gap-4">
            <label htmlFor="date-picker" className="text-muted-foreground">
              Select Date:
            </label>
            <Input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-40"
            />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Sessions for {format(new Date(selectedDate), "MMMM d, yyyy")}
            </h2>
            <Link to="/workouts/add-session">
              <Button>
                Add New Session
              </Button>
            </Link>
          </div>
          {sessionsForDate.length > 0 ? (
            sessionsForDate.map((session) => (
              <Card key={session.id} className="hover-scale">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-accent" />
                      {session.title} ({session.time})
                      <Badge
                        className={
                          session.assignedBy === "trainer"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary"
                        }
                      >
                        {session.assignedBy === "trainer" ? "Trainer" : "You"}
                      </Badge>
                    </CardTitle>
                    <Link to={`/workouts/edit/${session.id}`}>
                      <Button variant="outline">Edit</Button>
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
                          <img
                            src={exercise.image}
                            alt={exercise.name}
                            className="h-16 w-16 object-cover rounded-md"
                            loading="lazy"
                          />
                          <div>
                            <p className="font-medium">{exercise.name}</p>
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
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No sessions for this date. Add a new one!
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}