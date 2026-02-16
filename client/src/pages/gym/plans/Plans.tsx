import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit3,
    Check,
    Loader2,
    Trash2,
    Target,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import {
    listSubscriptionPlans,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
} from '@/services/gymService';
import { ROUTES } from '@/constants/routes';

const Plans = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await listSubscriptionPlans({ limit: 100 });
            setPlans(data.items || []);
        } catch (error) {
            toast.error('Failed to load plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleEdit = (plan: any) => {
        navigate(ROUTES.GYM_PLANS_EDIT.replace(':id', plan._id));
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            try {
                await deleteSubscriptionPlan(id);
                toast.success('Plan deleted');
                fetchPlans();
            } catch (error) {
                toast.error('Failed to delete plan');
            }
        }
    };

    const toggleStatus = async (plan: any) => {
        try {
            await updateSubscriptionPlan(plan._id, { isActive: !plan.isActive });
            setPlans(plans.map(p => p._id === plan._id ? { ...p, isActive: !p.isActive } : p));
            toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 font-outfit">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white italic tracking-tight uppercase">
                        Membership <span className="text-primary non-italic">Plans</span>
                    </h1>
                    <p className="text-zinc-500 font-medium italic">Manage your gym's subscription offerings</p>
                </div>
                <Button
                    onClick={() => { navigate(ROUTES.GYM_PLANS_CREATE); }}
                    className="h-14 px-10 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} className="mr-2" /> Create New Plan
                </Button>
            </header>

            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : plans.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                    <div className="h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-600">
                        <Zap size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">No Plans Found</h3>
                        <p className="text-zinc-500">Create your first membership plan to get started</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {plans.map((plan) => (
                            <motion.div
                                key={plan._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative group bg-white/[0.03] border-2 rounded-[2.5rem] p-8 transition-all duration-500 ${plan.isActive ? 'border-white/10 hover:border-primary/30' : 'border-red-500/10 grayscale opacity-60'
                                    }`}
                            >
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan._id)}
                                        className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <Badge className={`h-7 px-3 text-[10px] font-black uppercase tracking-widest border-0 ${plan.isActive ? 'bg-green-500/20 text-green-500' : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{plan.name}</h3>

                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-5xl font-black text-white">₹</span>
                                    <span className="text-6xl font-black text-primary tracking-tighter">{plan.price}</span>
                                    <span className="text-zinc-500 font-bold uppercase tracking-tighter">/ {plan.duration} {plan.durationUnit}{plan.duration > 1 ? 's' : ''}</span>
                                </div>

                                <div className="space-y-4 mb-10 min-h-[160px]">
                                    {plan.features?.map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                                            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Check size={14} className="text-primary" />
                                            </div>
                                            {f}
                                        </div>
                                    ))}
                                    {(!plan.features || plan.features.length === 0) && (
                                        <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                                            <Target className="mx-auto text-zinc-800 mb-2" size={32} />
                                            <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-4">No features defined</p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={() => toggleStatus(plan)}
                                    variant="outline"
                                    className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border-2 ${plan.isActive
                                        ? 'border-white/5 bg-white/5 text-zinc-400 hover:border-red-500/30 hover:text-red-500 hover:bg-red-500/5'
                                        : 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                                        }`}
                                >
                                    {plan.isActive ? 'Deactivate Membership' : 'Reactivate Membership'}
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Plans;
