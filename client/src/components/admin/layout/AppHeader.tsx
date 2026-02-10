import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import UserDropdown from "./UserDropdown";

const AppHeader: React.FC = () => {
    const location = useLocation();

    return (
        <header className="h-20 bg-white/5 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-300 capitalize">
                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
            </h2>

            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
                    />
                </div>

                <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></span>
                </button>

                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white">Admin Central</p>
                        <p className="text-xs text-gray-500 text-primary font-black uppercase tracking-tighter">Super Admin</p>
                    </div>
                    <UserDropdown />
                </div>
            </div>
        </header>
    );
};

export default AppHeader;

