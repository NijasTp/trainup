import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, Flame } from "lucide-react";

export function Upcoming() {
  return (
    <section aria-labelledby="upcoming" className="grid gap-4 md:grid-cols-2">
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-accent" /> Next Trainer Session</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">with Ava Thompson</p>
              <p className="font-semibold">Today, 6:00 PM</p>
            </div>
            <Badge variant="secondary">in 3h 12m</Badge>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-accent" /> Next Meal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chicken & Quinoa Bowl</p>
                <p className="text-sm text-muted-foreground">520 kcal • 35g P • 55g C • 16g F</p>
              </div>
              <Button variant="secondary">View</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
