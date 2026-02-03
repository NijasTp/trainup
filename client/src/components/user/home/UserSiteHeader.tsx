import React, { useEffect, useState, useCallback } from "react"
import { logout, updateUser } from "@/redux/slices/userAuthSlice"
import type { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { logout as logoutApi } from "@/services/authService"
import {
  Bell,
  CalendarClock,
  Megaphone,
  Users,
  Flame,
  Menu,
  X,
  Dumbbell,
  Utensils,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Heart,
  Activity
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import API from "@/lib/axios"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { io } from "socket.io-client"
import { StreakPopup } from "@/components/ui/StreakPopup"
import { StreakModal } from "@/components/ui/StreakModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export const SiteHeader: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.userAuth.user)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatUnreadCount, setChatUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(user?.streak ?? 0)
  const [showStreakPopup, setShowStreakPopup] = useState(false)
  const [showStreakModal, setShowStreakModal] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const { data } = await API.get<{
        notifications: Notification[]
        unreadCount: number
      }>("/notifications?page=1&limit=10")
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      console.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchChatUnread = useCallback(async () => {
    try {
      const { data } = await API.get<{ counts: { senderId: string; count: number }[] }>("/user/chat/unread-counts")
      const totalUnread = data.counts.reduce((acc, curr) => acc + curr.count, 0)
      setChatUnreadCount(totalUnread)
    } catch (err) {
      console.error("Failed to load chat unread counts")
    }
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      toast.error("Could not mark as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      await API.patch("/notifications/read-all")
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch {
      toast.error("Failed to mark all as read")
    }
  }

  useEffect(() => {
    if (user?.streak !== undefined) {
      setCurrentStreak(user.streak)
    }
  }, [user?.streak])

  useEffect(() => {
    if (!user?._id) return

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      socket.emit('join_room', user._id);
    });

    socket.on("streak_updated", (data: { streak: number }) => {
      const today = new Date().toDateString();
      const storageKey = `streak_popup_shown_${user._id}`;
      const lastShownDate = localStorage.getItem(storageKey);

      setCurrentStreak(data.streak);
      dispatch(updateUser({ streak: data.streak }));

      if (lastShownDate !== today) {
        setShowStreakPopup(true);
        localStorage.setItem(storageKey, today);
      }
    });

    socket.on("new_message", () => {
      setChatUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect()
  }, [user?._id, dispatch])

  useEffect(() => {
    if (!user) {
      navigate("/login")
      return
    }
    fetchNotifications()
    fetchChatUnread()
    const interval = setInterval(() => {
      fetchNotifications();
      fetchChatUnread();
    }, 30_000)
    return () => clearInterval(interval)
  }, [user, navigate, fetchNotifications, fetchChatUnread])

  const handleSignOut = async () => {
    dispatch(logout())
    await logoutApi()
    navigate("/user/login")
  }

  const userName = user?.name || "Me"
  const userAvatar = user?.profileImage

  const formatDate = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const navLinks = [
    { name: "My Trainer", path: "/my-trainer/profile", icon: MessageSquare, show: !!user?.assignedTrainer },
    { name: "Trainers", path: "/trainers", icon: Users, show: true },
    { name: "Workouts", path: "/workouts", icon: Dumbbell, show: true },
    { name: "Diet", path: "/diets", icon: Utensils, show: true },
    { name: "Wishlist", path: "/wishlist", icon: Heart, show: true },
  ].filter(link => link.show)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none">
      <nav className="container mx-auto max-w-7xl flex items-center justify-between backdrop-blur-xl bg-black/40 px-8 py-4 rounded-full border border-white/10 shadow-2xl transition-all hover:bg-black/50 pointer-events-auto">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/home")}>
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic text-white group-hover:text-cyan-400 transition-colors uppercase">TRAINUP</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold tracking-wide text-gray-400">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "hover:text-white transition-colors relative group tracking-tighter italic uppercase text-xs lg:text-sm",
                  isActive && "text-white"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-cyan-500 transition-all",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )} />
                {link.name === "My Trainer" && chatUnreadCount > 0 && (
                  <span className="absolute -top-3 -right-3 h-4 min-w-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg shadow-red-500/20">
                    {chatUnreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors group relative" onClick={() => setShowStreakModal(true)}>
            <Flame className={cn("h-4 w-4", currentStreak ? "text-orange-500" : "text-muted-foreground")} />
            <span className="text-sm font-black text-orange-500 italic tracking-tighter">{currentStreak}</span>
          </div>

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
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-cyan-400 hover:text-white uppercase transition-colors">Mark All Read</button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-xs italic">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={cn(
                        "p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors group",
                        !n.isRead && "bg-cyan-500/5"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20">
                          {n.type.includes("session") ? <CalendarClock className="h-4 w-4 text-cyan-400" /> : <Megaphone className="h-4 w-4 text-gray-400" />}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[13px] font-bold text-white group-hover:text-cyan-400 transition-colors italic">{n.title}</p>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 group cursor-pointer ml-2">
                <Avatar className="h-10 w-10 border border-white/10 group-hover:border-cyan-500/50 transition-all ring-offset-black transition-all">
                  <AvatarImage src={userAvatar} className="object-cover" />
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-xs italic font-black">
                    {userName[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-black/80 backdrop-blur-xl border-white/10 p-1 shadow-2xl mt-4"
              align="end"
            >
              <DropdownMenuLabel className="p-4 bg-white/5 rounded-lg mb-1">
                <p className="text-xs font-black tracking-widest text-white uppercase italic">{userName}</p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-cyan-400 transition-colors" onClick={() => navigate("/dashboard")}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="text-xs font-bold uppercase italic tracking-tighter">Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-cyan-400 transition-colors" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                <span className="text-xs font-bold uppercase italic tracking-tighter">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-cyan-400 transition-colors" onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-xs font-bold uppercase italic tracking-tighter">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 hover:text-red-500 hover:bg-red-500/5 focus:bg-red-500/5 transition-colors" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-xs font-bold uppercase italic tracking-tighter">Sign Out</span>
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
            <div className="bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all font-black italic uppercase tracking-tighter text-sm",
                    location.pathname === link.path ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.name}
                  {link.name === "My Trainer" && chatUnreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{chatUnreadCount}</span>
                  )}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-4" />
              <button
                onClick={handleSignOut}
                className="w-full p-4 rounded-2xl bg-red-500/10 text-red-400 font-black italic uppercase tracking-tighter text-sm text-left"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StreakPopup
        isOpen={showStreakPopup}
        onClose={() => setShowStreakPopup(false)}
        streak={currentStreak}
      />
      <StreakModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streak={currentStreak}
      />
    </header>
  )
}
