import { injectable, inject } from 'inversify'
import bcrypt from 'bcrypt'
import { IUserService } from '../core/interfaces/services/IUserService'
import { IUserRepository } from '../core/interfaces/repositories/IUserRepository'
import TYPES from '../core/types/types'
import { IJwtService } from '../core/interfaces/services/IJwtService'
import { IUser } from '../models/user.model'
import { OAuth2Client } from 'google-auth-library'
import { MESSAGES } from '../constants/messages'
import { LoginResponseDto, UserResponseDto } from '../dtos/user.dto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const JWT_SECRET = process.env.JWT_SECRET 

@injectable()
export class UserService implements IUserService {
  private googleClient: OAuth2Client
  constructor (
    @inject(TYPES.IUserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.IJwtService) private _jwtService: IJwtService
  ) {
    this._userRepo = _userRepo
    this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  }

  public async registerUser (name: string, email: string, password: string): Promise<LoginResponseDto> {
    const existingUser = await this._userRepo.findByEmail(email)
    if (existingUser) throw new Error(MESSAGES.USER_EXISTS)

    const hashed = await bcrypt.hash(password, 10)
    const user = await this._userRepo.createUser({
      name,
      email,
      password: hashed
    })

    const accessToken = this._jwtService.generateAccessToken(
      user._id.toString(),
      user.role,
      user.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      user._id.toString(),
      user.role,
      user.tokenVersion ?? 0
    )

    return { 
      user: this.mapToResponseDto(user), 
      accessToken, 
      refreshToken 
    }
  }

  async checkUsername (username: string): Promise<boolean> {
    return (await this._userRepo.checkUsername(username)) ? true : false
  }

  public async resetPassword (email: string, newPassword: string) {
    const user = await this._userRepo.findByEmail(email)
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword

    await this._userRepo.updateUser(user._id.toString(), {
      password: hashedPassword
    })
  }

  public async loginUser (email: string, password: string): Promise<LoginResponseDto> {
    const user = await this._userRepo.findByEmail(email)

    if (!user) throw new Error('User not found')
    if (!user.password) throw new Error('User has no password')
    if (user.isBanned) throw new Error('This user is banned')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new Error('Invalid password')

    const accessToken = this._jwtService.generateAccessToken(
      user._id.toString(),
      user.role,
      user.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      user._id.toString(),
      user.role,
      user.tokenVersion ?? 0
    )

    return { 
      user: this.mapToResponseDto(user), 
      accessToken, 
      refreshToken 
    }
  }

  async loginWithGoogle (idToken: string): Promise<LoginResponseDto> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()
    if (!payload) {
      throw new Error('Invalid Google token payload')
    }

    const { sub: googleId, email, name } = payload
    if (!googleId || !email) {
      throw new Error('Google token missing required fields')
    }
    let user = await this._userRepo.findByGoogleId(googleId)
    if (!user) {
      user = await this._userRepo.findByEmail(email)
    }

    if (!user) {
      user = await this._userRepo.createUser({
        googleId,
        email,
        name
      })
    } else if (!user.googleId) {
      throw new Error('User is not linked to Google')
    }

    const accessToken = this._jwtService.generateAccessToken(
      user._id.toString(),
      user.role,
      user.tokenVersion ?? 0
    )
    const refreshToken = this._jwtService.generateRefreshToken(
      user._id.toString(),
      user.role,
      user.tokenVersion ?? 0
    )
    
    return { 
      user: this.mapToResponseDto(user), 
      accessToken, 
      refreshToken 
    }
  }

  async getAllUsers (
    page: number,
    limit: number,
    search: string,
    isBanned?: string,
    isVerified?: string,
    startDate?: string,
    endDate?: string
  ) {
    return await this._userRepo.findUsers(
      page,
      limit,
      search,
      isBanned,
      isVerified,
      startDate,
      endDate
    )
  }
  
  async getUserById (id: string): Promise<UserResponseDto | null> {
    const user = await this._userRepo.findById(id)
    return user ? this.mapToResponseDto(user) : null
  }

  async incrementTokenVersion (id: string) {
    return await this._userRepo.updateStatusAndIncrementVersion(id, {})
  }

  async getProfile (id: string): Promise<UserResponseDto | null> {
    const user = await this._userRepo.findById(id)
    return user ? this.mapToResponseDto(user) : null
  }

  async updateUserStatus (id: string, updateData: Partial<IUser>) {
    if (updateData.isBanned !== undefined) {
      return await this._userRepo.updateStatusAndIncrementVersion(id, {
        isBanned: updateData.isBanned
      })
    }

    return await this._userRepo.updateStatus(id, updateData)
  }

  async updateUserTrainerId (userId: string, trainerId: string): Promise<void> {
    await this._userRepo.updateUser(userId, {
      assignedTrainer: trainerId,
      subscriptionStartDate: new Date()
    })
  }
  
  async cancelSubscription (userId: string, trainerId: string): Promise<void> {
    if (!trainerId) return
    await this._userRepo.updateUser(userId, {
      assignedTrainer: null,
      subscriptionStartDate: null
    })
  }

  private mapToResponseDto(user: IUser): UserResponseDto {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified || false,
      role: user.role,
      goals: user.goals,
      activityLevel: user.activityLevel,
      equipment: user.equipment,
      assignedTrainer: user.assignedTrainer?.toString(),
      subscriptionStartDate: user.subscriptionStartDate || undefined,
      gymId: user.gymId?.toString(),
      isPrivate: user.isPrivate,
      isBanned: user.isBanned,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      xp: user.xp,
      xpLogs: user.xpLogs.map(log => ({
        amount: log.amount,
        reason: log.reason,
        date: log.date
      })),
      achievements: user.achievements,
      todaysWeight: user.todaysWeight,
      goalWeight: user.goalWeight,
      weightHistory: user.weightHistory.map(weight => ({
        weight: weight.weight,
        date: weight.date
      })),
      height: user.height,
      age: user.age,
      gender: user.gender,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}