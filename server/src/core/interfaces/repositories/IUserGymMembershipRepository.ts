import { IUserGymMembership } from "../../../models/userGymMembership.model";

export interface IUserGymMembershipRepository {
    findById(id: string): Promise<IUserGymMembership | null>;
    findAllByUserId(userId: string): Promise<IUserGymMembership[]>;
    create(data: Partial<IUserGymMembership>): Promise<IUserGymMembership>;
    update(id: string, data: Partial<IUserGymMembership>): Promise<IUserGymMembership | null>;
    findActiveByPreferredTime(time: string): Promise<IUserGymMembership[]>;
}
