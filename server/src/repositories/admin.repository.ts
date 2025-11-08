import { IAdminRepository } from '../core/interfaces/repositories/IAdminRepository'
import Admin, { IAdmin } from '../models/admin.model'
import { AdminLoginResponseDto } from '../dtos/admin.dto'
import { BaseRepository } from './base.repository'
import { injectable } from 'inversify'

@injectable()
export class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return await this.findOne({ email });
  }

  async updateById(id: string, update: Partial<IAdmin>): Promise<IAdmin | null> {
    return await this.findByIdAndUpdate(id, update);
  }

  mapToResponseDto(admin: IAdmin): AdminLoginResponseDto['admin'] {
    return {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    }
  }
}