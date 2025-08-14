// src/controllers/WorkoutController.ts
import { Request, Response } from 'express'
import { injectable, inject } from 'inversify'
import { STATUS_CODE } from '../constants/status'
import TYPES from '../core/types/types'
import { IWorkoutService } from '../core/interfaces/services/IWorkoutService'
import { JwtPayload } from '../core/interfaces/services/IJwtService'

@injectable()
export class WorkoutController {
  constructor (
    @inject(TYPES.WorkoutService) private workoutService: IWorkoutService
  ) {}

  createSession = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const payload = req.body

      const created = await this.workoutService.createSession({
        ...payload,
        userId: jwtUser?.role === 'user' ? jwtUser.id : undefined,
        trainerId: jwtUser?.role === 'trainer' ? jwtUser.id : undefined,
        givenBy: jwtUser?.role
      })

      res.status(STATUS_CODE.CREATED).json(created)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  getSession = async (req: Request, res: Response) => {
    try {
      const id = req.params.id
      const session = await this.workoutService.getSession(id)
      res.status(STATUS_CODE.OK).json(session)
    } catch (error: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
    }
  }

  updateSession = async (req: Request, res: Response) => {
    try {
      const id = req.params.id
      const updated = await this.workoutService.updateSession(id, req.body)
      res.status(STATUS_CODE.CREATED).json(updated)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  deleteSession = async (req: Request, res: Response) => {
    try {
      await this.workoutService.deleteSession(req.params.id)
      res.status(STATUS_CODE.NO_CONTENT).end()
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  createOrGetDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const userId = jwtUser!.id

      const { date } = req.body
      const day = await this.workoutService.createDay(userId, date)

      res.status(STATUS_CODE.OK).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  addSessionToDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const userId = jwtUser!.id

      const { date } = req.params
      const { sessionId } = req.body
      const day = await this.workoutService.addSessionToDay(
        userId,
        date,
        sessionId
      )

      res.status(STATUS_CODE.CREATED).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }

  getDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const userId = jwtUser!.id

      const date = req.params.date
      const day = await this.workoutService.getDay(userId, date)

      if (!day) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: 'Not found' })
      }
      res.status(STATUS_CODE.OK).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }
}
