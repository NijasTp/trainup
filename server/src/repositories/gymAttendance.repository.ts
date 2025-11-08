import { injectable } from 'inversify';
import { IAttendanceRepository } from '../core/interfaces/repositories/IAttendanceRepository';
import { IAttendance,AttendanceModel } from '../models/gymAttendence.model';
import { Types } from 'mongoose';

@injectable()
export class AttendanceRepository implements IAttendanceRepository {
  async createAttendance(data: Partial<IAttendance>): Promise<IAttendance> {
    return await AttendanceModel.create(data);
  }

  async findTodayAttendance(
    userId: string,
    gymId: string,
    date: Date
  ): Promise<IAttendance | null> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return await AttendanceModel.findOne({
      userId: new Types.ObjectId(userId),
      gymId: new Types.ObjectId(gymId),
      date: {
        $gte: date,
        $lt: nextDay,
      },
    });
  }

  async getUserAttendanceHistory(
    userId: string,
    gymId: string,
    page: number,
    limit: number
  ): Promise<{
    attendance: Array<{
      _id: string;
      date: string;
      checkInTime: string;
      isValidLocation: boolean;
    }>;
    totalPages: number;
    total: number;
  }> {
    const query = {
      userId: new Types.ObjectId(userId),
      gymId: new Types.ObjectId(gymId),
    };

    const total = await AttendanceModel.countDocuments(query);
    const attendance = await AttendanceModel.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('date checkInTime isValidLocation')
      .lean();

    return {
      attendance: attendance.map((a: IAttendance) => ({
        _id: a._id.toString(),
        date: a.date.toISOString(),
        checkInTime: a.checkInTime.toISOString(),
        isValidLocation: a.isValidLocation,
      })),
      totalPages: Math.ceil(total / limit),
      total,
    };
  }

  async getGymAttendance(
    gymId: string,
    date: Date,
    page: number,
    limit: number
  ): Promise<{
    attendance: Array<{
      _id: string;
      userId: string;
      userName: string;
      userEmail: string;
      checkInTime: string;
      isValidLocation: boolean;
    }>;
    totalPages: number;
    total: number;
  }> {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const query = {
      gymId: new Types.ObjectId(gymId),
      date: {
        $gte: date,
        $lt: nextDay,
      },
    };

    const total = await AttendanceModel.countDocuments(query);
    const attendance = await AttendanceModel.find(query)
      .populate('userId', 'name email')
      .sort({ checkInTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      attendance: attendance.map((a: IAttendance) => ({
        _id: a._id.toString(),
        userId: a.userId.toString(),
        userName: (a.userId as unknown as { name: string }).name,
        userEmail: (a.userId as unknown as { email: string }).email,
        checkInTime: a.checkInTime.toISOString(),
        isValidLocation: a.isValidLocation,
      })),
      totalPages: Math.ceil(total / limit),
      total,
    };
  }
}