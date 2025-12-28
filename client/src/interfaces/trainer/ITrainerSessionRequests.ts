export interface User {
    _id: string;
    name: string;
    profileImage?: string;
}

export interface RequestedBy {
    _id: string;
    userId: User;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export interface SessionRequest {
    _id: string;
    trainerId: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    requestedBy: RequestedBy[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}
