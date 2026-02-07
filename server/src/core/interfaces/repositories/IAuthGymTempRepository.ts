import { IAuthGymTemp } from "../../../models/authGymTemp.model";

export interface IAuthGymTempRepository {
    saveVerification(email: string, otp: string, expiresAt: Date): Promise<IAuthGymTemp>;
    findVerificationByEmail(email: string): Promise<IAuthGymTemp | null>;
    updateVerificationStatus(email: string, verified: boolean): Promise<IAuthGymTemp | null>;
    deleteVerification(email: string): Promise<void>;
}
