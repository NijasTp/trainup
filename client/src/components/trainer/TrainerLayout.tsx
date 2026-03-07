import type React from "react";
import TrainerSiteHeader from "./general/TrainerHeader";
import { SiteFooter } from "../user/home/UserSiteFooter";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface TrainerLayoutProps {
    children: React.ReactNode;
}

export const TrainerLayout: React.FC<TrainerLayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#030303] flex flex-col font-outfit text-white selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Premium Aurora Background */}
            <div className="fixed inset-0 z-0 bg-[#030303] overflow-hidden pointer-events-none">
                {/* Moving Aurora Blobs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 100, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]"
                />
                <motion.div
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] left-[30%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px]"
                />

                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <TrainerSiteHeader />

            <main className="relative flex-1 z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="container mx-auto px-6 py-12"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            <SiteFooter />
        </div>
    );
};
