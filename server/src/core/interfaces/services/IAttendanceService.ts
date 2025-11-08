export interface IAttendanceService {
  markAttendance(
    userId: string,
    gymId: string,
    userLocation: { lat: number; lng: number }
  ): Promise<{ success: boolean; message: string }>;

  getAttendanceHistory(
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