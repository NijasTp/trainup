import { injectable } from 'inversify';
import { IUserGymMembershipRepository } from '../core/interfaces/repositories/IUserGymMembershipRepository';
import { IUserGymMembership, UserGymMembershipModel } from '../models/userGymMembership.model';

@injectable()
export class UserGymMembershipRepository implements IUserGymMembershipRepository {
    async findById(id: string): Promise<IUserGymMembership | null> {
        return await UserGymMembershipModel.findById(id).lean() as IUserGymMembership | null;
    }

    async findAllByUserId(userId: string): Promise<IUserGymMembership[]> {
        return await UserGymMembershipModel.find({ userId })
            .populate('gymId', 'name profileImage address')
            .populate('planId', 'name price duration durationUnit')
            .sort({ createdAt: -1 })
            .lean() as IUserGymMembership[];
    }

    async create(data: Partial<IUserGymMembership>): Promise<IUserGymMembership> {
        return await UserGymMembershipModel.create(data);
    }

    async update(id: string, data: Partial<IUserGymMembership>): Promise<IUserGymMembership | null> {
        return await UserGymMembershipModel.findByIdAndUpdate(id, data, { new: true });
    }
}
