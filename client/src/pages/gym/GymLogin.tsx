import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { gymLogin } from "@/services/authService";
import { useDispatch } from "react-redux";
import { loginGym } from "@/redux/slices/gymAuthSlice";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

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
            dispatch(loginGym(response.gym));
            toast.success("Logged in successfully");
            navigate(ROUTES.GYM_DASHBOARD);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-blue-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Logo className="mb-6 scale-110" />
                        <h2 className="text-3xl font-black text-white mb-2">Gym Console</h2>
                        <p className="text-gray-400 font-medium">Manage your gym ecosystem</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="Gym Email"
                                    className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Link
                                to={ROUTES.GYM_FORGOT_PASSWORD}
                                className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-gray-400 font-medium">
                                Don't have an account?{" "}
                                <Link to={ROUTES.GYM_SIGNUP} className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                                    Partner with us
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
