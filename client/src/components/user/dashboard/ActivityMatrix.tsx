import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, subDays, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";
import type { IActivityData } from "@/interfaces/user/IUserDashboard";

interface ActivityMatrixProps {
  activityData: IActivityData;
}

import { motion, AnimatePresence } from 'framer-motion';

const ActivityMatrix: React.FC<ActivityMatrixProps> = ({ activityData }) => {
  const [hoveredDay, setHoveredDay] = useState<{ date: Date; level: number; activities: string[]; x: number; y: number } | null>(null);
  
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
    <div className="relative group/matrix">
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
                
                return (
                  <div
                    key={di}
                    onMouseEnter={(e) => {
                      if (isFuture) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const parentRect = e.currentTarget.closest('.group\\/matrix')?.getBoundingClientRect();
                      if (parentRect) {
                        setHoveredDay({
                          date,
                          level,
                          activities,
                          x: rect.left - parentRect.left + rect.width / 2,
                          y: rect.top - parentRect.top - 10
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={cn(
                      "w-[12px] h-[12px] md:w-[14px] md:h-[14px] rounded-[2px] md:rounded-[3px] transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer relative",
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

      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 pointer-events-none bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl min-w-[150px] backdrop-blur-xl"
            style={{ 
              left: hoveredDay.x, 
              top: hoveredDay.y, 
              transform: 'translate(-50%, -100%)' 
            }}
          >
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic border-b border-white/5 pb-1 mb-1">
                {format(hoveredDay.date, "MMM dd, yyyy")}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white uppercase">{hoveredDay.level} {hoveredDay.level === 1 ? 'Activity' : 'Activities'}</span>
                <div className="flex gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < hoveredDay.level ? "bg-cyan-500" : "bg-white/10")} />
                  ))}
                </div>
              </div>
              {hoveredDay.activities.length > 0 && (
                <div className="pt-1.5 flex flex-wrap gap-1">
                  {hoveredDay.activities.map((a, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 text-[8px] font-black uppercase tracking-tighter">
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityMatrix;
