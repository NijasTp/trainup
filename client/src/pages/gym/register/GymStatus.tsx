import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';

import { motion } from 'framer-motion';
import {
    Clock,
    XCircle,
    ArrowRight,
    LogOut,
    Building2,
    ShieldCheck,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useNavigate } from 'react-router-dom';
import { logoutGymThunk } from '@/redux/slices/gymAuthSlice';

const GymStatus = () => {
    const { gym } = useSelector((state: RootState) => state.gymAuth);
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const handleLogout = async () => {
        try {
            await dispatch(logoutGymThunk()).unwrap();
            navigate(ROUTES.GYM_LOGIN);
        } catch (error) {
            console.error('Logout failed:', error);
            // Fallback redirect if API fails but we want to clear local state
            navigate(ROUTES.GYM_LOGIN);
        }
    };

    const isPending = gym?.verifyStatus === 'pending';
    const isRejected = gym?.verifyStatus === 'rejected';

    return (
        <div className="min-h-screen bg-[#030303] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full"
            >
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-purple-500/50" />

                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className={`h-24 w-24 rounded-3xl flex items-center justify-center relative ${isPending ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                            {isPending ? (
                                <Clock className="h-12 w-12 text-yellow-500 animate-spin-slow" />
                            ) : (
                                <XCircle className="h-12 w-12 text-red-500" />
                            )}
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-white/10 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-white/60" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-outfit">
                                {isPending ? 'Application Pending' : 'Application Rejected'}
                            </h1>
                            <p className="text-zinc-400 font-medium">
                                {isPending
                                    ? "Our team is currently reviewing your gym's registration. This typically takes 24-48 hours."
                                    : "Unfortunately, your application was not approved at this time."
                                }
                            </p>
                        </div>

                        {isRejected && gym?.rejectReason && (
                            <div className="w-full p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-left">
                                <span className="text-[10px] uppercase font-black tracking-widest text-red-500/60 block mb-1">Reason for Rejection</span>
                                <p className="text-sm text-red-200/80 font-medium italic">"{gym.rejectReason}"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-4">
                            {isRejected ? (
                                <Button
                                    onClick={() => navigate(ROUTES.GYM_REAPPLY)}
                                    className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black text-sm uppercase tracking-widest group shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-[1.02]"
                                >
                                    Reapply Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            ) : (
                                <div className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 px-6">
                                    <ShieldCheck className="h-5 w-5 text-zinc-400" />
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Verification in Progress</span>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-bold text-sm text-zinc-300"
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-8 px-4 opacity-50">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        <Mail className="h-3 w-3" /> support@trainup.fit
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        <ShieldCheck className="h-3 w-3" /> Secure Platform
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default GymStatus;
