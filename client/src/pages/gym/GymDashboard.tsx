
import { Users, Dumbbell, CalendarCheck, CreditCard, IndianRupee, Plus, Megaphone, Briefcase, UsersRound } from 'lucide-react';
import GymPageLayout from '@/components/layouts/GymPageLayout';

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
                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="flex items-center justify-center gap-3 bg-blue-600/80 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 border border-blue-500/50 backdrop-blur-sm group">
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span>Create Plan</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-medium py-4 px-6 rounded-xl transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm">
                            <Briefcase size={20} className="text-green-400" />
                            <span>Trainer Hiring</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-medium py-4 px-6 rounded-xl transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm">
                            <Megaphone size={20} className="text-purple-400" />
                            <span>Announcement</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-medium py-4 px-6 rounded-xl transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm">
                            <UsersRound size={20} className="text-amber-400" />
                            <span>Employees</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity / Charts Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center text-gray-400">
                        Graph Placeholder
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[300px]">
                        <h3 className="font-semibold text-white mb-4">Recent Joinees</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600"></div>
                                    <div>
                                        <p className="text-white font-medium">New Member {i}</p>
                                        <p className="text-xs text-gray-500">Joined today</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </GymPageLayout>
    );
}
