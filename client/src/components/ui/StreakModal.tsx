import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { StreakCalendar } from './StreakCalendar';
import { getAllSessions } from '@/services/workoutService';
import { Button } from '@/components/ui/button';

interface StreakModalProps {
    isOpen: boolean;
    onClose: () => void;
    streak: number;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, streak }) => {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchSessions = async () => {
                setLoading(true);
                try {
                    const data = await getAllSessions();
                    // Fix: extract the sessions array from the response object
                    const sessionsArray = data.sessions || data.workouts || (Array.isArray(data) ? data : []);
                    setSessions(sessionsArray);
                } catch (error) {
                    console.error("Failed to fetch sessions for streak calendar", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchSessions();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-zinc-950/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                <DialogTitle className="sr-only">Streak Details</DialogTitle>
                <DialogDescription className="sr-only">View your workout consistency and current streak.</DialogDescription>

                <div className="relative p-8 md:p-10">

                    <div className="space-y-6">
                        {/* Header Section - Horizontal Row */}
                        <div className="flex flex-row items-center justify-between gap-6 bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10 space-y-0 text-left"
                            >
                                <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                    <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                                        {streak}
                                    </span>
                                </h2>
                                <p className="text-base md:text-lg font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent uppercase tracking-widest">
                                    Day Streak
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, x: 20 }}
                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                                className="relative z-10"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 transition-opacity duration-500" />
                                    <Flame className="h-20 w-20 md:h-24 md:w-24 text-orange-500 fill-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Calendar Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div className="space-y-0.5">
                                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Your Consistency</h3>
                                        <p className="text-gray-400 text-xs md:text-sm font-medium">Keep the fire burning!</p>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Flame className="h-4 w-4 text-orange-500" />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="h-[180px] flex items-center justify-center">
                                        <div className="animate-spin h-5 w-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full" />
                                    </div>
                                ) : (
                                    <StreakCalendar sessions={sessions} />
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
