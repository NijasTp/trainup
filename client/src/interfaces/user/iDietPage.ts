
export interface Meal {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  isEaten: boolean;
  source: "trainer" | "user";
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
  createdAt: string;
  updatedAt: string;
  __v: number;
}
