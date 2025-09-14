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

  createSession = async (req: Request, res: Response) => {
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
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  getSession = async (req: Request, res: Response) => {
    try {
      const dto: GetSessionParamsDto = req.params as any
      const session: WorkoutSessionResponseDto =
        await this._workoutService.getSession(dto.id)
      res.status(STATUS_CODE.OK).json(session)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  updateSession = async (req: Request, res: Response) => {
    try {
      const paramsDto: UpdateSessionParamsDto = req.params as any
      const dto: UpdateSessionRequestDto = req.body
      const updated: WorkoutSessionResponseDto =
        await this._workoutService.updateSession(paramsDto.id, dto as any)
      res.status(STATUS_CODE.CREATED).json(updated)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  deleteSession = async (req: Request, res: Response) => {
    try {
      const dto: DeleteSessionParamsDto = req.params as any
      await this._workoutService.deleteSession(dto.id)
      res.status(STATUS_CODE.NO_CONTENT).end()
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  createOrGetDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const userId = jwtUser!.id
      const dto: CreateOrGetDayRequestDto = req.body
      const day: WorkoutDayResponseDto = await this._workoutService.createDay(
        userId,
        dto.date
      )
      res.status(STATUS_CODE.OK).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  addSessionToDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload
      const userId = jwtUser!.id
      const paramsDto: AddSessionToDayParamsDto = req.params as any
      const dto: AddSessionToDayRequestDto = req.body
      const day: WorkoutDayResponseDto =
        await this._workoutService.addSessionToDay(
          userId,
          paramsDto.date,
          dto.sessionId
        )
      res.status(STATUS_CODE.CREATED).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  async trainerCreateSession (req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload | undefined
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
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  getDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const userId = jwtUser!.id
      const dto: GetDayParamsDto = req.params as any
      const day: WorkoutDayResponseDto | null =
        await this._workoutService.getDay(userId, dto.date)

      if (!day) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
      }
      res.status(STATUS_CODE.OK).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  trainerGetDay = async (req: Request, res: Response) => {
    try {
      const queryDto: TrainerGetDayQueryDto = req.query as any
      const userId = queryDto.clientId
      const paramsDto: GetDayParamsDto = req.params as any
      const day: WorkoutDayResponseDto | null =
        await this._workoutService.getDay(userId, paramsDto.date)

      if (!day) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
      }
      res.status(STATUS_CODE.OK).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  async createAdminTemplate (req: Request, res: Response) {
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
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  async getAdminTemplates (req: Request, res: Response) {
    try {
      const dto: GetAdminTemplatesQueryDto = req.query as any
      const page = Number(dto.page) || 1
      const limit = Number(dto.limit) || 5
      const search = dto.search || ''
      const result: GetAdminTemplatesResponseDto =
        await this._workoutService.getAdminTemplates(page, limit, search)
      res.status(STATUS_CODE.OK).json(result)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  async updateAdminTemplate (req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      if (jwtUser?.role !== 'admin') {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ error: MESSAGES.ADMIN_REQUIRED })
        return
      }
      const paramsDto: UpdateAdminTemplateParamsDto = req.params as any
      const dto: UpdateAdminTemplateRequestDto = req.body
      const updated: WorkoutSessionResponseDto =
        await this._workoutService.updateAdminTemplate(paramsDto.id, dto)
      res.status(STATUS_CODE.OK).json(updated)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  async deleteAdminTemplate (req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      if (jwtUser?.role !== 'admin') {
        res
          .status(STATUS_CODE.UNAUTHORIZED)
          .json({ error: MESSAGES.ADMIN_REQUIRED })
        return
      }
      const dto: DeleteAdminTemplateParamsDto = req.params as any
      await this._workoutService.deleteSession(dto.id)
      res.status(STATUS_CODE.NO_CONTENT).end()
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }
}
