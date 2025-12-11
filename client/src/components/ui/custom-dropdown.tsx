import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CustomDropdownProps {
    trigger: React.ReactNode;
    content: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    align?: 'left' | 'right';
    className?: string;
    width?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
    trigger,
    content,
    isOpen,
    onClose,
    align = 'right',
    className,
    width = 'w-56'
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={(e) => e.stopPropagation()}>
                {trigger}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                            "absolute z-50 mt-2 rounded-xl border bg-popover text-popover-foreground shadow-xl overflow-hidden",
                            align === 'right' ? 'right-0' : 'left-0',
                            width,
                            className
                        )}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
