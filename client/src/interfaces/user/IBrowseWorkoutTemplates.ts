export type WorkoutTemplate = {
  _id: string;
  name: string;
  exercises: { id: string; name: string; image: string; sets: number; reps: string }[];
  goal: string;
  notes: string;
  createdAt: string;
};
