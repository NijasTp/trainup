export interface IExercise {
  id: string;
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  time?: string;
  rest?: string;
  notes?: string;
}

export interface IWorkoutTemplate {
  _id: string;
  title: string;
  givenBy: "admin";
  days: { dayNumber: number; exercises: IExercise[] }[];
  // keeping exercises for compatibility if backend flattens it not seen in the dump
  exercises?: IExercise[];
  goal?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMeal {
  _id?: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string;
  nutritions?: { label: string; value: number; unit?: string }[];
  notes?: string;
}

export interface IDietTemplateDay {
  dayNumber: number;
  meals: TemplateMeal[];
}

export interface IDietTemplate {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  goal: string;
  bodyType: string;
  days: IDietTemplateDay[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateResponse {
  templates: (IWorkoutTemplate | IDietTemplate)[];
  total: number;
  page: number;
  totalPages: number;
}
