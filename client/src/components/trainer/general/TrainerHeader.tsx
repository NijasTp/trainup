// src/components/trainer/TrainerSiteHeader.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  LogOut,
  Users,
  User,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "sonner";
import API from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  _id: string;
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
}


export default function TrainerSiteHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainerProfile = async () => {
    try { await API.get("/trainer/get-details"); }
    catch { toast.error("Failed to load profile"); }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await API.get<{ notifications: Notification[] }>("/notifications");
      setNotifications(data.notifications || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await API.patch(`/notifications/${id}`, { read: true });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Could not mark as read");
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/trainer/logout");
      dispatch(logoutTrainer());
      toast.success("Logged out");
      navigate("/trainer/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    fetchTrainerProfile();
    fetchNotifications();
    const int = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(int);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          TrainUp <span className="hidden sm:inline">Trainer</span>
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { label: "Clients",   icon: Users,      path: "/trainer/clients" },
            { label: "Slots",     icon: Clock,      path: "/trainer/slots" },
            { label: "Schedule",  icon: Calendar,   path: "/trainer/weekly-schedule" },
            { label: "Requests",  icon: UserCheck,  path: "/trainer/session-requests" },
            { label: "Profile",   icon: User,       path: "/trainer/profile" },
          ].map(i => (
            <Button
              key={i.path}
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10 hover:text-primary"
              onClick={() => navigate(i.path)}
            >
              <i.icon className="h-4 w-4 mr-1.5" />
              {i.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </nav>

        <div className="flex items-center gap-3">

          {/* NOTIFICATIONS*/}
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
                    onClick={markAllRead}
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
                  notifications.map(n => (
                    <DropdownMenu.Item
                      key={n._id}
                      className={`flex items-start gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent/5 ${
                        n.read ? "opacity-70" : ""
                      }`}
                      onSelect={() => !n.read && markAsRead(n._id)}
                    >
                      {/* Simple icon fallback */}
                      <Bell className="h-4 w-4 text-accent mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{n.title || "Notification"}</div>
                        <div className="text-xs text-muted-foreground">{n.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      {!n.read && <CheckCircle className="h-4 w-4 text-primary" />}
                    </DropdownMenu.Item>
                  ))
                )}
              </div>

              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item
                asChild
                className="text-center py-2 text-sm hover:bg-accent/5 cursor-pointer"
              >
                <Link to="/trainer/notifications" className="block w-full">
                  View all notifications
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* ---------- MOBILE MENU (Radix) ---------- */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="md:hidden p-2 rounded hover:bg-muted-foreground/5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
              align="end"
              className="w-56 rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              {[
                { label: "Clients",   icon: Users,      path: "/trainer/clients" },
                { label: "Slots",     icon: Clock,      path: "/trainer/slots" },
                { label: "Schedule",  icon: Calendar,   path: "/trainer/weekly-schedule" },
                { label: "Requests",  icon: UserCheck,  path: "/trainer/session-requests" },
                { label: "Profile",   icon: User,       path: "/trainer/profile" },
              ].map(i => (
                <DropdownMenu.Item
                  key={i.path}
                  asChild
                  className="cursor-pointer"
                >
                  <Link to={i.path} className="flex items-center gap-2 px-3 py-2 text-sm">
                    <i.icon className="h-4 w-4" />
                    {i.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="h-px bg-muted" />
              <DropdownMenu.Item
                className="text-destructive cursor-pointer px-3 py-2 text-sm"
                onSelect={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}