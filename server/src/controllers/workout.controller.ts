import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { STATUS_CODE } from '../constants/status'
import TYPES from '../core/types/types'
import { IWorkoutService } from '../core/interfaces/services/IWorkoutService'
import { JwtPayload } from '../core/interfaces/services/IJwtService'
import { MESSAGES } from '../constants/messages'
import { ROLE } from '../constants/role'
import {
  CreateSessionRequestDto,
  WorkoutSessionResponseDto,
  GetSessionParamsDto,
  UpdateSessionRequestDto,
  UpdateSessionParamsDto,
  DeleteSessionParamsDto,
  CreateOrGetDayRequestDto,
  WorkoutDayResponseDto,
  AddSessionToDayRequestDto,
  AddSessionToDayParamsDto,
  TrainerCreateSessionRequestDto,
  GetDayParamsDto,
  TrainerGetDayQueryDto,
  CreateAdminTemplateRequestDto,
  GetAdminTemplatesQueryDto,
  GetAdminTemplatesResponseDto,
  UpdateAdminTemplateRequestDto,
  UpdateAdminTemplateParamsDto,
  DeleteAdminTemplateParamsDto
} from '../dtos/workout.dto'

@injectable()
export class WorkoutController {
  constructor (
    @inject(TYPES.WorkoutService) private _workoutService: IWorkoutService
  ) {}

