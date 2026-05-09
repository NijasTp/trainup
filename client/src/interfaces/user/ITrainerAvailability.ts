export interface WeeklySlot {
    _id: string;
    trainerId: {
        _id: string;
        name: string;
        profileImage?: string;
        sessionBundles?: Array<{ sessions: number; price: number }>;
    };
    day: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    isRequested: boolean;
}
