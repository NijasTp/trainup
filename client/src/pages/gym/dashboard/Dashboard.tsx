
import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CreditCard,
    CalendarCheck,
    Package,
    TrendingUp,
    ArrowUpRight,
    Clock,
    Megaphone
} from 'lucide-react';
import { mockMembers, mockPlans, mockAttendance, mockProducts, mockAnnouncements } from '../data/mock';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${trend.includes('+') ? 'text-green-500' : 'text-primary'}`}>
                <Icon size={24} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
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

const Dashboard = () => {
    const stats = [
        { title: 'Total Members', value: mockMembers.length, icon: Users, trend: '+12%', color: 'from-blue-500 to-cyan-500' },
        { title: 'Active Plans', value: mockPlans.length, icon: CreditCard, trend: '+3%', color: 'from-purple-500 to-pink-500' },
        { title: 'Today Attendance', value: mockAttendance.length, icon: CalendarCheck, trend: '+18%', color: 'from-orange-500 to-amber-500' },
        { title: 'Store Products', value: mockProducts.length, icon: Package, trend: 'Stable', color: 'from-primary to-indigo-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white px-1">OVERVIEW</h1>
                    <p className="text-gray-500">Good morning, <span className="text-white font-bold">Elite Fitness Center</span></p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        <CalendarCheck size={18} className="text-primary" />
                        <span className="text-sm font-medium">March 20, 2024</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Placeholder */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden group min-h-[400px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" />
                                Revenue Analytics
                            </h3>
                            <p className="text-sm text-gray-500">Growth over the last 30 days</p>
                        </div>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none">
                            <option>Last 30 Days</option>
                            <option>Last 6 Months</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-lg relative group/bar"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                    ${h}k
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-gray-500 px-1 font-bold">
                        <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                        <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                    </div>
                </div>

                {/* Side Panel: Recent Announcements */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Megaphone size={18} className="text-primary" />
                            Latest Updates
                        </h3>
                        <ArrowUpRight size={18} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
                    </div>

                    <div className="space-y-4 flex-1">
                        {mockAnnouncements.map((ann, i) => (
                            <div key={ann.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{ann.date}</span>
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                </div>
                                <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{ann.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2">{ann.description}</p>
                            </div>
                        ))}
                    </div>

                    <button className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-colors">
                        View All Announcements
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
