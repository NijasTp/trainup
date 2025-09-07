export interface Client {
  _id: string
  name: string
  email: string
  phone: string
  subscriptionStartDate: string
  profileImage?: string
}

export interface PaginatedClients {
  clients: Client[]
  total: number
  page: number
  totalPages: number
}