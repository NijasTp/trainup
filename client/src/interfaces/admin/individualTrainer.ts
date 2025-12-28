export interface ITrainer {
  _id: string
  name: string
  email: string
  phone: string
  isBanned: boolean
  role: "trainer"
  gymId?: {
    _id: string
    name: string
    location: string
  } | null
  clients: Array<{
    _id: string
    name: string
    joinDate: Date
  }>
  bio: string
  location: string
  specialization: string
  experience: string
  badges: string[]
  rating: number
  certificate: string
  profileImage: string
  price: {
    basic: number;
    premium: number;
    pro: number;
  }
  profileStatus: "pending" | "approved" | "rejected" | "active" | "suspended"
  createdAt: Date
  updatedAt: Date
}
