import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary/40 to-background">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1570829460005-c840387bb1ca?q=80&w=1600&auto=format&fit=crop"
          alt="Energetic gym scene"
          className="w-full h-full object-cover opacity-20"
          loading="lazy"
        />
      </div>
      <div className="relative p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight">
            "Discipline beats motivation. Show up, get better."
          </h1>

          <div className="flex items-center gap-3 pt-2">
            <Badge className="bg-accent text-accent-foreground">Streak: 12 days</Badge>
            <Badge variant="secondary">XP: 2,450</Badge>
          </div>
          <div className="pt-2 flex gap-3">
            <a href="/workouts" className="hover-scale">
              <Button className="bg-accent text-accent-foreground shadow-[var(--shadow-glow)]">Start Workout</Button>
            </a>
            <a href="/diet" className="hover-scale">
              <Button variant="secondary">Plan Meals</Button>
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
            alt="Athlete training hard"
            className="w-full h-[300px] object-cover rounded-lg border border-border"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
