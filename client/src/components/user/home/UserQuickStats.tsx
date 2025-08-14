import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Flame, Star, Timer } from "lucide-react";

export function QuickStats() {
  const stats = [
    { label: "Calories Today", value: "1,240 kcal", icon: Flame },
    { label: "Workouts This Week", value: "4", icon: Dumbbell },
    { label: "XP", value: "2,450", icon: Star },
    { label: "Streak", value: "12 days", icon: Timer },
  ];
  return (
    <section aria-labelledby="quick-stats">
      <h2 id="quick-stats" className="sr-only">Quick stats</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover-scale">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
