export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    senderType: 'user' | 'trainer';
    messageType: 'text' | 'image' | 'audio' | 'file';
    fileUrl?: string;
}

export interface Client {
    _id: string;
    name: string;
    profileImage?: string;
    trainerPlan: 'basic' | 'premium' | 'pro';
}
