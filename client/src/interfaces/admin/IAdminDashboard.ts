export interface IDashboardStats {
  totalUsers: number;
  totalTrainers: number;
  totalRevenue: number;
  totalTemplates: number;
  recentTransactions: SafeAny[];
}

export interface IGraphData {
  name: string;
  value: number;
}

export interface ITrainer {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  rating?: number;
  experience?: number;
  location?: string;
}

export interface IReview {
  _id: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
