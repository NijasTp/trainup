import { injectable } from "inversify";
import { IAuthGymTempRepository } from "../core/interfaces/repositories/IAuthGymTempRepository";
import { AuthGymTempModel, IAuthGymTemp } from "../models/authGymTemp.model";

@injectable()
export class AuthGymTempRepository implements IAuthGymTempRepository {
    async saveVerification(email: string, otp: string, expiresAt: Date): Promise<IAuthGymTemp> {
        return await AuthGymTempModel.findOneAndUpdate(
            { email },
            { otp, expiresAt, verified: false },
            { upsert: true, new: true }
        );
    }

    async findVerificationByEmail(email: string): Promise<IAuthGymTemp | null> {
        return await AuthGymTempModel.findOne({ email });
    }

    async updateVerificationStatus(email: string, verified: boolean): Promise<IAuthGymTemp | null> {
        return await AuthGymTempModel.findOneAndUpdate(
            { email },
            { verified },
            { new: true }
        );
    }

    async deleteVerification(email: string): Promise<void> {
        await AuthGymTempModel.deleteOne({ email });
    }
}
