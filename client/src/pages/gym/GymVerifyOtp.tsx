// src/pages/GymVerifyOtp.tsx
import React, { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { gymVerifyOtp as gymVerifyOtpApi } from '@/services/authService';
import { useDispatch } from "react-redux";
import { loginGym } from "@/redux/slices/gymAuthSlice";
import { toast } from 'react-toastify';

interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

interface GymFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  geoLocation: GeoLocation;
  certificate: File | null;
  profileImage: File | null;
  images: File[];
}

interface LocationState {
  formData: GymFormData;
}

const GymVerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formData = (location.state as LocationState)?.formData;
  console.log('Received formData:', formData);

  useEffect(() => {
    if (!formData) {
      toast.error('Application data is missing. Please try again!');
      navigate('/gym/apply');
    }
  }, [formData, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const response = await fetch('/api/gym/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (response.ok) {
        setResendTimer(60);
        setError('');
        toast.success('OTP resent!');
      } else {
        setError('Failed to resend OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const prepareFormData = (): FormData => {
    const data = new globalThis.FormData();
    data.append('email', formData.email);
    data.append('otp', otp.join(''));
    data.append('name', formData.name);
    data.append('password', formData.password);
    data.append('geoLocation', JSON.stringify(formData.geoLocation)); // Correct

    if (formData.certificate) data.append('certificate', formData.certificate);
    if (formData.profileImage) data.append('profileImage', formData.profileImage);
    formData.images.forEach((image) => data.append('images', image));

    return data;
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = prepareFormData();
      const res = await gymVerifyOtpApi(data);

      dispatch(loginGym({
        _id: res.gym._id,
        name: res.gym.name,
        email: res.gym.email,
        profileImage: res.gym.profileImage,
        geoLocation: res.gym.geoLocation, // FIXED: was `location`, now `geoLocation`
        isVerified: res.gym.verifyStatus === 'approved'
      }));

      toast.success('Gym registered successfully!');
      navigate("/gym/dashboard");
    } catch (error: any) {
      setError(error.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/gym/apply', { state: { formData } })}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Application
        </button>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-400">We've sent a verification code to</p>
            <p className="text-blue-400 font-medium">{formData.email}</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step 2 of 2</span>
              <span className="text-sm text-gray-400">Email Verification</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-full"></div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
              Enter 6-digit code
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-semibold bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Verify & Create Account
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?{' '}
              {resendTimer > 0 ? (
                <span className="text-gray-500">Resend in {resendTimer}s</span>
              ) : (
                <button onClick={handleResendOtp} className="text-blue-400 hover:text-blue-300 font-medium transition">
                  Resend OTP
                </button>
              )}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">Check</span> Your gym details have been saved
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">Check</span> Certificate will be reviewed within 24 hours
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">Check</span> You'll receive an email once approved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymVerifyOtp;