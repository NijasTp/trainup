import { IAdminRepository } from '../core/interfaces/repositories/IAdminRepository'
import Admin, { IAdmin } from '../models/admin.model'
import { AdminLoginResponseDto } from '../dtos/admin.dto'

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email }).exec()
  }
  
  async findById(id: string): Promise<IAdmin | null> {
    return await Admin.findById(id).exec()
  }

  async updateById(id: string, update: Partial<IAdmin>): Promise<IAdmin | null> {
    return Admin.findByIdAndUpdate(id, update, { new: true }).exec()
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