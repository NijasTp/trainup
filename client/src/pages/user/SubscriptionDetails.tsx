import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/axios';
import { toast } from 'sonner';
import { Loader2, Calendar, CreditCard, User, Building2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { SiteHeader } from "@/components/user/home/UserSiteHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";

interface Subscription {
    _id: string;
    status: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    price?: number;
    amount?: number;
    gymNameSnapshot?: string;
    trainerNameSnapshot?: string;
    planNameSnapshot?: string;
    priceSnapshot?: number;
    refundedAmount?: number;
    cancellationDate?: string | null;
    gymId?: { name: string; profileImage?: string };
    trainerId?: { name: string; profileImage?: string };
}

const SubscriptionDetails = () => {
    const [loading, setLoading] = useState(true);
    const [gymSubscriptions, setGymSubscriptions] = useState<Subscription[]>([]);
    const [trainerSubscriptions, setTrainerSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const { data } = await API.get('/subscription');
                setGymSubscriptions(data.data.gymSubscriptions || []);
                setTrainerSubscriptions(data.data.trainerSubscriptions || []);
            } catch (error) {
                toast.error('Failed to load subscription details');
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return <Badge className="bg-green-500/20 text-green-500 border-0 uppercase font-black italic">Active</Badge>;
            case 'expired': return <Badge className="bg-gray-500/20 text-gray-500 border-0 uppercase font-black italic">Expired</Badge>;
            case 'cancelled': return <Badge className="bg-red-500/20 text-red-500 border-0 uppercase font-black italic">Cancelled</Badge>;
            case 'pending': return <Badge className="bg-yellow-500/20 text-yellow-500 border-0 uppercase font-black italic">Pending</Badge>;
            default: return <Badge variant="outline" className="border-white/10 text-gray-400 uppercase font-black italic">{status}</Badge>;
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    if (loading) {
        return (
            <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                <div className="absolute inset-0 z-0">
                    <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                </div>
                <SiteHeader />
                <div className="relative flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-cyan-500" size={40} />
                    <p className="text-gray-500 font-bold tracking-widest uppercase italic animate-pulse">Loading Subscriptions...</p>
                </div>
                <SiteFooter />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            <SiteHeader />

            <div className="relative max-w-7xl mx-auto space-y-12 p-6 flex-1 w-full pb-20">
                <div className="text-center space-y-4 pt-8">
                    <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent uppercase italic tracking-tighter">
                        My Subscriptions
                    </h1>
                    <p className="text-lg text-muted-foreground uppercase tracking-widest text-xs font-black italic opacity-50">Manage your active and past gym and trainer plans</p>
                </div>

                {/* Gym Subscriptions */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-cyan-500 pl-4">
                        <Building2 className="text-cyan-500 w-6 h-6" />
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Gym Memberships</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {gymSubscriptions.length === 0 ? (
                            <div className="col-span-full py-20 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-gray-500 italic backdrop-blur-xl">
                                <Building2 size={48} className="mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-widest text-xs opacity-30">No gym subscriptions found</p>
                            </div>
                        ) : gymSubscriptions.map((sub, i) => (
                            <motion.div
                                key={sub._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/[0.08] transition-all group backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Building2 className="text-cyan-400 w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                                {sub.gymNameSnapshot || sub.gymId?.name || "Member Gym"}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-1">{sub.planNameSnapshot || "Standard Plan"}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(sub.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 opacity-50">Price Paid</p>
                                        <p className="text-2xl font-black text-white italic">₹{sub.priceSnapshot || sub.price || 0}</p>
                                    </div>
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 opacity-50">Duration</p>
                                        <div className="flex items-center gap-2 text-gray-300 font-black text-[11px] uppercase italic">
                                            <Clock size={14} className="text-cyan-500" />
                                            <span>{formatDate(sub.subscriptionStartDate)} - {formatDate(sub.subscriptionEndDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {sub.cancellationDate && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase italic tracking-widest">
                                        <AlertCircle size={16} />
                                        <span>Cancelled on {formatDate(sub.cancellationDate)}</span>
                                        {sub.refundedAmount && sub.refundedAmount > 0 && (
                                            <span className="ml-auto text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Refunded: ₹{sub.refundedAmount}</span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Trainer Subscriptions */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-purple-500 pl-4">
                        <User className="text-purple-500 w-6 h-6" />
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Trainer Plans</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {trainerSubscriptions.length === 0 ? (
                            <div className="col-span-full py-20 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-gray-500 italic backdrop-blur-xl">
                                <User size={48} className="mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-widest text-xs opacity-30">No trainer plans found</p>
                            </div>
                        ) : trainerSubscriptions.map((sub, i) => (
                            <motion.div
                                key={sub._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:bg-white/[0.08] transition-all group backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <User className="text-purple-400 w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic group-hover:text-purple-400 transition-colors uppercase tracking-tight">
                                                {sub.trainerNameSnapshot || sub.trainerId?.name || "Personal Trainer"}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mt-1">{sub.planNameSnapshot || (sub as any).planType + " Plan"}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(sub.status || 'Active')}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 opacity-50">Price Paid</p>
                                        <p className="text-2xl font-black text-white italic">₹{sub.priceSnapshot || sub.amount || 0}</p>
                                    </div>
                                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 opacity-50">Expires On</p>
                                        <div className="flex items-center gap-2 text-gray-300 font-black text-[11px] uppercase italic">
                                            <Calendar size={14} className="text-purple-500" />
                                            <span>{formatDate((sub as any).expiryDate || sub.subscriptionEndDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {sub.cancellationDate && (
                                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase italic tracking-widest">
                                        <AlertCircle size={16} />
                                        <span>Cancelled on {formatDate(sub.cancellationDate)}</span>
                                        {sub.refundedAmount && sub.refundedAmount > 0 && (
                                            <span className="ml-auto text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Refunded: ₹{sub.refundedAmount}</span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
            <SiteFooter />
        </div>
    );
};

export default SubscriptionDetails;
