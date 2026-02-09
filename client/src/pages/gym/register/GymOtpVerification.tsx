import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Aurora from '@/components/ui/Aurora';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '@/constants/routes';
import { requestGymAuthOtp, verifyGymAuthOtp } from '@/services/authService';

const GymOtpVerification = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your business email");
            return;
        }
        try {
            await requestGymAuthOtp(email.trim().toLowerCase());
            toast.success("OTP sent to your email");
            setStep(2);
            setResendTimer(60);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        try {
            const normalizedEmail = email.trim().toLowerCase();
            await verifyGymAuthOtp(normalizedEmail, otp);
            toast.success("Email verified successfully");
            // Store verified email in session storage to use in Register page
            sessionStorage.setItem('verifiedGymEmail', normalizedEmail);
            navigate(ROUTES.GYM_ONBOARDING);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        try {
            await requestGymAuthOtp(email.trim().toLowerCase());
            toast.success("OTP resent successfully");
            setResendTimer(60);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#030303] text-white overflow-hidden font-outfit p-4">
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="text-primary h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-black mb-2 italic uppercase">GYM <span className="text-primary">VERIFICATION</span></h1>
                        <p className="text-gray-400">
                            {step === 1 ? "Enter your business email to receive an OTP" : `Enter the code sent to ${email}`}
                        </p>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                <Input
                                    type="email"
                                    placeholder="Business Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 transition-all text-lg"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-[1.02]"
                            >
                                {loading ? <RefreshCw className="animate-spin mr-2" /> : "Send OTP"} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                                <Input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="bg-white/5 border-white/10 h-14 pl-12 rounded-xl focus:border-primary/50 transition-all text-lg tracking-[0.5em] font-mono text-center"
                                    disabled={loading}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-[1.02]"
                            >
                                {loading ? <RefreshCw className="animate-spin mr-2" /> : "Verify OTP"} <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <div className="flex flex-col items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading || resendTimer > 0}
                                    className={`text-sm font-bold transition-all ${resendTimer > 0 ? 'text-gray-500' : 'text-primary hover:underline'}`}
                                >
                                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium"
                                >
                                    <ChevronLeft size={16} /> Back to email
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <button
                            onClick={() => navigate('/gym/login')}
                            className="text-gray-500 hover:text-primary transition-colors text-sm font-medium"
                        >
                            Already have an account? <span className="text-primary font-bold">Login</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default GymOtpVerification;
