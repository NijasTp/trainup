export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

export interface DaySchedule {
    day: string;
    isActive: boolean;
    slots: TimeSlot[];
}

export interface WeeklyScheduleData {
    trainerId: string;
    weekStart: string;
    schedule: DaySchedule[];
}

export interface UserProfile {
    _id: string;
    name: string;
    profileImage: string;
}

export interface RequestItem {
    _id: string;
    userId: UserProfile;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface SlotItem {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    bookedBy?: UserProfile;
    requestedBy: RequestItem[];
}
