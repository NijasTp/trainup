export interface IOTPService {
  requestOtp(email: string, role: 'user' | 'trainer' | 'gym' | 'admin'): Promise<string>;
  requestForgotPasswordOtp(email: string, role: 'user' | 'trainer' | 'gym' | 'admin'): Promise<string>
  verifyOtp(email: string, otp: string): Promise<boolean>;
  clearOtp(email: string): Promise<void>
}