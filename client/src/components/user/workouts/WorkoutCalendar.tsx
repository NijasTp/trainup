import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    parse
} from "date-fns";
import { cn } from "@/lib/utils";
import type { WorkoutSession } from '@/pages/user/Workouts';

interface WorkoutCalendarProps {
    sessions: WorkoutSession[]; // We will pass all sessions here
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function WorkoutCalendar({ sessions, selectedDate, onSelectDate }: WorkoutCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    // Helper to determine day status
    const getDayStatus = (day: Date) => {
        if (isFuture(day)) return 'future';

        const dayStr = format(day, 'yyyy-MM-dd');
        const daySessions = sessions.filter(s => s.date === dayStr);

        if (daySessions.length === 0) return 'yellow'; // No session assigned in past = Yellow (as per requirement)

        const isAnyDone = daySessions.some(s => s.isDone);
        if (isAnyDone) return 'green';

        // If sessions exist but none are done, and it's in the past/today
        return 'red';
    };

    const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

    return (
        <div className="p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        className="h-7 w-7 hover:bg-muted"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNextMonth}
                        className="h-7 w-7 hover:bg-muted"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground/70">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const status = getDayStatus(day);
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onSelectDate(day)}
                            className={cn(
                                "h-8 w-8 mx-auto flex items-center justify-center rounded-md text-xs font-medium transition-all duration-200",
                                !isCurrentMonth && "opacity-30",
                                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                !isSelected && status === 'green' && "bg-green-500/20 text-green-500 hover:bg-green-500/30",
                                !isSelected && status === 'red' && "bg-red-500/20 text-red-500 hover:bg-red-500/30",
                                !isSelected && status === 'yellow' && "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30",
                                status === 'future' && "text-muted-foreground/50 hover:bg-accent/50",
                                isSelected && "bg-primary text-primary-foreground"
                            )}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-3 mt-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Missed</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Rest</span>
                </div>
            </div>
        </div>
    );
}
