export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    trainerPlan?: 'basic' | 'premium' | 'pro';
    subscriptionStartDate?: string;
    assignedTrainer?: string;
}

export interface Trainer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
    isBanned: boolean;
    role: string;
    clients: string[];
    bio: string;
    location: string;
    specialization: string;
    tokenVersion: number;
    experience: string;
    badges: string[];
    rating: number;
    subscriptionStartDate?: string;
    trainerPlan?: 'basic' | 'premium' | 'pro';
    profileImage?: string;
    certificate?: string;
    reviews?: any[];
    price?: {
        basic: number;
        premium: number;
        pro: number;
    };
}
