import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Bell,
    LogOut,
    Users,
    User,
    Calendar,
    Wallet,
    LayoutDashboard,
    Activity,
    Menu,
    X,
    Settings,
    ChevronDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import API from "@/lib/axios";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";

interface Notification {
    _id: string;
    title?: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function TrainerSiteHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const trainer = useSelector((state: RootState) => state.trainerAuth.trainer);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get<{ notifications: Notification[] }>("/notifications");
            const sorted = (data.notifications || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(sorted);
            setUnreadCount(sorted.filter(n => !n.read).length);
        } catch (err) {
            console.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await API.patch(`/notifications/${id}`, { read: true });
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, read: true } : n))
            );
            setUnreadCount(c => Math.max(0, c - 1));
        } catch {
            toast.error("Could not mark as read");
        }
    };

    const markAllRead = async () => {
        try {
            await API.patch("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark all as read");
        }
    };

    const handleLogout = async () => {
        try {
            await API.post("/trainer/logout");
            dispatch(logoutTrainer());
            toast.success("Logged out successfully");
            navigate("/trainer/login");
        } catch {
            toast.error("Logout failed");
        }
    };

    useEffect(() => {
        if (!trainer) return;
        fetchNotifications();
        const int = setInterval(() => {
            fetchNotifications();
        }, 30_000);
        return () => clearInterval(int);
    }, [trainer, fetchNotifications]);

    const navLinks = [
        { name: "Dashboard", path: "/trainer/dashboard", icon: LayoutDashboard },
        { name: "Clients", path: "/trainer/clients", icon: Users },
        { name: "Schedule", path: "/trainer/weekly-schedule", icon: Calendar },
        { name: "Blueprints", path: "/trainer/templates", icon: Activity },
    ];

    const trainerName = trainer?.name || "Trainer";
    const trainerAvatar = trainer?.profileImage;

    const formatDate = (date: string) =>
        new Date(date).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <>
            {/* Ghost spacer to prevent content occlusion */}
            <div className="h-28 w-full pointer-events-none" />

            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none">
                <nav className="container mx-auto max-w-7xl flex items-center justify-between backdrop-blur-xl bg-black/40 px-8 py-4 rounded-full border border-white/10 shadow-2xl transition-all hover:bg-black/50 pointer-events-auto">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/trainer/dashboard")}>
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                            <Activity className="w-6 h-6 text-cyan-400" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors uppercase">PRO TRAIN</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 lg:gap-10">
                        {navLinks.map((link) => {
                            const isActive = location.pathname.startsWith(link.path);
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "hover:text-white transition-colors relative group tracking-tighter italic uppercase text-xs lg:text-sm font-bold",
                                        isActive ? "text-cyan-400" : "text-gray-400"
                                    )}
                                >
                                    {link.name}
                                    <span className={cn(
                                        "absolute -bottom-1 left-0 h-0.5 bg-cyan-500 transition-all",
                                        isActive ? "w-full" : "w-0 group-hover:w-full"
                                    )} />
                                </Link>
                            );
                        })}
                        <Link
                            to="/trainer/chats"
                            className={cn(
                                "hover:text-white transition-colors relative group tracking-tighter italic uppercase text-xs lg:text-sm font-bold",
                                location.pathname.startsWith("/trainer/chats") ? "text-cyan-400" : "text-gray-400"
                            )}
                        >
                            Chats
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications Popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative text-gray-400 hover:text-white transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-500/10 transition-all">
                                        <Bell className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-black" />
                                        )}
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 bg-black/80 backdrop-blur-xl border-white/10 p-0 shadow-2xl overflow-hidden mt-4"
                                align="end"
                            >
                                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-xl">
                                    <span className="text-xs font-black tracking-widest text-white uppercase italic">Notifications</span>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-[10px] font-bold text-cyan-400 hover:text-white uppercase transition-colors">Mark All Read</button>
                                    )}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto">
                                    {loading && notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500 text-xs italic">No alerts in your corridor</div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={() => !n.read && markAsRead(n._id)}
                                                className={cn(
                                                    "p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group",
                                                    !n.read && "bg-cyan-500/5"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20">
                                                        <Activity className="h-4 w-4 text-cyan-400" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[13px] font-bold text-white group-hover:text-cyan-400 transition-colors italic">{n.title || "Notification"}</p>
                                                        <p className="text-xs text-gray-400 leading-relaxed font-light">{n.message}</p>
                                                        <p className="text-[10px] text-gray-600 font-bold uppercase">{formatDate(n.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Profile Dropdown */}
                        <div className="flex items-center gap-2 ml-2">
                            <div
                                onClick={() => navigate("/trainer/profile")}
                                className="flex items-center gap-2 group cursor-pointer"
                            >
                                <Avatar className="h-10 w-10 border border-white/10 group-hover:border-cyan-500/50 transition-all ring-offset-black">
                                    <AvatarImage src={trainerAvatar} className="object-cover" />
                                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs italic font-black">
                                        {trainerName[0]?.toUpperCase() ?? "T"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* Dropdown for quick actions */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl">
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 bg-black/80 backdrop-blur-xl border-white/10 p-1 shadow-2xl mt-4"
                                    align="end"
                                >
                                    <DropdownMenuLabel className="p-4 bg-white/5 rounded-2xl mb-1">
                                        <p className="text-xs font-black tracking-widest text-white uppercase italic">{trainerName}</p>
                                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{trainer?.email}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-cyan-400 transition-colors rounded-xl" onClick={() => navigate("/trainer/profile")}>
                                        <User className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-bold uppercase italic tracking-tighter">Profile & Stats</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-cyan-400 transition-colors rounded-xl" onClick={() => navigate("/trainer/transactions")}>
                                        <Wallet className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-bold uppercase italic tracking-tighter">Transactions</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-cyan-400 transition-colors rounded-xl" onClick={() => navigate("/trainer/settings")}>
                                        <Settings className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-bold uppercase italic tracking-tighter">Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-white/10" />
                                    <DropdownMenuItem className="text-red-400 hover:text-red-500 hover:bg-red-500/5 focus:bg-red-500/5 transition-colors rounded-xl" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-bold uppercase italic tracking-tighter">Terminate Session</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden text-gray-400 hover:text-white"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="md:hidden container mx-auto max-w-7xl mt-4 pointer-events-auto"
                        >
                            <div className="bg-black/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 shadow-2xl space-y-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl transition-all font-black italic uppercase tracking-tighter text-sm",
                                            location.pathname.startsWith(link.path) ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <div className="h-px bg-white/5 my-4" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full p-4 rounded-2xl bg-red-500/10 text-red-400 font-black italic uppercase tracking-tighter text-sm text-left"
                                >
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    );
}
