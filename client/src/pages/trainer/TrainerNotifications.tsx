import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import API from "@/lib/axios";
import { toast } from "sonner";

import {
    Bell,
    CheckCircle,
    Clock,
    Users,
    Megaphone,
    Trash2,
    Search,
    Circle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

import type { Notification, NotificationsResponse } from "@/interfaces/trainer/ITrainerNotifications";

const PAGE_SIZE = 10;

export default function TrainerNotifications() {
    const trainer = useSelector((state: any) => state.trainerAuth.trainer);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterPriority, setFilterPriority] = useState("");

    const fetchNotifications = async (pageNum: number = 1) => {
        if (!trainer?._id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: PAGE_SIZE.toString(),
                ...(search && { search }),
                ...(filterType && { type: filterType }),
                ...(filterPriority && { priority: filterPriority }),
            });
            const { data } = await API.get<NotificationsResponse>(`/notifications?${params}`);
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
            setTotal(data.total);
            if (pageNum !== page) setPage(pageNum);
        } catch {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1);
    }, [search, filterType, filterPriority]);

    const markAsRead = async (id: string) => {
        setLoadingAction(id);
        try {
            await API.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
            setUnreadCount(c => c - 1);
            toast.success("Marked as read");
        } catch {
            toast.error("Failed to mark as read");
        } finally {
            setLoadingAction(null);
        }
    };

    const markAllAsRead = async () => {
        setLoadingAction("all");
        try {
            await API.patch("/notifications/read-all");
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark all as read");
        } finally {
            setLoadingAction(null);
        }
    };

    const deleteNotification = async (id: string) => {
        setLoadingAction(id);
        try {
            await API.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setTotal(t => t - 1);
            toast.success("Notification deleted");
        } catch {
            toast.error("Failed to delete");
        } finally {
            setLoadingAction(null);
        }
    };

    const getIcon = (type: string) => {
        if (type.includes("session") || type.includes("request")) return <Clock className="h-5 w-5" />;
        if (type.includes("announcement")) return <Megaphone className="h-5 w-5" />;
        if (type.includes("client") || type.includes("trainer")) return <Users className="h-5 w-5" />;
        return <Bell className="h-5 w-5" />;
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "urgent": return "bg-red-500";
            case "high": return "bg-orange-500";
            case "medium": return "bg-yellow-500";
            case "low": return "bg-blue-500";
            default: return "bg-gray-500";
        }
    };

    const getCategoryVariant = (c: string) => {
        switch (c) {
            case "success": return "default";
            case "warning": return "secondary";
            case "error": return "destructive";
            default: return "outline";
        }
    };

    if (!trainer) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <TrainerSiteHeader />
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Please log in to view notifications.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <TrainerSiteHeader />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
            <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
                <div className="mx-auto max-w-5xl space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Bell className="h-9 w-9 text-primary" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold">Trainer Notifications</h1>
                                <p className="text-sm text-muted-foreground">
                                    {unreadCount ? `${unreadCount} unread` : "You're all caught up!"}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button onClick={markAllAsRead} disabled={loadingAction === "all"} size="sm">
                                {loadingAction === "all" ? "…" : "Mark all read"}
                            </Button>
                        )}
                    </div>

                    {/* Filters & Search */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search notifications..."
                                        className="pl-9"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    {/* === TYPE FILTER === */}
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="session_request">Session Request</SelectItem>
                                            <SelectItem value="new_client">New Client</SelectItem>
                                            <SelectItem value="payment_received">Payment</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* === PRIORITY FILTER === */}
                                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {(search || filterType || filterPriority) && (
                                        <Button variant="outline" size="sm" onClick={() => { setSearch(""); setFilterType(""); setFilterPriority(""); }}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Loading */}
                    {loading && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-5">
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-1/2 mt-3" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && notifications.length === 0 && (
                        <Card className="text-center py-16">
                            <CardContent>
                                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">No notifications match your filters.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* List */}
                    {!loading && notifications.length > 0 && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                {notifications.map(n => (
                                    <Card key={n._id} className={`relative ${n.isRead ? "opacity-80" : "ring-2 ring-primary/20"}`}>
                                        <div className={`absolute top-3 right-3 h-3 w-3 rounded-full ${getPriorityColor(n.priority)}`} />
                                        <CardContent className="p-5">
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{n.title}</h3>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                <Badge variant={getCategoryVariant(n.category)}>{n.category}</Badge>
                                                                {!n.isRead && <Badge variant="default" className="text-xs">New</Badge>}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {!n.isRead && (
                                                                <Button size="icon" variant="ghost" onClick={() => markAsRead(n._id)} disabled={loadingAction === n._id}>
                                                                    {loadingAction === n._id ? <Circle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                                </Button>
                                                            )}
                                                            <Button size="icon" variant="ghost" onClick={() => deleteNotification(n._id)} disabled={loadingAction === n._id}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{n.message}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {total > PAGE_SIZE && (
                                <div className="flex items-center justify-between mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                                            Previous
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <SiteFooter />
        </div>
    );
}