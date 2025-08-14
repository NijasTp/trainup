import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";


export function SuggestedWorkouts() {
  const workouts = [
    { title: "Full-Body Power 45", tag: "Trainer", difficulty: "Intermediate" },
    { title: "Core Crusher 20", tag: "You", difficulty: "Beginner" },
    { title: "Leg Day Inferno", tag: "Trainer", difficulty: "Advanced" },
    { title: "Mobility Flow 15", tag: "You", difficulty: "All" },
  ];
  return (
    <section aria-labelledby="suggested">
      <div className="flex items-center justify-between mb-3">
        <h2 id="suggested" className="text-xl font-semibold">Suggested Workouts</h2>
        <a href="/workouts" className="story-link text-sm text-muted-foreground">View all</a>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
        {workouts.map((w) => (
          <div key={w.title} className="min-w-[260px] snap-start">
            <Card className="h-full hover-scale">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {w.title}
                  <Badge variant="secondary">{w.difficulty}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">Recommended by: {w.tag}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Dumbbell className="h-4 w-4" /> 8 exercises
                  </div>
                  <Link to="/workouts" className="hover-scale"><Button size="sm">Start</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}