import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, Phone, Calendar, Target, Activity, Loader2, Ban, Shield, Dumbbell, CheckCircle, XCircle, Lock, Globe } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { getUserById, toggleUserBan } from "@/services/adminService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { IUser } from "@/interfaces/admin/IIndividualUser"

const IndividualUser = () => {
    const [user, setUser] = useState<IUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const { userId } = useParams<{ userId: string }>()
    const [actionLoading, setActionLoading] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    useEffect(() => {
        const fetchUserById = async () => {
            if (!userId) {
                setError("Invalid or missing user ID");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await getUserById(userId);
                setUser(res);
                console.log(res)
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
        if (!isConfirmOpen) {
            setIsConfirmOpen(true)
            return
        }

        setActionLoading(true)
        try {
            const updatedUser = await toggleUserBan(userId, !currentBanStatus)
            setUser(updatedUser)
            toast.success(`User ${user?.name} ${!currentBanStatus ? 'banned' : 'unbanned'} successfully`)
            setError(null)
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            console.error("Error updating user ban status:", error)
            toast.error(error.response?.data?.message || "Failed to update ban status.")
        } finally {
            setActionLoading(false)
            setIsConfirmOpen(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                    <Loader2 className="h-10 w-10 animate-spin text-[#4B8B9B]" />
                </div>
            </AdminLayout>
        )
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
                    <p className="text-red-400 text-lg">{error || "User not found"}</p>
                    <Button onClick={() => navigate("/admin/users")} variant="outline">Back to Users</Button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <>
            <AdminLayout>
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/users")}
                            className="text-gray-400 hover:text-white hover:bg-[#1F2937]"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Profile Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="bg-[#111827] border border-[#4B8B9B]/20 overflow-hidden shadow-lg">
                                <div className="h-32 bg-gradient-to-r from-[#1F2937] to-[#111827] relative">
                                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                                        <Avatar className="h-24 w-24 border-4 border-[#111827] shadow-xl">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=4B8B9B&color=fff`} />
                                            <AvatarFallback className="bg-[#4B8B9B] text-white text-xl">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                                <CardContent className="pt-16 pb-8 px-6 text-center space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                        <p className="text-gray-400 text-sm mt-1">{user.email}</p>
                                        <Badge variant="outline" className="mt-3 border-[#4B8B9B]/50 text-[#4B8B9B]">
                                            {user.role.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-center gap-2 flex-wrap">
                                        {user.isVerified ? (
                                            <Badge className="bg-green-900/40 text-green-400 hover:bg-green-900/60 border-0 flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Verified
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-yellow-900/40 text-yellow-400 hover:bg-yellow-900/60 border-0 flex items-center gap-1">
                                                <Shield className="h-3 w-3" /> Unverified
                                            </Badge>
                                        )}
                                        {user.isPrivate ? (
                                            <Badge className="bg-gray-800 text-gray-400 hover:bg-gray-700 border-0 flex items-center gap-1">
                                                <Lock className="h-3 w-3" /> Private
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 border-0 flex items-center gap-1">
                                                <Globe className="h-3 w-3" /> Public
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-gray-800">
                                        <Button
                                            onClick={() => handleBanToggle(user._id, user.isBanned)}
                                            disabled={actionLoading}
                                            className={`w-full font-semibold shadow-md transition-all duration-200 ${user.isBanned
                                                ? "bg-green-600 hover:bg-green-700 text-white"
                                                : "bg-red-600 hover:bg-red-700 text-white"
                                                }`}
                                        >
                                            {actionLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : user.isBanned ? (
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                            ) : (
                                                <Ban className="mr-2 h-4 w-4" />
                                            )}
                                            {user.isBanned ? "Unban User" : "Ban User"}
                                        </Button>
                                        {user.isBanned && (
                                            <p className="text-red-400 text-xs mt-3 font-medium flex items-center justify-center gap-1">
                                                <XCircle className="h-3 w-3" /> Account is currently suspended
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Stats Grid - Simplified */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-[#111827] border border-[#4B8B9B]/20">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <Calendar className="h-6 w-6 text-[#4B8B9B] mb-2" />
                                        <span className="text-xs text-gray-400">Joined</span>
                                        <span className="text-sm font-semibold text-white">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </CardContent>
                                </Card>
                                <Card className="bg-[#111827] border border-[#4B8B9B]/20">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <Activity className="h-6 w-6 text-[#4B8B9B] mb-2" />
                                        <span className="text-xs text-gray-400">Activity</span>
                                        <span className="text-sm font-semibold text-white capitalize">
                                            {user.activityLevel || "N/A"}
                                        </span>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Personal Information */}
                            <Card className="bg-[#111827] border border-[#4B8B9B]/20">
                                <CardHeader className="pb-3 border-b border-gray-800">
                                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                        <User className="h-5 w-5 text-[#4B8B9B]" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Phone</label>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Phone className="h-4 w-4 text-[#4B8B9B]" />
                                            {user.phone || "Not provided"}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</label>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Mail className="h-4 w-4 text-[#4B8B9B]" />
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gender</label>
                                        <div className="text-gray-300 capitalize">{user.gender || "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Age</label>
                                        <div className="text-gray-300">{user.age ? `${user.age} years` : "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Height</label>
                                        <div className="text-gray-300">{user.height ? `${user.height} cm` : "N/A"}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Current Weight</label>
                                        <div className="text-gray-300">
                                            {user.weightHistory && user.weightHistory.length > 0
                                                ? `${user.weightHistory[user.weightHistory.length - 1].weight} kg`
                                                : "N/A"}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Fitness Profile */}
                            <Card className="bg-[#111827] border border-[#4B8B9B]/20">
                                <CardHeader className="pb-3 border-b border-gray-800">
                                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                        <Target className="h-5 w-5 text-[#4B8B9B]" />
                                        Fitness Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-3">Goals</label>
                                        <div className="flex flex-wrap gap-2">
                                            {user.goals && user.goals.length > 0 ? (
                                                user.goals.map((goal, index) => (
                                                    <Badge key={index} variant="secondary" className="bg-[#4B8B9B]/10 text-[#4B8B9B] hover:bg-[#4B8B9B]/20 border-0 px-3 py-1">
                                                        {goal}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">No specific goals set</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-3">Equipment Access</label>
                                        <div className="flex items-center gap-2">
                                            <Dumbbell className={`h-5 w-5 ${user.equipment ? "text-[#4B8B9B]" : "text-gray-600"}`} />
                                            <span className={user.equipment ? "text-white" : "text-gray-400"}>
                                                {user.equipment ? "Has access to equipment" : "No equipment access"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Memberships & Associations */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Trainer Card */}
                                <Card className="bg-[#111827] border border-[#4B8B9B]/20 h-full">
                                    <CardHeader className="pb-3 border-b border-gray-800">
                                        <CardTitle className="text-base font-medium text-white flex items-center gap-2">
                                            <User className="h-4 w-4 text-[#4B8B9B]" />
                                            Assigned Trainer
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {user.assignedTrainer ? (
                                            <div className="flex items-start gap-4">
                                                <Avatar className="h-12 w-12 border border-gray-700">
                                                    <AvatarFallback className="bg-[#1F2937] text-gray-300">
                                                        {user.assignedTrainer.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-white font-medium">{user.assignedTrainer}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 text-sm">
                                                No trainer assigned
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>


                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>

            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="bg-[#111827] border-[#4B8B9B]/30 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold flex items-center">
                            {user.isBanned ? (
                                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                            ) : (
                                <Ban className="h-5 w-5 mr-2 text-red-500" />
                            )}
                            {user.isBanned ? 'Unban User' : 'Ban User'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Are you sure you want to {user.isBanned ? 'unban' : 'ban'} <strong>{user.name}</strong>?
                            {!user.isBanned && " This will restrict their access to the platform."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            className="text-gray-400 border-gray-600 hover:bg-gray-700/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={user.isBanned ? "default" : "destructive"}
                            onClick={() => handleBanToggle(user._id, user.isBanned)}
                            disabled={actionLoading}
                            className={user.isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>Confirm {user.isBanned ? 'Unban' : 'Ban'}</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default IndividualUser