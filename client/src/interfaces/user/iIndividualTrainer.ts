export interface Position {
    x: number;
    y: number;
}

export interface Trainer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: string;
    rating: number;
    location: string;
    bio: string;
    price: {
        basic: number;
        premium: number;
        pro: number;
    };
    profileImage: string;
    certificate: string;
    isVerified: boolean;
    clients: any[];
    reviews?: any[];
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    assignedTrainer?: string;
    trainerPlan?: "basic" | "premium" | "pro";
}
