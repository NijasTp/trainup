import { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit3,
    Check,
    X,
    Zap,
    MessageSquare,
    Video,
    Loader2,
    Trash2,
    DollarSign,
    Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import {
    listSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan
} from '@/services/gymService';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';

const Plans = () => {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        duration: 1,
        durationUnit: 'month' as 'day' | 'month' | 'year',
        description: '',
        features: [] as string[],
        trainerChat: false,
        videoCall: false,
        isCardioIncluded: false
    });
    const [newFeature, setNewFeature] = useState('');

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

    const handleSave = async () => {
        if (!formData.name || formData.price < 0 || formData.duration <= 0) {
            toast.error('Please fill all required fields correctly');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateSubscriptionPlan(editingId, formData);
                toast.success('Plan updated successfully');
            } else {
                await createSubscriptionPlan(formData);
                toast.success('New plan created successfully');
            }
            setIsModalOpen(false);
            resetForm();
            fetchPlans();
        } catch (error) {
            toast.error('Failed to save plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (plan: any) => {
        setEditingId(plan._id);
        setFormData({
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            durationUnit: plan.durationUnit,
            description: plan.description || '',
            features: plan.features || [],
            trainerChat: plan.trainerChat || false,
            videoCall: plan.videoCall || false,
            isCardioIncluded: plan.isCardioIncluded || false
        });
        setIsModalOpen(true);
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

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: '',
            price: 0,
            duration: 1,
            durationUnit: 'month',
            description: '',
            features: [],
            trainerChat: false,
            videoCall: false,
            isCardioIncluded: false
        });
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
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
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
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
                                    <span className="text-5xl font-black text-white">$</span>
                                    <span className="text-6xl font-black text-primary tracking-tighter">{plan.price}</span>
                                    <span className="text-zinc-500 font-bold uppercase tracking-tighter">/ {plan.duration} {plan.durationUnit}{plan.duration > 1 ? 's' : ''}</span>
                                </div>

                                <div className="space-y-4 mb-10 min-h-[160px]">
                                    {plan.isCardioIncluded && (
                                        <div className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                                            <div className="h-6 w-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                <Check size={14} className="text-green-500" />
                                            </div>
                                            Cardio Access Included
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                            {plan.trainerChat ? <MessageSquare size={14} className="text-primary" /> : <X size={14} className="text-zinc-600" />}
                                        </div>
                                        {plan.trainerChat ? 'Trainer Chat Support' : 'No Chat Support'}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                            {plan.videoCall ? <Video size={14} className="text-primary" /> : <X size={14} className="text-zinc-600" />}
                                        </div>
                                        {plan.videoCall ? 'Video Consultations' : 'No Video Support'}
                                    </div>
                                    {plan.features?.map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-500">
                                            <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Target size={14} className="text-zinc-600" />
                                            </div>
                                            {f}
                                        </div>
                                    ))}
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

            {/* Plan Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-2xl rounded-[3rem] overflow-hidden p-0">
                    <div className="h-2 bg-primary w-full" />
                    <div className="p-10 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-4xl font-black italic uppercase tracking-tight">
                                {editingId ? 'Edit' : 'New'} <span className="text-primary non-italic">Plan</span>
                            </DialogTitle>
                            <DialogDescription className="text-zinc-500 font-medium italic">
                                Configure the specifics for this membership level.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Plan Name</label>
                                    <Input
                                        placeholder="e.g. Pro Membership"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Price ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                            <Input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                className="h-14 pl-10 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Duration</label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-white font-bold flex-1"
                                            />
                                            <select
                                                value={formData.durationUnit}
                                                onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value as any })}
                                                className="h-14 px-3 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase text-[10px] tracking-widest outline-none focus:border-primary/50"
                                            >
                                                <option value="day">Days</option>
                                                <option value="month">Months</option>
                                                <option value="year">Years</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Core Permissions</label>
                                    <div
                                        onClick={() => setFormData({ ...formData, trainerChat: !formData.trainerChat })}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.trainerChat ? 'bg-primary/10 border-primary/30' : 'bg-white/2 border-white/10 opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={18} className={formData.trainerChat ? 'text-primary' : 'text-zinc-500'} />
                                            <span className="font-bold text-sm">Trainer Chat</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.trainerChat ? 'bg-primary border-primary' : 'border-zinc-700'}`}>
                                            {formData.trainerChat && <Check size={12} className="text-black" />}
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, videoCall: !formData.videoCall })}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.videoCall ? 'bg-primary/10 border-primary/30' : 'bg-white/2 border-white/10 opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Video size={18} className={formData.videoCall ? 'text-primary' : 'text-zinc-500'} />
                                            <span className="font-bold text-sm">Video Calls</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.videoCall ? 'bg-primary border-primary' : 'border-zinc-700'}`}>
                                            {formData.videoCall && <Check size={12} className="text-black" />}
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, isCardioIncluded: !formData.isCardioIncluded })}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.isCardioIncluded ? 'bg-green-500/10 border-green-500/30' : 'bg-white/2 border-white/10 opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Zap size={18} className={formData.isCardioIncluded ? 'text-green-500' : 'text-zinc-500'} />
                                            <span className="font-bold text-sm">Cardio Access</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${formData.isCardioIncluded ? 'bg-green-500 border-green-500' : 'border-zinc-700'}`}>
                                            {formData.isCardioIncluded && <Check size={12} className="text-white" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Extra Features</label>
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            placeholder="e.g. Free Protein Shake"
                                            value={newFeature}
                                            onChange={(e) => setNewFeature(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl font-bold text-sm"
                                        />
                                        <Button onClick={addFeature} className="bg-primary hover:bg-primary/90 text-black h-12 w-12 rounded-xl p-0">
                                            <Plus size={20} />
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {formData.features.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group/f hover:border-primary/30 transition-all">
                                                <span className="text-sm font-bold text-zinc-300">{f}</span>
                                                <button onClick={() => removeFeature(i)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover/f:opacity-100 transition-all">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-8 border-t border-white/5">
                            <Button
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="h-14 px-8 rounded-2xl font-bold text-zinc-500 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSubmitting}
                                className="h-14 px-12 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                            >
                                {isSubmitting && <Loader2 className="mr-2 animate-spin" size={18} />}
                                {editingId ? 'Save Changes' : 'Launch Plan'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Plans;

