import React, { useState, useMemo } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isFuture,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface StreakCalendarProps {
    sessions: any[]; // Workout sessions from API
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ sessions }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    const workoutDates = useMemo(() => {
        const sessionsArray = Array.isArray(sessions) ? sessions : [];
        return new Set(
            sessionsArray
                .filter(s => s.isDone)
                .map(s => s.date)
        );
    }, [sessions]);

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    return (
        <div className="w-full max-w-sm mx-auto p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextMonth}
                        className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const isWorkoutDay = workoutDates.has(dateStr);
                    const isToday = isSameDay(day, new Date());
                    const isMonth = isSameMonth(day, currentMonth);
                    const isFut = isFuture(day);

                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "relative group aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300",
                                !isMonth && "opacity-20",
                                isFut && "cursor-not-allowed opacity-10",
                                !isFut && "cursor-default"
                            )}
                        >
                            {/* Hover Effect */}
                            {!isFut && (
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 rounded-xl transition-colors duration-300" />
                            )}

                            {/* Streak Highlight */}
                            {isWorkoutDay && (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={cn(
                                        "absolute inset-0 flex items-center justify-center rounded-xl",
                                        isToday ? "bg-orange-500/40 ring-2 ring-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]" : "bg-orange-500/20"
                                    )}
                                />
                            )}

                            <span className={cn(
                                "relative z-10",
                                isWorkoutDay ? "text-orange-100 font-bold" : "text-gray-400",
                                isToday && !isWorkoutDay && "text-white underline underline-offset-4 decoration-primary"
                            )}>
                                {format(day, 'd')}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500/40" />
                    <span>Streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/5 border border-white/10" />
                    <span>Rest</span>
                </div>
            </div>
        </div>
    );
};
