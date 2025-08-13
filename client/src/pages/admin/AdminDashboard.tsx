import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, Building2, TrendingUp, Activity, Star, Calendar, DollarSign } from "lucide-react"

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  changeType,
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
          <p
            className={`text-xs ${
              changeType === "positive"
                ? "text-green-400"
                : changeType === "negative"
                  ? "text-red-400"
                  : "text-gray-400"
            }`}
          >
            {change}
          </p>
        </div>
        <div className="h-12 w-12 bg-[#4B8B9B]/20 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-[#4B8B9B]" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const AdminDashboard = () => {
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      icon: Users,
      change: "+12% from last month",
      changeType: "positive" as const,
    },
    {
      title: "Active Trainers",
      value: "156",
      icon: UserCheck,
      change: "+8% from last month",
      changeType: "positive" as const,
    },
    {
      title: "Registered Gyms",
      value: "43",
      icon: Building2,
      change: "+3 new this month",
      changeType: "positive" as const,
    },
    {
      title: "Monthly Revenue",
      value: "$24,580",
      icon: DollarSign,
      change: "+15% from last month",
      changeType: "positive" as const,
    },
  ]

  const recentActivities = [
    { action: "New user registration", user: "John Doe", time: "2 minutes ago" },
    { action: "Trainer application approved", user: "Sarah Wilson", time: "15 minutes ago" },
    { action: "Gym verification completed", user: "FitZone Gym", time: "1 hour ago" },
    { action: "User subscription upgraded", user: "Mike Johnson", time: "2 hours ago" },
    { action: "New trainer application", user: "Alex Brown", time: "3 hours ago" },
  ]

  const topTrainers = [
    { name: "Sarah Wilson", rating: 4.9, clients: 45, specialization: "Weight Training" },
    { name: "Mike Chen", rating: 4.8, clients: 38, specialization: "Yoga" },
    { name: "Emma Davis", rating: 4.7, clients: 42, specialization: "Cardio" },
    { name: "James Rodriguez", rating: 4.6, clients: 35, specialization: "CrossFit" },
  ]

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with TrainUp today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm text-white">{activity.action}</p>
                      <p className="text-xs text-gray-400">{activity.user}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Trainers */}
          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                Top Rated Trainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTrainers.map((trainer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{trainer.name}</p>
                      <p className="text-xs text-gray-400">{trainer.specialization}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span className="text-sm text-white">{trainer.rating}</span>
                      </div>
                      <p className="text-xs text-gray-400">{trainer.clients} clients</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                Growth Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">User Growth</span>
                  <span className="text-green-400">+12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Trainer Onboarding</span>
                  <span className="text-green-400">+8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gym Partnerships</span>
                  <span className="text-green-400">+15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Revenue Growth</span>
                  <span className="text-green-400">+18%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">New Registrations</span>
                  <span className="text-white">342</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Trainer Applications</span>
                  <span className="text-white">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gym Applications</span>
                  <span className="text-white">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Sessions</span>
                  <span className="text-white">1,247</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111827] border border-[#4B8B9B]/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Server Status</span>
                  <span className="text-green-400">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Database</span>
                  <span className="text-green-400">Healthy</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Response</span>
                  <span className="text-green-400">Fast</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-green-400">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
