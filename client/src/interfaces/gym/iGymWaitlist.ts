export interface GymApplication {
    name: string;
    email: string;
    location: string;
    certificate: string | null;
    profileImage: string | null;
    images: string[];
    submittedAt?: string;
    status?: string;
}