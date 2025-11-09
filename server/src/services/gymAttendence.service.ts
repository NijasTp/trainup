import { injectable, inject } from 'inversify'
import { IAttendanceService } from '../core/interfaces/services/IAttendanceService'
import { IAttendanceRepository } from '../core/interfaces/repositories/IAttendanceRepository'
import { IGymService } from '../core/interfaces/services/IGymService'
import TYPES from '../core/types/types'
import { AppError } from '../utils/appError.util'
import { STATUS_CODE } from '../constants/status'
import { MESSAGES } from '../constants/messages.constants'

@injectable()
export class AttendanceService implements IAttendanceService {
  constructor (
    @inject(TYPES.IAttendanceRepository)
    private _attendanceRepo: IAttendanceRepository,
    @inject(TYPES.IGymService) private _gymService: IGymService
  ) {}

  async markAttendance (
    userId: string,
    gymId: string,
    userLocation: { lat: number; lng: number }
  ): Promise<{ success: boolean; message: string }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingAttendance = await this._attendanceRepo.findTodayAttendance(
      userId,
      gymId,
      today
    )

    if (existingAttendance) {
      throw new AppError(
        'Attendance already marked for today',
        STATUS_CODE.BAD_REQUEST
      )
    }

    const gym = await this._gymService.getGymById(gymId)
    if (!gym) {
      throw new AppError(MESSAGES.GYM_NOT_FOUND, STATUS_CODE.NOT_FOUND)
    }
    const distance = this.calculateDistance(
      userLocation.lat,
      userLocation.lng, 
      gym.geoLocation.coordinates[1],
      gym.geoLocation.coordinates[0] 
    )

    const isValidLocation = distance <= 1000

    if (!isValidLocation) {
      throw new AppError(
        `You must be within 1 km of the gym to mark attendance. You are ${Math.round(
          distance
        )}m away.`,
        STATUS_CODE.BAD_REQUEST
      )
    }

    await this._attendanceRepo.createAttendance({
      userId,
      gymId,
      date: today,
      checkInTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [userLocation.lng, userLocation.lat]
      },
      isValidLocation
    })

    return {
      success: true,
      message: 'Attendance marked successfully!'
    }
  }

  async getAttendanceHistory (
    userId: string,
    gymId: string,
    page: number,
    limit: number
  ): Promise<{
    attendance: Array<{
      _id: string
      date: string
      checkInTime: string
      isValidLocation: boolean
    }>
    totalPages: number
    total: number
  }> {
    return await this._attendanceRepo.getUserAttendanceHistory(
      userId,
      gymId,
      page,
      limit
    )
  }

  async getGymAttendance (
    gymId: string,
    date: Date,
    page: number,
    limit: number
  ): Promise<{
    attendance: Array<{
      _id: string
      userId: string
      userName: string
      userEmail: string
      checkInTime: string
      isValidLocation: boolean
    }>
    totalPages: number
    total: number
  }> {
    return await this._attendanceRepo.getGymAttendance(gymId, date, page, limit)
  }

  private calculateDistance (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000 // Earth radius in meters
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private deg2rad (deg: number): number {
    return deg * (Math.PI / 180)
  }
}
