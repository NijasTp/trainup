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
        sessionBundles?: Array<{ sessions: number; price: number }>;
    };
    date: string;
    startTime: string;
    endTime: string;
    videoCall?:{
        userPerformanceRating?:number;
    }
    requestedBy: RequestedBy[];
    isBooked: boolean;
    bookedBy?: string;
    createdAt: string;
    currentUserId?: string;
}
