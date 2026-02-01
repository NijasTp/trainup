import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Flame, X } from 'lucide-react';
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
                    // Assuming data is { workouts: [...] } or direct array
                    setSessions(data.workouts || data || []);
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
            <DialogContent className="max-w-none w-screen h-screen m-0 p-0 border-none bg-black/60 backdrop-blur-2xl transition-all duration-500 overflow-y-auto [&>button]:hidden">
                <DialogTitle className="sr-only">Streak Details</DialogTitle>

                <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 relative">
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-12 w-12"
                    >
                        <X className="h-6 w-6" />
                    </Button>

                    <div className="w-full max-w-2xl space-y-12">
                        {/* Header Section */}
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                                className="inline-block"
                            >
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                    <Flame className="h-32 w-32 text-orange-500 fill-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
                                    <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                                        {streak}
                                    </span>
                                </h2>
                                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent uppercase tracking-widest">
                                    Day Streak
                                </p>
                            </motion.div>
                        </div>

                        {/* Calendar Section */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white">Your Consistency</h3>
                                        <p className="text-gray-400 font-medium">Keep the fire burning!</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <Flame className="h-6 w-6 text-orange-500" />
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="h-[300px] flex items-center justify-center">
                                        <div className="animate-spin h-8 w-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full" />
                                    </div>
                                ) : (
                                    <StreakCalendar sessions={sessions} currentStreak={streak} />
                                )}
                            </div>
                        </motion.div>

                        {/* Motivator */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center text-gray-500 font-medium italic"
                        >
                            "The only workout you regret is the one that didn't happen."
                        </motion.p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
