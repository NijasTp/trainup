import React, { useState, useEffect, useRef } from "react";
import { format, isToday, subWeeks, startOfWeek, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Scale,
  Target,
  Dumbbell,
  Calendar,
  Zap,
  Activity,
  Image as ImageIcon,
  ChevronRight,
  Flame,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { getProfile, getWeightHistory, getActivityData, addWeight as addWeightService } from "@/services/userService";
import { getRecentWorkouts } from "@/services/workoutService";
import { compareProgress } from "@/services/progressService";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import type { WeightEntry, Workout, User, IBackendSession, IActivityData, TransformationData } from "@/interfaces/user/IUserDashboard";

// --- Components ---

const BentoTile = ({ children, className, title, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 hover:border-primary/30 transition-all group shadow-2xl",
      className
    )}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    <div className="relative z-10 space-y-6 h-full flex flex-col">
      {title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic">{title}</h3>
          </div>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  </motion.div>
);

const UserDashboard: React.FC = () => {
  const [userData, setUserData] = useState<User>({ name: "", currentWeight: 0, goalWeight: 0 });
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [activityData, setActivityData] = useState<IActivityData>({});
  const [transformation, setTransformation] = useState<TransformationData | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [isWeightLoggedToday, setIsWeightLoggedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Removed unused dispatch, navigate, reduxUser

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, weightRes, activityRes, workoutsRes, transformRes] = await Promise.all([
        getProfile(),
        getWeightHistory(),
        getActivityData(),
        getRecentWorkouts(),
        compareProgress()
      ]);

      const profile = profileRes.user;
      setActivityData(activityRes.activityData || {});
      setTransformation(transformRes);

      // Handle Weight Data
      const history = weightRes.weightHistory || [];
      const sortedHistory = history
        .filter((e: WeightEntry) => e.weight && e.date)
        .sort((a: WeightEntry, b: WeightEntry) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const latestWeight = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].weight : profile.currentWeight || 0;
      
      setWeightData(sortedHistory.slice(-7).map((e: WeightEntry) => ({
        date: format(new Date(e.date), "yyyy-MM-dd"),
        weight: e.weight,
        goal: profile.goalWeight || 0
      })));

      setUserData({
        name: profile.name || "",
        currentWeight: latestWeight,
        goalWeight: profile.goalWeight || 0,
        height: profile.height,
      });

      setIsWeightLoggedToday(sortedHistory.some((e: WeightEntry) => isToday(new Date(e.date))));

      // Handle Workouts
      const mappedWorkouts = (workoutsRes?.sessions || []).slice(0, 3).map((session: IBackendSession) => ({
        id: session._id,
        name: session.name,
        date: session.date,
        duration: Math.round(session.exercises.reduce((acc, ex) => acc + (ex.timeTaken || 0), 0) / 60) || 0,
        completed: session.isDone
      }));
      setRecentWorkouts(mappedWorkouts);

    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to sync some dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWeight = async (val: string) => {
    const weight = Number(val);
    if (!weight || isNaN(weight)) return toast.error("Invalid weight value");
    
    try {
      await addWeightService(weight);
      toast.success("Weight logged successfully!");
      fetchDashboardData();
      setNewWeight("");
    } catch (err) {
      toast.error("Failed to log weight");
    }
  };

  const calculateStreak = () => {
    let streak = 0;
    let curr = new Date();
    const todayStr = format(curr, "yyyy-MM-dd");
    const hasActivityToday = activityData[todayStr] && Object.values(activityData[todayStr]).some(v => v);

    if (!hasActivityToday) curr = addDays(curr, -1);

    while (true) {
      const dStr = format(curr, "yyyy-MM-dd");
      if (activityData[dStr] && Object.values(activityData[dStr]).some(v => v)) {
        streak++;
        curr = addDays(curr, -1);
      } else break;
    }
    return streak;
  };

  const streak = calculateStreak();

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-black italic tracking-widest uppercase animate-pulse">Syncing Metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["#020617", "#0d1117", "#020617"]} amplitude={1.1} blend={0.6} />
      </div>

      <SiteHeader />

      <main className="relative z-10 flex-1 container mx-auto px-4 py-12 pb-32">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Operational Status: Peak
              </div>
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tight uppercase leading-[0.8] text-white">
                Systems <span className="text-primary not-italic">Go,</span><br />
                {userData.name.split(' ')[0]}
              </h1>
            </div>
            
            <div className="flex items-center gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Current Streak</p>
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                  <span className="text-3xl font-black italic">{streak} DAYS</span>
                </div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Global Rank</p>
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="text-3xl font-black italic">ELITE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
            
            {/* Weight Summary (Span 4x2) */}
            <BentoTile title="Weight Dynamics" icon={Scale} className="md:col-span-8 md:row-span-2">
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-1/3 flex flex-col justify-center space-y-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500">Current Payload</p>
                    <div className="text-6xl font-black text-white italic tracking-tighter">{userData.currentWeight}<span className="text-2xl not-italic ml-1 opacity-40">KG</span></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Goal</p>
                      <p className="text-xl font-black italic text-primary">{userData.goalWeight} KG</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Diff</p>
                      <p className={cn("text-xl font-black italic", userData.currentWeight > userData.goalWeight ? "text-orange-500" : "text-emerald-500")}>
                        {Math.abs(userData.currentWeight - userData.goalWeight).toFixed(1)} KG
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-200 font-black italic uppercase tracking-widest" disabled={isWeightLoggedToday}>
                        {isWeightLoggedToday ? "SYNCED FOR TODAY" : "LOG NEW WEIGHT"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-white/10 text-white rounded-3xl">
                      <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase">Sync Weight</DialogTitle></DialogHeader>
                      <div className="space-y-6 pt-4">
                        <Input 
                          type="number" 
                          placeholder="00.0" 
                          className="h-16 text-3xl font-black bg-white/5 border-white/10 rounded-2xl focus:border-primary/50" 
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                        />
                        <Button onClick={() => handleAddWeight(newWeight)} className="w-full h-14 bg-primary text-white font-black italic uppercase tracking-widest">Confirm Sync</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex-1 h-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                      <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </BentoTile>

            {/* BMI Tile (Span 4x1) */}
            <BentoTile title="Mass Index" icon={Zap} className="md:col-span-4 md:row-span-1">
              <div className="flex items-center justify-between h-full">
                <div>
                  <div className="text-5xl font-black italic text-white leading-none">
                    {userData.height ? (userData.currentWeight / Math.pow(userData.height / 100, 2)).toFixed(1) : "---"}
                  </div>
                  <Badge variant="outline" className="mt-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-black uppercase italic text-[10px] tracking-widest">
                    OPTIMAL ZONE
                  </Badge>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-emerald-500 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </BentoTile>

            {/* Transformation (Span 4x1) */}
            <BentoTile title="Visual Progress" icon={ImageIcon} className="md:col-span-4 md:row-span-1">
               <div className="flex items-center gap-4 h-full">
                  <div className="flex-1 h-full rounded-2xl overflow-hidden bg-white/5 border border-white/5">
                    {transformation?.first?.photos?.[0] ? <img src={transformation.first.photos[0]} className="w-full h-full object-cover grayscale" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon /></div>}
                  </div>
                  <div className="flex-1 h-full rounded-2xl overflow-hidden bg-white/5 border border-white/5 shadow-xl ring-1 ring-primary/30">
                    {transformation?.latest?.photos?.[0] ? <img src={transformation.latest.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><ImageIcon /></div>}
                  </div>
                  <Link to={ROUTES.USER_PROGRESS} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  </Link>
               </div>
            </BentoTile>

            {/* Activity Matrix (Span 12x1) */}
            <BentoTile title="Engagement Matrix" icon={Calendar} className="md:col-span-12 md:row-span-1 pb-4">
              <ActivityMatrix activityData={activityData} />
            </BentoTile>

            {/* Recent Sessions (Span 6x1) */}
            <BentoTile title="Tactical History" icon={Dumbbell} className="md:col-span-6 md:row-span-1">
              <div className="space-y-4">
                {recentWorkouts.length > 0 ? (
                  recentWorkouts.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                        <div>
                          <p className="text-sm font-black italic uppercase text-white truncate w-32 md:w-auto">{w.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{format(new Date(w.date), "MMM dd")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-primary uppercase">{w.duration}M</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm italic py-4">No data streams detected.</p>
                )}
              </div>
            </BentoTile>

             {/* Quick Actions (Span 6x1) */}
             <BentoTile title="Direct Protocols" icon={Zap} className="md:col-span-6 md:row-span-1">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <Link to="/workouts/browse" className="h-full">
                    <Button variant="outline" className="w-full h-full rounded-3xl border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3 group/btn">
                      <Dumbbell className="h-8 w-8 text-primary group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">New Drill</span>
                    </Button>
                  </Link>
                  <Link to={ROUTES.USER_DIET} className="h-full">
                    <Button variant="outline" className="w-full h-full rounded-3xl border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3 group/btn">
                      <Target className="h-8 w-8 text-primary group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">Diet Intel</span>
                    </Button>
                  </Link>
                </div>
            </BentoTile>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

// --- Sub-components ---

const ActivityMatrix: React.FC<{ activityData: IActivityData }> = ({ activityData }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const startDate = subWeeks(startOfWeek(today), 51); // 1 year data
  
  const weeks = [];
  for (let w = 0; w <= 51; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(startDate, w * 7 + d));
    }
    weeks.push(week);
  }

  const getLevel = (date: Date) => {
    const dStr = format(date, "yyyy-MM-dd");
    const data = activityData[dStr];
    if (!data) return 0;
    return Object.values(data).filter(v => v).length;
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [activityData]);

  return (
    <div className="space-y-4">
      <div 
        ref={scrollRef}
        className="flex gap-[4px] overflow-x-auto pb-4 no-scrollbar cursor-grab active:cursor-grabbing"
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[4px]">
            {week.map((date, di) => {
              const level = getLevel(date);
              const isFuture = date > today;
              return (
                <div
                  key={di}
                  title={format(date, "MMM dd, yyyy")}
                  className={cn(
                    "w-[14px] h-[14px] rounded-[3px] transition-all duration-500",
                    isFuture ? "bg-transparent" :
                    level === 0 ? "bg-white/[0.03]" :
                    level === 1 ? "bg-primary/20 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]" :
                    level === 2 ? "bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" :
                    level === 3 ? "bg-primary/70 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" :
                    "bg-primary shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)]"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase italic tracking-widest text-slate-500">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.03]" /> INACTIVE</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-[2px] bg-primary" /> PEAK</span>
        </div>
        <p>365 DAY DEPLOYMENT VISUALIZATION</p>
      </div>
    </div>
  );
};

const Play = ({ className, fill }: any) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill || "currentColor"}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default UserDashboard;