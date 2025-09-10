export interface AdminLoginRequestDTO {
  email: string;
  password: string;
}

export interface AdminLoginResponseDTO {
  admin: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface AdminSessionResponseDTO {
  valid: boolean;
  id: string;
  role: string;
}

export interface AdminGetAllTrainersRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  isBanned?: string;
  isVerified?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminTrainerDTO {
  _id: string;
  name: string;
  email: string;
  phone: string;
  price: string;
  isBanned: boolean;
  role: string;
  gymId?: string;
  clients: string[];
  bio: string;
  location: string;
  specialization: string;
  tokenVersion?: number;
  experience: string;
  badges: string[];
  rating: number;
  certificate: string;
  profileImage?: string;
  profileStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaginatedTrainersResponseDTO {
  trainers: AdminTrainerDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminUpdateTrainerRequestDTO {
  isBanned?: boolean;
  profileStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason?: string;
}

export interface AdminTrainerApplicationDTO {
  _id: string;
  certificate: string;
  profileStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason?: string;
  bio: string;
  specialization: string;
  experience: string;
}

export interface AdminGetAllUsersRequestDTO {
  page?: number;
  limit?: number;
  search?: string;
  isBanned?: string;
  isVerified?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminUserDTO {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  googleId?: string;
  role: 'user';
  goals?: string[];
  activityLevel?: string;
  equipment?: boolean;
  assignedTrainer?: string;
  subscriptionStartDate?: string;
  gymId?: string;
  isPrivate?: boolean;
  tokenVersion?: number;
  isBanned: boolean;
  streak: number;
  lastActiveDate?: string;
  xp: number;
  xpLogs: {
    amount: number;
    reason: string;
    date: string;
  }[];
  achievements: string[];
  todaysWeight?: number;
  goalWeight?: number;
  weightHistory: {
    weight: number;
    date: string;
  }[];
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaginatedUsersResponseDTO {
  data: AdminUserDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUpdateUserRequestDTO {
  isBanned: boolean;
}

export interface AdminGetAllGymsRequestDTO {
  page?: number;
  limit?: number;
  searchQuery?: string;
}

export interface AdminGymDTO {
  _id: string;
  name: string;
  email: string;
  location: string;
  certificate: string;
  trainers: string[];
  members: string[];
  announcements: { title: string; message: string; date: string }[];
  images: string[];
  profileImage: string;
  profileStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason: string;
  role: string;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaginatedGymsResponseDTO {
  data: AdminGymDTO[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUpdateGymRequestDTO {
  isBanned?: boolean;
  profileStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface AdminGymApplicationDTO {
  _id: string;
  certificate: string; // Add certificate
  profileStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason: string;
  name: string;
  email: string;
  location: string;
}

export interface AdminLogoutResponseDTO {
  message: string;
}

export interface AdminErrorResponseDTO {
  error: string;
}

export interface CustomError extends Error {
  message: string;
}