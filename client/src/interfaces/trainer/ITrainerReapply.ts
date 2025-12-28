export interface TrainerDetails {
    name: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    specialization: string;
    bio: string;
    price: {
        basic: string;
        premium: string;
        pro: string;
    };
    rejectReason: string
}
