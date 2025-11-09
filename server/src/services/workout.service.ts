import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IExerciseUpdate, IWorkoutService, IWorkoutSessionPayload } from '../core/interfaces/services/IWorkoutService'
import { IWorkoutSessionRepository } from '../core/interfaces/repositories/IWorkoutSessionRepository'
import { IWorkoutDayRepository } from '../core/interfaces/repositories/IWorkoutDayRepository';
import { IWorkoutSession } from '../models/workout.model';
import { IStreakService } from '../core/interfaces/services/IStreakService';
import { WorkoutSessionResponseDto, WorkoutDayResponseDto, GetAdminTemplatesResponseDto } from '../dtos/workout.dto'
import { AppError } from '../utils/appError.util';
import { STATUS_CODE } from '../constants/status'
import { MESSAGES } from '../constants/messages.constants'

@injectable()
export class WorkoutService implements IWorkoutService {
  constructor (
    @inject(TYPES.WorkoutSessionRepository)
    private _sessionRepo: IWorkoutSessionRepository,
    @inject(TYPES.WorkoutDayRepository)
    private _workoutDayRepo: IWorkoutDayRepository,
    @inject(TYPES.IStreakService) private _streakService : IStreakService
  ) {}

  async createSession (payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto> {
    if (!payload.userId && payload.givenBy === 'user') {
      throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
    }
    const session = await this._sessionRepo.create(payload)

    if (payload.givenBy === 'user' || payload.givenBy === 'admin') {
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
    return this.mapToSessionResponseDto(session)
  }

  async getSession (id: string): Promise<WorkoutSessionResponseDto> {
    const session = await this._sessionRepo.findById(id)
    if (!session) throw new AppError(MESSAGES.SESSION_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    return this.mapToSessionResponseDto(session as any)
  }

  async getSessions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<{ sessions: WorkoutSessionResponseDto[]; total: number; totalPages: number }> {
    const query: any = {
      $or: [
        { userId },
        { givenBy: 'user', userId },
        { givenBy: 'trainer', userId },
        { givenBy: 'admin' }
      ],
      date: { $exists: true }
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const { sessions, total } = await this._sessionRepo.findSessions(query, page, limit);

    return {
      sessions: sessions.map((session: IWorkoutSession) => this.mapToSessionResponseDto(session)),
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async trainerCreateSession (
    trainerId: string,
    clientId: string,
    payload: Partial<IWorkoutSession>
  ): Promise<WorkoutSessionResponseDto> {
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

    return this.mapToSessionResponseDto(session)
  }

  async updateSession (id: string, payload: IWorkoutSessionPayload): Promise<WorkoutSessionResponseDto> {
    if (payload.notes && payload.givenBy && payload.givenBy !== 'trainer') {
      throw new AppError('Only trainers can set notes', STATUS_CODE.FORBIDDEN)
    }

    if (payload.exerciseUpdates) {
      const session = await this._sessionRepo.findById(id)
      if (!session) throw new AppError('Session not found', STATUS_CODE.NOT_FOUND)

      const updatedExercises = session.exercises.map(exercise => {
        const update = payload.exerciseUpdates?.find(
          (eu: IExerciseUpdate) => eu.exerciseId === exercise.id
        )
        return update ? { ...exercise, timeTaken: update.timeTaken } : exercise
      })
      payload.exercises = updatedExercises
      delete payload.exerciseUpdates
    }

    const updated = await this._sessionRepo.update(id, payload)
    if (!updated) throw new AppError('Session not found', STATUS_CODE.NOT_FOUND)
    return this.mapToSessionResponseDto(updated)
  }

  async deleteSession (id: string) {
    const success = await this._sessionRepo.delete(id)
   
  }

  async createDay (userId: string, date: string): Promise<WorkoutDayResponseDto> {
    const existing = await this._workoutDayRepo.findByUserAndDate(userId, date)
    if (existing) return this.mapToDayResponseDto(existing)

    const day = await this._workoutDayRepo.create({ userId, date, sessions: [] })
    return this.mapToDayResponseDto(day)
  }

  async addSessionToDay (userId: string, date: string, sessionId: string): Promise<WorkoutDayResponseDto> {
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
    if (!day) throw new AppError(MESSAGES.INVALID_DAY, STATUS_CODE.BAD_REQUEST)
    return this.mapToDayResponseDto(day!)
  }

  async getDay (userId: string, date: string): Promise<WorkoutDayResponseDto | null> {
    const day = await this._workoutDayRepo.findByUserAndDate(userId, date)
    return day ? this.mapToDayResponseDto(day) : null
  }

  async createAdminTemplate(payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto> {
    const template = await this._sessionRepo.create({
      ...payload,
      givenBy: 'admin',
      date: undefined,
      userId: undefined,
      trainerId: undefined,
      time: undefined,
      isDone: false,
    });
    return this.mapToSessionResponseDto(template);
  }

  async getAdminTemplates(page: number, limit: number, search: string): Promise<GetAdminTemplatesResponseDto> {
    const result = await this._sessionRepo.findAdminTemplates(page, limit, search);
    return {
      templates: result.templates.map(template => this.mapToSessionResponseDto(template as any)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    };
  }

  async updateAdminTemplate(id: string, payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto> {
    const session = await this._sessionRepo.findById(id);
    if (!session || session.givenBy !== 'admin') {
      throw new AppError('Template not found or not an admin template', STATUS_CODE.NOT_FOUND);
    }
    const updated = await this._sessionRepo.update(id, {
      ...payload,
      date: undefined,
      userId: undefined,
      trainerId: undefined,
      time: undefined,
    });
    if (!updated) throw new AppError('Failed to update template', STATUS_CODE.INTERNAL_SERVER_ERROR)
    return this.mapToSessionResponseDto(updated);
  }

  private mapToSessionResponseDto(session: IWorkoutSession): WorkoutSessionResponseDto {
    return {
      _id: session._id.toString(),
      name: session.name,
      givenBy: session.givenBy,
      trainerId: session.trainerId?.toString(),
      userId: session.userId?.toString(),
      date: session.date,
      time: session.time,
      exercises: session.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        image: exercise.image,
        sets: exercise.sets,
        reps: exercise.reps,
        time: exercise.time,
        timeTaken: exercise.timeTaken
      })),
      goal: session.goal,
      notes: session.notes,
      isDone: session.isDone,
      createdAt: session.createdAt!,
      updatedAt: session.updatedAt!
    };
  }

  private mapToDayResponseDto(day: any): WorkoutDayResponseDto {
    return {
      _id: day._id.toString(),
      userId: day.userId.toString(),
      date: day.date,
      sessions: Array.isArray(day.sessions)
        ? day.sessions.map((session: any) =>
            typeof session === 'string'
              ? { _id: session } as any
              : this.mapToSessionResponseDto(session)
          )
        : [],
      createdAt: day.createdAt,
      updatedAt: day.updatedAt
    };
  }
}