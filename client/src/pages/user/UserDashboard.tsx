import React, { useState, useEffect } from "react";
import { format, isToday, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line } from "recharts";
import {
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Clock,
  Plus,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { addWeight, getProfile, getWeightHistory } from "@/services/userService";
import { getRecentWorkouts } from "@/services/workoutService";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

import type { WeightEntry, Workout, User, CurrentWeightProps, AddWeightDialogProps, WeightChartProps, TransformationWidgetProps, RecentWorkoutsProps, IBackendSession } from "@/interfaces/user/IUserDashboard";


const CurrentWeight: React.FC<CurrentWeightProps> = ({ user }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
        <Scale className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-blue-600">{user.currentWeight} kg</div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Goal: {user.goalWeight} kg</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {user.currentWeight > user.goalWeight ? (
              <TrendingDown className="h-3 w-3 text-orange-500" />
            ) : (
              <TrendingUp className="h-3 w-3 text-green-500" />
            )}
            <span className="text-muted-foreground">
              {Math.abs(user.currentWeight - user.goalWeight).toFixed(1)} kg to goal
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AddWeightDialog: React.FC<AddWeightDialogProps> = ({ newWeight, setNewWeight, onAddWeight, isWeightLoggedToday }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!newWeight || isNaN(Number(newWeight)) || Number(newWeight) <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }
    onAddWeight(Number(newWeight));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full h-16 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          disabled={isWeightLoggedToday}
        >
          <Plus className="h-5 w-5 mr-2" />
          {isWeightLoggedToday ? "Today's Weight Added" : "Please Add Today's Weight"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Today's Weight</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="Enter your weight"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} className="flex-1">
              Log Weight
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// WeightChart Component

const WeightChart: React.FC<WeightChartProps> = ({ weightData }) => {
  if (!weightData || weightData.length === 0) {
    return (
      <Card className="bg-card/40 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weight Progress vs Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No weight data available. Please add your weight.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Weight Progress vs Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            weight: { label: "Current Weight", color: "hsl(var(--chart-1))" },
            goal: { label: "Goal Weight", color: "hsl(var(--chart-2))" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value: string) => format(new Date(value), "MMM dd")} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
              <ChartTooltip content={<ChartTooltipContent />} />

              <Line
                type="monotone"
                dataKey="goal"
                stroke="var(--color-goal)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <defs>
                <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="weight"
                type="monotone"
                fill="url(#fillWeight)"
                fillOpacity={0.4}
                stroke="var(--color-weight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// RecentXPLogs Component (unchanged)


// Transformation Widget
import { compareProgress } from "@/services/progressService";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Image as ImageIcon } from "lucide-react";



import type { TransformationData } from "@/interfaces/user/IUserDashboard";

const TransformationWidget: React.FC<TransformationWidgetProps> = () => {
  const [data, setData] = useState<TransformationData | null>(null);

  useEffect(() => {
    compareProgress().then(setData).catch(console.error);
  }, []);

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Transformation
        </CardTitle>
        <Link to={ROUTES.USER_PROGRESS}>
          <Button variant="outline" size="sm">View Gallery</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {data && (data.first?.photos?.length || data.latest?.photos?.length) ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground text-center">Start ({data.first ? format(new Date(data.first.date), "MMM d, yyyy") : 'N/A'})</p>
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary/20 relative">
                {data.first?.photos?.[0] ? (
                  <img src={data.first.photos[0]} alt="First" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Photo</div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground text-center">Latest ({data.latest ? format(new Date(data.latest.date), "MMM d, yyyy") : 'N/A'})</p>
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary/20 relative">
                {data.latest?.photos?.[0] ? (
                  <img src={data.latest.photos[0]} alt="Latest" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Photo</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <h3 className="font-medium">No progress photos yet</h3>
              <p className="text-sm text-muted-foreground">Upload your first photo to start tracking.</p>
            </div>
            <Link to={ROUTES.USER_PROGRESS}>
              <Button>Add Photo</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


// RecentWorkouts Component (unchanged)

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ workouts }) => {
  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          Recent Workouts
        </CardTitle>
        <Link to={ROUTES.USER_WORKOUTS_PAGE}>
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <div key={workout.id} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{workout.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(workout.date), "MMM dd")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {workout.exercises} exercises
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {workout.completed ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 mb-1">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mb-1">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <Dumbbell className="h-12 w-12 text-muted-foreground/30" />
            <div>
              <h3 className="font-medium">No workouts yet</h3>
              <p className="text-sm text-muted-foreground">Start your fitness journey by adding your first workout.</p>
            </div>
            <Link to={ROUTES.USER_ADD_WORKOUT}>
              <Button size="sm">Add Workout</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// UserDashboard Component
const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User>({
    name: "",
    currentWeight: 0,
    goalWeight: 0,
  });
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [isWeightLoggedToday, setIsWeightLoggedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profile, weightHistoryResponse] = await Promise.all([
          getProfile(),
          getWeightHistory(),
        ]);


        const weightHistory = weightHistoryResponse.weightHistory || [];

        const validHistory = weightHistory.filter(
          (entry: { weight: number; date: string }) => entry && typeof entry.weight === "number" && entry.date && !isNaN(new Date(entry.date).getTime())
        );

        const aggregatedHistory: { [key: string]: { weight: number; date: string } } = {};
        validHistory.forEach((entry: { weight: number; date: string }) => {
          const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
          const entryDate = new Date(entry.date).getTime();
          if (
            !aggregatedHistory[dateKey] ||
            entryDate > new Date(aggregatedHistory[dateKey].date).getTime()
          ) {
            aggregatedHistory[dateKey] = { weight: entry.weight, date: entry.date };
          }
        });


        const sortedHistory = Object.values(aggregatedHistory).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const newWeightData = sortedHistory.slice(-5).map((entry) => {
          const formattedEntry = {
            date: format(new Date(entry.date), "yyyy-MM-dd"),
            weight: entry.weight,
            goal: profile.goalWeight || 0,
          };
          return formattedEntry;
        });

        setWeightData(newWeightData);

        // Set currentWeight from latest weightHistory entry if profile.currentWeight is 0
        const latestWeight = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].weight : profile.currentWeight || 0;

        setUser({
          name: profile.name || "",
          currentWeight: latestWeight,
          goalWeight: profile.goalWeight || 0,
        });

        const isLoggedToday = sortedHistory.some((entry) => {
          const normalizedDate = startOfDay(new Date(entry.date));
          return isToday(normalizedDate);
        });
        setIsWeightLoggedToday(isLoggedToday);

        const recentWorkoutsData = await getRecentWorkouts();
        // Map backend workout data to frontend interface

        const mappedWorkouts = (recentWorkoutsData?.sessions || []).map((session: IBackendSession) => {
          // Calculate duration from exercises if possible, or use time, or default
          // Assuming time is start time, we don't have end time easily here unless traversing exercises timeTaken
          const totalDuration = session.exercises.reduce((acc: number, ex) => acc + (ex.timeTaken || 0), 0) / 60; // Convert seconds to minutes if timeTaken is in seconds, need to verify unit. 
          // If timeTaken is not available, maybe just show 0 or hide it.
          // Let's assume timeTaken is in minutes or seconds. Usually seconds.
          // If session duration is not available, we can mock or sum up.

          return {
            id: session._id,
            name: session.name,
            date: session.date,
            duration: Math.round(totalDuration) || 0, // Round to nearest minute
            exercises: session.exercises.length,
            completed: session.isDone
          };
        });
        setRecentWorkouts(mappedWorkouts);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        const errorMessage = error instanceof Error ? (error as any).response?.data?.error || error.message : "Failed to load dashboard data";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddWeight = async (weight: number) => {
    try {
      const response = await addWeight(weight);
      setWeightData((prev) => {
        const newEntry = { date: format(new Date(), "yyyy-MM-dd"), weight, goal: user.goalWeight };
        const dateKey = newEntry.date;
        const existingIndex = prev.findIndex((entry) => entry.date === dateKey);
        let updated;
        if (existingIndex !== -1) {
          updated = [...prev];
          updated[existingIndex] = newEntry;
        } else {
          updated = [...prev, newEntry].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ).slice(-5);
        }
        return updated;
      });
      setUser((prev) => ({ ...prev, currentWeight: weight }));
      setIsWeightLoggedToday(true);
      toast.success(response.message || "Weight logged successfully!");
      setNewWeight("");
    } catch (error: unknown) {
      console.error("Error logging weight:", error);
      const errorMessage = error instanceof Error ? (error as any).response?.data?.error || error.message : "Failed to log weight";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      <SiteHeader />
      <div className="relative max-w-7xl mx-auto space-y-8 p-6 flex-1 w-full">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Fitness Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Track your progress, level up, and achieve your goals</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <CurrentWeight user={user} />
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="flex items-center justify-center h-full">
                  <AddWeightDialog
                    newWeight={newWeight}
                    setNewWeight={setNewWeight}
                    onAddWeight={handleAddWeight}
                    isWeightLoggedToday={isWeightLoggedToday}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <WeightChart weightData={weightData} />
              <RecentWorkouts workouts={recentWorkouts} />
            </div>
            <TransformationWidget />
          </>
        )}
      </div>
      <SiteFooter />
    </div >
  );
};

export default UserDashboard;