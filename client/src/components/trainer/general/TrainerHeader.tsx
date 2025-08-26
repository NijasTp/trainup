"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutTrainer } from "@/redux/slices/trainerAuthSlice";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Users, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/axios";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function TrainerSiteHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [trainerName, setTrainerName] = useState("Trainer");

  useEffect(() => {
    fetchTrainerProfile();
    fetchNotifications();
  }, []);

  const fetchTrainerProfile = async () => {
    try {
      const response = await API.get("/trainer/get-details");
      setTrainerName(response.data.name || "Trainer");
      setProfileImage(response.data.profileImage);
    } catch (err: any) {
      toast.error("Failed to load profile");
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/trainer/notifications");
      setNotifications(response.data || []);
    } catch (err: any) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await API.patch(`/trainer/notifications/${id}`, { read: true });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/trainer/logout");
      dispatch(logoutTrainer());
      toast.success("Logged out successfully");
      navigate("/trainer/login");
    } catch (err: any) {
      toast.error("Failed to log out");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/90 bg-clip-text text-transparent">
            TrainUp Trainer
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            className="text-foreground hover:bg-primary/5 hover:text-primary transition-all"
            onClick={() => navigate("/trainer/clients")}
          >
            <Users className="h-4 w-4 mr-2" />
            Clients
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-primary/5 hover:text-primary transition-all"
            onClick={() => navigate("/trainer/chat/:clientId")} // Placeholder clientId
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-primary/5 hover:text-primary transition-all"
            onClick={() => navigate("/trainer/profile")}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 transition-all"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative bg-background/50 border-border/50 hover:bg-primary/5"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-80 bg-card/80 backdrop-blur-sm border-border/50"
              align="end"
              sideOffset={8}
            >
              <div className="p-4 border-b border-border/50">
                <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
              </div>
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification._id}
                    className={`p-4 flex flex-col items-start gap-2 cursor-pointer ${
                      notification.read ? "bg-background/50" : "bg-primary/10"
                    }`}
                    onSelect={() => !notification.read && markNotificationAsRead(notification._id)}
                  >
                    <p className="text-sm text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {!notification.read && (
                      <Badge className="bg-primary text-primary-foreground">New</Badge>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="md:hidden">
            <Button
              variant="outline"
              className="bg-background/50 border-border/50 hover:bg-primary/5"
              aria-label="Menu"
            >
              Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-card/80 backdrop-blur-sm border-border/50"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuItem
              className="text-foreground hover:bg-primary/5 cursor-pointer"
              onSelect={() => navigate("/trainer/clients")}
            >
              <Users className="h-4 w-4 mr-2" />
              Clients
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground hover:bg-primary/5 cursor-pointer"
              onSelect={() => navigate("/trainer/chat/:clientId")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-foreground hover:bg-primary/5 cursor-pointer"
              onSelect={() => navigate("/trainer/profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}