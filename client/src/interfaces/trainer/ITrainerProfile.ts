export interface TrainerProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    bio: string;
    location: string;
    specialization: string;
    experience: string;
    price: {
        basic: number;
        premium: number;
        pro: number;
    };
    rating: number;
    profileImage: string;
    certificate: string;
    profileStatus: string;
    clients: string[];
    createdAt: string;
}
