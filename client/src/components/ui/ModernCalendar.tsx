import * as React from "react";
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    isToday
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModernCalendarProps {
    selected?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
}

const ModernCalendar: React.FC<ModernCalendarProps> = ({ 
    selected, 
    onSelect, 
    className 
}) => {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className={cn("p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] shadow-2xl w-[400px]", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={prevMonth}
                        className="h-10 w-10 rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400 transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={nextMonth}
                        className="h-10 w-10 rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-neutral-400 transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 mb-4">
                {daysOfWeek.map((day) => (
                    <div 
                        key={day} 
                        className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                    const isSelected = selected && isSameDay(day, selected);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onSelect?.(day)}
                            className={cn(
                                "h-12 w-12 flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-300",
                                !isCurrentMonth && "text-neutral-800 opacity-20 hover:opacity-100",
                                isCurrentMonth && !isSelected && "text-neutral-400 hover:bg-white/5 hover:text-white",
                                isSelected && "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-110 z-10",
                                isTodayDate && !isSelected && "border border-white/20 text-white bg-white/5"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export { ModernCalendar };
