  import { Request, Response } from 'express'
  import { injectable, inject } from 'inversify'
  import { STATUS_CODE } from '../constants/status'
  import TYPES from '../core/types/types'
  import { IWorkoutService } from '../core/interfaces/services/IWorkoutService'
  import { JwtPayload } from '../core/interfaces/services/IJwtService'
import { MESSAGES } from '../constants/messages'
import { ROLE } from '../constants/role'

  @injectable()
  export class WorkoutController {
    constructor (
      @inject(TYPES.WorkoutService) private _workoutService: IWorkoutService
    ) {}

    createSession = async (req: Request, res: Response) => {
      try {
        const jwtUser = req.user as JwtPayload
        const payload = req.body
        const created = await this._workoutService.createSession({
          ...payload,
          userId: jwtUser?.role === ROLE.USER ? jwtUser.id : undefined,
          trainerId: jwtUser?.role === ROLE.TRAINER ? jwtUser.id : undefined,
          givenBy: payload.givenBy || jwtUser?.role
        })

        res.status(STATUS_CODE.CREATED).json(created)
      } catch (err: any) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
      }
    }

    getSession = async (req: Request, res: Response) => {
      try {
        const id = req.params.id
        const session = await this._workoutService.getSession(id)
        res.status(STATUS_CODE.OK).json(session)
      } catch (error: any) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: error.message })
      }
    }

    updateSession = async (req: Request, res: Response) => {
      try {
        const id = req.params.id
        const updated = await this._workoutService.updateSession(id, req.body)
        res.status(STATUS_CODE.CREATED).json(updated)
      } catch (err: any) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
      }
    }

    deleteSession = async (req: Request, res: Response) => {
      try {
        await this._workoutService.deleteSession(req.params.id)
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
        const day = await this._workoutService.createDay(userId, date)
        res.status(STATUS_CODE.OK).json(day)
      } catch (err: any) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
      }
    }

    addSessionToDay = async (req: Request, res: Response) => {
      try {
        const jwtUser = req.user as JwtPayload
        const userId = jwtUser!.id
        const { date } = req.params
        const { sessionId } = req.body
        const day = await this._workoutService.addSessionToDay(
          userId,
          date,
          sessionId
        )
        res.status(STATUS_CODE.CREATED).json(day)
      } catch (err: any) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
      }
    }

      async trainerCreateSession(req: Request, res: Response) {
      try {
        const jwtUser = req.user as JwtPayload | undefined;
        if (!jwtUser || jwtUser.role !== 'trainer') {
          res.status(STATUS_CODE.UNAUTHORIZED).json({ error: MESSAGES.TRAINER_REQUIRED });
          return
        }
        const { clientId, name, date, time, goal, notes } = req.body;
        if (!clientId || !name || !date || !time) {
          res.status(STATUS_CODE.BAD_REQUEST).json({ error: MESSAGES.MISSING_REQUIRED_FIELDS });
          return
        }
        const session = await this._workoutService.trainerCreateSession(jwtUser.id, clientId, {
          name,
          date,
          time,
          goal,
          notes,
        });
        res.status(STATUS_CODE.CREATED).json(session);
      } catch (err: any) {
        res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message });
      }
    }

  getDay = async (req: Request, res: Response) => {
    try {
      const jwtUser = req.user as JwtPayload | undefined
      const userId = jwtUser!.id

      const date = req.params.date
      const day = await this._workoutService.getDay(userId, date)

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
      const userId = req.query.clientId as string
      const date = req.params.date
      const day = await this._workoutService.getDay(userId, date)

      if (!day) {
        res.status(STATUS_CODE.NOT_FOUND).json({ error: MESSAGES.NOT_FOUND })
      }
      res.status(STATUS_CODE.OK).json(day)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message })
    }
  }
  async createAdminTemplate(req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload;
      if (jwtUser?.role !== 'admin') {
         res.status(STATUS_CODE.UNAUTHORIZED).json({ error: MESSAGES.ADMIN_REQUIRED });
         return
      }
      const payload = req.body;
      const template = await this._workoutService.createAdminTemplate(payload);
      res.status(STATUS_CODE.CREATED).json(template);
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message });
    }
  }

  async getAdminTemplates(req: Request, res: Response) {
    try {
      const { page = 1, limit = 5, search = '' } = req.query;
      const result = await this._workoutService.getAdminTemplates(Number(page), Number(limit), search as string);
      res.status(STATUS_CODE.OK).json(result);
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message });
    }
  }

  async updateAdminTemplate(req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload | undefined;
      if (jwtUser?.role !== 'admin') {
         res.status(STATUS_CODE.UNAUTHORIZED).json({ error: MESSAGES.ADMIN_REQUIRED });
         return 
      }
      const id = req.params.id;
      const payload = req.body;
      const updated = await this._workoutService.updateAdminTemplate(id, payload);
      res.status(STATUS_CODE.OK).json(updated);
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message });
    }
  }

  async deleteAdminTemplate(req: Request, res: Response) {
    try {
      const jwtUser = req.user as JwtPayload | undefined;
      if (jwtUser?.role !== 'admin') {
         res.status(STATUS_CODE.UNAUTHORIZED).json({ error: MESSAGES.ADMIN_REQUIRED });
         return
      }
      const id = req.params.id;
      await this._workoutService.deleteSession(id);
      res.status(STATUS_CODE.NO_CONTENT)
    } catch (err: any) {
      res.status(STATUS_CODE.BAD_REQUEST).json({ error: err.message });
    }
  }
}
