export interface Exercise {
  id: string;
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

export interface WorkoutTemplate {
  _id: string;
  name: string;
  goal?: string;
  notes?: string;
  exercises: Exercise[];
}

export interface DietTemplate {
  _id: string;
  title: string;
  description?: string;
  meals: Meal[];
}