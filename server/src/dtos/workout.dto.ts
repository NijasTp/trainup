export class CreateSessionRequestDto {
  name: string;
  date?: string;
  time?: string;
  exercises: ExerciseDto[];
  goal?: string;
  notes?: string;
  givenBy: "trainer" | "admin" | "user";
}

export class ExerciseDto {
  id: string;
  name: string;
  image?: string;
  sets: number;
  reps?: string;
  time?: string;
  timeTaken?: number;
}

export class WorkoutSessionResponseDto {
  _id: string;
  name: string;
  givenBy: "trainer" | "admin" | "user";
  trainerId?: string;
  userId?: string;
  date?: string;
  time?: string;
  exercises: ExerciseDto[];
  goal?: string;
  notes?: string;
  isDone?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetSessionParamsDto {
  id: string;
}

export class UpdateSessionRequestDto {
  name?: string;
  exercises?: ExerciseDto[];
  goal?: string;
  notes?: string;
  isDone?: boolean;
  exerciseUpdates?: ExerciseUpdateDto[];
  givenBy?: "trainer" | "admin" | "user";
}

export class ExerciseUpdateDto {
  exerciseId: string;
  timeTaken: number;
}

export class UpdateSessionParamsDto {
  id: string;
}

export class DeleteSessionParamsDto {
  id: string;
}

export class CreateOrGetDayRequestDto {
  date: string;
}

export class WorkoutDayResponseDto {
  _id: string;
  userId: string;
  date: string;
  sessions: WorkoutSessionResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class AddSessionToDayRequestDto {
  sessionId: string;
}

export class AddSessionToDayParamsDto {
  date: string;
}

export class TrainerCreateSessionRequestDto {
  clientId: string;
  name: string;
  date: string;
  time: string;
  goal?: string;
  notes?: string;
}

export class GetDayParamsDto {
  date: string;
}

export class TrainerGetDayQueryDto {
  clientId: string;
}

export class CreateAdminTemplateRequestDto {
  name: string;
  exercises: ExerciseDto[];
  goal?: string;
  notes?: string;
}

export class GetAdminTemplatesQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export class GetAdminTemplatesResponseDto {
  templates: WorkoutSessionResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class UpdateAdminTemplateRequestDto {
  name?: string;
  exercises?: ExerciseDto[];
  goal?: string;
  notes?: string;
}

export class UpdateAdminTemplateParamsDto {
  id: string;
}

export class DeleteAdminTemplateParamsDto {
  id: string;
}