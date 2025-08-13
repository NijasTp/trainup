import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import OtpInput from './OtpInput';
import ResendTimer from './ResendTimer';


interface OtpCardProps {
  otp: string[];
  loading: boolean
  handleOtpChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resendTimer: number;
  handleResend: () => void;
  isResendDisabled: boolean;
}
export default function OtpCard({
  otp,
  loading,
  handleOtpChange,
  handleKeyDown,
  handleSubmit,
  resendTimer,
  handleResend,
  isResendDisabled,
}: OtpCardProps) {

  return (
    <Card className="bg-[#111827] border-[#4B8B9B]/30 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-white text-3xl font-bold tracking-tight">OTP Verification</CardTitle>
        <CardDescription className="text-[#4B8B9B] text-lg">
          Enter the 6-digit code sent to your email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-white text-lg font-semibold">Verification Code</Label>
            <div className="flex justify-between mt-2 gap-2">
              {otp.map((digit, index) => (
                <OtpInput
                  key={index}
                  id={`otp-${index}`}
                  value={digit}
                  onChange={(value) => handleOtpChange(index, value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#001C30] text-white text-lg font-semibold py-3 rounded-lg hover:bg-gradient-to-r hover:from-[#001C30] hover:to-[#1F2A44] transition duration-300 shadow-lg"
            disabled={otp.join('').length !== 6}
          >
            <Lock className="h-5 w-5 mr-2" />
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
        <ResendTimer timer={resendTimer} onResend={handleResend} isDisabled={isResendDisabled} />
        <div className="mt-4 text-center">
          <Link
            to="/trainer/login"
            className="text-sm text-[#4B8B9B] hover:text-white hover:underline font-medium transition duration-300"
          >
            Back to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
