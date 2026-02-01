import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Users, UserCheck, DollarSign, ListIcon } from "lucide-react"
import { getDashboardStats, getDashboardGraphData, getTrainers, getTrainerReviews } from "@/services/adminService"
import StatCard from "@/components/admin/StatCard"
import PlatformEarnings from "@/components/admin/dashboard/PlatformEarnings"
import UserGrowth from "@/components/admin/dashboard/UserGrowth"
import TrainerInsights from "@/components/admin/dashboard/TrainerInsights"
import DashboardTransactions from "@/components/admin/dashboard/DashboardTransactions"

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
        <div className="p-8 flex items-center justify-center h-full min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium animate-pulse">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Platform status and performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || "0"}
            icon={Users}
            trend="+12.5%"
            trendType="positive"
          />
          <StatCard
            title="Active Trainers"
            value={stats?.totalTrainers?.toLocaleString() || "0"}
            icon={UserCheck}
            trend="+8.2%"
            trendType="positive"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            trend="+15.4%"
            trendType="positive"
          />
          <StatCard
            title="Templates"
            value={stats?.totalTemplates?.toLocaleString() || "0"}
            icon={ListIcon}
            trend="Stable"
            trendType="neutral"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-12 xl:col-span-7">
            <PlatformEarnings
              data={revenueData}
              filter={revenueFilter}
              setFilter={setRevenueFilter}
            />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <UserGrowth
              data={userData}
              filter={userFilter}
              setFilter={setUserFilter}
            />
          </div>
        </div>

        {/* bottom Row */}
        <div className="grid grid-cols-12 gap-6">
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
