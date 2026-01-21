import React, { useEffect, useState, useCallback } from "react"
import { logout } from "@/redux/slices/userAuthSlice"
import type { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { logout as logoutApi } from "@/services/authService"
import {
  Bell,
  CalendarClock,
  Megaphone,
  Search,
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
  ChevronDown,
  MessageSquare,
  Heart
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import API from "@/lib/axios"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CustomDropdown } from "@/components/ui/custom-dropdown"
import { io } from "socket.io-client"
import { StreakPopup } from "@/components/ui/StreakPopup"
import { updateUser } from "@/redux/slices/userAuthSlice"

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
  const [scrolled, setScrolled] = useState(false)

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
      // Silent error for notifications
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

  // Socket and Streak Effect
  useEffect(() => {
    if (user?.streak !== undefined) {
      setCurrentStreak(user.streak)
    }
  }, [user?.streak])

  useEffect(() => {
    if (!user?._id) return

    console.log("Initializing socket for user:", user._id);
    const socket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on("streak_updated", (data: { streak: number }) => {
      console.log("Streak updated event received:", data);
      setCurrentStreak(data.streak)
      setShowStreakPopup(true)
      // Update global store
      if (user) {
        dispatch(updateUser({ streak: data.streak }))
      }
    })

    socket.on("new_message", () => {
      setChatUnreadCount(prev => prev + 1);
    });

    return () => {
      console.log("Disconnecting socket");
      socket.disconnect()
    }
  }, [user?._id, dispatch]) // removed user from dependency to avoid re-connecting on every update

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
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm" : "bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/home"
          className="flex items-center gap-2 group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#4B8B9B] to-[#2E5C6E] text-white shadow-lg group-hover:shadow-[#4B8B9B]/20 transition-all duration-300">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight">TRAIN<span className="text-[#4B8B9B]">UP</span></span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#4B8B9B]/10 text-[#4B8B9B]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.name}

              </Link>
            )
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - Desktop */}
          <div className="hidden lg:block relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 h-9 bg-secondary/50 border-transparent focus:bg-background focus:border-[#4B8B9B]/50 transition-all rounded-full"
            />
          </div>

          {/* Search - Mobile Icon */}
          <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>

          {/* Streak */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Flame
              className={cn(
                "h-4 w-4",
                currentStreak ? "text-orange-500 fill-orange-500" : "text-muted-foreground"
              )}
            />
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{currentStreak}</span>
          </div>

          {/* Notifications */}
          <CustomDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            width="w-80"
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground rounded-full"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileOpen(false);
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                )}
              </Button>
            }
            content={
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#4B8B9B] hover:text-[#4B8B9B]/80 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto py-1">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <div className="animate-spin h-5 w-5 border-2 border-[#4B8B9B] border-t-transparent rounded-full mx-auto mb-2" />
                      <span className="text-xs">Loading...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 cursor-pointer outline-none transition-colors hover:bg-accent/50",
                          !n.isRead && "bg-accent/20"
                        )}
                        onClick={() => {
                          if (!n.isRead) markAsRead(n._id)
                        }}
                      >
                        <div className={cn(
                          "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          n.type.includes("session") ? "bg-blue-500/10 text-blue-500" :
                            n.type.includes("trainer") ? "bg-purple-500/10 text-purple-500" :
                              "bg-[#4B8B9B]/10 text-[#4B8B9B]"
                        )}>
                          {n.type.includes("session") ? <CalendarClock className="h-4 w-4" /> :
                            n.type.includes("trainer") ? <Users className="h-4 w-4" /> :
                              <Megaphone className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium leading-none mb-1", !n.isRead && "text-foreground")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {formatDate(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="h-2 w-2 rounded-full bg-[#4B8B9B] shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border/50">
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-center justify-center w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    View all notifications
                  </Link>
                </div>
              </>
            }
          />

          {/* User Profile Dropdown */}
          <CustomDropdown
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            width="w-56"
            trigger={
              <Button
                variant="ghost"
                className="pl-2 pr-1 h-10 rounded-full hover:bg-accent/50 gap-2"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotifOpen(false);
                }}
              >
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                  <AvatarFallback className="bg-[#4B8B9B] text-white text-xs">
                    {userName[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </Button>
            }
            content={
              <div className="p-1">
                <div className="px-2 py-2.5 mb-1 border-b border-border/50">
                  <p className="text-sm font-semibold truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent outline-none text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                  Dashboard
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent outline-none text-foreground"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent outline-none text-foreground"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Settings
                </Link>

                <div className="h-px bg-border/50 my-1" />

                <button
                  onClick={() => {
                    handleSignOut();
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-500/10 text-red-500 hover:text-red-600 outline-none"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            }
          />

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md animate-in slide-in-from-top-5">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#4B8B9B]/10 text-[#4B8B9B]"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                  {link.name === "My Trainer" && chatUnreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {chatUnreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
            <div className="pt-4 mt-2 border-t border-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-[#4B8B9B]/50 transition-all rounded-lg"
                />
              </div>
            </div>
          </nav>
        </div>
      )}
      <StreakPopup
        isOpen={showStreakPopup}
        onClose={() => setShowStreakPopup(false)}
        streak={currentStreak}
      />
    </header>
  )
}