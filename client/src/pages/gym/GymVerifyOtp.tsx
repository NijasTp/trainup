
import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/logo';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpCard from '@/components/trainer/verify-otp/OtpCard'; // Reusing Trainer OTP Card as requested
import { toast } from 'react-toastify';
import { requestGymOtp, gymVerifyOtp } from '@/services/authService';
import { useDispatch } from 'react-redux';
import { loginGym } from '@/redux/slices/gymAuthSlice';
import { ROUTES } from '@/constants/routes';

const GymVerifyOtp: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState<number>(30);
    const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
    const { state } = useLocation()

    // Guard against direct access without state
    useEffect(() => {
        if (!state?.email || !state?.formData) {
            navigate(ROUTES.GYM_SIGNUP);
        }
    }, [state, navigate]);

    const { formData, email } = state || {};

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
            // Build FormData for registration
            const form = new FormData();
            form.append("name", formData.name);
            form.append("email", formData.email);
            form.append("password", formData.password);
            form.append("geoLocation", JSON.stringify(formData.geoLocation));
            form.append("otp", otpCode); // Pass OTP to backend for verification + registration

            if (formData.certificate) form.append("certificate", formData.certificate);
            if (formData.profileImage) form.append("profileImage", formData.profileImage);
            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((img: File) => form.append("images", img));
            }

            const res = await gymVerifyOtp(form);
            dispatch(loginGym(res.gym));
            setLoading(false)
            toast.success("Gym verified and registered successfully!");
            navigate(ROUTES.GYM_DASHBOARD);
        } catch (error: any) {
            setLoading(false);
            toast.error(error.response?.data?.message || "OTP verification failed");
            console.error(error);
        }
    };

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
            await requestGymOtp(email);
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
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Logo className="justify-center mb-6" />
                    <h2 className="text-xl font-semibold text-white mb-2">Verify Gym Account</h2>
                    <p className="text-gray-400 text-sm">Enter the OTP sent to {email}</p>
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
                    handlePaste={(e: React.ClipboardEvent) => {
                        const pastedData = e.clipboardData.getData('text');
                        if (/^\d{6}$/.test(pastedData)) {
                            const newOtp = pastedData.split('');
                            setOtp(newOtp);
                            document.getElementById(`otp-5`)?.focus();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default GymVerifyOtp;
