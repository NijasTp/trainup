import React, { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Users, UserCheck, DollarSign, Activity, TrendingUp, BarChart3, Star, MoreVertical, ChevronDownIcon } from "lucide-react"
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
import { Link } from "react-router-dom"

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
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm">
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800`}>
      <Icon className={`h-6 w-6 ${color === "primary" ? "text-brand-500" :
        color === "success" ? "text-success-500" :
          color === "warning" ? "text-warning-500" :
            "text-gray-500"
        }`} />
    </div>

    <div className="flex items-end justify-between mt-5">
      <div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className="mt-2 text-xl font-bold text-gray-800 dark:text-white/90">{value}</h4>
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
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Header Section */}
        <div className="col-span-12 mb-2">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white/90">Dashboard Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Efficiently manage users, trainers, and platform growth.</p>
        </div>

        {/* Stats Section - Col Spans 12 total */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers?.toLocaleString() || "0"}
              icon={Users}
              color="primary"
              trend="+12%"
              trendType="positive"
            />
            <StatCard
              title="Total Trainers"
              value={stats?.totalTrainers?.toLocaleString() || "0"}
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

          {/* Revenue Chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm">
            <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Platform Earnings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revenue analytics over time</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                {(['day', 'week', 'month', 'year'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setRevenueFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${revenueFilter === filter
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B8B9B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4B8B9B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tick={{ dy: 10 }} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} tick={{ dx: -10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ color: "#4B8B9B", fontWeight: "600" }}
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
        </div>

        {/* Right Column - User Growth etc */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 h-full flex flex-col transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">User Growth</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Registration trends</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                {(['day', 'week', 'month', 'year'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setUserFilter(filter)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${userFilter === filter
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    {filter.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4B8B9B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#4B8B9B" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} strokeOpacity={0.5} />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} tick={{ dy: 5 }} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} tick={{ dx: -5 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(75, 139, 155, 0.05)' }}
                    contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #e5e7eb", borderRadius: "10px" }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Growth Ratio</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp className="h-4 w-4 text-brand-500" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">+{userData.length > 0 ? '14.5' : '0'}%</span>
                  </div>
                </div>
                <Badge size="sm" color="success">Increased</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Trainer Insights & Recent Transactions */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Trainer Insights</h3>
              <div className="relative">
                <button
                  onClick={() => setIsTrainerDropdownOpen(!isTrainerDropdownOpen)}
                  className="dropdown-toggle flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100"
                >
                  {selectedTrainer ? selectedTrainer.name : "Select Trainer"}
                  <ChevronDownIcon className={`h-3 w-3 transition-transform ${isTrainerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <Dropdown
                  isOpen={isTrainerDropdownOpen}
                  onClose={() => setIsTrainerDropdownOpen(false)}
                  className="w-48 mt-2 shadow-xl ring-1 ring-black/5"
                >
                  {trainers.map((trainer) => (
                    <DropdownItem
                      key={trainer._id}
                      onItemClick={() => {
                        setSelectedTrainer(trainer)
                        setIsTrainerDropdownOpen(false)
                      }}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800 last:border-0"
                    >
                      {trainer.name}
                    </DropdownItem>
                  ))}
                </Dropdown>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedTrainer ? (
                trainerReviews.length > 0 ? (
                  trainerReviews.map((review: any, index: number) => (
                    <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 transition-colors hover:border-brand-500/30">
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {review.userId?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-white">{review.userId?.name || "Anonymous"}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-1">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <Activity className="h-6 w-6 mb-2 opacity-30" />
                    <p className="text-xs font-medium">No reviews for this trainer</p>
                  </div>
                )
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                  <UserCheck className="h-7 w-7 mb-2 opacity-30" />
                  <p className="text-xs font-medium text-center px-4">Select a trainer to see their performance and reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all hover:shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Recent Transactions</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Summary of latest platform activity</p>
              </div>
              <Link to="/admin/transactions" className="text-xs font-bold text-brand-500 hover:text-brand-600 px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg transition-colors">View All History</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="pb-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {stats?.recentTransactions?.slice(0, 5).map((transaction: any, index: number) => (
                    <tr key={index} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-500 group-hover:scale-110 transition-transform">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">{transaction.userId?.name || "User"}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-medium text-gray-500">{new Date(transaction.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="py-4 text-sm font-black text-gray-800 dark:text-white text-right">₹{transaction.amount.toLocaleString()}</td>
                      <td className="py-4 text-center">
                        <Badge size="sm" color={transaction.status === "completed" ? "success" : "warning"}>
                          {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!stats?.recentTransactions?.length && (
                <div className="text-center py-12">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm text-gray-400">No recent transactions to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
