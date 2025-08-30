export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user";
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  height?: number;
  weight?: number;
  assignedTrainer?: string;
  gymId?: string;
  isPrivate?: boolean;
  isBanned: boolean;
  streak?: number;
  xp?: number;
  achievements?: string[];
  createdAt: string;
  updatedAt: string;
}