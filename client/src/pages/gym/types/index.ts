
export interface GymPlan {
    id: string;
    name: string;
    price: number;
    duration: number; // in months
    equipmentIds: string[];
    isCardioIncluded: boolean;
    permissions: {
        trainerChat: boolean;
        videoCall: boolean;
    };
    status: 'active' | 'inactive';
}

export interface Equipment {
    id: string;
    name: string;
    category: string;
    status: 'available' | 'unavailable';
}

export interface Member {
    id: string;
    name: string;
    email: string;
    planName: string;
    status: 'Active' | 'Expired' | 'Pending';
    joinDate: string;
}

export interface Attendance {
    id: string;
    memberName: string;
    date: string;
    time: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: 'supplements' | 'clothing' | 'accessories';
    subcategory: string;
    stock: number;
    images: string[];
    description: string;
    isAvailable: boolean;
}

export interface Announcement {
    id: string;
    title: string;
    description: string;
    image?: string;
    date: string;
    target: 'all' | 'trainers' | 'members';
}

export interface Job {
    id: string;
    title: string;
    salary: string;
    requirements: string[];
    description: string;
    type: 'Trainer' | 'Staff' | 'Manager';
    location: 'On-site' | 'Remote' | 'Hybrid';
}

export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    order: number;
}

export interface WorkoutTemplate {
    id: string;
    name: string;
    category: string;
    exercises: Exercise[];
    restrictedPlanIds: string[];
}
