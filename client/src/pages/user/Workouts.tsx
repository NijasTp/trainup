import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Dumbbell, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, addDays, subDays, isToday } from "date-fns";
import { SiteHeader, SiteFooter } from "./HomePage"; 
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  image?: string; // Added image field
}

interface WorkoutSession {
  id: string;
  title: string;
  time: string; // e.g., "14:00" for 2:00 PM
  exercises: Exercise[];
  assignedBy: "trainer" | "user";
}

interface DailyWorkouts {
  date: string; // ISO date string
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
            image: "https://cdn.mos.cms.futurecdn.net/v2/t:0,l:218,cw:563,ch:563,q:80,w:563/pLaRi5jXSHDKu6WRydetBo.jpg",
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

export default function WorkoutPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filter, setFilter] = useState<"trainer" | "user">("trainer"); // Only trainer or user
  const [dailyWorkouts, setDailyWorkouts] = useState<DailyWorkouts[]>(mockWorkouts);
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    // Focus on the session closest to current time for today's date
    if (isToday(selectedDate)) {
      const todayWorkouts = dailyWorkouts.find(
        (dw) => dw.date === format(selectedDate, "yyyy-MM-dd")
      );
      if (todayWorkouts?.sessions.length) {
        const now = new Date().toTimeString().slice(0, 5); // e.g., "14:30"
        const closestSession = todayWorkouts.sessions
          .filter((session) => session.assignedBy === filter)
          .reduce((prev, curr) => {
            const prevDiff = Math.abs(
              parseInt(prev.time.replace(":", "")) - parseInt(now.replace(":", ""))
            );
            const currDiff = Math.abs(
              parseInt(curr.time.replace(":", "")) - parseInt(now.replace(":", ""))
            );
            return currDiff < prevDiff ? curr : prev;
          });
        setFocusedSessionId(closestSession.id);
      }
    } else {
      setFocusedSessionId(null);
    }
  }, [selectedDate, dailyWorkouts, filter]);

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

  const filteredSessions = dailyWorkouts
    .find((dw) => dw.date === format(selectedDate, "yyyy-MM-dd"))
    ?.sessions.filter((session) => session.assignedBy === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container py-6 space-y-8 animate-fade-in">
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange("prev")}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">
              Workouts for {format(selectedDate, "MMMM d, yyyy")}
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDateChange("next")}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Input
              type="date"
              value={dateFilter}
              onChange={handleDateInputChange}
              className="w-40"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "trainer" ? "default" : "outline"}
              onClick={() => setFilter("trainer")}
            >
              Trainer Sessions
            </Button>
            <Button
              variant={filter === "user" ? "default" : "outline"}
              onClick={() => setFilter("user")}
            >
              My Sessions
            </Button>
            <Link to="/workouts/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Session
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          {filteredSessions?.length ? (
            filteredSessions.map((session) => (
              <Dialog key={session.id}>
                <DialogTrigger asChild>
                  <Card
                    className={`hover-scale cursor-pointer ${
                      focusedSessionId === session.id ? "border-accent" : ""
                    }`}
                  >
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
                        <div className="flex gap-2">
                          <Button
                            onClick={() => console.log(`Start session ${session.id}`)}
                            className="bg-accent text-accent-foreground"
                          >
                            Start
                          </Button>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Edit session ${session.id}`);
                            }}
                          >
                            Edit
                          </Button>
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
                        <p className="text-muted-foreground">
                          No exercises added to this session yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle>{session.title} ({session.time})</DialogTitle>
                      <Button
                        variant="outline"
                        onClick={() => console.log(`Edit session ${session.id}`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4">
                    {session.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center gap-4 p-4 border-b border-border/60"
                      >
                        <img
                          src={exercise.image}
                          alt={exercise.name}
                          className="h-24 w-24 object-cover rounded-md"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets • {exercise.reps}
                            {exercise.weight ? ` • ${exercise.weight}kg` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="sticky bottom-0 bg-background py-4">
                    <Button
                      className="w-full bg-accent text-accent-foreground"
                      onClick={() => console.log(`Start session ${session.id}`)}
                    >
                      Start Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No {filter === "trainer" ? "trainer-assigned" : "user-created"} workouts scheduled for this day.
              </CardContent>
            </Card>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}