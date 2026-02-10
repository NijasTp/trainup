import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    Star,
    CreditCard,
    ClipboardList,
    LogOut,
    Menu,
    X,
    ChevronDown
} from "lucide-react";

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    path: string;
    active: boolean;
    isOpen: boolean;
    subItems?: { name: string; path: string }[];
}

const SidebarItem = ({ icon: Icon, label, path, active, isOpen, subItems }: SidebarItemProps) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(active);

    return (
        <div className="flex flex-col gap-1">
            <Link to={subItems ? "#" : path} onClick={() => subItems && setIsSubMenuOpen(!isSubMenuOpen)}>
                <motion.div
                    whileHover={{ scale: 1.02, x: isOpen ? 5 : 0 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center'} py-3 rounded-xl transition-all duration-300 ${active
                        ? 'bg-primary/20 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-primary' : ''}`} />
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex-1 flex items-center justify-between"
                            >
                                <span className="font-medium whitespace-nowrap">{label}</span>
                                {subItems && (
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`} />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </Link>
            {subItems && isOpen && isSubMenuOpen && (
                <div className="flex flex-col gap-1 ml-9">
                    {subItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${useLocation().pathname === item.path
                                ? 'text-primary bg-primary/10'
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const AppSidebar: React.FC<{ isOpen: boolean; setIsOpen: (val: boolean) => void }> = ({ isOpen, setIsOpen }) => {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Building2, label: 'Gyms', path: '/admin/gyms' },
        {
            icon: Briefcase,
            label: 'Trainers',
            path: '/admin/trainers',
            subItems: [
                { name: "Trainer Listing", path: "/admin/trainers" },
                { name: "Trainer Rating", path: "/admin/ratings" },
            ]
        },
        { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
        { icon: ClipboardList, label: 'Templates', path: '/admin/templates' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isOpen ? 280 : 80 }}
            className="fixed left-0 top-0 z-50 h-screen bg-[#060606]/80 backdrop-blur-2xl border-r border-white/10 p-4 flex flex-col gap-8 transition-all duration-300"
        >
            <div className="flex items-center justify-between px-2">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black text-lg">T</div>
                            <span className="text-xl font-black tracking-tighter text-white">TRAINUP <span className="text-primary text-xs ml-1 font-black">ADMIN</span></span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-white ${!isOpen ? 'mx-auto' : ''}`}
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.label}
                        {...item}
                        active={location.pathname.startsWith(item.path)}
                        isOpen={isOpen}
                    />
                ))}
            </nav>

            <div className="pt-4 border-t border-white/10">
                <Link
                    to="/admin/login"
                    className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center'} py-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all`}
                >
                    <LogOut size={20} className="shrink-0" />
                    {isOpen && <span className="font-medium">Logout</span>}
                </Link>
            </div>
        </motion.aside>
    );
};

export default AppSidebar;

