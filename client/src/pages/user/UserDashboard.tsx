import React, { useState, useEffect, useRef } from "react";
import { format, isToday, subWeeks, startOfWeek, addDays, subDays, eachDayOfInterval, isSameMonth } from "date-fns";
import ActivityMatrix from "@/components/user/dashboard/ActivityMatrix";
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
  Droplets,
  Moon,
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

interface BentoTileProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon: any;
  delay?: number;
}

const BentoTile = ({ children, className, title, icon: Icon, delay = 0 }: BentoTileProps) => (
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
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local state for new tools
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  
  // Removed unused dispatch, navigate, reduxUser

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
      const latestDate = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].date : null;
      setLastLoggedDate(latestDate ? format(new Date(latestDate), "MMM dd, yyyy") : null);
      
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

    } catch (err: unknown) {
      console.error("Dashboard error:", err);
      toast.error("Failed to sync some dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddWeight = async (val: string) => {
    const weight = Number(val);
    if (!weight || isNaN(weight)) return toast.error("Invalid weight value");
    
    try {
      await addWeightService(weight);
      toast.success("Weight logged successfully!");
      fetchDashboardData();
      setNewWeight("");
    } catch (_err: unknown) {
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
                    {lastLoggedDate && (
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">
                        Last Logged: {lastLoggedDate}
                      </p>
                    )}
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

            {/* Health Tools - Water & Sleep (Span 8x1) */}
            <BentoTile title="Hydration Protocol" icon={Droplets} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black italic text-white leading-none">{waterGlasses}</div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Glasses</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-cyan-500 flex items-center justify-center bg-cyan-500/10 text-cyan-500">
                      <Droplets className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" onClick={() => { setWaterGlasses(Math.max(0, waterGlasses - 1)); toast.success("Hydration updated"); }}>-</Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" onClick={() => { setWaterGlasses(waterGlasses + 1); toast.success("Hydration updated"); }}>+</Button>
                  </div>
                </div>
            </BentoTile>

            <BentoTile title="Recovery Protocol" icon={Moon} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black italic text-white leading-none">{sleepHours}</div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Hours Logged</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-indigo-500 flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                      <Moon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" onClick={() => { setSleepHours(Math.max(0, sleepHours - 1)); toast.success("Recovery updated"); }}>-</Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" onClick={() => { setSleepHours(sleepHours + 1); toast.success("Recovery updated"); }}>+</Button>
                  </div>
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

// Removed local ActivityMatrix implementation in favor of reusable component

interface PlayProps {
  className?: string;
  fill?: string;
}

const Play = ({ className, fill }: PlayProps) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill || "currentColor"}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default UserDashboard;