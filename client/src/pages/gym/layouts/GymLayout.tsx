
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    ClipboardList,
    Dumbbell,
    Users,
    CalendarCheck,
    Store,
    Megaphone,
    Briefcase,
    Flame,
    Menu,
    X,
    LogOut,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Aurora from '@/components/ui/Aurora';

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    active: boolean;
    isOpen: boolean;
}

const SidebarItem = ({ icon: Icon, label, path, active, isOpen }: SidebarItemProps) => (
    <Link to={path}>
        <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${active
                ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            <Icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
            <AnimatePresence>
                {isOpen && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-medium whitespace-nowrap"
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    </Link>
);

const GymLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/gym/dashboard' },
        { icon: User, label: 'Profile', path: '/gym/profile' },
        { icon: ClipboardList, label: 'Plans', path: '/gym/plans' },
        { icon: Dumbbell, label: 'Equipment', path: '/gym/equipment' },
        { icon: Users, label: 'Members', path: '/gym/members' },
        { icon: CalendarCheck, label: 'Attendance', path: '/gym/attendance' },
        { icon: Store, label: 'Store', path: '/gym/store' },
        { icon: Megaphone, label: 'Announcements', path: '/gym/announcements' },
        { icon: Briefcase, label: 'Jobs', path: '/gym/jobs' },
        { icon: Flame, label: 'Workout Templates', path: '/gym/workouts' },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[#030303] text-white flex overflow-hidden font-outfit">
            {/* Background Visuals */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#020617", "#0f172a", "#020617"]}
                    amplitude={1.1}
                    blend={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="relative z-20 h-screen bg-white/5 backdrop-blur-2xl border-r border-white/10 p-4 flex flex-col gap-8 transition-all duration-300"
            >
                <div className="flex items-center justify-between px-2">
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black">T</div>
                                <span className="text-xl font-black tracking-tighter">TRAINUP <span className="text-primary text-xs ml-1">GYM</span></span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname.startsWith(item.path)}
                            isOpen={isSidebarOpen}
                        />
                    ))}
                </nav>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Top Navbar */}
                <header className="h-20 bg-white/5 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-300 capitalize">
                        {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                    </h2>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
                        </button>
                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold">Elite Fitness Center</p>
                                <p className="text-xs text-gray-500">Gym Manager</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/50 border border-white/20 p-0.5">
                                <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center font-bold text-primary">EF</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default GymLayout;
