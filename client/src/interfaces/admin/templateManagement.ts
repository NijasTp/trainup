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
  name: string;
  givenBy: "admin";
  exercises: IExercise[];
  goal?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMeal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  time: string;
  nutritions?: { label: string; value: number; unit?: string }[];
  notes?: string;
}

export interface IDietTemplate {
  _id: string;
  title: string;
  description?: string;
  createdBy: string;
  meals: TemplateMeal[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateResponse {
  templates: (IWorkoutTemplate | IDietTemplate)[];
  total: number;
  page: number;
  totalPages: number;
}
