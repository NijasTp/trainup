
import React from 'react';
import { motion } from 'framer-motion';
import {
    CalendarCheck,
    TrendingUp,
    Users,
    Search,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockAttendance } from '../data/mock';

const Attendance = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">ATTENDANCE TRACKER</h1>
                    <p className="text-gray-500">Monitor daily member check-ins</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Today Entries', value: '24', icon: Users, color: 'text-primary' },
                    { label: 'Weekly Average', value: '182', icon: TrendingUp, color: 'text-green-500' },
                    { label: 'Peak Hour', value: '06:00 PM', icon: Clock, color: 'text-orange-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black">{stat.value}</h3>
                        </div>
                        <div className={`p-4 bg-white/5 rounded-2xl border border-white/10 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Filter by name..."
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl"
                        />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-0 rounded-lg px-4 py-2 font-bold">
                        DATE: MARCH 20, 2024
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                <th className="px-8 py-4">Member Name</th>
                                <th className="px-8 py-4 text-center">Date</th>
                                <th className="px-8 py-4 text-center">Time</th>
                                <th className="px-8 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockAttendance.map((record) => (
                                <motion.tr
                                    key={record.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <span className="font-bold text-white">{record.memberName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center text-gray-400 text-sm font-medium">
                                        {record.date}
                                    </td>
                                    <td className="px-8 py-6 text-center text-gray-300 font-bold">
                                        {record.time}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <Badge className="bg-green-500/10 text-green-500 border border-green-500/20">
                                            Verified
                                        </Badge>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
