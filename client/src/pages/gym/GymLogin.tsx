import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { gymLogin } from "@/services/authService";
import { useDispatch } from "react-redux";
import { loginGym } from "@/redux/slices/gymAuthSlice";
import { ROUTES } from "@/constants/routes";

export default function GymLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await gymLogin(email, password);
            // Dispatch works because gymLogin middleware should set cookie and response returns gym object
            dispatch(loginGym(response.gym));
            toast.success("Logged in successfully");
            navigate(ROUTES.GYM_DASHBOARD);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
            <div className="bg-[#1F2A44] border border-gray-700/50 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Logo className="mb-4" />
                    <h2 className="text-2xl font-bold text-white">Gym Login</h2>
                    <p className="text-gray-400">Manage your gym and trainers</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-500 h-5 w-5" />
                        <input
                            type="email"
                            placeholder="Gym Email"
                            className="w-full bg-[#2A3655] text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500 h-5 w-5" />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-[#2A3655] text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end text-sm">
                        <Link
                            to={ROUTES.GYM_FORGOT_PASSWORD}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Sign In"}
                    </button>

                    <div className="text-center text-gray-400 text-sm">
                        Don't have an account?{" "}
                        <Link to={ROUTES.GYM_SIGNUP} className="text-blue-400 hover:text-blue-300">
                            Partner with us
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
