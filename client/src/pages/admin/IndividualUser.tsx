import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, Phone, Calendar, Target, Activity, Award, MapPin, Loader2, Ban } from "lucide-react"
import {  useNavigate, useParams } from "react-router-dom"
import { getUserById, toggleUserBan } from "@/services/adminService"


interface IUser {
    _id: string
    name: string
    email: string
    phone?: string
    isVerified?: boolean
    role: "user"
    goals?: string[]
    activityLevel?: string
    equipment?: boolean
    assignedTrainer?: {
        _id: string
        name: string
        specialization: string
    } | null
    gymId?: {
        _id: string
        name: string
        location: string
    } | null
    isPrivate?: boolean
    isBanned: boolean
    streak?: number
    xp?: number
    achievements?: string[]
    workoutHistory?: Array<{
        date: string
        type: string
        duration: number
    }>
    createdAt: Date
    updatedAt: Date
}

const IndividualUser = () => {
    const [user, setUser] = useState<IUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { userId } = useParams<{ userId: string }>()

    useEffect(() => {
        console.log("useEffect triggered, userId:", userId);

        const fetchUserById = async () => {
            if (!userId) {
                console.log("No userId provided");
                setError("Invalid or missing user ID");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                console.log("Fetching user by ID:", userId);
                const res = await getUserById(userId);
                setUser(res);
                setError(null);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                console.error("Error fetching user:", error);
                setError(error.response?.data?.message || "Failed to load user");
            } finally {
                setLoading(false);
            }
        };

        fetchUserById();
    }, [userId]);

    const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
        try {
            const updatedUser = await toggleUserBan(userId, !currentBanStatus)
            setUser(updatedUser)
            setError(null)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            console.error("Error updating user ban status:", error)
            setError(error.response?.data?.message || "Failed to update ban status.")
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
                        <span className="ml-2 text-gray-400">Loading user details...</span>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <div className="p-8">
                    <div className="text-center py-12">
                        <p className="text-red-400 mb-4">{error || "User not found"}</p>
                        <Button onClick={() => navigate("/admin/users")}>Back to Users</Button>
                    </div>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="p-8">
                <div className="mb-8">
                    <Button variant="outline" onClick={() => navigate("/admin/users")} className="mb-4 flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Users
                    </Button>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                        <User className="mr-3 h-8 w-8 text-[#4B8B9B]" />
                        {user.name}
                    </h1>
                    <p className="text-gray-400">User Details and Activity</p>
                    <Button
                        variant="default"
                        onClick={() => handleBanToggle(user._id, user.isBanned)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 ${user.isBanned ? "bg-green-900/30 hover:bg-green-900/50" : "bg-red-900/30 hover:bg-red-900/50"}`}
                    >
                        <Ban className="h-3 w-3" />
                        {user.isBanned ? "Unban" : "Ban"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-[#4B8B9B]" />
                                        <div>
                                            <p className="text-sm text-gray-400">Email</p>
                                            <p className="text-white">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-[#4B8B9B]" />
                                        <div>
                                            <p className="text-sm text-gray-400">Phone</p>
                                            <p className="text-white">{user.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-[#4B8B9B]" />
                                        <div>
                                            <p className="text-sm text-gray-400">Joined</p>
                                            <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-[#4B8B9B]" />
                                        <div>
                                            <p className="text-sm text-gray-400">Activity Level</p>
                                            <p className="text-white">{user.activityLevel || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Fitness Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.goals?.map((goal, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4B8B9B]/20 text-[#4B8B9B]"
                                        >
                                            <Target className="h-3 w-3 mr-1" />
                                            {goal}
                                        </span>
                                    )) || <p className="text-gray-400">No goals set</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Recent Workouts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {user.workoutHistory && user.workoutHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.workoutHistory.map((workout, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-[#1F2A44]/30 rounded-lg">
                                                <div>
                                                    <p className="text-white font-medium">{workout.type}</p>
                                                    <p className="text-sm text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[#4B8B9B] font-medium">{workout.duration} min</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No workout history available</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Verification</span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isVerified ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"}`}
                                    >
                                        {user.isVerified ? "Verified" : "Unverified"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Account Status</span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isBanned ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"}`}
                                    >
                                        {user.isBanned ? "Banned" : "Active"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Profile</span>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isPrivate ? "bg-gray-900/30 text-gray-400" : "bg-blue-900/30 text-blue-400"}`}
                                    >
                                        {user.isPrivate ? "Private" : "Public"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                            <CardHeader>
                                <CardTitle className="text-white">Progress Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#4B8B9B]">{user.streak || 0}</div>
                                    <p className="text-sm text-gray-400">Day Streak</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#4B8B9B]">{user.xp || 0}</div>
                                    <p className="text-sm text-gray-400">Experience Points</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-[#4B8B9B]">{user.achievements?.length || 0}</div>
                                    <p className="text-sm text-gray-400">Achievements</p>
                                </div>
                            </CardContent>
                        </Card>

                        {user.assignedTrainer && (
                            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                                <CardHeader>
                                    <CardTitle className="text-white">Assigned Trainer</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <p className="text-white font-medium">{user.assignedTrainer.name}</p>
                                        <p className="text-sm text-gray-400">{user.assignedTrainer.specialization}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {user.gymId && (
                            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                                <CardHeader>
                                    <CardTitle className="text-white">Gym Membership</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-[#4B8B9B]" />
                                        <div>
                                            <p className="text-white font-medium">{user.gymId.name}</p>
                                            <p className="text-sm text-gray-400">{user.gymId.location}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {user.achievements && user.achievements.length > 0 && (
                            <Card className="bg-[#111827] border border-[#4B8B9B]/30">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center">
                                        <Award className="mr-2 h-5 w-5 text-[#4B8B9B]" />
                                        Achievements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {user.achievements.map((achievement, index) => (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-[#1F2A44]/30 rounded">
                                                <Award className="h-4 w-4 text-yellow-400" />
                                                <span className="text-white text-sm">{achievement}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default IndividualUser