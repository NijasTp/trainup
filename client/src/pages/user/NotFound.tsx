import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { toast } from "sonner";

export default function NotFound() {
  const [reps, setReps] = useState(0);
  const [isLifting, setIsLifting] = useState(false);

  const handleLift = () => {
    if (isLifting) return;
    setIsLifting(true);
    setTimeout(() => {
      setIsLifting(false);
      const newReps = reps + 1;
      setReps(newReps);
      if (newReps % 5 === 0) {
        toast.success(`Awesome! ${newReps} reps done. You're pumping through this 404!`, {
          description: "Keep going or head back to your workout plan.",
        });
      }
    }, 800); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 space-y-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              404
            </CardTitle>
            <p className="text-xl text-muted-foreground">Page Not Found</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Looks like this route is taking a rest day. While you're here, let's do some quick reps to stay fit!
            </p>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-48 h-32 flex items-center justify-center">
                <div className="absolute bottom-0 w-32 h-2 bg-foreground/20 rounded-full"></div> {/* Ground */}
                <div 
                  className={`absolute bottom-2 w-40 h-4 bg-primary rounded-full transition-all duration-800 ease-in-out ${
                    isLifting ? 'translate-y-[-60px] rotate-[-5deg]' : 'translate-y-0 rotate-0'
                  }`}
                >
                  <div className="absolute left-2 w-8 h-8 bg-accent rounded-full"></div> {/* Left weight */}
                  <div className="absolute right-2 w-8 h-8 bg-accent rounded-full"></div> {/* Right weight */}
                </div>
                <Dumbbell className="absolute bottom-4 h-12 w-12 text-foreground animate-pulse" />
              </div>
              <Button 
                onClick={handleLift}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                disabled={isLifting}
              >
                Lift! (Reps: {reps})
              </Button>
            </div>
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Pump up those reps to conquer the 404!</p>
              <Link to="/">
                <Button variant="outline" className="w-full border-border/50 hover:bg-primary/5">
                  <Home className="mr-2 h-4 w-4" /> Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}