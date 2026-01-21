
import { Users, Dumbbell, CalendarCheck, CreditCard, IndianRupee, Plus, Megaphone, Briefcase, UsersRound, ArrowRight } from 'lucide-react';
import GymPageLayout from '@/components/layouts/GymPageLayout';
import { Button } from '@/components/ui/button';

export default function GymDashboard() {
    const stats = [
        { label: 'Total Members', value: '1,248', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Active Trainers', value: '18', icon: Dumbbell, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        { label: "Today's Attendance", value: '187', icon: CalendarCheck, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { label: 'Active Subscriptions', value: '842', icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { label: 'Monthly Revenue', value: '₹4.82L', icon: IndianRupee, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    ];

    return (
        <GymPageLayout
            title="Gym Dashboard"
            subtitle="Overview of your gym's performance and quick actions."
        >
            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} shadow-lg shadow-black/20`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black text-white mt-1 group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-white group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10">
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
                        Quick Console
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <button className="flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-6 px-8 rounded-2xl transition-all hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] border border-blue-400/20 group">
                            <Plus size={22} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span className="text-lg">Create Plan</span>
                        </button>
                        <button className="flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 text-white font-bold py-6 px-8 rounded-2xl transition-all border border-white/10 hover:border-white/20 group">
                            <Briefcase size={22} className="text-green-400 group-hover:scale-110 transition-transform" />
                            <span className="text-lg">Trainer Hiring</span>
                        </button>
                        <button className="flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 text-white font-bold py-6 px-8 rounded-2xl transition-all border border-white/10 hover:border-white/20 group">
                            <Megaphone size={22} className="text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-lg">Announcement</span>
                        </button>
                        <button className="flex items-center justify-center gap-4 bg-white/5 hover:bg-white/10 text-white font-bold py-6 px-8 rounded-2xl transition-all border border-white/10 hover:border-white/20 group">
                            <UsersRound size={22} className="text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="text-lg">Employees</span>
                        </button>
                    </div>
                </div>

                {/* Performance Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-white">Revenue Overview</h3>
                            <select className="bg-white/5 border border-white/10 text-gray-400 text-xs font-bold px-4 py-2 rounded-full outline-none hover:border-white/20 transition-all uppercase tracking-tighter cursor-pointer">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>
                        <div className="flex-1 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-sm bg-black/20 rounded-3xl border border-white/5">
                            Interactive Chart Component
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10">
                        <h3 className="text-xl font-black text-white mb-8">New Talents</h3>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                                        M{i}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-black">Member Pulse #{i}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Joined 2h ago</p>
                                    </div>
                                    <button className="text-gray-500 hover:text-white transition-colors">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-8 text-gray-400 hover:text-white font-bold h-12 rounded-xl">
                            View All Members
                        </Button>
                    </div>
                </div>
            </div>
        </GymPageLayout>
    );
}
