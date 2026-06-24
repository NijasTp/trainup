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
  Flame,
  Award,
  Droplets,
  Moon,
  Footprints,
  Brain,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import { getProfile, getWeightHistory, getActivityData, addWeight as addWeightService } from "@/services/userService";
import { compareProgress, addProgress } from "@/services/progressService";
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
  icon: React.ComponentType<any>;
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
  const [weightData, setWeightData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<IActivityData>({});
  const [transformation, setTransformation] = useState<TransformationData | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [isWeightLoggedToday, setIsWeightLoggedToday] = useState(false);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom states for visual progression comparison
  const [startingWeight, setStartingWeight] = useState<number>(0);
  const [fullWeightHistory, setFullWeightHistory] = useState<any[]>([]);
  
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
      
      setFullWeightHistory(sortedHistory);
      const initialWeight = sortedHistory.length > 0 ? sortedHistory[0].weight : profile.currentWeight || 0;
      setStartingWeight(initialWeight);

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

    } catch (errVal) {
      const err = errVal as SafeAny;
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

  // Fetch full weight history asynchronously if we loaded from cache and state is empty
  useEffect(() => {
    if (!isLoading && fullWeightHistory.length === 0) {
      getWeightHistory().then(weightRes => {
        const history = weightRes.weightHistory || [];
        const sortedHistory = history
          .filter((e: any) => e.weight && e.date)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setFullWeightHistory(sortedHistory);
        if (sortedHistory.length > 0) {
          setStartingWeight(sortedHistory[0].weight);
        }
      }).catch(err => console.error("Error fetching weight history background:", err));
    }
  }, [isLoading, fullWeightHistory.length]);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingPhoto(true);
      try {
        const formData = new FormData();
        formData.append("date", new Date().toISOString());
        formData.append("notes", "Uploaded from control center dashboard");
        formData.append("photos", file);
        
        await addProgress(formData);
        toast.success("Progress photo uploaded successfully!");
        fetchDashboardData(true);
      } catch (errVal) {
        const err = errVal as SafeAny;
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to upload photo");
      } finally {
        setIsUploadingPhoto(false);
      }
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

  const getWeightAtDate = (dateStr: string) => {
    if (!fullWeightHistory || fullWeightHistory.length === 0) return null;
    const targetTime = new Date(dateStr).getTime();
    let closest = fullWeightHistory[0];
    let minDiff = Math.abs(new Date(closest.date).getTime() - targetTime);
    for (const entry of fullWeightHistory) {
      const entryTime = new Date(entry.date).getTime();
      const diff = Math.abs(entryTime - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = entry;
      }
    }
    return closest.weight;
  };

  const getProgressPercentage = () => {
    const start = startingWeight || userData.currentWeight || 0;
    const goal = userData.goalWeight || 0;
    const current = userData.currentWeight || 0;
    if (!start || !goal) return 0;
    
    const totalTarget = Math.abs(start - goal);
    if (totalTarget === 0) return 100;
    
    const lostSoFar = start - current;
    const targetLoss = start - goal;
    
    if (targetLoss > 0) {
      if (lostSoFar <= 0) return 0;
      return Math.min(100, Math.round((lostSoFar / targetLoss) * 100));
    } else {
      const gainedSoFar = current - start;
      const targetGain = goal - start;
      if (gainedSoFar <= 0) return 0;
      return Math.min(100, Math.round((gainedSoFar / targetGain) * 100));
    }
  };

  const streak = calculateStreak();
  
  // Calculate completed daily tasks count out of 5
  const completedTasksCount = [
    waterGlasses > 0,
    sleepHours > 0,
    steps > 0,
    mindfulnessMinutes > 0,
    isWeightLoggedToday
  ].filter(Boolean).length;

  const hasMultiplePhotos = transformation?.first && transformation?.latest && 
    (transformation.first.date !== transformation.latest.date || 
     transformation.first.photos[0] !== transformation.latest.photos[0]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen w-full flex flex-col bg-[#0d0d0e] text-[#f5f5f5]">
        <SiteHeader />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#22d3ee]/20 border-t-[#22d3ee] rounded-full animate-spin" />
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
          
          {/* Dashboard Header */}
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
                  <span className="text-xl font-extrabold font-mono text-white">
                    {streak >= 15 ? "ELITE" : streak >= 7 ? "VETERAN" : streak >= 3 ? "VANGUARD" : "RECRUIT"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto md:auto-rows-[270px] max-w-6xl mx-auto">
            
            {/* Visual Progression (Span 8x2) */}
            <BentoTile title="Visual Progression Evolution" icon={ImageIcon} className="md:col-span-8 md:row-span-2">
              <div className="flex flex-col md:flex-row gap-6 h-full w-full justify-between">
                
                {/* Evolution side-by-side snapshots */}
                <div className="flex-1 flex gap-4 items-center justify-center min-h-[220px] md:min-h-0">
                  {transformation?.first || transformation?.latest ? (
                    <>
                      {/* Before Snapshot */}
                      {transformation.first && (
                        <div className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-neutral-500 bg-[#0d0d0e] border border-[#262626] px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                            BEFORE
                          </span>
                          
                          <div className="w-full aspect-[4/5] max-h-[190px] rounded-xl overflow-hidden border-2 border-[#262626] bg-[#0d0d0e] relative group shadow-lg">
                            <img 
                              src={transformation.first.photos[0]} 
                              alt="Before progress" 
                              className="w-full h-full object-cover grayscale opacity-55 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-90" 
                            />
                            
                            {/* Date overlay */}
                            <div className="absolute bottom-2 left-2 right-2 bg-[#0d0d0e]/85 backdrop-blur-xs border border-[#262626] rounded-lg py-0.5 px-1.5 text-center">
                              <p className="text-[9px] font-mono font-bold text-neutral-400">
                                {format(new Date(transformation.first.date), "MMM dd, yyyy")}
                              </p>
                              {getWeightAtDate(transformation.first.date) && (
                                <p className="text-[10px] font-mono font-extrabold text-neutral-300 mt-0.5">
                                  {getWeightAtDate(transformation.first.date)} KG
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Divider / VS Badge */}
                      {transformation.first && transformation.latest && (
                        <div className="hidden md:flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/35 flex items-center justify-center text-[#22d3ee] font-mono font-black text-xs shadow-md shadow-[#22d3ee]/5 animate-pulse">
                            VS
                          </div>
                        </div>
                      )}

                      {/* Current Snapshot */}
                      {transformation.latest && (
                        hasMultiplePhotos ? (
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#22d3ee] bg-[#22d3ee]/10 border border-[#22d3ee]/35 px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-md shadow-[#22d3ee]/5">
                              CURRENT
                            </span>
                            
                            <div className="w-full aspect-[4/5] max-h-[190px] rounded-xl overflow-hidden border-2 border-[#22d3ee]/40 bg-[#0d0d0e] relative group shadow-lg shadow-[#22d3ee]/5">
                              <img 
                                src={transformation.latest.photos[0]} 
                                alt="Current progress" 
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" 
                              />
                              
                              {/* Date overlay */}
                              <div className="absolute bottom-2 left-2 right-2 bg-[#0d0d0e]/85 backdrop-blur-xs border border-[#22d3ee]/30 rounded-lg py-0.5 px-1.5 text-center">
                                <p className="text-[9px] font-mono font-bold text-[#22d3ee]">
                                  {format(new Date(transformation.latest.date), "MMM dd, yyyy")}
                                </p>
                                {getWeightAtDate(transformation.latest.date) && (
                                  <p className="text-[10px] font-mono font-extrabold text-white mt-0.5">
                                    {getWeightAtDate(transformation.latest.date)} KG
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Only 1 photo exists -> show a call to action on the right instead of duplicate photo */
                          <div className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-955/20 border border-orange-900/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                              NEXT EVOLUTION
                            </span>
                            
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full aspect-[4/5] max-h-[190px] rounded-xl border-2 border-dashed border-[#262626] bg-[#0d0d0e] hover:border-orange-500/50 hover:bg-[#171717]/30 transition-all duration-300 flex flex-col items-center justify-center p-3 text-center cursor-pointer group"
                            >
                              <div className="p-2 bg-[#171717] border border-[#262626] rounded-xl text-neutral-500 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-colors">
                                <Upload className="h-4 w-4 animate-bounce" />
                              </div>
                              <p className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-tight mt-2">
                                Upload Photo
                              </p>
                              <p className="text-[7px] font-mono text-neutral-600 uppercase mt-0.5 leading-normal max-w-[120px]">
                                Add today's snap to compare progress.
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    /* Entirely empty state */
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#262626] hover:border-[#22d3ee]/50 hover:bg-[#171717]/30 transition-all duration-300 rounded-2xl bg-[#0d0d0e] gap-3 cursor-pointer group"
                    >
                      <div className="p-3 bg-[#171717] border border-[#262626] rounded-xl text-neutral-600 group-hover:text-[#22d3ee] group-hover:border-[#22d3ee]/30 transition-colors">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-extrabold font-mono text-white uppercase tracking-tight">Begin Your Physical Evolution</h4>
                        <p className="text-[9px] font-mono text-neutral-500 uppercase max-w-[280px] mx-auto leading-relaxed">
                          No snapshot logged. Start documenting your physical evolution matrix. Upload your first progress snapshot to track visual growth velocity.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Motivation Info & Actions Panel */}
                <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#262626] pt-4 md:pt-0 md:pl-6 h-full">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">dedication matrix</h4>
                      <p className="text-base font-extrabold text-white font-mono mt-1 uppercase leading-none">
                        {transformation?.first && transformation?.latest ? (
                          <>
                            {Math.max(1, Math.round((new Date(transformation.latest.date).getTime() - new Date(transformation.first.date).getTime()) / (1000 * 60 * 60 * 24)))} Days Elapsed
                          </>
                        ) : (
                          "0 DAYS ACTIVE"
                        )}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">progression insight</h4>
                      <div className="bg-[#0d0d0e] border border-[#262626] rounded-xl p-3 space-y-2">
                        {transformation?.first && transformation?.latest && getWeightAtDate(transformation.first.date) && getWeightAtDate(transformation.latest.date) ? (
                          (() => {
                            const wFirst = getWeightAtDate(transformation.first.date) || 0;
                            const wLatest = getWeightAtDate(transformation.latest.date) || 0;
                            const diff = wFirst - wLatest;
                            return (
                              <>
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-neutral-500 uppercase font-bold">Snapshot Delta</span>
                                  <span className={cn("font-extrabold", diff >= 0 ? "text-emerald-400" : "text-orange-500")}>
                                    {diff >= 0 ? `-${diff.toFixed(1)} KG` : `+${Math.abs(diff).toFixed(1)} KG`}
                                  </span>
                                </div>
                                <p className="text-[8px] font-mono text-neutral-500 uppercase leading-normal">
                                  {diff >= 0 
                                    ? "Excellent fat loss velocity. Maintain calorie target matrix to solidify muscular definition."
                                    : "Hypertrophy phase active. Solidify sleep protocols to maximize muscle tissue regeneration."
                                  }
                                </p>
                              </>
                            );
                          })()
                        ) : (
                          <>
                            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 font-bold uppercase">
                              <span>Snapshot Delta</span>
                              <span>---</span>
                            </div>
                            <p className="text-[8px] font-mono text-neutral-500 uppercase leading-normal">
                              Upload at least two snapshots to track physical dimension shifting and delta calculations.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="duo-btn-cyan w-full py-3 text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      {isUploadingPhoto ? "UPLOADING..." : "UPLOAD SNAPSHOT"}
                    </button>
                    <Link to={ROUTES.USER_PROGRESS} className="w-full block">
                      <button className="duo-btn-outline w-full py-3 text-xs font-mono font-bold uppercase tracking-wider">
                        HISTORY LOGS
                      </button>
                    </Link>
                  </div>
                </div>

              </div>
            </BentoTile>

            {/* Weight Tracker Matrix (Span 4x2) */}
            <BentoTile title="Weight Tracker Matrix" icon={Scale} className="md:col-span-4 md:row-span-2">
              <div className="flex flex-col gap-4 h-full justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Current Metric</p>
                      <div className="text-3xl font-extrabold text-white font-mono leading-none mt-1">
                        {userData.currentWeight}
                        <span className="text-xs font-bold text-neutral-600 ml-1">KG</span>
                      </div>
                      {lastLoggedDate && (
                        <p className="text-[8px] text-neutral-500 font-mono font-bold uppercase tracking-wider mt-1">
                          Updated: {lastLoggedDate}
                        </p>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="duo-btn-cyan px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-wider disabled:opacity-50"
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
                            step="0.1"
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
                  
                  {/* Targets & Delta */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#262626]">
                    <div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Start</p>
                      <p className="text-xs font-extrabold font-mono text-neutral-300 mt-0.5">{startingWeight || userData.currentWeight} KG</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Goal</p>
                      <p className="text-xs font-extrabold font-mono text-[#22d3ee] mt-0.5">{userData.goalWeight} KG</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Lost</p>
                      <p className={cn("text-xs font-extrabold font-mono mt-0.5", startingWeight - userData.currentWeight >= 0 ? "text-emerald-400" : "text-orange-500")}>
                        {(startingWeight - userData.currentWeight).toFixed(1)} KG
                      </p>
                    </div>
                  </div>

                  {/* Progress to Goal bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[8px] font-mono font-bold text-neutral-500 uppercase">
                      <span>Goal Progress</span>
                      <span className="text-[#22d3ee]">{getProgressPercentage()}%</span>
                    </div>
                    <div className="w-full h-3 bg-[#0d0d0e] border border-[#262626] rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] to-[#10b981] transition-all duration-500" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* 7-Day Line Chart */}
                <div className="flex-1 min-h-[100px] bg-[#0d0d0e] border border-[#262626] rounded-xl p-2.5 relative">
                  <span className="absolute top-2 left-2 text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-wider pointer-events-none">
                    7-Day Vector Trend
                  </span>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightData} margin={{ top: 15, right: 5, left: 5, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                      <Area type="monotone" dataKey="weight" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
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
                  <div className="w-10 h-10 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-[#22d3ee]">
                    <Droplets className="h-5 w-5 fill-[#22d3ee]/10" />
                  </div>
                </div>
                
                {/* Visual cups representation */}
                <div className="flex gap-1.5 py-1 justify-center my-1.5">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2.5 h-5 rounded-b-md border transition-all duration-200", 
                        i < waterGlasses 
                          ? "bg-[#22d3ee] border-[#22d3ee] shadow-sm shadow-[#22d3ee]/20" 
                          : "bg-[#0d0d0e] border-[#262626]"
                      )} 
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateWater(Math.max(0, waterGlasses - 1))}>-</button>
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateWater(waterGlasses + 1)}>+</button>
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
                  <div className="w-10 h-10 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-indigo-400">
                    <Moon className="h-5 w-5 fill-indigo-400/10" />
                  </div>
                </div>
                
                {/* Sleep progress bar */}
                <div className="space-y-1 my-1.5">
                  <div className="flex justify-between text-[7px] font-mono font-bold text-neutral-600 uppercase">
                    <span>Sleep protocol</span>
                    <span>{sleepHours >= 8 ? "OPTIMAL" : sleepHours >= 6 ? "ADEQUATE" : "DEFICIT"}</span>
                  </div>
                  <div className="w-full h-2 bg-[#0d0d0e] border border-[#262626] rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateSleep(Math.max(0, sleepHours - 1))}>-</button>
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateSleep(sleepHours + 1)}>+</button>
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
                  <div className="w-10 h-10 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-orange-400">
                    <Footprints className="h-5 w-5" />
                  </div>
                </div>

                {/* Step Goal Progress */}
                <div className="space-y-1 my-1.5">
                  <div className="flex justify-between text-[7px] font-mono font-bold text-neutral-600 uppercase">
                    <span>Step Goal (10k)</span>
                    <span>{steps} steps</span>
                  </div>
                  <div className="w-full h-2 bg-[#0d0d0e] border border-[#262626] rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (steps / 10000) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateSteps(Math.max(0, steps - 1000))}>-1k</button>
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateSteps(steps + 1000)}>+1k</button>
                </div>
              </div>
            </BentoTile>

            {/* Mind Flow (Span 4x1) */}
            <BentoTile title="Mind Flow" icon={Brain} className="md:col-span-4 md:row-span-1">
              <div className="flex flex-col h-full justify-between py-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold font-mono text-white leading-none">{mindfulnessMinutes}</div>
                    <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">MINUTES FOCUS</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-purple-400">
                    <Brain className="h-5 w-5" />
                  </div>
                </div>

                {/* Focus quality progress */}
                <div className="space-y-1 my-1.5">
                  <div className="flex justify-between text-[7px] font-mono font-bold text-neutral-600 uppercase">
                    <span>Mind Protocol</span>
                    <span>{mindfulnessMinutes >= 20 ? "ZEN MASTER" : mindfulnessMinutes >= 10 ? "MEDITATIVE" : "RESTLESS"}</span>
                  </div>
                  <div className="w-full h-2 bg-[#0d0d0e] border border-[#262626] rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, (mindfulnessMinutes / 20) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateMindfulness(Math.max(0, mindfulnessMinutes - 5))}>-5m</button>
                  <button className="duo-btn-gray flex-1 py-1 text-xs font-bold" onClick={() => handleUpdateMindfulness(mindfulnessMinutes + 5)}>+5m</button>
                </div>
              </div>
            </BentoTile>

            {/* BMI Tile (Span 4x1) */}
            <BentoTile title="BMI Tier" icon={Zap} className="md:col-span-4 md:row-span-1">
              <div className="flex flex-col h-full justify-between py-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold font-mono text-white leading-none">
                      {userData.height ? (userData.currentWeight / Math.pow(userData.height / 100, 2)).toFixed(1) : "---"}
                    </div>
                    <p className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-widest mt-1">BMI INDEX</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl border border-[#262626] bg-[#0d0d0e] flex items-center justify-center text-emerald-500">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="w-full bg-[#0d0d0e] border border-[#262626] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[8px] font-mono font-bold">
                    <span className="text-neutral-500 uppercase">Height Matrix</span>
                    <span className="text-white">{userData.height ? `${userData.height} cm` : "Not Configured"}</span>
                  </div>
                  <div className="w-full bg-[#0d0d0e] border border-[#262626] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[8px] font-mono font-bold">
                    <span className="text-neutral-500 uppercase">BMI Status</span>
                    {userData.height ? (
                      (() => {
                        const bmi = userData.currentWeight / Math.pow(userData.height / 100, 2);
                        let tier = "Optimal";
                        let color = "text-emerald-400 bg-emerald-950/20 border border-emerald-900/40";
                        if (bmi < 18.5) {
                          tier = "Underweight";
                          color = "text-orange-400 bg-orange-950/20 border border-orange-900/40";
                        } else if (bmi >= 25 && bmi < 30) {
                          tier = "Overweight";
                          color = "text-orange-400 bg-orange-950/20 border border-orange-900/40";
                        } else if (bmi >= 30) {
                          tier = "Obese";
                          color = "text-red-400 bg-red-950/20 border border-red-900/40";
                        }
                        return <span className={cn("px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold", color)}>{tier}</span>;
                      })()
                    ) : (
                      <span className="text-neutral-600 font-bold">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </BentoTile>

            {/* XP / Consistency Summary (Span 4x1) */}
            <BentoTile title="Daily Quest Summary" icon={Award} className="md:col-span-4 md:row-span-1">
              <div className="flex flex-col justify-between h-full py-1 font-mono text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] text-neutral-500 font-bold uppercase">
                    <span>Quest Status</span>
                    <span className="text-[#22d3ee]">Active</span>
                  </div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-tight leading-none">WEEKLY QUEST INDEX</h4>
                  <p className="text-[8px] text-neutral-500 uppercase leading-normal">
                    Earn XP multiplier by logging daily metrics. Maintain a streak to trigger the ultimate hyper-burn rank buff!
                  </p>
                </div>
                
                {/* Completed Daily Objectives Progress */}
                <div className="space-y-2">
                  <div className="w-full bg-[#0d0d0e] border border-[#262626] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[8px] font-bold">
                    <span className="text-neutral-500 uppercase">Streak Rank</span>
                    <span className="text-[#22d3ee] uppercase">
                      {streak >= 15 ? "Elite General" : streak >= 7 ? "Squad Leader" : streak >= 3 ? "Vanguard" : "Recruit"}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[7px] font-bold text-neutral-600 uppercase">
                      <span>Daily Objectives</span>
                      <span>{completedTasksCount}/5 LOCKED</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0d0d0e] border border-[#262626] rounded-full overflow-hidden p-px">
                      <div 
                        className="h-full bg-[#22d3ee] transition-all duration-300 rounded-full"
                        style={{ width: `${(completedTasksCount / 5) * 100}%` }}
                      />
                    </div>
                  </div>
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