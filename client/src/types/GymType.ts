export interface GymType {
  _id: string;
  name: string;
  email: string;
  password?: string; 
  location: string;
  trainers?: string[]; 
  members?: string[];
  announcements?: string[];
  images?: string[]; 
  profileImage?: string; 
  certificate?: string; 
  createdAt?: string; 
  updatedAt?: string; 
}
