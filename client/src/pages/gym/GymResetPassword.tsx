
import { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Loader2, KeyRound } from 'lucide-react';
import { gymResetPassword } from '@/services/authService';
import { toast } from 'react-toastify';
import { ROUTES } from '@/constants/routes';

export default function GymResetPassword() {
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate(ROUTES.GYM_LOGIN);
            toast.error("Session expired or invalid access");
        }
    }, [email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await gymResetPassword(email, password, otp);
            toast.success('Password reset successfully');
            navigate(ROUTES.GYM_LOGIN);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1F2A44] border border-gray-700/50 p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <Logo className="justify-center mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-gray-400">Enter OTP and new password for {email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-3.5 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2A3655] border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2A3655] border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2A3655] border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
