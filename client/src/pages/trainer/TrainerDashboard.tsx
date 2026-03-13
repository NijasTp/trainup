import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  Target,
  Activity,
  ArrowUpRight,
  Plus,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import {
  LineChart,
  Line,
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
    } catch (err: unknown) {
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
      <div className="min-h-screen bg-[#050505] text-white">
        <TrainerSiteHeader />
        <div className="relative container mx-auto px-6 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-cyan-400/30 rounded-full animate-pulse"></div>
          </div>
          <p className="text-white/40 font-black uppercase italic tracking-widest text-sm">Synchronizing Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <TrainerSiteHeader />
        <div className="relative container mx-auto px-6 py-16 text-center space-y-6">
          <h3 className="text-4xl font-black italic uppercase tracking-tighter">System Error</h3>
          <p className="text-white/40 font-medium max-w-md mx-auto">{error}</p>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 uppercase font-black italic tracking-widest"
            onClick={fetchDashboardStats}
          >
            Reboot Interface
          </Button>
        </div>
      </div>
    );
  }

  const growthPercentage = calculateGrowthPercentage(stats.totalEarningsThisMonth, stats.totalEarningsLastMonth);

  // Calculate total plan count for percentage
  const totalPlanCount = stats.planDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <TrainerSiteHeader />
      
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative container mx-auto px-6 py-12 space-y-12 z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
             <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1 font-black italic uppercase tracking-widest text-[10px]">
              Business Core
            </Badge>
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Control <span className="text-cyan-500">Center</span>
            </h1>
            <p className="text-white/40 font-medium text-lg max-w-xl">
              Real-time analytics and performance metrics for your training empire.
            </p>
          </div>
          <div className="flex gap-4">
             <Button 
                onClick={() => navigate("/trainer/weekly-schedule")}
                className="h-14 px-8 bg-white text-black hover:bg-white/90 font-black uppercase italic tracking-widest transition-transform active:scale-95"
              >
                Schedule Session
              </Button>
          </div>
        </div>
        
        {/* Unassigned Users Notification */}
        {stats.unassignedClientsCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl group cursor-pointer hover:bg-amber-500/20 transition-all"
            onClick={() => navigate("/trainer/clients")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <ShieldAlert className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-widest text-amber-400">Assignment Pending</h3>
                <p className="text-xs text-amber-400/60 font-medium">You have {stats.unassignedClientsCount} client{stats.unassignedClientsCount > 1 ? 's' : ''} waiting for workout or diet plans.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-black uppercase italic tracking-widest text-xs">
              Action Required <ArrowUpRight className="h-4 w-4" />
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Users className="h-16 w-16" />
            </div>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-white/40 mb-1">Active Clients</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic">{stats.totalClients}</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-black italic italic tracking-tighter">
                      +{stats.newClientsThisMonth} NEW
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <DollarSign className="h-16 w-16" />
            </div>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-white/40 mb-1">Monthly Revenue</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic">{formatAmount(stats.totalEarningsThisMonth)}</span>
                  </div>
                   <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${Number(growthPercentage) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <ArrowUpRight className="h-3 w-3" />
                    {Number(growthPercentage) >= 0 ? '+' : ''}{growthPercentage}% vs Last Month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Star className="h-16 w-16" />
            </div>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Star className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-white/40 mb-1">Impact Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic">{stats.averageRating.toFixed(1)}</span>
                    <span className="text-white/20 font-black italic">/ 5.0</span>
                  </div>
                  <div className="flex gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className={`h-1 flex-1 rounded-full ${s <= Math.round(stats.averageRating) ? 'bg-amber-400' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Activity className="h-16 w-16" />
            </div>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-white/40 mb-1">Total Executions</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black italic">{stats.totalSessions}</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/20 mt-2 uppercase tracking-widest">Completed Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                Revenue Trajectory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyEarnings}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#06b6d4', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                      labelStyle={{ color: 'white', fontWeight: 700, marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#06b6d4" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorEarnings)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                Network Expansion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#06b6d4', fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                      labelStyle={{ color: 'white', fontWeight: 700, marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="clients" 
                      fill="#06b6d4" 
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lower Grid: Distribution and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan-400" />
                Plan Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-6">
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
                    <div key={plan.plan} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase italic tracking-widest text-white">{plan.plan} Tier</p>
                          <p className="text-[10px] text-white/40 font-bold">{plan.count} Deployment Units</p>
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter">{percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5">
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

          <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                Real-time Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                    <div className={`p-3 rounded-xl ${
                        activity.type === 'subscription' ? 'bg-green-500/10' :
                        activity.type === 'session' ? 'bg-blue-500/10' :
                        activity.type === 'rating' ? 'bg-amber-500/10' :
                        'bg-white/10'
                      }`}>
                      {activity.type === 'subscription' && <DollarSign className="h-4 w-4 text-green-400" />}
                      {activity.type === 'session' && <Calendar className="h-4 w-4 text-blue-400" />}
                      {activity.type === 'rating' && <Star className="h-4 w-4 text-amber-400" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{activity.message}</p>
                      <div className="flex items-center justify-between">
                         <Badge variant="outline" className="text-[9px] border-white/10 text-white/40 font-black uppercase italic tracking-tighter">
                          {activity.type}
                        </Badge>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">
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
                ))}
                {stats.recentActivity.length === 0 && (
                  <div className="text-center py-12 space-y-4 opacity-20">
                    <Activity className="h-12 w-12 mx-auto" />
                    <p className="text-xs font-black uppercase italic tracking-widest">No spectral activity detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}