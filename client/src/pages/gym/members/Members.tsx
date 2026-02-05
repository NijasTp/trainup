
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Users,
    Filter,
    MoreVertical,
    Download,
    Mail
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockMembers } from '../data/mock';

const Members = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMembers = mockMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white italic">MEMBER MANAGEMENT</h1>
                    <p className="text-gray-500">View and manage your gym community</p>
                </div>
                <div className="flex gap-4">
                    <button className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center gap-2">
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
                            className="bg-white/5 border-white/10 h-12 pl-12 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-gray-400">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
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
                            {filteredMembers.map((member) => (
                                <motion.tr
                                    key={member.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-0.5 border border-primary/20">
                                                <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center font-bold text-primary text-xs">
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="outline" className="border-white/10 bg-white/5 text-gray-300">
                                            {member.planName}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge className={
                                            member.status === 'Active' ? 'bg-green-500/20 text-green-500 border-0' :
                                                member.status === 'Expired' ? 'bg-red-500/20 text-red-500 border-0' :
                                                    'bg-orange-500/20 text-orange-500 border-0'
                                        }>
                                            {member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-gray-400 text-sm font-medium">
                                        {member.joinDate}
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
                </div>
            </div>
        </div>
    );
};

export default Members;
