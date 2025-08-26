// src/services/WorkoutService.ts
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IWorkoutService } from '../core/interfaces/services/IWorkoutService'
import { IWorkoutSessionRepository } from '../core/interfaces/repositories/IWorkoutSessionRepository'
import { IWorkoutDayRepository } from '../core/interfaces/repositories/IWorkoutDayRepository'
import { IWorkoutSession } from '../models/workout.model'
import { IWorkoutDay } from '../models/workoutDay.model'

interface IExerciseUpdate {
  exerciseId: string
  timeTaken: number
}

interface IWorkoutSessionPayload extends Partial<IWorkoutSession> {
  exerciseUpdates?: IExerciseUpdate[]
}

@injectable()
export class WorkoutService implements IWorkoutService {
  constructor (
    @inject(TYPES.WorkoutSessionRepository)
    private sessionRepo: IWorkoutSessionRepository,
    @inject(TYPES.WorkoutDayRepository)
    private workoutDayRepo: IWorkoutDayRepository
  ) {}

  async createSession (
    payload: Partial<IWorkoutSession>
  ): Promise<IWorkoutSession> {
    if (payload.notes && payload.givenBy !== 'trainer') {
      throw new Error('Only trainers can provide notes')
    }

    const session = await this.sessionRepo.create(payload)

    if (payload.givenBy === 'user') {
      let day = await this.workoutDayRepo.findByUserAndDate(
        payload.userId?.toString()!,
        payload.date!
      )

      if (!day) {
        day = await this.workoutDayRepo.create({
          userId: payload.userId!,
          date: payload.date!,
          sessions: []
        })
      }

      await this.workoutDayRepo.addSessionToDay(
        day._id.toString(),
        session._id.toString()
      )
    }

    return session
  }

  getSession (id: string) {
    return this.sessionRepo.findById(id)
  }
    async trainerCreateSession(
    trainerId: string,
    clientId: string,
    payload: Partial<IWorkoutSession>
  ): Promise<IWorkoutSession> {
    const sessionPayload = {
      ...payload,
      givenBy: "trainer" as const,
      trainerId,
      userId: clientId,
    };

    const session = await this.sessionRepo.create(sessionPayload);

    let day = await this.workoutDayRepo.findByUserAndDate(clientId, payload.date!);
    if (!day) {
      day = await this.workoutDayRepo.create({
        userId: clientId,
        date: payload.date!,
        sessions: [],
      });
    }
    await this.workoutDayRepo.addSessionToDay(day._id.toString(), session._id.toString());

    return session;
  }

  async updateSession (id: string, payload: IWorkoutSessionPayload) {
    if (payload.notes && payload.givenBy && payload.givenBy !== 'trainer') {
      throw new Error('Only trainers can set notes')
    }

    if (payload.exerciseUpdates) {
      const session = await this.sessionRepo.findById(id)
      if (!session) throw new Error('Session not found')


      const updatedExercises = session.exercises.map(exercise => {
        const update = payload.exerciseUpdates?.find(
          (eu: IExerciseUpdate) => eu.exerciseId === exercise.id
        )
        return update ? { ...exercise, timeTaken: update.timeTaken } : exercise
      })
      payload.exercises = updatedExercises
      delete payload.exerciseUpdates
    }

    return this.sessionRepo.update(id, payload)
  }
  async deleteSession (id: string) {
    return this.sessionRepo.delete(id)
  }

  async createDay (userId: string, date: string) {
    const existing = await this.workoutDayRepo.findByUserAndDate(userId, date)
    if (existing) return existing
    return this.workoutDayRepo.create({ userId, date, sessions: [] })
  }

  async addSessionToDay (userId: string, date: string, sessionId: string) {
    let day = await this.workoutDayRepo.findByUserAndDate(userId, date)
    if (!day)
      day = await this.workoutDayRepo.create({
        userId,
        date,
        sessions: [sessionId]
      })
    else
      day = await this.workoutDayRepo.addSessionToDay(
        day._id.toString(),
        sessionId
      )
    return day
  }

  async getDay (userId: string, date: string) {
    return this.workoutDayRepo.findByUserAndDate(userId, date)
  }
}
