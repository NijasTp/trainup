
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit3,
    ChevronRight,
    Check,
    X,
    ShieldCheck,
    Zap,
    MessageSquare,
    Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockPlans } from '../data/mock';
import type { GymPlan } from '../types';

const Plans = () => {
    const [plans, setPlans] = useState<GymPlan[]>(mockPlans);
    const [editingPlan, setEditingPlan] = useState<GymPlan | null>(null);

    const toggleStatus = (id: string) => {
        setPlans(plans.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            setPlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
            setEditingPlan(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">MEMBERSHIP PLANS</h1>
                    <p className="text-gray-500">Manage your gym's subscription offerings</p>
                </div>
                <Button className="h-12 px-8 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all">
                    <Plus size={18} className="mr-2" /> Create New Plan
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {!editingPlan ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {plans.map((plan) => (
                            <motion.div
                                key={plan.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />

                                <div className="flex justify-between items-start mb-6">
                                    <Badge className={plan.status === 'active' ? 'bg-green-500/20 text-green-500 border-0' : 'bg-gray-500/20 text-gray-500 border-0'}>
                                        {plan.status.toUpperCase()}
                                    </Badge>
                                    <button
                                        onClick={() => setEditingPlan(plan)}
                                        className="p-2 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-xl border border-white/10 transition-all"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-primary">${plan.price}</span>
                                    <span className="text-gray-500 text-sm font-bold">/ MONTH</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <Zap size={16} className="text-primary" />
                                        <span>{plan.equipmentIds.length} Equipment Types</span>
                                    </div>
                                    {plan.isCardioIncluded && (
                                        <div className="flex items-center gap-3 text-sm text-gray-400">
                                            <Check size={16} className="text-green-500" />
                                            <span>Cardio Included</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                        <ShieldCheck size={16} className="text-primary" />
                                        <span>{plan.permissions.trainerChat ? 'Trainer Chat' : 'No Chat'}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => toggleStatus(plan.id)}
                                    variant="outline"
                                    className={`w-full h-12 rounded-xl font-bold transition-all ${plan.status === 'active'
                                            ? 'border-red-500/50 text-red-500 hover:bg-red-500/10'
                                            : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
                                        }`}
                                >
                                    {plan.status === 'active' ? 'Deactivate Plan' : 'Activate Plan'}
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-2">
                            <h2 className="text-2xl font-black italic">EDIT PLAN: <span className="text-primary">{editingPlan.name}</span></h2>
                            <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Plan Name</label>
                                    <Input
                                        value={editingPlan.name}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Price ($)</label>
                                    <Input
                                        type="number"
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Duration (Months)</label>
                                    <Input
                                        type="number"
                                        value={editingPlan.duration}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, duration: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/10 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setEditingPlan({ ...editingPlan, isCardioIncluded: !editingPlan.isCardioIncluded })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${editingPlan.isCardioIncluded ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-gray-500'
                                            }`}
                                    >
                                        {editingPlan.isCardioIncluded ? <Check size={18} /> : <X size={18} />} Cardio Included
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">Permissions</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setEditingPlan({
                                            ...editingPlan,
                                            permissions: { ...editingPlan.permissions, trainerChat: !editingPlan.permissions.trainerChat }
                                        })}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${editingPlan.permissions.trainerChat ? 'bg-primary/10 border-primary/50' : 'bg-white/5 border-white/10 grayscale'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={20} className={editingPlan.permissions.trainerChat ? 'text-primary' : 'text-gray-500'} />
                                            <span className="font-bold">Trainer Chat</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 ${editingPlan.permissions.trainerChat ? 'bg-primary border-primary' : 'border-gray-500'}`} />
                                    </div>

                                    <div
                                        onClick={() => setEditingPlan({
                                            ...editingPlan,
                                            permissions: { ...editingPlan.permissions, videoCall: !editingPlan.permissions.videoCall }
                                        })}
                                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${editingPlan.permissions.videoCall ? 'bg-primary/10 border-primary/50' : 'bg-white/5 border-white/10 grayscale'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Video size={20} className={editingPlan.permissions.videoCall ? 'text-primary' : 'text-gray-500'} />
                                            <span className="font-bold">Video Calls</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 ${editingPlan.permissions.videoCall ? 'bg-primary border-primary' : 'border-gray-500'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingPlan(null)}
                                    className="flex-1 h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-lg font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-black text-lg font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    Save Plan Changes
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Plans;
