import { injectable, inject } from 'inversify'
import { Types } from 'mongoose'
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
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository';
import { IWorkoutTemplateRepository } from '../core/interfaces/repositories/IWorkoutTemplateRepository';
import { WorkoutSnapshotModel } from '../models/workoutSnapshot.model';

interface WorkoutTemplateData {
  _id: Types.ObjectId | string;
  title: string;
  repetitions: number;
  goal?: string;
  createdByType: string;
  days: {
    dayNumber: number;
    exercises: {
      exerciseId: string;
      name: string;
      sets: number;
      reps: number;
      time?: string;
    }[];
  }[];
}
import { MESSAGES } from '../constants/messages.constants'

@injectable()
export class WorkoutService implements IWorkoutService {
  constructor(
    @inject(TYPES.WorkoutSessionRepository)
    private _sessionRepo: IWorkoutSessionRepository,
    @inject(TYPES.WorkoutDayRepository)
    private _workoutDayRepo: IWorkoutDayRepository,
    @inject(TYPES.IStreakService) private _streakService: IStreakService,
    @inject(TYPES.INotificationService) private _notificationService: INotificationService,
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.WorkoutTemplateRepository) private _workoutTemplateRepo: IWorkoutTemplateRepository
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

    if (payload.userId && payload.date) {
      let day = await this._workoutDayRepo.findByUserAndDate(
        payload.userId.toString(),
        payload.date
      )

      if (!day) {
        day = await this._workoutDayRepo.create({
          userId: payload.userId,
          date: payload.date,
          sessions: []
        })
      }

      await this._workoutDayRepo.addSessionToDay(
        day._id.toString(),
        session._id.toString()
      )
    }

    // Set source based on context if not provided
    if (payload.givenBy === 'admin') {
      session.source = 'template';
      await session.save();
    } else if (payload.givenBy === 'trainer') {
      session.source = 'trainer';
      await session.save();
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

    session.source = 'trainer';
    await session.save();

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
    const mergedDay = await this.getDay(userId, date);
    if (mergedDay && mergedDay._id && mergedDay._id !== "") {
      return mergedDay;
    }

    let day = await this._workoutDayRepo.findByUserAndDate(userId, date);
    if (!day) {
      day = await this._workoutDayRepo.create({ userId, date, sessions: [] });
    }

    const newMergedDay = await this.getDay(userId, date);
    return newMergedDay || this.mapToDayResponseDto(day);
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
    const user = await this._userRepo.findById(userId);
    let day = await this._workoutDayRepo.findByUserAndDate(userId, date);

    let templateInfo: Partial<WorkoutDayResponseDto> = {};
    const virtualSessions: WorkoutSessionResponseDto[] = [];

    // Consolidate active templates (new array + legacy field)
    const activeTemplates = [...(user?.activeWorkoutTemplates || [])];
    if (user?.activeWorkoutTemplate && user.workoutTemplateStartDate) {
      // Avoid duplicates if legacy is actively migrated (though simplified here)
      if (!activeTemplates.some(t => t.templateId.toString() === user.activeWorkoutTemplate!.toString())) {
        activeTemplates.push({
          templateId: user.activeWorkoutTemplate,
          startDate: user.workoutTemplateStartDate
        });
      }
    }

    if (activeTemplates.length > 0) {
      for (const activeDetails of activeTemplates) {
        // Try to find as snapshot first
        let templateData: WorkoutTemplateData | null = await (WorkoutSnapshotModel.findById(activeDetails.templateId.toString()) as any);

        // Fallback to template if snapshot not found (for legacy support)
        if (!templateData) {
          templateData = await (this._workoutTemplateRepo.findById(activeDetails.templateId.toString()) as any);
        }

        if (templateData) {
          const scheduleType = (activeDetails as any).scheduleType || (templateData as any).scheduleType || 'contiguous';
          const weeklyDays = (activeDetails as any).weeklyDays || (templateData as any).weeklyDays || [];

          let diffDays = -1;
          const startDate = new Date(activeDetails.startDate);
          startDate.setHours(0, 0, 0, 0);
          const currentDate = new Date(date);
          currentDate.setHours(0, 0, 0, 0);

          if (scheduleType === 'weekly' && weeklyDays.length > 0) {
            // Check if currentDate is a training day
            if (weeklyDays.includes(currentDate.getDay())) {
              // Count training days between startDate and currentDate (inclusive)
              let count = 0;
              const tempDate = new Date(startDate);
              while (tempDate <= currentDate) {
                if (weeklyDays.includes(tempDate.getDay())) {
                  count++;
                }
                tempDate.setDate(tempDate.getDate() + 1);
              }
              if (count > 0) {
                diffDays = count - 1;
              }
            }
          } else {
            const diffTime = currentDate.getTime() - startDate.getTime();
            diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          }

          // Calculate total duration based on repetitions
          const repetitions = templateData.repetitions || 1;
          const totalDays = templateData.days.length * repetitions;

          if (diffDays >= 0 && diffDays < totalDays) {
            const dayNumber = (diffDays % templateData.days.length) + 1;
            const templateDay = templateData.days.find((d: { dayNumber: number }) => d.dayNumber === dayNumber);

            templateInfo = {
              templateDay: diffDays + 1, // Overall day of the program
              templateName: templateData.title,
              templateDuration: totalDays
            };

            if (templateDay && templateDay.exercises.length > 0) {
              const virtualId = `template-${templateData._id}-${dayNumber}-${date}`;
              const alreadyExists = day?.sessions?.some(s => {
                const session = s as IWorkoutSession;
                if (typeof s === 'string') return false;
                return session.notes?.includes(`From active template: ${templateData.title}`) || session.name === `${templateData.title} - Day ${dayNumber}`;
              });


              if (!alreadyExists) {
                virtualSessions.push({
                  _id: virtualId,
                  name: `${templateData.title} - Day ${dayNumber}`,
                  givenBy: templateData.createdByType === 'Trainer' ? 'trainer' : 'admin',
                  date: date,
                  time: "08:00", // Default virtual time
                  exercises: templateDay.exercises.map((ex: any) => ({
                    id: ex.exerciseId,
                    name: ex.name,
                    sets: ex.sets,
                    reps: ex.reps !== undefined ? String(ex.reps) : undefined,
                    time: ex.time
                  })),
                  goal: templateData.goal || '',
                  notes: `From active template: ${templateData.title}`,
                  isDone: false,
                  templateId: templateData._id.toString(),
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
              }
            }
          }
        }
      }
    }

    if (!day) {
      if (virtualSessions.length === 0 && !templateInfo.templateDay) return null;

      return {
        _id: "",
        userId,
        date,
        sessions: virtualSessions,
        ...templateInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as WorkoutDayResponseDto;
    }

    const response = this.mapToDayResponseDto(day);
    if (virtualSessions.length > 0) {
      response.sessions.push(...virtualSessions);
    }
    return { ...response, ...templateInfo };
  }
  
  async getWorkoutHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    source?: string
  ): Promise<{ sessions: WorkoutSessionResponseDto[]; total: number; totalPages: number }> {
    const query: Record<string, unknown> = { 
      userId, 
      $or: [
        { isDone: true }, 
        { completedAt: { $exists: true, $ne: null } }
      ]
    };
    if (source) query.source = source;

    const { sessions, total } = await this._sessionRepo.findSessions(query, page, limit);

    return {
      sessions: sessions.map((session: IWorkoutSession) => this.mapToSessionResponseDto(session)),
      total,
      totalPages: Math.ceil(total / limit)
    };
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
      source: (session.source as unknown as string) === 'direct' ? 'user' : session.source || 'user',
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