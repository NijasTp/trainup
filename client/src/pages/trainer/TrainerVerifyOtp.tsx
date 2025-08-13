
import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/logo';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpCard from '@/components/trainer/verify-otp/OtpCard';
import { toast } from 'react-toastify';
import { trainerVerifyOtp as trainerVerifyOtpApi, trainerResendOtp as trainerResendOtpApi, trainerApply as trainerApplyApi } from '@/services/authService';
import { useDispatch } from 'react-redux';
import { loginTrainer } from '@/redux/slices/trainerAuthSlice';

// Main Component
const TrainerVerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const { state: { formData, email } } = useLocation()
  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      await trainerVerifyOtpApi(email, otpCode);
      const form = new FormData();
      form.append("fullName", formData.fullName);
      form.append("email", formData.email);
      form.append("password", formData.password);
      form.append("phone", formData.phone);
      form.append("location", formData.location);
      form.append("experience", formData.experience);
      form.append("specialization", formData.specialization);
      form.append("bio", formData.bio);

      if (!formData.certificate || !(formData.certificate instanceof File) || formData.certificate.size === 0) {
        toast.error("Please upload a valid certificate file (JPG, PNG, or PDF)");
        setLoading(false);
        return;
      }
      if (!formData.profileImage || !(formData.profileImage instanceof File) || formData.profileImage.size === 0) {
        toast.error("Please upload a valid profile image (JPG or PNG)");
        setLoading(false);
        return;
      }
      form.append("certificate", formData.certificate);
      form.append("profileImage", formData.profileImage);
      const res = await trainerApplyApi(form);
      dispatch(loginTrainer({ trainer: res.trainer }))
      setLoading(false)
      toast.success("OTP verified successfully");
      navigate("/trainer/dashboard", { state: { formData, email } });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "OTP verification failed");
      console.log('Application submission error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsResendDisabled(false);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (isResendDisabled) return;

    try {
      await trainerResendOtpApi(email);
      toast.success("OTP resent successfully");
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      setIsResendDisabled(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center">
          <Logo className="justify-center mb-6" />
        </div>
        <OtpCard
          otp={otp}
          loading={loading}
          handleOtpChange={handleOtpChange}
          handleKeyDown={handleKeyDown}
          handleSubmit={handleSubmit}
          resendTimer={resendTimer}
          handleResend={handleResend}
          isResendDisabled={isResendDisabled}
        />
      </div>
    </div>
  );
};

export default TrainerVerifyOtp;
