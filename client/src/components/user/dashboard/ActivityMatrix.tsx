import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, subDays, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import type { IActivityData } from "@/interfaces/user/IUserDashboard";

interface ActivityMatrixProps {
  activityData: IActivityData;
}

const ActivityMatrix: React.FC<ActivityMatrixProps> = ({ activityData }) => {
  const today = new Date();
  const startDate = subDays(today, 364); // 1 year ago
  const startOfFirstWeek = startOfWeek(startDate);
  const days = eachDayOfInterval({ start: startOfFirstWeek, end: today });

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getLevelInfo = (date: Date) => {
    const dStr = format(date, "yyyy-MM-dd");
    const data = activityData[dStr];
    if (!data) return { level: 0, activities: [] };
    const activities = [];
    if (data.workout) activities.push("Workout");
    if (data.meal) activities.push("Meal Logged");
    if (data.weight) activities.push("Weight Logged");
    if (data.gym) activities.push("Gym Attendance");
    return { level: activities.length, activities };
  };

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-4 scrollbar-hide">
      {weeks.map((week, wi) => {
        const showMonth = wi > 0 && !isSameMonth(week[0], weeks[wi - 1][0]);
        return (
          <div key={wi} className="flex flex-col gap-[3px] relative pt-6">
            {showMonth && (
              <span className="absolute top-0 left-0 text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">
                {format(week[0], 'MMM')}
              </span>
            )}
            {week.map((date, di) => {
              const { level, activities } = getLevelInfo(date);
              const isFuture = date > today;
              const tooltipText = isFuture 
                ? format(date, "MMM dd, yyyy") 
                : `${format(date, "MMM dd, yyyy")} - ${level} ${level === 1 ? 'activity' : 'activities'}${level > 0 ? `: ${activities.join(", ")}` : ''}`;
              
              return (
                <div
                  key={di}
                  title={tooltipText}
                  className={cn(
                    "w-[12px] h-[12px] md:w-[14px] md:h-[14px] rounded-[2px] md:rounded-[3px] transition-all duration-500 hover:scale-125 hover:z-10 cursor-pointer",
                    isFuture ? "bg-transparent" :
                    level === 0 ? "bg-white/[0.03] border border-white/[0.02]" :
                    level === 1 ? "bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]" :
                    level === 2 ? "bg-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]" :
                    level === 3 ? "bg-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]" :
                    "bg-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                  )}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ActivityMatrix;
