
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { gymForgotPassword } from '@/services/authService';
import { toast } from 'react-toastify';
import { ROUTES } from '@/constants/routes';

export default function GymForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await gymForgotPassword(email);
            toast.success('Reset link/OTP sent to your email');
            navigate(ROUTES.GYM_RESET_PASSWORD, { state: { email } });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1F2A44] border border-gray-700/50 p-8 rounded-2xl shadow-xl animate-fade-in relative">
                <Link to={ROUTES.GYM_LOGIN} className="absolute left-6 top-6 text-gray-400 hover:text-white transition">
                    <ArrowLeft size={24} />
                </Link>

                <div className="text-center mb-8">
                    <Logo className="justify-center mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-400">Enter your gym email to reset password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
                        <input
                            type="email"
                            placeholder="Gym Email Address"
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#2A3655] border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                    </button>
                </form>
            </div>
        </div>
    );
}
