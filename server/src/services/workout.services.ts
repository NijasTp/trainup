// src/services/WorkoutService.ts
import { injectable, inject } from "inversify";
import TYPES from "../core/types/types";
import { IWorkoutService } from "../core/interfaces/services/IWorkoutService";
import { IWorkoutSessionRepository } from "../core/interfaces/repositories/IWorkoutSessionRepository";
import { IWorkoutDayRepository } from "../core/interfaces/repositories/IWorkoutDayRepository";
import { IWorkoutSession } from "../models/workout.model";
import { IWorkoutDay } from "../models/workoutDay.model";

@injectable()
export class WorkoutService implements IWorkoutService {
    constructor(
        @inject(TYPES.WorkoutSessionRepository) private sessionRepo: IWorkoutSessionRepository,
        @inject(TYPES.WorkoutDayRepository) private dayRepo: IWorkoutDayRepository
    ) { }

    async createSession(payload: Partial<IWorkoutSession>): Promise<IWorkoutSession> {
        // business rule: if notes provided, givenBy must be 'trainer'
        if (payload.notes && payload.givenBy !== "trainer") {
            throw new Error("Only trainers can provide notes");
        }
        return this.sessionRepo.create(payload);
    }

    async updateSession(id: string, payload: Partial<IWorkoutSession>) {
        if (payload.notes && payload.givenBy && payload.givenBy !== "trainer") {
            throw new Error("Only trainers can set notes");
        }
        return this.sessionRepo.update(id, payload);
    }

    async deleteSession(id: string) {
        return this.sessionRepo.delete(id);
    }

    async createDay(userId: string, date: string) {
        // if already exists, return it
        const existing = await this.dayRepo.findByUserAndDate(userId, date);
        if (existing) return existing;
        return this.dayRepo.create({ userId, date, sessions: [] });
    }

    async addSessionToDay(userId: string, date: string, sessionId: string) {
        // ensure day exists and belongs to user
        let day = await this.dayRepo.findByUserAndDate(userId, date);
        if (!day) day = await this.dayRepo.create({ userId, date, sessions: [sessionId] });
        else day = await this.dayRepo.addSessionToDay(day._id.toString(), sessionId);
        return day;
    }

    async getDay(userId: string, date: string) {
        return this.dayRepo.findByUserAndDate(userId, date);
    }
}
