export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    height: number; // in cm
    weight: number; // in kg
    activityStatus: 'active' | 'inactive';
    subscriptionStartDate: string;
    profileImage?: string;
    trainerPlan?: 'basic' | 'premium' | 'pro';
}

export interface UserPlan {
    messagesLeft: number;
    videoCallsLeft: number;
    planType: 'basic' | 'premium' | 'pro';
    expiryDate: string;
}