  async createSession (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      const dto: CreateSessionRequestDto = req.body
      const payload = {
        ...dto,
        userId: jwtUser?.role === ROLE.USER ? jwtUser.id : undefined,
        trainerId: jwtUser?.role === ROLE.TRAINER ? jwtUser.id : undefined,
        givenBy: dto.givenBy || jwtUser?.role
      }

      const created: WorkoutSessionResponseDto =
        await this._workoutService.createSession(payload)
      res.status(STATUS_CODE.CREATED).json(created)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async getSession (req: Request, res: Response): Promise<void> {
    try {
      const dto: GetSessionParamsDto = {id:req.params.id}
      const session: WorkoutSessionResponseDto =
        await this._workoutService.getSession(dto.id)
      if (!session) {
        res
          .status(STATUS_CODE.NOT_FOUND)
          .json({ error: MESSAGES.SESSION_NOT_FOUND })
        return
      }
      res.status(STATUS_CODE.OK).json(session)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.SESSION_NOT_FOUND })
    }
  }

  async updateSession (req: Request, res: Response): Promise<void> {
    try {
      const paramsDto: UpdateSessionParamsDto = { id: req.params.id }
      const dto: UpdateSessionRequestDto = req.body
      const updated: WorkoutSessionResponseDto =
        await this._workoutService.updateSession(paramsDto.id, dto)
      if (!updated) {
        res
          .status(STATUS_CODE.NOT_FOUND)
          .json({ error: MESSAGES.SESSION_NOT_FOUND })
        return
      }
      res.status(STATUS_CODE.OK).json(updated)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async deleteSession (req: Request, res: Response): Promise<void> {
    try {
      const dto: DeleteSessionParamsDto = { id: req.params.id }
      await this._workoutService.deleteSession(dto.id)
      res.status(STATUS_CODE.NO_CONTENT).end()
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async getSessions (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      const {
        page = '1',
        limit = '10',
        search = ''
      } = req.query as {
        page?: string
        limit?: string
        search?: string
      }
      const result = await this._workoutService.getSessions(
        jwtUser.id,
        parseInt(page, 10),
        parseInt(limit, 10),
        search
      )
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async createOrGetDay (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      const userId = jwtUser.id
      const dto: CreateOrGetDayRequestDto = req.body
      const day: WorkoutDayResponseDto = await this._workoutService.createDay(
        userId,
        dto.date
      )
      res.status(STATUS_CODE.OK).json(day)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_DAY })
    }
  }

  async addSessionToDay (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      const userId = jwtUser.id
      const paramsDto: AddSessionToDayParamsDto = { date: req.params.date }
      const dto: AddSessionToDayRequestDto = req.body
      const day: WorkoutDayResponseDto =
        await this._workoutService.addSessionToDay(
          userId,
          paramsDto.date,
          dto.sessionId
        )
      res.status(STATUS_CODE.CREATED).json(day)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async trainerCreateSession (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      if (!jwtUser || jwtUser.role !== 'trainer') {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ error: MESSAGES.TRAINER_REQUIRED })
        return
      }
      const dto: TrainerCreateSessionRequestDto = req.body
      if (!dto.clientId || !dto.name || !dto.date || !dto.time) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: MESSAGES.MISSING_REQUIRED_FIELDS })
        return
      }
      const session: WorkoutSessionResponseDto =
        await this._workoutService.trainerCreateSession(
          jwtUser.id,
          dto.clientId,
          {
            name: dto.name,
            date: dto.date,
            time: dto.time,
            goal: dto.goal,
            notes: dto.notes
          }
        )
      res.status(STATUS_CODE.CREATED).json(session)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async getDay (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      const userId = jwtUser.id
      const dto: GetDayParamsDto = { date: req.params.date }
      const day: WorkoutDayResponseDto | null =
        await this._workoutService.getDay(userId, dto.date)

      if (!day) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.status(STATUS_CODE.OK).json(day)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_DAY })
    }
  }

  async trainerGetDay (req: Request, res: Response): Promise<void> {
    try {
      const queryDto: TrainerGetDayQueryDto = {
        clientId: req.query.clientId as string
      }
      const userId = queryDto.clientId
      if (!userId) {
        res
          .status(STATUS_CODE.BAD_REQUEST)
          .json({ error: MESSAGES.INVALID_USER_ID })
        return
      }
      const paramsDto: GetDayParamsDto = { date: req.params.date }
      const day: WorkoutDayResponseDto | null =
        await this._workoutService.getDay(userId, paramsDto.date)

      if (!day) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
        return
      }
      res.status(STATUS_CODE.OK).json(day)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_DAY })
    }
  }

  async createAdminTemplate (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      if (jwtUser?.role !== 'admin') {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ error: MESSAGES.ADMIN_REQUIRED })
        return
      }
      const dto: CreateAdminTemplateRequestDto = req.body
      const template: WorkoutSessionResponseDto =
        await this._workoutService.createAdminTemplate(dto)
      res.status(STATUS_CODE.CREATED).json(template)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async getAdminTemplates (req: Request, res: Response) {
    try {
      const dto: GetAdminTemplatesQueryDto = req.query
      const page = Number(dto.page) || 1
      const limit = Number(dto.limit) || 5
      const search = String(dto.search || '')
      const result: GetAdminTemplatesResponseDto =
        await this._workoutService.getAdminTemplates(page, limit, search)
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async updateAdminTemplate (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      if (jwtUser?.role !== 'admin') {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ error: MESSAGES.ADMIN_REQUIRED })
        return
      }
      const paramsDto: UpdateAdminTemplateParamsDto = { id: req.params.id }
      const dto: UpdateAdminTemplateRequestDto = req.body
      const updated: WorkoutSessionResponseDto =
        await this._workoutService.updateAdminTemplate(paramsDto.id, dto)
      res.status(STATUS_CODE.OK).json(updated)
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }

  async deleteAdminTemplate (req: Request, res: Response): Promise<void> {
    try {
      const jwtUser = req.user as JwtPayload
      if (jwtUser?.role !== 'admin') {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ error: MESSAGES.ADMIN_REQUIRED })
        return
      }
      const dto: DeleteAdminTemplateParamsDto = { id: req.params.id }
      await this._workoutService.deleteSession(dto.id)
      res.status(STATUS_CODE.NO_CONTENT).end()
    } catch (err) {
      const error = err as Error
      res
        .status(STATUS_CODE.BAD_REQUEST)
        .json({ error: error.message || MESSAGES.INVALID_REQUEST })
    }
  }
}
