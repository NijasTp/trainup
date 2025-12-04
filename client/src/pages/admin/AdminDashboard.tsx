import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Building2, DollarSign, Activity, TrendingUp } from "lucide-react"
import { getDashboardStats } from "@/services/adminService"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

const StatCard = ({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: any
  change: string
  changeType: "positive" | "negative" | "neutral"
}) => (
  <Card className="bg-[#111827] border border-[#4B8B9B]/30">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {/* <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-400"
                : changeType === "negative"
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {change}
          </p> */}
        </div>
        <div className="h-12 w-12 bg-[#4B8B9B]/20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#4B8B9B]" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-white">Failed to load dashboard data.</div>
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers?.toString() || "0",
      icon: Users,
      change: "+12% from last month",
      changeType: "positive" as const,
    },
    {
      title: "Total Trainers",
      value: stats?.totalTrainers?.toString() || "0",
      icon: UserCheck,
      change: "+8% from last month",
      changeType: "positive" as const,
    },
    {
      title: "Total Gyms",
      value: stats?.totalGyms?.toString() || "0",
      icon: Building2,
      change: "+3 new this month",
      changeType: "positive" as const,
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      change: "+15% from last month",
      changeType: "positive" as const,
    },
  ]

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with TrainUp today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth Chart */}
          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                User Growth (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.userGrowth || []}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4B8B9B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4B8B9B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "none", color: "#fff" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#4B8B9B"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Trainer Growth Chart */}
          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                Trainer Growth (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.trainerGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1F2937", border: "none", color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="mr-2 h-5 w-5 text-[#4B8B9B]" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTransactions?.map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {transaction.userId?.name || "Unknown User"} paid{" "}
                      {transaction.trainerId?.name || "Unknown Trainer"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">
                      +₹{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
              {stats?.recentTransactions?.length === 0 && (
                <p className="text-gray-400 text-center py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
