export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  nutritions?: { label: string; value: string; unit?: string }[];
  notes?: string;
}

export interface DietTemplate {
  _id: string;
  title: string;
  description?: string;
  templates: Meal[];
  createdAt: string;
  notes?: string;
}