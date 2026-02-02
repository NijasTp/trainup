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
            <DialogContent className="sm:max-w-md bg-zinc-900 border-white/10 shadow-2xl flex flex-col items-center justify-center p-0 overflow-hidden [&>button]:hidden">
                <DialogTitle className="sr-only">Streak Milestone</DialogTitle>
                <DialogDescription className="sr-only">Celebration of your new workout streak milestone!</DialogDescription>
                <div className="relative flex flex-col items-center w-full p-10 text-center space-y-6">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-orange-600/10 blur-3xl -z-10" />

                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Flame className="w-24 h-24 text-orange-500 fill-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white">
                            Daily Streak Unlocked!
                        </h2>
                        <p className="text-gray-400 font-medium text-lg">
                            You have a <span className="text-orange-500 font-bold text-2xl">
                                <AnimatedNumber value={streak} />
                            </span> day streak!
                        </p>
                    </div>

                    <div className="w-full pt-4">
                        <Button
                            onClick={onClose}
                            className="w-full h-14 bg-white text-black hover:bg-gray-200 text-lg font-black rounded-2xl transition-all"
                        >
                            CONTINUE
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
