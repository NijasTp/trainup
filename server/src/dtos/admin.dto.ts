export class AdminLoginRequestDto {
  email: string;
  password: string;
}

export class AdminLoginResponseDto {
  admin: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class GetAllTrainersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isBanned?: string;
  isVerified?: string;
  startDate?: string;
  endDate?: string;
}

export class UpdateTrainerStatusDto {
  isBanned?: boolean;
  isVerified?: boolean;
  profileStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason?: string;
}

export class GetAllUsersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isBanned?: string;
  isVerified?: string;
  startDate?: string;
  endDate?: string;
}

export class UpdateUserStatusDto {
  isBanned?: boolean;
}

export class GetAllGymsQueryDto {
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export class UpdateGymStatusDto {
  isBanned?: boolean;
  verifyStatus?: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
}

export class CheckSessionResponseDto {
  valid: boolean;
  id: string;
  role: string;
}