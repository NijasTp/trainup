export interface IUser {
    _id: string
    name: string
    email: string
    phone?: string
    isVerified?: boolean
    role: "user"
    goals?: string[]
    activityLevel?: string
    equipment?: boolean
    assignedTrainer?: string
    isPrivate?: boolean
    isBanned: boolean
    workoutHistory?: Array<{
        date: string
        type: string
        duration: number
    }>
    createdAt: Date
    updatedAt: Date
    height?: number
    weightHistory?: Array<{ weight: number, date: Date }>
    age?: number
    gender?: string
}
