"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import {
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Dumbbell,
  Clock,
  Plus,
  Star,
  Activity,
  Calendar,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { SiteHeader } from "@/components/user/home/UserSiteHeader"

// Mock data - replace with real API calls
const mockUser = {
  name: "Alex Johnson",
  currentWeight: 75.2,
  goalWeight: 70,
  totalXP: 2450,
  level: 12,
  xpToNextLevel: 150,
}

const mockWeightData = [
  { date: "2024-01-15", weight: 78.5, goal: 70 },
  { date: "2024-01-20", weight: 77.8, goal: 70 },
  { date: "2024-01-25", weight: 77.2, goal: 70 },
  { date: "2024-01-30", weight: 76.5, goal: 70 },
  { date: "2024-02-05", weight: 76.1, goal: 70 },
  { date: "2024-02-10", weight: 75.8, goal: 70 },
  { date: "2024-02-15", weight: 75.2, goal: 70 },
]

const mockXPLogs = [
  { date: "2024-02-15", activity: "Completed Full Body Workout", xp: 50, type: "workout" },
  { date: "2024-02-14", activity: "Logged Daily Meals", xp: 20, type: "nutrition" },
  { date: "2024-02-14", activity: "Morning Cardio Session", xp: 30, type: "workout" },
  { date: "2024-02-13", activity: "Hit Weekly Goal", xp: 100, type: "achievement" },
  { date: "2024-02-12", activity: "Strength Training", xp: 40, type: "workout" },
  { date: "2024-02-11", activity: "Meal Prep Sunday", xp: 25, type: "nutrition" },
  { date: "2024-02-10", activity: "Rest Day Recovery", xp: 15, type: "recovery" },
]

const mockRecentWorkouts = [
  {
    id: "1",
    name: "Upper Body Strength",
    date: "2024-02-15",
    duration: 45,
    exercises: 8,
    completed: true,
    xpEarned: 50,
  },
  {
    id: "2",
    name: "HIIT Cardio",
    date: "2024-02-14",
    duration: 30,
    exercises: 6,
    completed: true,
    xpEarned: 35,
  },
  {
    id: "3",
    name: "Lower Body Power",
    date: "2024-02-13",
    duration: 50,
    exercises: 10,
    completed: true,
    xpEarned: 60,
  },
  {
    id: "4",
    name: "Core & Flexibility",
    date: "2024-02-12",
    duration: 25,
    exercises: 5,
    completed: false,
    xpEarned: 0,
  },
]

export default function UserDashboard() {
  const [user, setUser] = useState(mockUser)
  const [weightData, setWeightData] = useState(mockWeightData)
  const [xpLogs, setXpLogs] = useState(mockXPLogs)
  const [recentWorkouts, setRecentWorkouts] = useState(mockRecentWorkouts)
  const [newWeight, setNewWeight] = useState("")
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false)

  const handleAddWeight = () => {
    if (!newWeight || isNaN(Number(newWeight))) {
      toast.error("Please enter a valid weight")
      return
    }

    const today = format(new Date(), "yyyy-MM-dd")
    const weightEntry = {
      date: today,
      weight: Number(newWeight),
      goal: user.goalWeight,
    }

    setWeightData((prev) => [weightEntry, ...prev.slice(0, 6)])
    setUser((prev) => ({ ...prev, currentWeight: Number(newWeight) }))

    const xpEntry = {
      date: today,
      activity: "Logged Daily Weight",
      xp: 10,
      type: "tracking" as const,
    }
    setXpLogs((prev) => [xpEntry, ...prev.slice(0, 6)])
    setUser((prev) => ({ ...prev, totalXP: prev.totalXP + 10 }))

    toast.success("Weight logged successfully! +10 XP")
    setNewWeight("")
    setIsAddWeightOpen(false)
  }

  const weightProgress =
    user.goalWeight > user.currentWeight
      ? (user.currentWeight / user.goalWeight) * 100
      : ((user.goalWeight * 2 - user.currentWeight) / user.goalWeight) * 100

  const levelProgress = ((user.totalXP % 200) / 200) * 100

  const getXPTypeColor = (type: string) => {
    switch (type) {
      case "workout":
        return "text-blue-600 bg-blue-100"
      case "nutrition":
        return "text-green-600 bg-green-100"
      case "achievement":
        return "text-purple-600 bg-purple-100"
      case "recovery":
        return "text-orange-600 bg-orange-100"
      case "tracking":
        return "text-teal-600 bg-teal-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getXPTypeIcon = (type: string) => {
    switch (type) {
      case "workout":
        return <Dumbbell className="h-3 w-3" />
      case "nutrition":
        return <Target className="h-3 w-3" />
      case "achievement":
        return <Award className="h-3 w-3" />
      case "recovery":
        return <Activity className="h-3 w-3" />
      case "tracking":
        return <Scale className="h-3 w-3" />
      default:
        return <Star className="h-3 w-3" />
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
        <SiteHeader/>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
            Fitness Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">Track your progress, level up, and achieve your goals</p>
        </div>

        {/* XP Stats Row */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Level & XP */}
          <Card className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-purple-500/10 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level & XP</CardTitle>
              <div className="relative">
                <Zap className="h-5 w-5 text-purple-600" />
                <div className="absolute inset-0 animate-pulse">
                  <Zap className="h-5 w-5 text-purple-300 opacity-40" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">Level {user.level}</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {user.totalXP} XP
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress to Level {user.level + 1}</span>
                    <span className="font-medium">{user.xpToNextLevel} XP to go</span>
                  </div>
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Weight */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
              <Scale className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">{user.currentWeight} kg</div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Goal: {user.goalWeight} kg</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {user.currentWeight > user.goalWeight ? (
                    <TrendingDown className="h-3 w-3 text-orange-500" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  <span className="text-muted-foreground">
                    {Math.abs(user.currentWeight - user.goalWeight).toFixed(1)} kg to goal
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Weight Button */}
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="flex items-center justify-center h-full">
              <Dialog open={isAddWeightOpen} onOpenChange={setIsAddWeightOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-16 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Today's Weight
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Today's Weight</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weight (kg)</label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Enter your weight"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleAddWeight} className="flex-1">
                        Log Weight (+10 XP)
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddWeightOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Weight vs Goal Chart */}
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weight Progress vs Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                weight: {
                  label: "Current Weight",
                  color: "hsl(var(--chart-1))",
                },
                goal: {
                  label: "Goal Weight",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value: string) => format(new Date(value), "MMM dd")} />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--color-weight)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="goal"
                    stroke="var(--color-goal)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* XP Logs */}
          <Card className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Recent XP Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {xpLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getXPTypeColor(log.type)}`}>{getXPTypeIcon(log.type)}</div>
                      <div>
                        <p className="font-medium text-sm">{log.activity}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(log.date), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-purple-600">+{log.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Workouts */}
          <Card className="bg-card/40 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{workout.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(workout.date), "MMM dd")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {workout.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {workout.exercises} exercises
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {workout.completed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 mb-1">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mb-1">
                            Pending
                          </Badge>
                        )}
                        {workout.xpEarned > 0 && (
                          <div className="text-sm font-bold text-purple-600">+{workout.xpEarned} XP</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
