import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export function GymAnnouncements() {
  const announcements = [
    { title: "New equipment arrived", desc: "Try the latest squat racks and rowers." },
    { title: "Holiday hours", desc: "Open 7am–7pm this weekend." },
    { title: "Community run", desc: "Join our 5K fun run this Saturday." },
  ];
  return (
    <section aria-labelledby="announcements">
      <h2 id="announcements" className="text-xl font-semibold mb-3">Gym Announcements</h2>
      <div className="space-y-3">
        {announcements.slice(0, 3).map((a, i) => (
          <Card key={i} className="hover-scale">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Megaphone className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
