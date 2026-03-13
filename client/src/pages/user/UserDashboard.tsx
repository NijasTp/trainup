import React, { useState, useEffect } from "react";
import { format, isToday, startOfDay, subWeeks, startOfWeek, addDays } from "date-fns";
import { useRef } from "react";
import { cn } from "@/lib/utils";
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
import Aurora from "@/components/ui/Aurora";
import { getProfile, getWeightHistory, getActivityData, addWeight as addWeightService } from "@/services/userService";
import { getRecentWorkouts } from "@/services/workoutService";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { compareProgress } from "@/services/progressService";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateUser } from "@/redux/slices/userAuthSlice";

import type { WeightEntry, Workout, User, CurrentWeightProps, AddWeightDialogProps, WeightChartProps, TransformationWidgetProps, RecentWorkoutsProps, IBackendSession, IActivityData, TransformationData } from "@/interfaces/user/IUserDashboard";


const CurrentWeight: React.FC<CurrentWeightProps> = ({ user }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
        <Scale className="h-4 w-4 text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent italic">{user.currentWeight} kg</div>
          <div className="flex items-center gap-2 text-xs font-medium tracking-tight">
            <Target className="h-3 w-3 text-primary" />
            <span className="text-muted-foreground uppercase opacity-70">Goal:</span>
            <span className="text-white">{user.goalWeight} kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {user.currentWeight > user.goalWeight ? (
              <div className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20 font-bold uppercase tracking-tighter italic">
                <TrendingDown className="h-3 w-3" />
                {Math.abs(user.currentWeight - user.goalWeight).toFixed(1)} kg to go
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20 font-bold uppercase tracking-tighter italic">
                <TrendingUp className="h-3 w-3" />
                Achievement Unlocked
              </div>
            )}
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
          className="w-full h-16 bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary-bright text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 uppercase italic tracking-tighter border border-white/10"
          disabled={isWeightLoggedToday}
        >
          <Plus className="h-6 w-6 mr-2" />
          {isWeightLoggedToday ? "Logged for Today" : "Log Today's Weight"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Enter Weight</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground italic">Weight (KG)</label>
            <Input
              type="number"
              step="0.1"
              placeholder="00.0"
              className="bg-white/5 border-white/10 h-14 text-2xl font-bold"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSubmit} className="flex-1 h-12 font-black uppercase italic tracking-widest">
              Confirm Entry
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-12 uppercase font-bold text-xs tracking-widest opacity-50 hover:opacity-100">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WeightChart: React.FC<WeightChartProps> = ({ weightData }) => {
  if (!weightData || weightData.length === 0) {
    return (
      <Card className="bg-card/40 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weight Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground font-light italic">
            No weight data logged yet.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Weight Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            weight: { label: "Current", color: "hsl(var(--primary))" },
            goal: { label: "Goal", color: "rgba(255,255,255,0.2)" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value: string) => format(new Date(value), "MMM dd")} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              />
              <YAxis 
                domain={["dataMin - 5", "dataMax + 5"]} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />

              <Line
                type="monotone"
                dataKey="goal"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
                strokeDasharray="10 10"
                dot={false}
              />
              <defs>
                <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-weight)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-weight)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                dataKey="weight"
                type="monotone"
                fill="url(#fillWeight)"
                stroke="var(--color-weight)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const TransformationWidget: React.FC<TransformationWidgetProps> = () => {
  const [data, setData] = useState<TransformationData | null>(null);

  useEffect(() => {
    compareProgress().then(setData).catch(console.error);
  }, []);

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="h-5 w-5 text-primary" />
          Transformation
        </CardTitle>
        <Link to={ROUTES.USER_PROGRESS}>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest italic opacity-50 hover:opacity-100">Full Gallery</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {data && (data.first?.photos?.length || data.latest?.photos?.length) ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                {data.first?.photos?.[0] ? (
                  <img src={data.first.photos[0]} alt="First" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">Baseline</div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-black uppercase tracking-widest italic border border-white/10">Day 1</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 border border-white/10 group shadow-2xl shadow-primary/10">
                {data.latest?.photos?.[0] ? (
                  <img src={data.latest.photos[0]} alt="Latest" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">Current</div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-[8px] font-black uppercase tracking-widest italic shadow-lg">Latest</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-white/5 rounded-full">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold uppercase tracking-tighter italic">Upload Progress</h3>
              <p className="text-[10px] text-muted-foreground uppercase opacity-50 font-bold tracking-widest">See your visual journey unfold</p>
            </div>
            <Link to={ROUTES.USER_PROGRESS}>
              <Button size="sm" className="font-black uppercase italic tracking-tighter h-8 px-6">Upload First Photo</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RecentWorkouts: React.FC<RecentWorkoutsProps> = ({ workouts }) => {
  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dumbbell className="h-5 w-5 text-primary" />
          Recent Sessions
        </CardTitle>
        <Link to={ROUTES.USER_WORKOUTS_PAGE}>
          <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest italic opacity-50 hover:opacity-100">History</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="group relative p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black uppercase tracking-tighter italic group-hover:text-primary transition-colors">{workout.name}</h4>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest opacity-40 mt-1">
                      <span className="flex items-center gap-1.5 italic">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(workout.date), "MMM dd")}
                      </span>
                      <span className="flex items-center gap-1.5 italic">
                        <Clock className="h-3 w-3" />
                        {workout.duration}m
                      </span>
                    </div>
                  </div>
                  <div>
                    {workout.completed ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-black uppercase tracking-tighter italic text-[10px]">
                        Victory
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="opacity-40 font-black uppercase tracking-tighter italic text-[10px]">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 bg-white/5 rounded-full">
              <Dumbbell className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold uppercase tracking-tighter italic">No Workouts Found</h3>
              <p className="text-[10px] text-muted-foreground uppercase opacity-50 font-bold tracking-widest">Crush your first session today</p>
            </div>
            <Link to={ROUTES.USER_ADD_WORKOUT}>
              <Button size="sm" className="font-black uppercase italic tracking-tighter h-8 px-6">Start Training</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


// Helper to calculate streak
const calculateStreak = (activityData: IActivityData) => {
  let streak = 0;
  let curr = new Date();
  
  // If no activity today, check if streak from yesterday exists
  const todayStr = format(curr, "yyyy-MM-dd");
  const hasActivityToday = activityData[todayStr] && (
    activityData[todayStr].workout || 
    activityData[todayStr].meal || 
    activityData[todayStr].weight || 
    activityData[todayStr].gym
  );

  if (!hasActivityToday) {
    curr = addDays(curr, -1);
  }

  while (true) {
    const dateStr = format(curr, "yyyy-MM-dd");
    const data = activityData[dateStr];
    const hasActivity = data && (data.workout || data.meal || data.weight || data.gym);
    
    if (hasActivity) {
      streak++;
      curr = addDays(curr, -1);
    } else {
      break;
    }
  }
  return streak;
};

const ActivityCalendar: React.FC<{ activityData: IActivityData }> = ({ activityData }) => {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [activityData]);
  
  // Generate last 53 weeks of dates (approx 1 year)
  const weeks = [];
  const today = new Date();
  // Start from exactly 52 weeks ago from the start of the current week to align columns
  const startDate = subWeeks(startOfWeek(today), 52);

  for (let w = 0; w <= 52; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(startDate, w * 7 + d);
      week.push(date);
    }
    weeks.push(week);
  }

  const getLevel = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const data = activityData[dateStr];
    if (!data) return 0;
    let count = 0;
    if (data.workout) count++;
    if (data.meal) count++;
    if (data.weight) count++;
    if (data.gym) count++;
    return count;
  };

  const getActivityDetails = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const data = activityData[dateStr];
    if (!data) return [];
    const activities = [];
    if (data.workout) activities.push({ label: "Workout", color: "text-blue-400" });
    if (data.meal) activities.push({ label: "Meal Logged", color: "text-green-400" });
    if (data.weight) activities.push({ label: "Weight Entry", color: "text-purple-400" });
    if (data.gym) activities.push({ label: "Gym Check-in", color: "text-amber-400" });
    return activities;
  };

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50 relative z-20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Active Engagement
        </CardTitle>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase italic tracking-widest text-white/20">
            <span>365 Day Matrix</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-[3px] overflow-x-auto pb-4 flex-nowrap no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px] shrink-0">
                {week.map((date, di) => {
                  const level = getLevel(date);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const isFuture = date > today;
                  const activities = getActivityDetails(date);

                  return (
                    <div
                      key={di}
                      className={cn(
                        "w-3 h-3 rounded-[2px] transition-all duration-300 relative cursor-pointer",
                        isFuture ? 'bg-transparent pointer-events-none' :
                          level === 0 ? 'bg-white/[0.03] hover:bg-white/[0.08]' :
                            level === 1 ? 'bg-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' :
                              level === 2 ? 'bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' :
                                level === 3 ? 'bg-primary/70 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' :
                                  'bg-primary shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)]'
                      )}
                      onMouseEnter={() => setHoveredDate(dateStr)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      {hoveredDate === dateStr && !isFuture && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[9999] animate-in fade-in zoom-in duration-200">
                          <div className="bg-[#0A0A0A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[180px] ring-1 ring-white/5">
                            <div className="space-y-3">
                              <div className="pb-2 border-b border-white/5">
                                <p className="text-[10px] font-black uppercase italic tracking-widest text-white/30">{format(date, "EEEE")}</p>
                                <p className="text-sm font-black italic uppercase tracking-tighter">{format(date, "MMM dd, yyyy")}</p>
                              </div>
                              <div className="space-y-2">
                                {activities.length > 0 ? (
                                  activities.map((act, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className={cn("w-1 h-1 rounded-full bg-current", act.color)} />
                                      <span className={cn("text-[10px] font-black uppercase italic tracking-widest", act.color)}>{act.label}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] font-bold text-white/10 uppercase italic">Inactivity Detected</p>
                                )}
                              </div>
                              {level > 0 && (
                                <div className="pt-2 border-t border-white/5">
                                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase italic tracking-widest px-2 py-0">Intensity: {level}/4</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Triangle pointer */}
                          <div className="w-2 h-2 bg-[#0A0A0A] border-r border-b border-white/10 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] font-black uppercase italic tracking-widest text-white/20">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-primary/20" /> Minimal</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-[1px] bg-primary" /> Peak</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Less Activity</span>
            <div className="flex gap-[2px]">
              {[0.03, 0.2, 0.4, 0.7, 1].map((op, i) => (
                <div 
                    key={i} 
                    className="w-2.5 h-2.5 rounded-[1px]" 
                    style={{ backgroundColor: `rgba(var(--primary-rgb, 6, 182, 212), ${op})` }} 
                />
              ))}
            </div>
            <span>More Activity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BMICard: React.FC<{ weight: number; height?: number }> = ({ weight, height }) => {
  if (!height) return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50 h-full flex items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <Scale className="h-10 w-10 text-muted-foreground/30 mx-auto" />
        <div>
          <h3 className="font-medium">BMI Score</h3>
          <p className="text-sm text-muted-foreground">Add your height in profile to calculate BMI</p>
        </div>
      </div>
    </Card>
  );

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: "Underweight", color: "text-blue-400" };
    if (val < 25) return { label: "Healthy", color: "text-green-400" };
    if (val < 30) return { label: "Overweight", color: "text-yellow-400" };
    return { label: "Obese", color: "text-red-400" };
  };

  const category = getBMICategory(bmi);

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Scale className="h-20 w-20" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">BMI Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent italic">
              {bmi.toFixed(1)}
            </span>
            <Badge variant="outline" className={`${category.color} border-current/20 font-bold uppercase tracking-tighter italic text-[10px]`}>
              {category.label}
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-400" style={{ width: '18.5%' }} title="Underweight" />
            <div className="h-full bg-green-400" style={{ width: '6.5%' }} title="Healthy" />
            <div className="h-full bg-yellow-400" style={{ width: '5%' }} title="Overweight" />
            <div className="h-full bg-red-400" style={{ width: '70%' }} title="Obese" />
          </div>
          <p className="text-[10px] text-muted-foreground leading-tight italic font-medium">
            BMI is a simple measure of weight-for-height that is commonly used to classify underweight, overweight and obesity in adults.
          </p>
        </div>
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
  const [activityData, setActivityData] = useState<IActivityData>({});
  const [newWeight, setNewWeight] = useState("");
  const [isWeightLoggedToday, setIsWeightLoggedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const streak = calculateStreak(activityData);

  useEffect(() => {
    if (activityData && Object.keys(activityData).length > 0) {
      dispatch(updateUser({ streak }));
    }
  }, [streak, dispatch, activityData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileResponse, weightHistoryResponse, activityDataResponse] = await Promise.all([
          getProfile(),
          getWeightHistory(),
          getActivityData()
        ]);

        const profile = profileResponse.user;
        const weightHistory = weightHistoryResponse.weightHistory || [];
        setActivityData(activityDataResponse.activityData || {});

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
          height: profile.height,
        });

        const isLoggedToday = sortedHistory.some((entry) => {
          const normalizedDate = startOfDay(new Date(entry.date));
          return isToday(normalizedDate);
        });
        setIsWeightLoggedToday(isLoggedToday);

        const recentWorkoutsData = await getRecentWorkouts();
        // Map backend workout data to frontend interface

        const mappedWorkouts = (recentWorkoutsData?.sessions || []).map((session: IBackendSession) => {
          const totalDuration = session.exercises.reduce((acc: number, ex) => acc + (ex.timeTaken || 0), 0) / 60;

          return {
            id: session._id,
            name: session.name,
            date: session.date,
            duration: Math.round(totalDuration) || 0,
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
      const response = await addWeightService(weight);
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

      // Update activity data for weight
      const todayStr = format(new Date(), "yyyy-MM-dd");
      setActivityData(prev => ({
        ...prev,
        [todayStr]: {
          ...prev[todayStr],
          weight: true
        }
      }));

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
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#020617", "#0f172a", "#020617"]}
          amplitude={1.1}
          blend={0.6}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
      </div>

      <SiteHeader />
      <div className="relative max-w-7xl mx-auto space-y-12 p-6 flex-1 w-full mt-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black italic uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Live Dashboard
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold bg-gradient-to-br from-white via-white to-white/30 bg-clip-text text-transparent tracking-tighter">
            Welcome back, <span className="text-white italic underline decoration-primary/30 underline-offset-8">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-xl text-muted-foreground/60 max-w-2xl font-light">
            You're on a <span className="text-white font-medium italic underline decoration-cyan-500/50 underline-offset-4">{streak}-day streak</span>! Keep pushing towards your <span className="text-white font-medium italic decoration-green-500/50 underline underline-offset-4">{user.goalWeight}kg goal</span>.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-primary/10 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Top row - Weights and BMI */}
            <div className="grid gap-6 md:grid-cols-3">
              <CurrentWeight user={user} />
              <BMICard weight={user.currentWeight} height={user.height} />
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 backdrop-blur-md">
                <CardContent className="flex flex-col items-center justify-center h-full p-6 space-y-4">
                  <div className="p-3 bg-green-500/20 rounded-2xl">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <AddWeightDialog
                    newWeight={newWeight}
                    setNewWeight={setNewWeight}
                    onAddWeight={handleAddWeight}
                    isWeightLoggedToday={isWeightLoggedToday}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Middle row - Charts and Calendar */}
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 space-y-8">
                <WeightChart weightData={weightData} />
                <ActivityCalendar activityData={activityData} />
              </div>
              <div className="lg:col-span-2 space-y-8">
                <RecentWorkouts workouts={recentWorkouts} />
                <TransformationWidget />
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div >
  );
};

export default UserDashboard;