export interface Conversation {
    partnerId: string;
    lastMessage: {
        message: string;
        createdAt: string;
        senderId: string;
        readStatus: boolean;
        messageType: string;
    };
    unreadCount: number;
    trainerDetails?: {
        name: string;
        profileImage: string;
    };
    userDetails?: {
        name: string;
        profileImage: string;
    };
}
