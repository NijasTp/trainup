import React, { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Users, UserCheck, DollarSign, Activity, TrendingUp, BarChart3, Star, MoreVertical } from "lucide-react"
import { getDashboardStats, getDashboardGraphData, getTrainers, getTrainerReviews } from "@/services/adminService"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"
import Badge from "@/components/admin/ui/Badge"
import { Dropdown, DropdownItem } from "@/components/admin/ui/Dropdown"

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend,
  trendType = "neutral"
}: {
  title: string
  value: string
  icon: any
  color?: "primary" | "success" | "error" | "warning"
  trend?: string
  trendType?: "positive" | "negative" | "neutral"
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color === "primary" ? "bg-brand-50 dark:bg-brand-500/10" :
        color === "success" ? "bg-success-50 dark:bg-success-500/10" :
          color === "warning" ? "bg-warning-50 dark:bg-warning-500/10" :
            "bg-gray-100 dark:bg-gray-800"
      }`}>
      <Icon className={`h-6 w-6 ${color === "primary" ? "text-brand-500" :
          color === "success" ? "text-success-500" :
            color === "warning" ? "text-warning-500" :
              "text-gray-500"
        }`} />
    </div>

    <div className="flex items-end justify-between mt-5">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
      </div>
      {trend && (
        <Badge color={trendType === "positive" ? "success" : trendType === "negative" ? "error" : "light"}>
          {trend}
        </Badge>
      )}
    </div>
  </div>
)

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [revenueFilter, setRevenueFilter] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [revenueData, setRevenueData] = useState<any[]>([])

  const [userFilter, setUserFilter] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [userData, setUserData] = useState<any[]>([])

  const [trainerFilter, setTrainerFilter] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [trainerData, setTrainerData] = useState<any[]>([])

  // Trainer Dropdown State
  const [trainers, setTrainers] = useState<any[]>([])
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null)
  const [isTrainerDropdownOpen, setIsTrainerDropdownOpen] = useState(false)
  const [trainerReviews, setTrainerReviews] = useState<any[]>([])

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

    const fetchTrainerList = async () => {
      try {
        const data = await getTrainers(1, 10)
        setTrainers(data.trainers || [])
        if (data.trainers?.length > 0) {
          // setSelectedTrainer(data.trainers[0])
        }
      } catch (error) {
        console.error("Failed to fetch trainers", error)
      }
    }

    fetchStats()
    fetchTrainerList()
  }, [])

  useEffect(() => {
    if (selectedTrainer) {
      const fetchReviews = async () => {
        try {
          const data = await getTrainerReviews(selectedTrainer._id)
          setTrainerReviews(data.reviews || [])
        } catch (error) {
          console.error("Failed to fetch reviews", error)
        }
      }
      fetchReviews()
    }
  }, [selectedTrainer])

  // Fetch Revenue Data
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const data = await getDashboardGraphData(revenueFilter, 'revenue')
        setRevenueData(data)
      } catch (error) {
        console.error("Failed to fetch revenue data", error)
      }
    }
    fetchRevenue()
  }, [revenueFilter])

  // Fetch User Data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getDashboardGraphData(userFilter, 'users')
        setUserData(data)
      } catch (error) {
        console.error("Failed to fetch user data", error)
      }
    }
    fetchUsers()
  }, [userFilter])

  // Fetch Trainer Data
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await getDashboardGraphData(trainerFilter, 'trainers')
        setTrainerData(data)
      } catch (error) {
        console.error("Failed to fetch trainer data", error)
      }
    }
    fetchTrainers()
  }, [trainerFilter])

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-full">
          <div className="text-gray-500 animate-pulse">Loading dashboard...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">Dashboard Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers?.toString() || "0"}
            icon={Users}
            color="primary"
            trend="+12%"
            trendType="positive"
          />
          <StatCard
            title="Total Trainers"
            value={stats?.totalTrainers?.toString() || "0"}
            icon={UserCheck}
            color="success"
            trend="+8%"
            trendType="positive"
          />
          <StatCard
            title="Total Profit"
            value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            color="warning"
            trend="+15%"
            trendType="positive"
          />
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Revenue Chart */}
          <div className="col-span-12 xl:col-span-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Platform Earnings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Revenue analytics over time</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['day', 'week', 'month', 'year'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRevenueFilter(filter)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${revenueFilter === filter
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B8B9B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4B8B9B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                    itemStyle={{ color: "#4B8B9B" }}
                    formatter={(value: any) => [`₹${value}`, "Profit"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#4B8B9B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Growth */}
          <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">User Growth</h3>
              <TrendingUp className="h-5 w-5 text-brand-500" />
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(70, 95, 255, 0.05)' }}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#4B8B9B" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Users</span>
                <span className="font-bold text-gray-800 dark:text-white">{stats?.totalUsers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Trainer Dropdown & Reviews Section */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Trainer Insights</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select a trainer to view reviews</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setIsTrainerDropdownOpen(!isTrainerDropdownOpen)}
                  className="dropdown-toggle flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {selectedTrainer ? selectedTrainer.name : "Select Trainer"}
                  <MoreVertical className="h-4 w-4" />
                </button>
                <Dropdown
                  isOpen={isTrainerDropdownOpen}
                  onClose={() => setIsTrainerDropdownOpen(false)}
                  className="w-56 mt-2"
                >
                  {trainers.map((trainer) => (
                    <DropdownItem
                      key={trainer._id}
                      onItemClick={() => {
                        setSelectedTrainer(trainer)
                        setIsTrainerDropdownOpen(false)
                      }}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {trainer.name}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedTrainer ? (
                trainerReviews.length > 0 ? (
                  trainerReviews.map((review: any, index: number) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">
                            {review.userId?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{review.userId?.name || "Anonymous"}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                    <Activity className="h-8 w-8 mb-2 opacity-20" />
                    <p>No reviews found for this trainer</p>
                  </div>
                )
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                  <UserCheck className="h-8 w-8 mb-2 opacity-20" />
                  <p>Select a trainer to see their performance and reviews</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Recent Transactions</h3>
              <Link to="/admin/transactions" className="text-xs font-medium text-brand-500 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {stats?.recentTransactions?.slice(0, 5).map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-500">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {transaction.userId?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success-500">+₹{transaction.amount}</p>
                    <Badge size="sm" color={transaction.status === "completed" ? "success" : "warning"}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {!stats?.recentTransactions?.length && (
                <div className="text-center py-10 text-gray-400">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
