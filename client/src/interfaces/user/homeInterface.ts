
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  image?: string;
  timeTaken?: number;
}

export interface WorkoutSession {
  _id: string;
  name: string;
  givenBy: "trainer" | "user";
  trainerId?: string;
  date: string;
  time: string;
  exercises: Exercise[] | [];
  goal?: string;
  notes?: string;
  isDone?: boolean;
}

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
  nutritions: any[] | [];
  eatenTime?: string;
  image?: string;
  description?: string;
}

export interface DietResponse {
  _id: string;
  user: string;
  date: string;
  meals: Meal[] | [];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Trainer {
  _id: string;
  name: string;
  specialty: string;
  location: string;
  price: string;
  rating: number;
  bio: string;
  profileImage: string;
}