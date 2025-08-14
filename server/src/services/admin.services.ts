// src/services/admin.services.ts
import { injectable, inject } from 'inversify'
import bcrypt from 'bcryptjs'
import { IAdminService } from '../core/interfaces/services/IAdminService'
import { IAdminRepository } from '../core/interfaces/repositories/IAdminRepository'
import TYPES from '../core/types/types'
import { IJwtService } from '../core/interfaces/services/IJwtService'

@injectable()
export class AdminService implements IAdminService {
  constructor (
    @inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository,
    @inject(TYPES.IJwtService) private jwtService: IJwtService
  ) {}

  async login (email: string, password: string) {
    const admin = await this.adminRepository.findByEmail(email)
    if (!admin) throw new Error('Invalid credentials')

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) throw new Error('Invalid credentials')

    const adminId = admin._id as string

    const accessToken = this.jwtService.generateAccessToken(
      adminId,
      admin.role,
      admin.tokenVersion ?? 0
    )
    const refreshToken = this.jwtService.generateRefreshToken(
      adminId,
      admin.role,
      admin.tokenVersion ?? 0
    )

    return {
      admin: {
        _id: adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      accessToken,
      refreshToken
    }
  }

  async updateTokenVersion (adminId: string): Promise<void> {
    const admin = await this.adminRepository.findById(adminId)
    if (!admin) {
      throw new Error('Admin not found')
    }
    
    const newTokenVersion = (admin.tokenVersion || 0) + 1
    await this.adminRepository.updateById(adminId, {
      tokenVersion: newTokenVersion
    })
  }
}
