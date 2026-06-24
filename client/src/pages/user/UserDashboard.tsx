import React, { useState, useEffect, useCallback, useRef } from "react";
import { format, isToday, addDays } from "date-fns";
import ActivityMatrix from "@/components/user/dashboard/ActivityMatrix";
import { cn } from "@/lib/utils";
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
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={cn(
      "relative overflow-hidden bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:border-b-[6px] hover:border-b-[#262626] hover:border-[#404040] active:translate-y-1 active:border-b-[4px] active:border-b-[#1f1f1f] group flex flex-col justify-between",
      className
    )}
  >
    <div className="space-y-4 h-full flex flex-col justify-between w-full">
      {title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0d0d0e] border border-[#262626] rounded-xl text-[#22d3ee]">
              <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">{title}</h3>
          </div>
        </div>
      )}
      <div className="flex-1 w-full">{children}</div>
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
  
  // Local state for daily trackers
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [steps, setSteps] = useState(0);
  const [mindfulnessMinutes, setMindfulnessMinutes] = useState(0);

  const dispatch = useDispatch();
  const { data: cachedData, activityData: cachedActivity, lastFetched } = useSelector((state: RootState) => state.dashboard);

  const fetchDashboardData = useCallback(async (force = false) => {
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

      const water = profile.dailyMetrics?.water || 0;
      const sleep = profile.dailyMetrics?.sleep || 0;
      const stepCount = profile.dailyMetrics?.steps || 0;
      const mindMinutes = profile.dailyMetrics?.mindfulness || 0;
      setWaterGlasses(water);
      setSleepHours(sleep);
      setSteps(stepCount);
      setMindfulnessMinutes(mindMinutes);

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
  }, [cachedData, lastFetched, cachedActivity, dispatch]);

  const fetchDashboardDataRef = useRef(fetchDashboardData);
  useEffect(() => {
    fetchDashboardDataRef.current = fetchDashboardData;
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardDataRef.current();
  }, []);

  const handleAddWeight = async (val: string) => {
    const weight = Number(val);
    if (!weight || isNaN(weight)) return toast.error("Invalid weight value");
    
    try {
      await addWeightService(weight);
      toast.success("Weight logged successfully!");
      fetchDashboardData(true);
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
      <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5]">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-[#22d3ee] rounded-full animate-spin" />
          <p className="text-neutral-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing quest progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5] overflow-hidden font-sans">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_75%)] rounded-full blur-[70px]" />
      </div>

      <SiteHeader />

      <main className="relative z-10 flex-1 container mx-auto px-6 py-12 pb-32 max-w-6xl w-full">
        <div className="space-y-10">
          
          {/* Dashboard Header Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#171717] border border-[#262626] text-[#22d3ee] font-mono px-3 py-1 rounded-full text-[10px] tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                DAILY QUEST MATRIX ACTIVE
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-mono uppercase">
                CONTROL CENTER
              </h1>
            </div>
            
            <div className="flex items-center gap-4 bg-[#171717] border-2 border-[#262626] border-b-[5px] border-b-[#1f1f1f] p-5 rounded-2xl">
              <div className="text-center px-2">
                <p className="text-[9px] text-neutral-500 font-mono font-bold uppercase tracking-wider mb-1">STREAK</p>
                <div className="flex items-center gap-1.5">
                  <Flame className="h-5 w-5 text-orange-500 fill-orange-500/10 animate-pulse" />
                  <span className="text-xl font-extrabold font-mono text-white">{streak} DAYS</span>
                </div>
              </div>
              <div className="w-px h-8 bg-[#262626]" />
              <div className="text-center px-2">
                <p className="text-[9px] text-neutral-500 font-mono font-bold uppercase tracking-wider mb-1">RANK TIER</p>
                <div className="flex items-center gap-1.5">
                  <Award className="h-5 w-5 text-[#22d3ee]" />
                  <span className="text-xl font-extrabold font-mono text-white">RECRUIT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px] max-w-6xl mx-auto">
            
            {/* Weight Summary (Span 8x2) */}
            <BentoTile title="Weight Vector" icon={Scale} className="md:col-span-8 md:row-span-2">
              <div className="flex flex-col md:flex-row gap-6 h-full justify-between">
                <div className="w-full md:w-2/5 flex flex-col justify-between py-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Current Metric</p>
                    <div className="text-5xl font-extrabold text-white font-mono leading-none">
                      {userData.currentWeight}
                      <span className="text-lg font-bold text-neutral-600 ml-1">KG</span>
                    </div>
                    {lastLoggedDate && (
                      <p className="text-[9px] text-neutral-500 font-mono font-bold uppercase tracking-wider pt-1">
                        Updated: {lastLoggedDate}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 py-2 border-t border-[#262626]">
                    <div className="flex-1">
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Goal</p>
                      <p className="text-sm font-extrabold font-mono text-[#22d3ee]">{userData.goalWeight} KG</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Delta</p>
                      <p className={cn("text-sm font-extrabold font-mono", userData.currentWeight > userData.goalWeight ? "text-orange-500" : "text-emerald-400")}>
                        {Math.abs(userData.currentWeight - userData.goalWeight).toFixed(1)} KG
                      </p>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button 
                        className="duo-btn-cyan w-full py-3 text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                        disabled={isWeightLoggedToday}
                      >
                        {isWeightLoggedToday ? "LOGGED" : "LOG WEIGHT"}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#171717] border-2 border-[#262626] text-[#f5f5f5] rounded-2xl max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-extrabold font-mono uppercase text-white">Log Today's Weight</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <input 
                          type="number" 
                          placeholder="00.0" 
                          className="w-full h-14 text-2xl font-mono bg-[#0d0d0e] border-2 border-[#262626] rounded-xl px-4 text-white focus:outline-none focus:border-[#22d3ee]" 
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                        />
                        <button 
                          onClick={() => handleAddWeight(newWeight)} 
                          className="duo-btn-cyan w-full py-3.5 text-xs font-mono font-bold"
                        >
                          SUBMIT ENTRY
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex-1 h-full min-h-[160px] bg-[#0d0d0e] border border-[#262626] rounded-xl p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                      <Area type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </BentoTile>

            {/* BMI Tile (Span 4x1) */}
            <BentoTile title="BMI Tier" icon={Zap} className="md:col-span-4 md:row-span-1">
              <div className="flex items-center justify-between h-full py-1">
                <div>
                  <div className="text-4xl font-extrabold font-mono text-white leading-none">
                    {userData.height ? (userData.currentWeight / Math.pow(userData.height / 100, 2)).toFixed(1) : "---"}
                  </div>
                  <span className="inline-flex items-center text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded uppercase tracking-wider mt-3">
                    Optimal
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-emerald-500">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
            </BentoTile>

            {/* Transformation (Span 4x1) */}
            <BentoTile title="Visual Progression" icon={ImageIcon} className="md:col-span-4 md:row-span-1">
               <div className="flex items-center gap-4 h-full py-1">
                  <div className="flex-1 h-full rounded-xl overflow-hidden bg-[#0d0d0e] border border-[#262626]">
                    {transformation?.first?.photos?.[0] ? <img src={transformation.first.photos[0]} className="w-full h-full object-cover grayscale opacity-50" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700"><ImageIcon className="w-4 h-4" /></div>}
                  </div>
                  <div className="flex-1 h-full rounded-xl overflow-hidden bg-[#0d0d0e] border-2 border-[#22d3ee]/20 shadow-md shadow-[#22d3ee]/5">
                    {transformation?.latest?.photos?.[0] ? <img src={transformation.latest.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-700"><ImageIcon className="w-4 h-4" /></div>}
                  </div>
                  <Link to={ROUTES.USER_PROGRESS} className="p-2.5 bg-[#0d0d0e] border border-[#262626] rounded-xl hover:border-white/20 transition-all flex items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-[#a3a3a3]" />
                  </Link>
               </div>
            </BentoTile>

            {/* Water Tracker (Span 4x1) */}
            <BentoTile title="Water Log" icon={Droplets} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between py-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold font-mono text-white leading-none">{waterGlasses}</div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">GLASSES DRUNK</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-[#22d3ee]">
                      <Droplets className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateWater(Math.max(0, waterGlasses - 1))}>-</button>
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateWater(waterGlasses + 1)}>+</button>
                  </div>
                </div>
            </BentoTile>

            {/* Sleep Tracker (Span 4x1) */}
            <BentoTile title="Recovery Log" icon={Moon} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between py-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold font-mono text-white leading-none">{sleepHours}</div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">HOURS RESTED</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-indigo-400">
                      <Moon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateSleep(Math.max(0, sleepHours - 1))}>-</button>
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateSleep(sleepHours + 1)}>+</button>
                  </div>
                </div>
            </BentoTile>

            {/* Steps Tracker (Span 4x1) */}
            <BentoTile title="Steps Log" icon={Footprints} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between py-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold font-mono text-white leading-none">{(steps/1000).toFixed(1)}k</div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">STEPS COMPLETED</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-orange-400">
                      <Footprints className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateSteps(Math.max(0, steps - 500))}>-500</button>
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateSteps(steps + 500)}>+500</button>
                  </div>
                </div>
            </BentoTile>

            {/* Mindfulness Tracker (Span 4x1) */}
            <BentoTile title="Mind Flow" icon={Brain} className="md:col-span-4 md:row-span-1">
                <div className="flex flex-col h-full justify-between py-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold font-mono text-white leading-none">{mindfulnessMinutes}</div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">MINUTES FOCUS</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-purple-400">
                      <Brain className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateMindfulness(Math.max(0, mindfulnessMinutes - 5))}>-5m</button>
                    <button className="duo-btn-gray flex-1 py-1.5 text-xs font-bold" onClick={() => handleUpdateMindfulness(mindfulnessMinutes + 5)}>+5m</button>
                  </div>
                </div>
            </BentoTile>

            {/* Activity Matrix (Span 12x1) */}
            <BentoTile title="Quest Log Timeline" icon={Calendar} className="md:col-span-12 md:row-span-1 pb-4">
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