export interface Position {
    x: number;
    y: number;
}

export interface SpotlightCardProps extends React.PropsWithChildren {
    className?: string;
    spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
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
    certificate: string;
    profileImage: string;
    profileStatus: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    price?: string;
}

export interface User {
    _id: string;
    trainerPlan?: 'basic' | 'premium' | 'pro';
    assignedTrainer?: string;
}
