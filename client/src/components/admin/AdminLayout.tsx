import type React from "react";
import { useState } from "react";
import { SidebarProvider } from "../../context/SidebarContext";
import AppSidebar from "./layout/AppSidebar";
import AppHeader from "./layout/AppHeader";
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

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
            <AppSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col relative z-10 overflow-hidden transition-all duration-300"
                style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
            >
                <AppHeader />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
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

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
};
