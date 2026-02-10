import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Users, UserCheck, DollarSign, ListIcon, Loader2, Sparkles } from "lucide-react"
import { getDashboardStats, getDashboardGraphData, getTrainers, getTrainerReviews } from "@/services/adminService"
import StatCard from "@/components/admin/StatCard"
import PlatformEarnings from "@/components/admin/dashboard/PlatformEarnings"
import UserGrowth from "@/components/admin/dashboard/UserGrowth"
import TrainerInsights from "@/components/admin/dashboard/TrainerInsights"
import DashboardTransactions from "@/components/admin/dashboard/DashboardTransactions"
import { motion } from "framer-motion"

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [revenueFilter, setRevenueFilter] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [revenueData, setRevenueData] = useState<any[]>([])

  const [userFilter, setUserFilter] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [userData, setUserData] = useState<any[]>([])

  const [trainers, setTrainers] = useState<any[]>([])
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null)
  const [trainerReviews, setTrainerReviews] = useState<any[]>([])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const statsData = await getDashboardStats()
        setStats(statsData)

        const trainerData = await getTrainers(1, 10)
        const trainerList = trainerData.trainers || []
        setTrainers(trainerList)
        if (trainerList.length > 0) {
          setSelectedTrainer(trainerList[0])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedTrainer?._id) {
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-primary" size={60} />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white font-black italic text-xl tracking-widest animate-pulse">SYNCHRONIZING ANALYTICS</p>
            <p className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Preparing platform insights...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={16} />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase">Platform Overview</span>
            </div>
            <h1 className="text-4xl font-black text-white italic tracking-tight">ADMIN ANALYTICS</h1>
            <p className="text-zinc-500 font-medium">Real-time performance metrics and user growth tracking</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">Live System Status</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="TOTAL PLATFORM USERS"
            value={stats?.totalUsers?.toLocaleString() || "0"}
            icon={Users}
            trend="+12.5%"
            trendType="positive"
          />
          <StatCard
            title="CERTIFIED TRAINERS"
            value={stats?.totalTrainers?.toLocaleString() || "0"}
            icon={UserCheck}
            trend="+8.2%"
            trendType="positive"
          />
          <StatCard
            title="GROSS PLATFORM REVENUE"
            value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            trend="+15.4%"
            trendType="positive"
          />
          <StatCard
            title="SYSTEM TEMPLATES"
            value={stats?.totalTemplates?.toLocaleString() || "0"}
            icon={ListIcon}
            trend="OPTIMIZED"
            trendType="neutral"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-8">
            <PlatformEarnings
              data={revenueData}
              filter={revenueFilter}
              setFilter={setRevenueFilter}
            />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <UserGrowth
              data={userData}
              filter={userFilter}
              setFilter={setUserFilter}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 xl:col-span-4 lg:col-span-5">
            <TrainerInsights
              trainers={trainers}
              selectedTrainer={selectedTrainer?._id}
              setSelectedTrainer={(id) => setSelectedTrainer(trainers.find(t => t._id === id))}
              reviews={trainerReviews}
            />
          </div>
          <div className="col-span-12 xl:col-span-8 lg:col-span-7">
            <DashboardTransactions transactions={stats?.recentTransactions || []} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

