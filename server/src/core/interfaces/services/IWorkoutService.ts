import { IWorkoutSession } from "../../../models/workout.model";
import { 
  WorkoutSessionResponseDto, 
  WorkoutDayResponseDto, 
  GetAdminTemplatesResponseDto 
} from '../../../dtos/workout.dto'

export interface IExerciseUpdate {
  exerciseId: string;
  timeTaken: number;
}

export interface IWorkoutSessionPayload {
  name?: string;
  exercises?: any[];
  goal?: string;
  notes?: string;
  isDone?: boolean;
  exerciseUpdates?: IExerciseUpdate[];
  givenBy?: "trainer" | "admin" | "user";
}

export interface IWorkoutService {
  createSession(payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto>;
  getSession(id: string): Promise<WorkoutSessionResponseDto>;
  trainerCreateSession(
    trainerId: string,
    clientId: string,
    payload: Partial<IWorkoutSession>
  ): Promise<WorkoutSessionResponseDto>;
  updateSession(id: string, payload: IWorkoutSessionPayload): Promise<WorkoutSessionResponseDto>;
  deleteSession(id: string): Promise<void>;
  createDay(userId: string, date: string): Promise<WorkoutDayResponseDto>;
  addSessionToDay(userId: string, date: string, sessionId: string): Promise<WorkoutDayResponseDto>;
  getDay(userId: string, date: string): Promise<WorkoutDayResponseDto | null>;
  createAdminTemplate(payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto>;
  getAdminTemplates(page: number, limit: number, search: string): Promise<GetAdminTemplatesResponseDto>;
  updateAdminTemplate(id: string, payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto>;
}