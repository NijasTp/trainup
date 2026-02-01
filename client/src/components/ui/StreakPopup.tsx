import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';

interface StreakPopupProps {
    isOpen: boolean;
    onClose: () => void;
    streak: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (value <= 0) {
            setDisplayValue(0);
            return;
        }
        let start = 0;
        const end = value;
        const totalDuration = 1500;
        const incrementTime = Math.max(totalDuration / end, 16); // cap at ~60fps

        const timer = setInterval(() => {
            start += 1;
            setDisplayValue(start);
            if (start >= end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{displayValue}</span>;
};

export const StreakPopup: React.FC<StreakPopupProps> = ({ isOpen, onClose, streak }) => {
    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#f97316', '#ea580c', '#ffffff']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#f97316', '#ea580c', '#ffffff']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();

            const timer = setTimeout(() => {
                onClose();
            }, 5000); // 5 seconds for premium feel
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none flex flex-col items-center justify-center p-0 overflow-hidden [&>button]:hidden">
                <DialogTitle className="sr-only">Streak Milestone</DialogTitle>
                <DialogDescription className="sr-only">Celebration of your new workout streak milestone!</DialogDescription>
                <motion.div
                    initial={{ scale: 0.6, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 15, stiffness: 150 }}
                    className="relative flex flex-col items-center group"
                >
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-orange-600 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />

                    <div className="relative bg-zinc-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative z-10"
                            >
                                <Flame className="w-32 h-32 text-orange-500 fill-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.6)]" />
                            </motion.div>

                            {/* Particles behind flame */}
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent blur-xl" />
                        </div>

                        <div className="space-y-2">
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl font-black text-white px-2"
                            >
                                Daily Streak Unlocked!
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-400 font-medium text-lg leading-relaxed"
                            >
                                You have a <span className="text-orange-500 font-bold text-2xl px-1">
                                    <AnimatedNumber value={streak} />
                                </span> day streak — keep going!
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 }}
                            className="w-full pt-4"
                        >
                            <Button
                                onClick={onClose}
                                className="w-full h-14 bg-white text-black hover:bg-gray-200 text-lg font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                            >
                                CONTINUE
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};
