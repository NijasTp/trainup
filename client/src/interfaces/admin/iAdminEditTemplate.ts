export interface Exercise {
  id?: string;
  exerciseId?: string;
  name: string;
  sets: number;
  reps?: string;
  time?: string;
  weight?: number;
  rest?: string;
  notes?: string;
  image?: string;
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  notes?: string;
  nutritions?: Array<{
    label: string;
    value: number;
    unit?: string;
  }>;
}

export interface TemplateDay {
  dayNumber: number;
  exercises: Exercise[]; // For workout
  meals: Meal[]; // For diet
}

export interface WorkoutTemplate {
  _id: string;
  title: string;
  description?: string;
  image: string;
  type: 'one-time' | 'series';
  repetitions: number;
  goal?: string;
  difficultyLevel?: string;
  requiredEquipment: string[];
  isPublic: boolean;
  days: TemplateDay[];
}

export interface DietTemplate {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  duration?: number;
  goal?: string;
  bodyType?: string;
  days: TemplateDay[];

  // Legacy
  meals?: Meal[];
}