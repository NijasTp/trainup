import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ShieldCheck } from "lucide-react";

export function TipOfTheDay() {
  return (
    <section aria-labelledby="tip">
      <Card className="bg-secondary/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-accent" /> Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          Hydrate early and often. Aim for 250–300ml every 20 minutes during training.
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-5 w-5 text-accent" /> Progress Photo Reminder</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Stay accountable with weekly photos.</p>
          <Button variant="secondary" size="sm">Remind me</Button>
        </CardContent>
      </Card>
    </section>
  );
}
