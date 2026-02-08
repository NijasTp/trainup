import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Search,
    Clock,
    Loader2,
    Calendar as CalendarIcon,
    AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getGymAttendance } from '@/services/gymService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Attendance = () => {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        todayEntries: 0,
        weeklyAverage: 0,
        peakHour: 'N/A'
    });

    useEffect(() => {
        fetchAttendance();
    }, [selectedDate]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const data = await getGymAttendance(selectedDate);
            setRecords(data.records);
            setStats(data.stats);
        } catch (error) {
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = records.filter(r =>
        r.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic">ATTENDANCE TRACKER</h1>
                    <p className="text-gray-500">Monitor daily member check-ins</p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl w-full md:w-auto">
                    <CalendarIcon size={18} className="text-primary ml-2" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-white font-bold outline-none uppercase text-sm cursor-pointer"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Entries', value: stats.todayEntries.toString(), icon: Users, color: 'text-primary' },
                    { label: 'Weekly Average', value: stats.weeklyAverage.toString(), icon: TrendingUp, color: 'text-green-500' },
                    { label: 'Peak Hour', value: stats.peakHour, icon: Clock, color: 'text-orange-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between border-b-4 border-b-primary/20">
                        <div>
                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
                        </div>
                        <div className={`p-4 bg-white/5 rounded-2xl border border-white/10 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Filter by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white focus:ring-1 focus:ring-primary/30"
                        />
                    </div>
                    <Badge className="bg-primary/20 text-primary border-0 rounded-lg px-4 py-2 font-bold uppercase tracking-widest">
                        LOGS: {format(new Date(selectedDate), 'MMMM dd, yyyy')}
                    </Badge>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-zinc-500 font-bold animate-pulse">FETCHING LOGS...</p>
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                            <AlertCircle className="text-zinc-700" size={60} />
                            <p className="text-zinc-500 font-bold uppercase italic">No check-ins found for this day</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    <th className="px-8 py-4">Member Name</th>
                                    <th className="px-8 py-4 text-center">Location</th>
                                    <th className="px-8 py-4 text-center">Check-in Time</th>
                                    <th className="px-8 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredRecords.map((record) => (
                                    <motion.tr
                                        key={record._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                                    {record.userId?.profileImage ? (
                                                        <img src={record.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-primary text-xs">
                                                            {record.userId?.name?.substring(0, 2).toUpperCase() || '??'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{record.userId?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{record.userId?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-gray-400 text-sm font-medium">
                                            {record.isValidLocation ? (
                                                <span className="text-green-500/80">In-range</span>
                                            ) : (
                                                <span className="text-red-400">Out-range</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center text-gray-300 font-bold">
                                            {format(new Date(record.checkInTime), 'hh:mm a')}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Badge className={`border-0 ${record.isValidLocation ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {record.isValidLocation ? 'VERIFIED' : 'UNVERIFIED'}
                                            </Badge>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Attendance;

