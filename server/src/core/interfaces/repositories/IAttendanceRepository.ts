import { IAttendance } from "../../../models/gymAttendence.model";

export interface IAttendanceRepository {
  createAttendance(data: Partial<IAttendance>): Promise<IAttendance>;

  findTodayAttendance(
    userId: string,
    gymId: string,
    date: Date
  ): Promise<IAttendance | null>;

  getUserAttendanceHistory(
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
  }>;

  getGymAttendance(
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
  }>;
}