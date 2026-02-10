export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isVerified?: boolean;
    role: "user";
    goals?: string[];
    activityLevel?: string;
    equipment?: boolean;
    assignedTrainer?: string;
    isPrivate?: boolean;
    isBanned: boolean;
    streak?: number;
    xp?: number;
    achievements?: string[];
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}
