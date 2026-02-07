export interface IGymAuthService {
    requestOtp(email: string): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<boolean>;
    isVerified(email: string): Promise<boolean>;
    clearVerification(email: string): Promise<void>;
}
