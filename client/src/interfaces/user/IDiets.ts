
export interface Meal {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  isEaten: boolean;
  source: "trainer" | "user" | "admin";
  usedBy: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
  nutritions: any[];
  eatenTime?: string;
  image?: string;
  description?: string;
}

export interface ApiResponse {
  _id: string;
  user: string;
  date: string;
  meals: Meal[];
  templateDay?: number;
  templateName?: string;
  templateDuration?: number;
  templateMeals?: Meal[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
