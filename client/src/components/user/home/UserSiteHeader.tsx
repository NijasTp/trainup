
import React, { useEffect, useState } from "react"
import { logout } from "@/redux/slices/userAuthSlice"
import type { RootState } from "@/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logout as logoutApi } from "@/services/authService"
import {
  Bell,
  CalendarClock,
  Megaphone,
  Search,
  Users,
  Flame,
  CheckCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import API from "@/lib/axios"
import { toast } from "sonner"

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
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.userAuth.user)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data } = await API.get<{
        notifications: Notification[]
        unreadCount: number
      }>("/notifications?page=1&limit=10")
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => c - 1)
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
    if (!user) {
      navigate("/login")
      return
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [user, navigate])

  const handleSignOut = async () => {
    dispatch(logout())
    await logoutApi()
    navigate("/user/login")
  }

  const userName = user?.name || "Me"
  const userAvatar =
    user?.profileImage ||
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=300&auto=format&fit=crop"

  const formatDate = (date: string) =>
    new Date(date).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          to="/home"
          className="flex items-center gap-2 font-display text-xl tracking-wider"
        >
          <div className="ms-3">
            <span className="font-extrabold">TRAIN</span>
            <span className="text-accent font-extrabold">UP</span>
          </div>
        </Link>

        {/* Search – desktop */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl ml-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workouts, diets, trainers..."
              className="pl-9 bg-secondary/40"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="ml-auto flex items-center gap-2">
          {/* Streak */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40">
            <Flame
              className={`h-5 w-5 ${user?.streak ? "text-orange-500 fill-orange-500" : "text-muted-foreground"
                }`}
            />
            <span className="text-sm font-medium">{user?.streak ?? 0}</span>
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="p-2 rounded hover:bg-muted-foreground/5">
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 text-[10px] flex items-center justify-center"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-80 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <DropdownMenu.Label className="text-sm font-semibold">
                  Notifications
                </DropdownMenu.Label>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-6 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
              </div>

              <DropdownMenu.Separator className="h-px bg-muted" />

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenu.Item
                      key={n._id}
                      className={`flex items-start gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent/5 ${n.isRead ? "opacity-70" : ""
                        }`}
                      onSelect={() => !n.isRead && markAsRead(n._id)}
                    >
                      {/* Icon based on type – you can extend this map */}
                      {n.type.includes("session") && (
                        <CalendarClock className="h-4 w-4 text-accent mt-0.5" />
                      )}
                      {n.type.includes("announcement") && (
                        <Megaphone className="h-4 w-4 text-accent mt-0.5" />
                      )}
                      {n.type.includes("trainer") && (
                        <Users className="h-4 w-4 text-accent mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{n.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {n.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDate(n.createdAt)}
                        </div>
                      </div>
                      {!n.isRead && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenu.Item>
                  ))
                )}
              </div>
              <DropdownMenu.Separator className="h-px bg-muted flex items-center" />
              <DropdownMenu.Item
                asChild
                className="flex items-center py-2 text-sm hover:bg-accent/5 cursor-pointer"
              >
                <div className="flex items-center justify-center">
                  <Link to="/notifications" className="block w-full text-center py-2 text-sm hover:bg-accent/5 cursor-pointer">
                    View all notifications
                  </Link>
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* ==== USER MENU ==== */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted-foreground/5">
              <Avatar className="h-6 w-6">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName[0]?.toUpperCase() ?? "ME"}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{userName}</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-56 rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              <DropdownMenu.Label className="px-2 py-2 text-sm font-semibold">
                My Account
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item asChild>
                <Link to="/profile" className="block px-2 py-2 text-sm">
                  Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/dashboard" className="block px-2 py-2 text-sm">
                  Dashboard
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link to="/settings" className="block px-2 py-2 text-sm">
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="px-2 py-2 text-sm"
                onSelect={handleSignOut}
              >
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}