import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CreditCard,
    CalendarCheck,
    Package,
    TrendingUp,
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

    const { stats, revenueAnalytics, announcements, membershipDistribution } = data || {
        stats: [],
        revenueAnalytics: { monthlyData: [], currentMonth: 0 },
        announcements: [],
        membershipDistribution: []
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white px-1 italic">COMMAND CENTER</h1>
                    <p className="text-gray-500">Welcome back to your <span className="text-white font-bold tracking-tight uppercase">Elite Portal</span></p>
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
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group min-h-[400px]">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                Revenue Pulse
                            </h3>
                            <p className="text-sm text-gray-500 italic">Projected growth vs actual performance</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Current Month</span>
                            <span className="text-2xl font-black text-primary ml-2">₹{(revenueAnalytics.currentMonth / 1000).toFixed(1)}k</span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {revenueAnalytics.monthlyData.map((h: number, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(h * 2, 100)}%` }} // Scaled for visibility
                                    className="w-full bg-gradient-to-t from-primary/10 to-primary rounded-t-xl relative group/bar min-h-[4px]"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover:scale-100 z-10 shadow-2xl">
                                        ₹{h}k
                                    </div>
                                </motion.div>
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Panels Column */}
                <div className="space-y-8">
                    {/* Membership Distribution */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 italic">
                            <CreditCard size={18} className="text-primary" />
                            DEPLOYMENT BREAKDOWN
                        </h3>
                        <div className="space-y-6">
                            {membershipDistribution?.length > 0 ? (
                                membershipDistribution.map((item: any, i: number) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                            <span className="text-gray-400">{item.name}</span>
                                            <span className="text-white">{item.count} Active</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(item.count / stats[0]?.value) * 100}%` }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No membership data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2 italic">
                                <Megaphone size={18} className="text-primary" />
                                LATEST UPDATES
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {announcements.length > 0 ? (
                                announcements.map((ann: any, i: number) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{ann.date}</span>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{ann.title}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1 font-medium">{ann.description}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No active updates</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
