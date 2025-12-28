export type Trainer = {
    _id: string;
    name: string;
    specialty: string;
    location: string;
    price: {
        basic: string;
        premium: string;
        pro: string;
    };
    rating: number;
    bio: string;
    experience: string;
    specialization: string;
    profileImage: string;
};