import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    Target,
    Activity,
    Loader2,
    Ban,
    Shield,
    Dumbbell,
    CheckCircle,
    XCircle,
    Lock,
    Globe,
    Zap,
    Scale,
    Ruler,
    Clock,
    UserCircle,
    Users,
    ShieldAlert,
    ChevronRight,
    Sparkles,
    Medal
} from "lucide-react"
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
import { motion, AnimatePresence } from "framer-motion"
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

    const handleBanToggle = async (id: string, currentBanStatus: boolean) => {
        if (!isConfirmOpen) {
            setIsConfirmOpen(true)
            return
        }

        setActionLoading(true)
        try {
            const updatedUser = await toggleUserBan(id, !currentBanStatus)
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
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                        />
                    </div>
                    <p className="mt-6 text-white/50 font-medium animate-pulse tracking-widest uppercase text-xs">Synchronizing Profile Data...</p>
                </div>
            </AdminLayout>
        )
    }

    if (error || !user) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-6">
                    <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-white text-xl font-bold">{error || "User Not Found"}</p>
                        <p className="text-white/40 mt-2">The requested operative could not be located in the database.</p>
                    </div>
                    <Button
                        onClick={() => navigate("/admin/users")}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl px-8"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Return to Archives
                    </Button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 md:p-10 max-w-7xl mx-auto space-y-10"
            >
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/admin/users")}
                        className="text-white/40 hover:text-white hover:bg-white/5 rounded-2xl h-12 px-6 transition-all group"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to User Collective
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Live Terminal Access</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Command Card */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-xl relative group"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-colors duration-500" />

                            <div className="h-40 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{ duration: 10, repeat: Infinity }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <Sparkles className="w-64 h-64 text-primary/10" />
                                </motion.div>

                                <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-125 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <Avatar className="h-32 w-32 border-[6px] border-[#0a0a0b] shadow-2xl relative">
                                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=4B8B9B&color=fff&size=256`} />
                                            <AvatarFallback className="bg-white/10 text-white text-3xl font-black italic">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Status Glow Rings */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-2 border-2 border-dashed border-primary/20 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-20 pb-10 px-8 text-center space-y-8 relative">
                                <div>
                                    <h2 className="text-3xl font-black text-white italic tracking-tight">{user.name}</h2>
                                    <p className="text-white/40 text-sm mt-1 font-medium">{user.email}</p>
                                    <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                        {user.role}
                                    </div>
                                </div>

                                <div className="flex justify-center gap-3 flex-wrap">
                                    <AnimatePresence>
                                        {user.isVerified ? (
                                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                                <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2 hover:bg-green-500/20 transition-colors">
                                                    <CheckCircle className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider text-green-400/80">AUTHENTICATED</span>
                                                </Badge>
                                            </motion.div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                                <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2 hover:bg-orange-500/20 transition-colors">
                                                    <Shield className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/80">NOVICE</span>
                                                </Badge>
                                            </motion.div>
                                        )}

                                        {user.isPrivate ? (
                                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                                <Badge className="bg-white/5 text-white/50 border border-white/10 px-4 py-1.5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
                                                    <Lock className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">STEALTH</span>
                                                </Badge>
                                            </motion.div>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                                                <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-xl flex items-center gap-2 hover:bg-blue-500/20 transition-colors">
                                                    <Globe className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400/80">OVERT</span>
                                                </Badge>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <Button
                                        onClick={() => handleBanToggle(user._id, user.isBanned)}
                                        disabled={actionLoading}
                                        className={`w-full font-black italic rounded-[1.5rem] h-14 shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden group ${user.isBanned
                                            ? "bg-green-600 hover:bg-green-500 text-black shadow-[0_10px_30px_rgba(22,163,74,0.3)]"
                                            : "bg-red-600 hover:bg-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all rounded-full duration-500 blur-2xl" />
                                        {actionLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin relative" />
                                        ) : user.isBanned ? (
                                            <CheckCircle className="h-5 w-5 relative" />
                                        ) : (
                                            <Ban className="h-5 w-5 relative" />
                                        )}
                                        <span className="relative uppercase tracking-widest">{user.isBanned ? "Revoke Suspension" : "Execute Lockdown"}</span>
                                    </Button>

                                    <AnimatePresence>
                                        {user.isBanned && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3"
                                            >
                                                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
                                                <p className="text-red-400 text-xs font-bold uppercase tracking-wider leading-relaxed text-left">
                                                    PROTOCOL VIOLATION: Operative access restricted by high command.
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Calendar, label: "Inducted", value: new Date(user.createdAt).toLocaleDateString(), color: "primary" },
                                { icon: Zap, label: "Engagement", value: user.activityLevel || "Inactive", color: "primary" }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * (idx + 1) }}
                                    className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:bg-white/[0.08] transition-all"
                                >
                                    <stat.icon className="h-6 w-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</span>
                                    <span className="text-sm font-bold text-white tracking-tight">{stat.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Detailed Intelligence */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Section Header Macro */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Intelligence */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md"
                            >
                                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-xl">
                                            <UserCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-black italic text-white uppercase tracking-wider">Identity</h3>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-white/20" />
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Communication Hub</label>
                                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl group-hover:bg-white/[0.08] transition-all">
                                                <Phone className="h-4 w-4 text-primary opacity-50" />
                                                <span className="text-white font-bold">{user.phone || "UNPUBLISHED"}</span>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">Network Address</label>
                                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl group-hover:bg-white/[0.08] transition-all">
                                                <Mail className="h-4 w-4 text-primary opacity-50" />
                                                <span className="text-white font-bold truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 block">Assigned Gender</label>
                                            <span className="text-white font-bold uppercase tracking-tight">{user.gender || "NA"}</span>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 block">Biological Cycle</label>
                                            <span className="text-white font-bold">{user.age ? `${user.age} CYCLES` : "NA"}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Biometric Data */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md"
                            >
                                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-xl">
                                            <Activity className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-black italic text-white uppercase tracking-wider">Metrics</h3>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-white/20" />
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Ruler className="h-4 w-4 text-primary opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Elevation</span>
                                            </div>
                                            <span className="text-white font-black italic">{user.height ? `${user.height} CM` : "NA"}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Scale className="h-4 w-4 text-primary opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Mass</span>
                                            </div>
                                            <span className="text-white font-black italic">
                                                {user.weightHistory && user.weightHistory.length > 0
                                                    ? `${user.weightHistory[user.weightHistory.length - 1].weight} KG`
                                                    : "NA"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-4 w-4 text-primary opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Update</span>
                                            </div>
                                            <span className="text-white font-black italic text-[10px] uppercase tracking-wider">Synchronized</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Operational Objectives */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md relative"
                        >
                            <div className="absolute top-0 right-0 p-8 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all">
                                <Medal className="w-16 h-16 text-primary" />
                            </div>

                            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Target className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black italic text-white uppercase tracking-wider">Operational Objectives</h3>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6 block">Target Decryption</label>
                                    <div className="flex flex-wrap gap-3">
                                        {user.goals && user.goals.length > 0 ? (
                                            user.goals.map((goal, index) => (
                                                <motion.div
                                                    key={index}
                                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(var(--primary), 0.2)' }}
                                                    className="bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-default transition-all shadow-lg shadow-black/20"
                                                >
                                                    {goal}
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="bg-white/5 text-white/20 border border-white/10 px-6 py-4 rounded-3xl w-full text-center italic text-sm font-medium">
                                                No specific operational targets identified in the current dossier.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] group hover:bg-white/[0.08] transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Dumbbell className={`h-6 w-6 ${user.equipment ? "text-primary" : "text-white/20"}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Arsenal Readiness</p>
                                            <p className={`text-sm font-bold tracking-tight ${user.equipment ? "text-white" : "text-white/40"}`}>
                                                {user.equipment ? "Full Arsenal Access Authorized" : "Restricted Equipment Clearance"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`h-2.5 w-2.5 rounded-full ${user.equipment ? "bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-white/10"}`} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Hierarchical Associations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md"
                        >
                            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black italic text-white uppercase tracking-wider">Affiliations</h3>
                                </div>
                            </div>
                            <div className="p-8">
                                {user.assignedTrainer ? (
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <Avatar className="h-16 w-16 border-2 border-primary/20 p-1 relative">
                                                    <AvatarFallback className="bg-white/10 text-white font-black italic">
                                                        {user.assignedTrainer.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Assigned Architect</p>
                                                <p className="text-xl font-black italic text-white group-hover:text-primary transition-colors">{user.assignedTrainer}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl group-hover:bg-primary group-hover:text-black transition-all">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <User className="h-10 w-10 text-white/5 mx-auto mb-4" />
                                        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No Strategic Guidance Assigned</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Premium Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="bg-[#0a0a0b] border-white/10 text-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-lg border-2">
                    <DialogHeader className="space-y-6">
                        <div className="flex justify-center">
                            <div className={`p-6 rounded-full border-2 ${user.isBanned ? 'bg-green-500/10 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]'}`}>
                                {user.isBanned ? (
                                    <CheckCircle className="h-12 w-12 text-green-500" />
                                ) : (
                                    <Ban className="h-12 w-12 text-red-500" />
                                )}
                            </div>
                        </div>
                        <DialogTitle className="text-3xl font-black italic text-center tracking-tight uppercase">
                            Confirm <span className={user.isBanned ? 'text-green-500' : 'text-red-500'}>{user.isBanned ? 'Restoration' : 'Lockdown'}</span>
                        </DialogTitle>
                        <DialogDescription className="text-white/50 text-center text-base font-medium leading-relaxed px-4">
                            Are you certain you want to {user.isBanned ? (
                                <span className="text-white font-bold underline decoration-green-500/50 underline-offset-4">restore unrestricted access</span>
                            ) : (
                                <span className="text-white font-bold underline decoration-red-500/50 underline-offset-4">suspend all active protocols</span>
                            )} for operative <strong className="text-white tracking-widest uppercase italic bg-white/5 px-2 py-0.5 rounded-lg">{user.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            className="flex-1 text-white/40 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white rounded-2xl h-14 font-black uppercase tracking-widest transition-all"
                        >
                            Abort
                        </Button>
                        <Button
                            onClick={() => handleBanToggle(user._id, user.isBanned)}
                            disabled={actionLoading}
                            className={`flex-[2] font-black italic rounded-2xl h-14 shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest ${user.isBanned
                                ? "bg-green-600 hover:bg-green-500 text-black shadow-[0_10px_30px_rgba(22,163,74,0.3)]"
                                : "bg-red-600 hover:bg-red-500 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                                }`}
                        >
                            {actionLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                                <>Confirm Resolution</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}

export default IndividualUser
