export interface WeeklySlot {
    _id: string;
    trainerId: {
        _id: string;
        name: string;
        profileImage?: string;
    };
    day: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    isRequested: boolean;
}
