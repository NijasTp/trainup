export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    priority: "low" | "medium" | "high" | "urgent";
    category: "info" | "warning" | "success" | "error";
    createdAt: string;
    data?: Record<string, any>;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}
