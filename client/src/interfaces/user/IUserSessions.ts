export interface RequestedBy {
    userId: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
}

export interface Session {
    _id: string;
    trainerId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    requestedBy: RequestedBy[];
    isBooked: boolean;
    bookedBy?: string;
    createdAt: string;
    currentUserId?: string;
}
