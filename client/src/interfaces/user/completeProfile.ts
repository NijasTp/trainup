export interface ProfileFormData {
    height: string;
    weight: string;
    activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | undefined;
    equipmentAvailability: boolean;
    goals: ('Weight Loss' | 'Muscle Gain' | 'Endurance' | 'General Fitness')[];
}