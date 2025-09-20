import { IWorkoutDay } from "../../../models/workoutDay.model";

export interface IWorkoutDayRepository {
  create(day: Partial<IWorkoutDay>): Promise<IWorkoutDay>;
  findById(id: string): Promise<IWorkoutDay | null>;
  findByUserAndDate(userId: string, date: string): Promise<IWorkoutDay | null>;
  findByUserId (userId: string, skip :number, limit : 10): Promise<IWorkoutDay[]>;
  addSessionToDay(dayId: string, sessionId: string): Promise<IWorkoutDay | null>;
  removeSessionFromDay(dayId: string, sessionId: string): Promise<IWorkoutDay | null>;
  update(dayId: string, update: Partial<IWorkoutDay>): Promise<IWorkoutDay | null>;
}