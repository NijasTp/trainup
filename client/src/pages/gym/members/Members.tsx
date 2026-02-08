import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Users,
    Filter,
    MoreVertical,
    Download,
    Mail,
    Loader2,
    ChevronLeft,
    ChevronRight,
    UserX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getGymMembers } from '@/services/gymService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const Members = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    useEffect(() => {
        fetchMembers();
    }, [page, searchTerm]);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const data = await getGymMembers(page, limit, searchTerm);
            setMembers(data.members);
            setTotalPages(data.totalPages);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-500/20 text-green-500 border-0';
            case 'expired': return 'bg-red-500/20 text-red-500 border-0';
            case 'cancelled': return 'bg-gray-500/20 text-gray-500 border-0';
            default: return 'bg-orange-500/20 text-orange-500 border-0';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic">MEMBER MANAGEMENT</h1>
                    <p className="text-gray-500">View and manage your gym community</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 flex-1 md:flex-none">
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
                        <Input
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl text-white outline-none focus:ring-0"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400 flex-1 md:flex-none flex justify-center">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-zinc-500 font-bold animate-pulse">LOADING MEMBERS...</p>
                        </div>
                    ) : members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                            <UserX className="text-zinc-700" size={60} />
                            <p className="text-zinc-500 font-bold">NO MEMBERS FOUND</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    <th className="px-8 py-4">Member</th>
                                    <th className="px-8 py-4">Plan</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Joined</th>
                                    <th className="px-8 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {members.map((membership) => (
                                    <motion.tr
                                        key={membership._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                                                    {membership.userId?.profileImage ? (
                                                        <img src={membership.userId.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-primary text-xs">
                                                            {membership.userId?.name?.substring(0, 2).toUpperCase() || '??'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{membership.userId?.name || 'Unnamed'}</p>
                                                    <p className="text-xs text-gray-500">{membership.userId?.email || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="outline" className="border-white/10 bg-white/5 text-gray-300">
                                                {membership.planId?.name || 'Unknown Plan'}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge className={getStatusColor(membership.status)}>
                                                {membership.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 text-gray-400 text-sm font-medium">
                                            {format(new Date(membership.joinedAt || membership.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center gap-2">
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                                                    <Mail size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && members.length > 0 && (
                    <div className="p-6 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-gray-500 font-bold">
                            PAGE {page} OF {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Members;

