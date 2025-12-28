export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    senderType: 'user' | 'trainer';
    messageType: 'text' | 'image' | 'audio';
    fileUrl?: string;
}

export interface ChatTrainer {
    _id: string;
    name: string;
    profileImage?: string;
}

export interface UserPlan {
    messagesLeft: number;
    planType: 'basic' | 'premium' | 'pro';
}
