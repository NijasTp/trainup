import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CreditCard,
    CalendarCheck,
    Package,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Megaphone,
    Loader2
} from 'lucide-react';
import { getGymDashboardStats } from '@/services/gymService';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
    // Map icon string to component
    const IconComponent = {
        Users,
        CreditCard,
        CalendarCheck,
        Package
    }[Icon as string] || Package;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${trend?.includes('+') ? 'text-green-500' : 'text-primary'}`}>
                    <IconComponent size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend?.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-black text-white">{value}</h3>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>Updated just now</span>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const statsData = await getGymDashboardStats();
            setData(statsData);
        } catch (error) {
            toast.error('Failed to fetch dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-zinc-500 font-bold animate-pulse tracking-widest uppercase">INITIALIZING COMMAND CENTER...</p>
            </div>
        );
    }

    const { stats, revenueAnalytics, announcements } = data || { stats: [], revenueAnalytics: { monthlyData: [] }, announcements: [] };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white px-1">OVERVIEW</h1>
                    <p className="text-gray-500">Welcome back to your <span className="text-white font-bold tracking-tight">ELITE DASHBOARD</span></p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        <CalendarCheck size={18} className="text-primary" />
                        <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat: any, i: number) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Analytics */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                Revenue Analytics
                            </h3>
                            <p className="text-sm text-gray-500">Growth over the last 12 months</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold border border-primary/20">
                            Live Pulse
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {revenueAnalytics.monthlyData.map((h: number, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-lg relative group/bar"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                                    ${h}k
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-gray-500 px-1 font-bold">
                        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map(m => (
                            <span key={m}>{m}</span>
                        ))}
                    </div>
                </div>

                {/* Side Panel: Recent Announcements */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Megaphone size={18} className="text-primary" />
                            Latest Broadcasts
                        </h3>
                        <ArrowUpRight size={18} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {announcements.length > 0 ? (
                            announcements.map((ann: any, i: number) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group border-l-2 border-l-primary/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{ann.date}</span>
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                    <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{ann.title}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">{ann.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-white/5 rounded-2xl p-6">
                                <Megaphone className="text-white/10 mb-2" size={32} />
                                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">No active broadcasts</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-colors text-white/50 hover:text-white">
                        Access Command History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
