import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IExerciseUpdate, IWorkoutService, IWorkoutSessionPayload } from '../core/interfaces/services/IWorkoutService'
import { IWorkoutSessionRepository } from '../core/interfaces/repositories/IWorkoutSessionRepository'
import { IWorkoutDayRepository } from '../core/interfaces/repositories/IWorkoutDayRepository';
import { IWorkoutSession } from '../models/workout.model';
import { IStreakService } from '../core/interfaces/services/IStreakService';

@injectable()
export class WorkoutService implements IWorkoutService {
  constructor (
    @inject(TYPES.WorkoutSessionRepository)
    private _sessionRepo: IWorkoutSessionRepository,
    @inject(TYPES.WorkoutDayRepository)
    private _workoutDayRepo: IWorkoutDayRepository,
    @inject(TYPES.IStreakService) private _streakService : IStreakService
  ) {}

  async createSession (
    payload: Partial<IWorkoutSession>
  ): Promise<IWorkoutSession> {
    if (payload.notes && payload.givenBy !== 'trainer') {
      throw new Error('Only trainers can provide notes')
    }

    const session = await this._sessionRepo.create(payload)

    if (payload.givenBy === 'user') {
      let day = await this._workoutDayRepo.findByUserAndDate(
        payload.userId?.toString()!,
        payload.date!
      )

      if (!day) {
        day = await this._workoutDayRepo.create({
          userId: payload.userId!,
          date: payload.date!,
          sessions: []
        })
      }

      await this._workoutDayRepo.addSessionToDay(
        day._id.toString(),
        session._id.toString()
      )
    }

    return session
  }

  getSession (id: string) {
    return this._sessionRepo.findById(id)
  }
  async trainerCreateSession (
    trainerId: string,
    clientId: string,
    payload: Partial<IWorkoutSession>
  ): Promise<IWorkoutSession> {
    const sessionPayload = {
      ...payload,
      givenBy: 'trainer' as const,
      trainerId,
      userId: clientId
    }

    const session = await this._sessionRepo.create(sessionPayload)

    let day = await this._workoutDayRepo.findByUserAndDate(
      clientId,
      payload.date!
    )
    if (!day) {
      day = await this._workoutDayRepo.create({
        userId: clientId,
        date: payload.date!,
        sessions: []
      })
    }
    await this._workoutDayRepo.addSessionToDay(
      day._id.toString(),
      session._id.toString()
    )

    return session
  }

  async updateSession (id: string, payload: IWorkoutSessionPayload) {
    if (payload.notes && payload.givenBy && payload.givenBy !== 'trainer') {
      throw new Error('Only trainers can set notes')
    }

    if (payload.exerciseUpdates) {
      const session = await this._sessionRepo.findById(id)
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

    return this._sessionRepo.update(id, payload)
  }
  async deleteSession (id: string) {
    return this._sessionRepo.delete(id)
  }

  async createDay (userId: string, date: string) {
    const existing = await this._workoutDayRepo.findByUserAndDate(userId, date)
    if (existing) return existing
    return this._workoutDayRepo.create({ userId, date, sessions: [] })
  }

  async addSessionToDay (userId: string, date: string, sessionId: string) {
    let day = await this._workoutDayRepo.findByUserAndDate(userId, date)
    if (!day)
      day = await this._workoutDayRepo.create({
        userId,
        date,
        sessions: [sessionId]
      })
    else
      day = await this._workoutDayRepo.addSessionToDay(
        day._id.toString(),
        sessionId
      )
    return day
  }

  async getDay (userId: string, date: string) {
    return this._workoutDayRepo.findByUserAndDate(userId, date)
  }
}
