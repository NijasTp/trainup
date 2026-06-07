import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  totalEarningsThisMonth: number;
  totalEarningsLastMonth: number;
  averageRating: number;
  totalSessions: number;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    clients: number;
  }>;
  planDistribution: Array<{
    plan: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: string;
    message: string;
    date: string;
  }>;
  unassignedClientsCount: number;
  hasSessionBundles: boolean;
}

export default function TrainerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get("/trainer/dashboard");
      setStats(response.data);
      setIsLoading(false);
    } catch (errVal) { const err = errVal as SafeAny;
      console.error("Failed to fetch dashboard stats:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "TrainUp - Dashboard";
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-site-bg text-foreground">
        <TrainerSiteHeader />
        <div className="relative container mx-auto px-6 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-cyan-400/30 rounded-full animate-pulse"></div>
          </div>
          <p className="text-white/40 font-black uppercase italic tracking-widest text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-site-bg text-foreground">
        <TrainerSiteHeader />
        <div className="relative container mx-auto px-6 py-16 text-center space-y-6">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter">Oops!</h3>
          <p className="text-white/40 font-medium max-w-md mx-auto">{error}</p>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 uppercase font-black italic tracking-widest"
            onClick={fetchDashboardStats}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const growthPercentage = calculateGrowthPercentage(stats.totalEarningsThisMonth, stats.totalEarningsLastMonth);

  // Calculate total plan count for percentage
  const totalPlanCount = stats.planDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="min-h-screen bg-[#030303] text-foreground selection:bg-cyan-500/30 font-outfit overflow-x-hidden">
      <TrainerSiteHeader />
      
      {/* Dynamic Aurora Ambient Backdrops */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-cyan-500/5 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-600/5 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <main className="relative container mx-auto px-6 py-12 space-y-12 z-10">
        {/* Elite Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-3">
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-1.5 font-black italic uppercase tracking-widest text-[9px] rounded-full">
              Command Center
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none text-white">
              Trainer <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 italic">Dashboard</span>
            </h1>
            <p className="text-slate-400 font-medium text-base md:text-lg max-w-2xl">
              Monitor active client engagement, evaluate financial trajectories, and coordinate training schedules through an elite modern console.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
             <Button 
                onClick={() => navigate("/trainer/weekly-schedule")}
                className="h-16 px-10 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase italic tracking-widest rounded-2xl shadow-xl shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 border-0"
              >
                Schedule Session
              </Button>
          </div>
        </div>
   

        {/* Stats Grid with Glowing Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Clients */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 hover:border-blue-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group h-full">
              <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                 <Users className="h-32 w-32 text-blue-500" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-xl group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Active Operatives</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black italic tracking-tighter text-white">{stats.totalClients}</span>
                    <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black italic uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                      +{stats.newClientsThisMonth} NEW
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Revenue */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 hover:border-cyan-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group h-full">
              <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                 <DollarSign className="h-32 w-32 text-cyan-500" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Monthly Revenue</p>
                  <span className="text-4xl font-black italic tracking-tighter text-white">{formatAmount(stats.totalEarningsThisMonth)}</span>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mt-1",
                    Number(growthPercentage) >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {Number(growthPercentage) >= 0 ? "+" : ""}{growthPercentage}% vs last month
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Average Rating */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 hover:border-amber-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group h-full">
              <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                 <Star className="h-32 w-32 text-amber-500" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-xl group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Satisfaction Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic tracking-tighter text-white">{stats.averageRating.toFixed(1)}</span>
                    <span className="text-slate-500 font-bold text-base uppercase">/ 5.0</span>
                  </div>
                  <div className="flex gap-1 mt-1.5 w-full bg-white/[0.02] p-1 rounded-full border border-white/5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div 
                        key={s} 
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all duration-500",
                          s <= Math.round(stats.averageRating) ? "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white/5"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Sessions */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 hover:border-purple-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden group h-full">
              <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                 <Activity className="h-32 w-32 text-purple-500" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-xl group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Total Consultations</p>
                  <span className="text-4xl font-black italic tracking-tighter text-white">{stats.totalSessions}</span>
                  <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wider">Completed Sessions</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Area Chart: Earnings */}
          <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] shadow-2xl p-6 group">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-black uppercase italic tracking-widest flex items-center gap-3 text-slate-400 group-hover:text-cyan-400 transition-colors">
                <div className="w-1.5 h-4 bg-cyan-500 rounded-full" />
                Financial Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyEarnings}>
                    <defs>
                      <linearGradient id="colorEarningsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900, letterSpacing: '0.05em'}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                      itemStyle={{ color: '#06b6d4', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                      labelStyle={{ color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#06b6d4" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorEarningsGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bar Chart: Client Allocations */}
          <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] shadow-2xl p-6 group">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs font-black uppercase italic tracking-widest flex items-center gap-3 text-slate-400 group-hover:text-blue-400 transition-colors">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                Client Allocation Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900, letterSpacing: '0.05em'}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.02)'}}
                      contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                      itemStyle={{ color: '#06b6d4', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                      labelStyle={{ color: 'white', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px' }}
                    />
                    <Bar 
                      dataKey="clients" 
                      fill="#06b6d4" 
                      radius={[8, 8, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lower Grid: Plan Distribution and Dynamic Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Plan Distribution */}
          <div className="lg:col-span-5">
            <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] shadow-2xl p-8 h-full">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xs font-black uppercase italic tracking-widest flex items-center gap-3 text-slate-400">
                  <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                  Subscription Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-8">
                  {stats.planDistribution.map((plan) => {
                    const percentage = totalPlanCount > 0
                      ? ((plan.count / totalPlanCount) * 100).toFixed(1)
                      : '0';

                    const planColor = {
                      basic: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
                      premium: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
                      pro: 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    }[plan.plan as 'basic'|'premium'|'pro'] || 'bg-white/20';

                    return (
                      <div key={plan.plan} className="space-y-3 group">
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-sm font-black uppercase italic tracking-widest text-white group-hover:text-cyan-400 transition-colors">{plan.plan} Protocol</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{plan.count} client{plan.count !== 1 ? 's' : ''}</p>
                          </div>
                          <span className="text-3xl font-black italic tracking-tighter text-white">{percentage}%</span>
                        </div>
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div
                            className={`${planColor} h-full rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dynamic Recent Activity with Credit/Debit Markers */}
          <div className="lg:col-span-7">
            <Card className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[3rem] shadow-2xl p-8 h-full">
              <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase italic tracking-widest flex items-center gap-3 text-slate-400">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  Recent Activity logs
                </CardTitle>
                <Badge variant="outline" className="border-white/10 text-slate-500 uppercase text-[9px] font-black tracking-widest rounded-full py-1 px-3">
                  Real-time Feed
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity: SafeAny, index: number) => {
                    const isRefund = activity.isRefund;
                    const amount = activity.amount;

                    return (
                      <div key={index} className="flex items-start gap-5 p-5 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 group">
                        <div className={cn(
                          "p-3.5 rounded-2xl transition-all duration-300 shadow-xl",
                          isRefund 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        )}>
                          {isRefund ? (
                            <TrendingDown className="h-5 w-5" />
                          ) : (
                            <TrendingUp className="h-5 w-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors leading-relaxed">
                              {activity.message}
                            </p>
                            {amount !== undefined && (
                              <span className={cn(
                                "text-lg font-black italic tracking-tighter tabular-nums whitespace-nowrap px-3 py-1 bg-white/[0.02] rounded-xl border border-white/5 self-start sm:self-auto shadow-inner",
                                isRefund ? "text-rose-500" : "text-emerald-400"
                              )}>
                                {isRefund ? "-" : "+"}{formatAmount(amount)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-1">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[8px] font-black uppercase italic tracking-widest px-3 py-0.5 rounded-full border",
                                isRefund 
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : activity.type === 'bundle'
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              )}
                            >
                              {activity.type === 'bundle' ? 'Call Stack' : activity.type}
                            </Badge>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {new Date(activity.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {stats.recentActivity.length === 0 && (
                    <div className="text-center py-20 space-y-4 bg-white/[0.01] border border-white/5 rounded-[2.5rem] border-dashed">
                      <Activity className="h-12 w-12 mx-auto text-slate-600 animate-pulse" />
                      <p className="text-xs font-black uppercase italic tracking-widest text-slate-500">No recent activity detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
