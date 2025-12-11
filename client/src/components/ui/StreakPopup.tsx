import React, { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface StreakPopupProps {
    isOpen: boolean;
    onClose: () => void;
    streak: number;
}

export const StreakPopup: React.FC<StreakPopupProps> = ({ isOpen, onClose, streak }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none flex flex-col items-center justify-center p-0 overflow-hidden [&>button]:hidden">
                <DialogTitle className="sr-only">Streak Update</DialogTitle>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="relative flex flex-col items-center"
                >
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Flame className="w-40 h-40 text-orange-500 fill-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.8)]" />
                        </motion.div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-4 text-white font-black text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-sans">
                            {streak}
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 text-center"
                    >
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-sm">
                            STREAK!
                        </h2>
                        <p className="text-orange-200 mt-1 font-semibold text-lg drop-shadow-md">
                            You're on fire!
                        </p>
                    </motion.div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};
