import React, { useState, useEffect } from "react";
import { format, isToday, addDays } from "date-fns";
import ActivityMatrix from "@/components/user/dashboard/ActivityMatrix";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Scale,
  Calendar,
  Zap,
  Activity,
  Image as ImageIcon,
  ChevronRight,
  Flame,
  Award,
  Droplets,
  Moon,
  Footprints,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";
import { getProfile, getWeightHistory, getActivityData, addWeight as addWeightService } from "@/services/userService";
import { compareProgress } from "@/services/progressService";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useSelector, useDispatch } from "react-redux";
import { setDashboardData, setActivityData as setReduxActivityData, setLoading as setReduxLoading } from "@/redux/slices/dashboardSlice";
import type { RootState } from "@/redux/store";
import { updateDailyMetrics } from "@/services/userService";

import type { WeightEntry, User, IActivityData, TransformationData } from "@/interfaces/user/IUserDashboard";

// --- Components ---

interface BentoTileProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon: SafeAny;
  delay?: number;
}

const BentoTile = ({ children, className, title, icon: Icon, delay = 0 }: BentoTileProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative overflow-hidden bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-[2.5rem] p-8 hover:border-primary/30 transition-all group shadow-2xl",
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
  const [activityData, setActivityData] = useState<IActivityData>({});
  const [transformation, setTransformation] = useState<TransformationData | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [isWeightLoggedToday, setIsWeightLoggedToday] = useState(false);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Local state for new tools
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [steps, setSteps] = useState(0);
  const [mindfulnessMinutes, setMindfulnessMinutes] = useState(0);
  
  // Removed unused dispatch, navigate, reduxUser

  const dispatch = useDispatch();
  const { data: cachedData, activityData: cachedActivity, lastFetched } = useSelector((state: RootState) => state.dashboard);

  const fetchDashboardData = async (force = false) => {
    // If we have cached data and it's less than 5 minutes old, don't fetch unless forced
    if (!force && cachedData && lastFetched && (Date.now() - lastFetched < 5 * 60 * 1000)) {
      setUserData(cachedData.user);
      setWeightData(cachedData.weightData);
      setLastLoggedDate(cachedData.lastLoggedDate);
      setIsWeightLoggedToday(cachedData.isWeightLoggedToday);
      setActivityData(cachedActivity || {});
      setTransformation(cachedData.transformation);
      setWaterGlasses(cachedData.dailyMetrics?.water || 0);
      setSleepHours(cachedData.dailyMetrics?.sleep || 0);
      setSteps(cachedData.dailyMetrics?.steps || 0);
      setMindfulnessMinutes(cachedData.dailyMetrics?.mindfulness || 0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    dispatch(setReduxLoading(true));
    try {
      const [profileRes, weightRes, activityRes, transformRes] = await Promise.all([
        getProfile(),
        getWeightHistory(),
        getActivityData(),
        compareProgress()
      ]);

      const profile = profileRes.user;
      const activity = activityRes.activityData || {};
      setActivityData(activity);
      dispatch(setReduxActivityData(activity));
      setTransformation(transformRes);

      // Handle Weight Data
      const history = weightRes.weightHistory || [];
      const sortedHistory = history
        .filter((e: WeightEntry) => e.weight && e.date)
        .sort((a: WeightEntry, b: WeightEntry) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const latestWeight = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].weight : profile.currentWeight || 0;
      const latestDate = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].date : null;
      const lastDateFormatted = latestDate ? format(new Date(latestDate), "MMM dd, yyyy") : null;
      setLastLoggedDate(lastDateFormatted);
      
      const chartData = sortedHistory.slice(-7).map((e: WeightEntry) => ({
        date: format(new Date(e.date), "yyyy-MM-dd"),
        weight: e.weight,
        goal: profile.goalWeight || 0
      }));
      setWeightData(chartData);

      const isLoggedToday = sortedHistory.some((e: WeightEntry) => isToday(new Date(e.date)));
      setIsWeightLoggedToday(isLoggedToday);

      const dashboardUser = {
        name: profile.name || "",
        currentWeight: latestWeight,
        goalWeight: profile.goalWeight || 0,
        height: profile.height,
      };
      setUserData(dashboardUser);



      // Daily Metrics
      const water = profile.dailyMetrics?.water || 0;
      const sleep = profile.dailyMetrics?.sleep || 0;
      const stepCount = profile.dailyMetrics?.steps || 0;
      const mindMinutes = profile.dailyMetrics?.mindfulness || 0;
      setWaterGlasses(water);
      setSleepHours(sleep);
      setSteps(stepCount);
      setMindfulnessMinutes(mindMinutes);

      // Store in Redux
      dispatch(setDashboardData({
        user: dashboardUser,
        weightData: chartData,
        lastLoggedDate: lastDateFormatted,
        isWeightLoggedToday: isLoggedToday,
        recentWorkouts: [],
        transformation: transformRes,
        dailyMetrics: profile.dailyMetrics
      }));

    } catch (errVal) { const err = errVal as SafeAny;
      console.error("Dashboard error:", err);
      toast.error("Failed to sync some dashboard data.");
    } finally {
      setIsLoading(false);
      dispatch(setReduxLoading(false));
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
      fetchDashboardData(true); // Force refresh cache
      setNewWeight("");
    } catch (_err: unknown) {
      toast.error("Failed to log weight");
    }
  };

  const handleUpdateWater = async (newVal: number) => {
    setWaterGlasses(newVal);
    try {
      await updateDailyMetrics({ water: newVal });
      toast.success("Hydration updated");
    } catch (_err) {
      toast.error("Failed to update hydration");
    }
  };

  const handleUpdateSleep = async (newVal: number) => {
    setSleepHours(newVal);
    try {
      await updateDailyMetrics({ sleep: newVal });
      toast.success("Recovery updated");
    } catch (_err) {
      toast.error("Failed to update recovery");
    }
  };

  const handleUpdateSteps = async (newVal: number) => {
    setSteps(newVal);
    try {
      await updateDailyMetrics({ steps: newVal });
    } catch (_err) {
      toast.error("Failed to sync steps");
    }
  };

  const handleUpdateMindfulness = async (newVal: number) => {
    setMindfulnessMinutes(newVal);
    try {
      await updateDailyMetrics({ mindfulness: newVal });
    } catch (_err) {
      toast.error("Failed to sync mindfulness");
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
      <div className="relative min-h-screen w-full flex flex-col bg-site-bg text-foreground">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-black italic tracking-widest uppercase animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-site-bg text-foreground overflow-hidden font-outfit">
      <div className="absolute inset-0 z-0">
        <Aurora colorStops={["var(--background)", "var(--site-bg)", "var(--background)"]} amplitude={1.1} blend={0.6} />
      </div>

      <SiteHeader />

      <main className="relative z-10 flex-1 container mx-auto px-4 py-12 pb-32">
        <div className="space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                You're doing great!
              </div>
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tight uppercase leading-[0.8] text-foreground">
                Welcome <span className="text-primary not-italic">back,</span><br />
                {userData.name.split(' ')[0]}
              </h1>
            </div>
            
            <div className="flex items-center gap-6 bg-glass-bg backdrop-blur-xl border border-glass-border p-6 rounded-[2.5rem] shadow-2xl">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Current Streak</p>
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                  <span className="text-3xl font-black italic text-foreground">{streak} DAYS</span>
                </div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Global Rank</p>
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <span className="text-3xl font-black italic text-foreground">ELITE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
            
            {/* Weight Summary (Span 4x2) */}
            <BentoTile title="Weight Progress" icon={Scale} className="md:col-span-8 md:row-span-2">
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="w-full md:w-1/3 flex flex-col justify-center space-y-6">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-500">Current Weight</p>
                    <div className="text-6xl font-black text-foreground italic tracking-tighter">{userData.currentWeight}<span className="text-2xl not-italic ml-1 opacity-40 text-foreground">KG</span></div>
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
                      <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 font-black italic uppercase tracking-widest" disabled={isWeightLoggedToday}>
                        {isWeightLoggedToday ? "LOGGED TODAY" : "LOG WEIGHT"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border text-foreground rounded-3xl">
                      <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase">Log Weight</DialogTitle></DialogHeader>
                      <div className="space-y-6 pt-4">
                        <Input 
                          type="number" 
                          placeholder="00.0" 
                          className="h-16 text-3xl font-black bg-muted border-border rounded-2xl focus:border-primary/50 text-foreground" 
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                        />
                        <Button onClick={() => handleAddWeight(newWeight)} className="w-full h-14 bg-primary text-white font-black italic uppercase tracking-widest">Save Weight</Button>
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
            <BentoTile title="BMI" icon={Zap} className="md:col-span-4 md:row-span-1">
              <div className="flex items-center justify-between h-full">
                <div>
                  <div className="text-5xl font-black italic text-foreground leading-none">
                    {userData.height ? (userData.currentWeight / Math.pow(userData.height / 100, 2)).toFixed(1) : "---"}
                  </div>
                  <Badge variant="outline" className="mt-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-black uppercase italic text-[10px] tracking-widest">
                    HEALTHY
                  </Badge>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-emerald-500 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </BentoTile>

            {/* Transformation (Span 4x1) */}
            <BentoTile title="Before & After" icon={ImageIcon} className="md:col-span-4 md:row-span-1">
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
            <BentoTile title="Water Intake" icon={Droplets} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black italic text-foreground leading-none">{waterGlasses}</div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Glasses</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-cyan-500 flex items-center justify-center bg-cyan-500/10 text-cyan-500">
                      <Droplets className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateWater(Math.max(0, waterGlasses - 1))}>-</Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateWater(waterGlasses + 1)}>+</Button>
                  </div>
                </div>
            </BentoTile>

            <BentoTile title="Sleep" icon={Moon} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black italic text-foreground leading-none">{sleepHours}</div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Hours Logged</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-indigo-500 flex items-center justify-center bg-indigo-500/10 text-indigo-500">
                      <Moon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateSleep(Math.max(0, sleepHours - 1))}>-</Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateSleep(sleepHours + 1)}>+</Button>
                  </div>
                </div>
            </BentoTile>

            <BentoTile title="Steps" icon={Footprints} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black italic text-foreground leading-none">{(steps/1000).toFixed(1)}k</div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Steps Today</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-orange-500 flex items-center justify-center bg-orange-500/10 text-orange-500">
                      <Footprints className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateSteps(Math.max(0, steps - 500))}>-500</Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateSteps(steps + 500)}>+500</Button>
                  </div>
                </div>
            </BentoTile>

            <BentoTile title="Mindfulness" icon={Brain} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black italic text-foreground leading-none">{mindfulnessMinutes}</div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Minutes</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-purple-500 flex items-center justify-center bg-purple-500/10 text-purple-500">
                      <Brain className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateMindfulness(Math.max(0, mindfulnessMinutes - 5))}>-5m</Button>
                    <Button variant="outline" className="flex-1 rounded-xl border-glass-border bg-glass-bg hover:bg-glass-hover" onClick={() => handleUpdateMindfulness(mindfulnessMinutes + 5)}>+5m</Button>
                  </div>
                </div>
            </BentoTile>

            {/* Activity Matrix (Span 12x1) */}
            <BentoTile title="Activity" icon={Calendar} className="md:col-span-12 md:row-span-1 pb-4">
              <ActivityMatrix activityData={activityData} />
            </BentoTile>



          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};




export default UserDashboard;