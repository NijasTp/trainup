import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Star,
  Target,
  Activity
} from "lucide-react";
import API from "@/lib/axios";
import { toast } from "sonner";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

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
}

export default function TrainerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "TrainUp - Dashboard";
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.get("/trainer/dashboard");
      setStats(response.data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <TrainerSiteHeader />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-accent rounded-full animate-pulse"></div>
          </div>
          <p className="text-muted-foreground font-medium text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
        <TrainerSiteHeader />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16 text-center space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Error</h3>
          <p className="text-muted-foreground text-lg">{error}</p>
          <button
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 rounded-lg text-white"
            onClick={fetchDashboardStats}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const growthPercentage = calculateGrowthPercentage(stats.totalEarningsThisMonth, stats.totalEarningsLastMonth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <TrainerSiteHeader />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <main className="relative container mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back! Here's your training business overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalClients}</p>
                  <p className="text-xs text-green-600">+{stats.newClientsThisMonth} this month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month Earnings</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatAmount(stats.totalEarningsThisMonth)}
                  </p>
                  <p className={`text-xs ${Number(growthPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(growthPercentage) >= 0 ? '+' : ''}{growthPercentage}% vs last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Out of 5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
          {/* Monthly Earnings Chart */}
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Earnings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyEarnings}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [formatAmount(Number(value)), 'Earnings']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Client Growth Chart */}
          {/* <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Client Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {stats.monthlyEarnings.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyEarnings}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        formatter={(value) => [value, 'New Clients']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="clients" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-lg">No client growth data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}
        {/* </div> */}

        {/* Plan Distribution and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Plan Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.planDistribution.map((plan) => {
                  const percentage = stats.totalClients > 0 
                    ? ((plan.count / stats.totalClients) * 100).toFixed(1)
                    : '0';
                  
                  const planColor = {
                    basic: 'bg-blue-500',
                    premium: 'bg-amber-500',
                    pro: 'bg-purple-500'
                  }[plan.plan] || 'bg-gray-500';

                  return (
                    <div key={plan.plan} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{plan.plan} Plan</span>
                        <span className="text-muted-foreground">
                          {plan.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <div
                          className={`${planColor} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-background/30">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'subscription' ? 'bg-green-500/10' :
                      activity.type === 'session' ? 'bg-blue-500/10' :
                      activity.type === 'rating' ? 'bg-amber-500/10' :
                      'bg-gray-500/10'
                    }`}>
                      {activity.type === 'subscription' && <DollarSign className="h-4 w-4 text-green-600" />}
                      {activity.type === 'session' && <Calendar className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'rating' && <Star className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity to display
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}