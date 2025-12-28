import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IExerciseUpdate, IWorkoutService, IWorkoutSessionPayload } from '../core/interfaces/services/IWorkoutService'
import { INotificationService } from '../core/interfaces/services/INotificationService'
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
  constructor(
    @inject(TYPES.WorkoutSessionRepository)
    private _sessionRepo: IWorkoutSessionRepository,
    @inject(TYPES.WorkoutDayRepository)
    private _workoutDayRepo: IWorkoutDayRepository,
    @inject(TYPES.IStreakService) private _streakService: IStreakService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService
  ) { }

  async createSession(payload: Partial<IWorkoutSession>): Promise<WorkoutSessionResponseDto> {
    if (!payload.userId && payload.givenBy === 'user') {
      throw new AppError(MESSAGES.MISSING_REQUIRED_FIELDS, STATUS_CODE.BAD_REQUEST);
    }
    const session = await this._sessionRepo.create(payload)

    if (payload.userId && payload.date && payload.time) {
      const workoutDate = new Date(`${payload.date}T${payload.time}`);
      const reminderTime = new Date(workoutDate.getTime() - 15 * 60000); // 15 mins before
      if (reminderTime > new Date()) {
        await this._notificationService.sendWorkoutReminder(
          payload.userId.toString(),
          payload.name!,
          reminderTime
        );
      }
    }

    if (payload.givenBy === 'user' || payload.givenBy === 'admin') {
      let day = await this._workoutDayRepo.findByUserAndDate(
        payload.userId?.toString() || '',
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

  async getSession(id: string): Promise<WorkoutSessionResponseDto> {
    const session = await this._sessionRepo.findById(id)
    if (!session) throw new AppError(MESSAGES.SESSION_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    return this.mapToSessionResponseDto(session as IWorkoutSession)
  }

  async getSessions(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<{ sessions: WorkoutSessionResponseDto[]; total: number; totalPages: number }> {
    const query: Record<string, unknown> = {
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
      sessions: sessions.map((session: unknown) => this.mapToSessionResponseDto(session as IWorkoutSession)),
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async trainerCreateSession(
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

    if (clientId && payload.date && payload.time) {
      const workoutDate = new Date(`${payload.date}T${payload.time}`);
      const reminderTime = new Date(workoutDate.getTime() - 15 * 60000);
      if (reminderTime > new Date()) {
        await this._notificationService.sendWorkoutReminder(
          clientId,
          payload.name!,
          reminderTime
        );
      }
    }

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

  async updateSession(id: string, payload: IWorkoutSessionPayload): Promise<WorkoutSessionResponseDto> {
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

    const updated = await this._sessionRepo.update(id, payload as unknown as Partial<IWorkoutSession>)
    if (!updated) throw new AppError('Session not found', STATUS_CODE.NOT_FOUND)

    if (payload.isDone) {
      await this._streakService.updateUserStreak(updated.userId!);

      // Trigger "Doing a workout" if it's being started (though isDone implies completion)
      // If we don't have separate 'start' event, we can notify on completion or similar.
      // But user specifically said "Doing a workout" (active). 
      // I'll assume they want an immediate notification when they interact with it in a certain way.
      // For now, I'll add an immediate notification in updateSession if it's NOT done yet (i.e. just started/modified).
    }

    if (!payload.isDone && (payload.exercises || payload.exerciseUpdates)) {
      await this._notificationService.createNotification({
        recipientId: updated.userId!.toString(),
        recipientRole: 'user',
        type: 'DOING_WORKOUT',
        title: 'Workout in Progress',
        message: `You are currently doing ${updated.name}. Keep it up!`,
        priority: 'medium',
        category: 'info'
      });
    }

    return this.mapToSessionResponseDto(updated)
  }

  async deleteSession(id: string) {
    await this._sessionRepo.delete(id)
  }

  async createDay(userId: string, date: string): Promise<WorkoutDayResponseDto> {
    const existing = await this._workoutDayRepo.findByUserAndDate(userId, date)
    if (existing) return this.mapToDayResponseDto(existing)

    const day = await this._workoutDayRepo.create({ userId, date, sessions: [] })
    return this.mapToDayResponseDto(day)
  }

  async addSessionToDay(userId: string, date: string, sessionId: string): Promise<WorkoutDayResponseDto> {
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

  async getDay(userId: string, date: string): Promise<WorkoutDayResponseDto | null> {
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
      templates: result.templates.map(template => this.mapToSessionResponseDto(template as IWorkoutSession)),
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

  private mapToDayResponseDto(day: unknown): WorkoutDayResponseDto {
    const d = day as {
      _id: { toString: () => string },
      userId: { toString: () => string },
      date: string,
      sessions: unknown[],
      createdAt: Date,
      updatedAt: Date
    };
    return {
      _id: d._id.toString(),
      userId: d.userId.toString(),
      date: d.date,
      sessions: Array.isArray(d.sessions)
        ? d.sessions.map((session: unknown) =>
          typeof session === 'string'
            ? { _id: session } as unknown as WorkoutSessionResponseDto
            : this.mapToSessionResponseDto(session as IWorkoutSession)
        )
        : [],
      createdAt: d.createdAt,
      updatedAt: d.updatedAt
    };
  }
}