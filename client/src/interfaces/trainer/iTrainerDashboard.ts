export interface Client {
  _id: string
  name: string
  email: string
  phone: string
  subscriptionStartDate: string
  profileImage?: string
  trainerPlan?: 'basic' | 'premium' | 'pro'
}

export interface PaginatedClients {
  clients: Client[]
  total: number
  page: number
  totalPages: number
}