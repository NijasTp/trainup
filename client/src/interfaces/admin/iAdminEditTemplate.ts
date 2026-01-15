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
  duration?: number;
  goal?: string;
  difficulty?: string;
  equipment?: boolean;
  notes?: string;
  days: TemplateDay[];

  // Legacy/Flat support if needed temporarily, but main structure is days
  exercises?: Exercise[];
  name?: string; // handling legacy 'name' vs 'title'
}

export interface DietTemplate {
  _id: string;
  title: string;
  description?: string;
  duration?: number;
  goal?: string;
  bodyType?: string;
  days: TemplateDay[];

  // Legacy
  meals?: Meal[];
}