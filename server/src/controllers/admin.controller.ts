import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import TYPES from '../core/types/types'
import { IAdminService } from '../core/interfaces/services/IAdminService'
import { ITrainerService } from '../core/interfaces/services/ITrainerService'
import { IUserService } from '../core/interfaces/services/IUserService'
import { PaginatedTrainers } from '../core/interfaces/services/ITrainerService'
import {
  IJwtService,
  JwtPayload
} from '../core/interfaces/services/IJwtService'
import { IGymService } from '../core/interfaces/services/IGymService'
import { STATUS_CODE } from '../constants/status'
import { 
  AdminLoginRequestDto,
  AdminLoginResponseDto,
  GetAllTrainersQueryDto,
  UpdateTrainerStatusDto,
  GetAllUsersQueryDto,
  UpdateUserStatusDto,
  GetAllGymsQueryDto,
  UpdateGymStatusDto,
  CheckSessionResponseDto
} from '../dtos/admin.dto'

@injectable()
export class AdminController {
  constructor (
    @inject(TYPES.IAdminService) private _adminService: IAdminService,
    @inject(TYPES.ITrainerService) private _trainerService: ITrainerService,
    @inject(TYPES.IUserService) private _userService: IUserService,
    @inject(TYPES.IJwtService) private _JwtService: IJwtService,
    @inject(TYPES.IGymService) private _gymService: IGymService
  ) {}

  async login (req: Request, res: Response) {
    try {
      const dto: AdminLoginRequestDto = req.body
      const result: AdminLoginResponseDto = await this._adminService.login(dto)
      
      this._JwtService.setTokens(res, result.accessToken, result.refreshToken)
      res.status(STATUS_CODE.OK).json({ admin: result.admin })
      return
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Login failed' })
    }
  }

  async getAllTrainers (req: Request, res: Response): Promise<void> {
    try {
      const dto: GetAllTrainersQueryDto = req.query as any
      const page = Number(dto.page) || 1
      const limit = Number(dto.limit) || 5
      const search = String(dto.search || '')
      const isBanned = dto.isBanned
      const isVerified = dto.isVerified
      const startDate = dto.startDate
      const endDate = dto.endDate

      const result: PaginatedTrainers =
        await this._trainerService.getAllTrainers(
          page,
          limit,
          search,
          isBanned,
          isVerified,
          startDate,
          endDate
        )
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      console.error('Controller error:', err)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to fetch trainers' })
    }
  }

  async updateTrainer (req: Request, res: Response) {
    try {
      const dto: UpdateTrainerStatusDto = req.body
      const trainer = await this._trainerService.updateTrainerStatus(
        req.params.id,
        dto
      )
      res.json(trainer)
    } catch (err: any) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: err.message })
    }
  }

  async getTrainerById (req: Request, res: Response) {
    try {
      const trainer = await this._trainerService.getTrainerById(req.params.id)
      res.json(trainer)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getTrainerApplication (req: Request, res: Response) {
    try {
      const application = await this._trainerService.getTrainerApplication(
        req.params.id
      )
      res.json(application)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  async getAllUsers (req: Request, res: Response): Promise<void> {
    try {
      const dto: GetAllUsersQueryDto = req.query as any
      const page = Number(dto.page) || 1
      const limit = Number(dto.limit) || 5
      const search = String(dto.search || '')
      const isBanned = dto.isBanned
      const isVerified = dto.isVerified
      const startDate = dto.startDate
      const endDate = dto.endDate

      const result = await this._userService.getAllUsers(
        page,
        limit,
        search,
        isBanned,
        isVerified,
        startDate,
        endDate
      )
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      console.error('Controller error:', err)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to fetch users' })
    }
  }

  async getUserById (req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id
      const user = await this._userService.getUserById(id)
      if (!user) {
        res.status(STATUS_CODE.NOT_FOUND).json({ message: 'User not found' })
        return
      }
      res.status(STATUS_CODE.OK).json(user)
    } catch (err) {
      console.error(err)
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to fetch user' })
    }
  }

  async updateUserStatus (req: Request, res: Response) {
    try {
      const { id } = req.params
      const dto: UpdateUserStatusDto = req.body

      const updatedUser = await this._userService.updateUserStatus(id, dto)

      if (!updatedUser) {
        res.status(STATUS_CODE.NOT_FOUND).json({ message: 'User not found' })
        return
      }

      res.status(STATUS_CODE.OK).json(updatedUser)
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to update user ban status' })
    }
  }

  checkSession = async (req: Request, res: Response) => {
    try {
      const user = req.user as { id: string; role: string }
      const response: CheckSessionResponseDto = { 
        valid: true, 
        id: user.id, 
        role: user.role 
      }
      res.json(response)
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Server error' })
    }
  }

  async getGyms (req: Request, res: Response) {
    try {
      const dto: GetAllGymsQueryDto = req.query as any
      const page = parseInt(dto.page as any) || 1
      const limit = parseInt(dto.limit as any) || 10
      const searchQuery = dto.searchQuery || ''

      const result = await this._gymService.getAllGyms(page, limit, searchQuery)
      res.status(STATUS_CODE.OK).json(result)
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch gyms' })
    }
  }

  async updateGymStatus (req: Request, res: Response) {
    try {
      const { id } = req.params
      const dto: UpdateGymStatusDto = req.body
      const updatedGym = await this._gymService.updateGymStatus(id, dto)

      if (!updatedGym) {
        res.status(STATUS_CODE.NOT_FOUND).json({ message: 'Gym not found' })
        return
      }

      res.status(STATUS_CODE.OK).json(updatedGym)
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to update gym status' })
    }
  }

  async getGymApplication (req: Request, res: Response) {
    try {
      const { id } = req.params
      const gym = await this._gymService.getGymApplication(id)

      if (!gym) {
        res.status(STATUS_CODE.NOT_FOUND).json({ message: 'Gym not found' })
        return
      }

      res.status(STATUS_CODE.OK).json(gym)
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to fetch gym application' })
    }
  }

  async getGymById (req: Request, res: Response) {
    try {
      const { id } = req.params
      const gym = await this._gymService.getGymById(id)

      if (!gym) {
        res.status(STATUS_CODE.NOT_FOUND).json({ message: 'Gym not found' })
        return
      }

      res.status(STATUS_CODE.OK).json(gym)
    } catch (err) {
      res
        .status(STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ error: 'Failed to fetch gym' })
    }
  }
  
  logout (req: Request, res: Response) {
    try {
      this._JwtService.clearTokens(res)
      const jwtUser = req.user as JwtPayload
      this._adminService.updateTokenVersion(jwtUser.id)
      res.status(STATUS_CODE.OK).json({ message: 'Logged out successfully' })
    } catch (error: any) {
      console.error('Logout error:', error)
      res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: error.data })
    }
  }
}