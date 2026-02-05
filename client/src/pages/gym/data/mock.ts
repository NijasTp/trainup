
import { Member, GymPlan, Product, Attendance, Announcement, Job, WorkoutTemplate } from '../types';

export const mockMembers: Member[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', planName: 'All Access', status: 'Active', joinDate: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', planName: 'Strength Only', status: 'Active', joinDate: '2024-02-10' },
    { id: '3', name: 'Mike Ross', email: 'mike@example.com', planName: 'Cardio Only', status: 'Expired', joinDate: '2023-11-20' },
];

export const mockPlans: GymPlan[] = [
    {
        id: '1',
        name: 'Cardio Only',
        price: 49,
        duration: 1,
        equipmentIds: ['treadmill', 'crossfit'],
        isCardioIncluded: true,
        permissions: { trainerChat: false, videoCall: false },
        status: 'active'
    },
    {
        id: '2',
        name: 'Strength Only',
        price: 69,
        duration: 1,
        equipmentIds: ['dumbbell', 'barbell', 'smith'],
        isCardioIncluded: false,
        permissions: { trainerChat: true, videoCall: false },
        status: 'active'
    },
    {
        id: '3',
        name: 'All Access',
        price: 99,
        duration: 1,
        equipmentIds: ['dumbbell', 'barbell', 'smith', 'treadmill', 'crossfit'],
        isCardioIncluded: true,
        permissions: { trainerChat: true, videoCall: true },
        status: 'active'
    },
];

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Whey Protein',
        price: 55,
        category: 'supplements',
        subcategory: 'protein',
        stock: 25,
        images: ['https://images.unsplash.com/photo-1593095191071-83715ed7e27d?q=80&w=2070&auto=format&fit=crop'],
        description: 'High quality whey protein isolate.',
        isAvailable: true
    },
    {
        id: '2',
        name: 'Fitness Tee',
        price: 25,
        category: 'clothing',
        subcategory: 'tshirts',
        stock: 50,
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1974&auto=format&fit=crop'],
        description: 'Breathable sports t-shirt.',
        isAvailable: true
    }
];

export const mockAttendance: Attendance[] = [
    { id: '1', memberName: 'John Doe', date: '2024-03-20', time: '08:30 AM' },
    { id: '2', memberName: 'Jane Smith', date: '2024-03-20', time: '09:15 AM' },
    { id: '3', memberName: 'John Doe', date: '2024-03-19', time: '05:45 PM' },
];

export const mockAnnouncements: Announcement[] = [
    { id: '1', title: 'New Yoga Classes', description: 'Starting next Monday at 6 PM.', date: '2024-03-15', target: 'all' },
    { id: '2', title: 'Maintenance Notice', description: 'The weights area will be closed for cleaning this Sunday.', date: '2024-03-10', target: 'members' },
];

export const mockJobs: Job[] = [
    { id: '1', title: 'Personal Trainer', salary: '$3000 - $5000', requirements: ['CPT Certification', '2+ Years Experience'], description: 'Looking for a passionate trainer.', type: 'Trainer', location: 'On-site' },
];

export const mockWorkoutTemplates: WorkoutTemplate[] = [
    {
        id: '1',
        name: 'Morning Blast',
        category: 'Strength',
        exercises: [
            { name: 'Pushups', sets: 3, reps: '20', order: 1 },
            { name: 'Squats', sets: 3, reps: '15', order: 2 },
            { name: 'Plank', sets: 3, reps: '60s', order: 3 }
        ],
        restrictedPlanIds: ['2', '3']
    }
];
