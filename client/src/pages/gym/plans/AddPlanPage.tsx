import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    Plus,
    X,
    Clock,
    DollarSign,
    Target,
    Loader2,
    Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import {
    createSubscriptionPlan,
    updateSubscriptionPlan,
    getSubscriptionPlan
} from '@/services/gymService';
import { ROUTES } from '@/constants/routes';

const AddPlanPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [newFeature, setNewFeature] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '1',
        durationUnit: 'month' as 'day' | 'month' | 'year',
        description: '',
        features: [] as string[]
    });

    useEffect(() => {
        if (isEditing) {
            fetchPlan();
        }
    }, [id]);

    const fetchPlan = async () => {
        try {
            const plan = await getSubscriptionPlan(id!);
            setFormData({
                name: plan.name,
                price: plan.price.toString(),
                duration: plan.duration.toString(),
                durationUnit: plan.durationUnit,
                description: plan.description || '',
                features: plan.features || []
            });
        } catch (error) {
            toast.error('Failed to load plan details');
            navigate(ROUTES.GYM_PLANS);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.duration) {
            toast.error('Please fill all required fields');
            return;
        }

        if (formData.features.length === 0) {
            toast.error('At least one feature is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration)
            };

            if (isEditing) {
                await updateSubscriptionPlan(id!, payload);
                toast.success('Plan updated successfully');
            } else {
                await createSubscriptionPlan(payload);
                toast.success('New plan launched successfully');
            }
            navigate(ROUTES.GYM_PLANS);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save plan');
        } finally {
            setSubmitting(false);
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            if (formData.features.length >= 8) {
                toast.error('Maximum 8 features allowed');
                return;
            }
            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Scanning Plan Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 font-outfit">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(ROUTES.GYM_PLANS)}
                    className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tight">
                        {isEditing ? 'RECONFIGURE' : 'LAUNCH'} <span className="text-primary non-italic">PLAN</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium">Define the specifications for your elite membership tier.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Data */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Plan Identity</label>
                            <Input
                                placeholder="e.g. ULTIMATE PERFORMANCE"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold placeholder:text-zinc-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Price Point (INR)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Cycle Duration</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                        <Input
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                        />
                                    </div>
                                    <select
                                        value={formData.durationUnit}
                                        onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value as any })}
                                        className="h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest outline-none focus:border-primary/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                                    >
                                        <option value="day">Days</option>
                                        <option value="month">Months</option>
                                        <option value="year">Years</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Brief Narrative</label>
                            <Textarea
                                placeholder="Describe what makes this tier special..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-medium resize-none p-4"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Features */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Inclusions</label>
                                <span className="text-[10px] font-bold text-zinc-600 uppercase">{formData.features.length}/8 Slots</span>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add feature..."
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-sm"
                                />
                                <Button
                                    type="button"
                                    onClick={addFeature}
                                    className="bg-primary hover:bg-primary/90 text-black h-12 w-12 rounded-xl p-0 flex-shrink-0"
                                >
                                    <Plus size={20} />
                                </Button>
                            </div>

                            <div className="space-y-3 pt-2">
                                {formData.features.map((f, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i}
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/f hover:border-primary/30 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-primary/50 group-hover/f:bg-primary transition-colors" />
                                            <span className="text-xs font-bold text-zinc-300">{f}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(i)}
                                            className="text-zinc-600 hover:text-red-500 transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                                {formData.features.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                                        <Target className="mx-auto text-zinc-800 mb-2" size={32} />
                                        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-4">No features defined</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-16 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] group"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isEditing ? 'SYNC CHANGES' : 'DEPLOY PLAN'}
                                        <Zap size={18} className="group-hover:animate-pulse" />
                                    </span>
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.GYM_PLANS)}
                                className="w-full mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                ABORT CONFIGURATION
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddPlanPage;
