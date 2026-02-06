export interface Member {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    joinedAt?: string;
}

export interface UserSubscription {
    planName: string;
    planPrice: number;
    planDuration: number;
    planDurationUnit: string;
    subscribedAt: string;
    preferredTime: string;
    expiresAt?: string;
}

export interface Gym {
    _id: string;
    name: string;
    email: string;
    planDuration: number;
    planDurationUnit: string;
    subscribedAt: string;
    preferredTime: string;
    description?: string;
    rating?: number;
    memberCount?: number;
    phone?: string;
    images?: string[];
    reviews?: any[];
    profileImage?: string;
    geoLocation?: { type: string; coordinates: [number, number] };
    address?: string;
}

export interface MyGymData {
    gym: Gym;
    members: Member[];
    userSubscription: UserSubscription;
}
