export interface TrainerDetails {
    _id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    experience: string;
    specialization: string;
    bio: string;
    certificate: string;
    profileImage: string;
    profileStatus: "pending" | "approved" | "rejected" | "active" | "suspended";
    createdAt: Date;
}
