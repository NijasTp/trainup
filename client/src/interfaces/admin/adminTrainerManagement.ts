export interface ITrainer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isBanned: boolean;
  role: "trainer";
  gymId?: string;
  clients: string[];
  bio: string;
  location: string;
  specialization: string;
  experience: string;
  badges: string[];
  rating: number;
  certificate: string;
  profileImage: string;
  profileStatus: "pending" | "approved" | "rejected" | "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainerResponse {
  trainers: ITrainer[];
  total: number;
  page: number;
  totalPages: number;
}