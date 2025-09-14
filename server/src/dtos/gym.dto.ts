export class GymRequestOtpDto {
  email: string;
}

export class GymVerifyOtpDto {
  email: string;
  otp: string;
  name: string;
  password: string;
  location: string;
}

export class GymLoginDto {
  email: string;
  password: string;
}

export class GymLoginResponseDto {
  gym: GymResponseDto;
  accessToken: string;
  refreshToken: string;
}

export class GymResponseDto {
  _id: string;
  role: string;
  name: string;
  email: string;
  location: string;
  certificate: string;
  verifyStatus: string;
  rejectReason?: string;
  isBanned: boolean;
  profileImage?: string;
  images?: string[];
  trainers?: string[];
  members?: string[];
  announcements: AnnouncementDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class AnnouncementDto {
  title: string;
  message: string;
  date: Date;
}

export class GymDataResponseDto {
  gymDetails: GymResponseDto;
  trainers: any[];
  members: any[];
  announcements: AnnouncementDto[];
}

export class UpdateGymProfileDto {
  name?: string;
  location?: string;
  announcements?: AnnouncementDto[];
}