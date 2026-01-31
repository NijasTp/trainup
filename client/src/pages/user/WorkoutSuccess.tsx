import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate, Link, } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";
import { getProfile } from "@/services/userService";
import { Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { updateWorkoutSession } from "@/services/workoutService";
import confetti from "canvas-confetti";

import type { LocationState } from "@/interfaces/user/IWorkoutSuccess";


export default function SuccessPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!state?.totalWorkoutTime || !state?.isDone) {
      toast.error("Please complete your workout before moving on.");
      navigate("/workouts");
      return;
    }

    document.title = "TrainUp - Workout Complete!";

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);



    async function markSessionAsDone() {
      try {
        if (id && state?.exerciseTimes && state.isDone) {
          const exerciseUpdates = state.exerciseTimes.map((et) => ({
            exerciseId: et.exerciseId,
            timeTaken: et.duration,
          }));
          await updateWorkoutSession(id, {
            isDone: true,
            exerciseUpdates,
          });

          // Refetch profile to get updated streak
          const profileData = await getProfile();
          if (profileData) {
            dispatch(updateUser(profileData));
          }

          toast.success("Workout marked as complete!", {
            description: "Your progress has been saved.",
          });
        }
      } catch (err: any) {
        toast.error("Failed to update workout status", {
          description: err.message || "An error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (id && state.isDone) markSessionAsDone();

    return () => clearInterval(interval);
  }, [id, state, navigate]);


  const exerciseTimes = state?.exerciseTimes || [];
  const totalWorkoutTime = state?.totalWorkoutTime || 0;
  const formattedTotalTime = `${Math.floor(totalWorkoutTime / 60)}:${(
    totalWorkoutTime % 60
  ).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <main className="relative container mx-auto px-4 py-12 flex flex-col items-center flex-1">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 animate-pulse">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Workout Complete!</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
            Congratulations!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            You crushed your workout. Check out your performance below.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground font-medium">Saving your progress...</p>
          </div>
        ) : (

          <Card onClick={() => navigate('/workouts')} className="group relative bg-card/40 backdrop-blur-sm border-primary/30 w-full max-w-2xl shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground">Workout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold text-foreground">Total Time</span>
                </div>
                <span className="text-lg font-bold text-primary">{formattedTotalTime}</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Exercise Breakdown</h3>
                {exerciseTimes.length > 0 ? (
                  <ul className="space-y-3">
                    {exerciseTimes.map((exercise) => (
                      <li
                        key={exercise.exerciseId}
                        className="flex justify-between items-center bg-primary/10 rounded-lg p-3 transition-all duration-300 hover:bg-primary/20"
                      >
                        <span className="text-foreground">{exercise.name}</span>
                        <span className="text-primary font-semibold">
                          {Math.floor(exercise.duration / 60)}:
                          {(exercise.duration % 60).toString().padStart(2, "0")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center">No exercise times recorded.</p>
                )}
              </div>

              <Button
                className="w-full text-black bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Back to Workouts
              </Button>
            </CardContent>
          </Card>

        )}
      </main>
      <SiteFooter />
    </div>
  );
}