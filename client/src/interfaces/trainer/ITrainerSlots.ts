export interface Slot {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    bookedBy?: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    requestedBy: Array<{
        userId: {
            _id: string;
            name: string;
            profileImage?: string;
        };
        status: 'pending' | 'approved' | 'rejected';
    }>;
}
