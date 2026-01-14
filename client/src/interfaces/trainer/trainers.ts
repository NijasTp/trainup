export type Trainer = {
    _id: string;
    name: string;
    specialty: string;
    location: string;
    price: {
        basic: number;
        premium: number;
        pro: number;
    };
    rating: number;
    bio: string;
    experience: string;
    specialization: string;
    profileImage: string;
};