export interface UpdateProfileData {
  name: string;
  phone?: string | null;
  height?: number | null;
  age?: number | null;
  gender?: "male" | "female" | "other" | null;
  goals?: string[];
  activityLevel?: string | null;
  equipment?: boolean;
  isPrivate?: boolean;
  todaysWeight?: number | null;
  goalWeight?: number | null;
}