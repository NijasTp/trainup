import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-6 bg-neutral-900 rounded-[2rem]", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-6",
                caption: "flex justify-center pt-2 relative items-center mb-4",
                caption_label: "text-lg font-bold tracking-tighter uppercase italic",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-10 w-10 bg-white/5 border-white/10 p-0 opacity-50 hover:opacity-100 rounded-full transition-all hover:scale-110"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-2",
                head_row: "flex w-full mb-4 justify-between",
                head_cell:
                    "text-neutral-500 rounded-md w-12 font-black text-[10px] uppercase tracking-widest text-center",
                row: "flex w-full mt-2 justify-between",
                cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
                    "h-12 w-12"
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-12 w-12 p-0 font-bold aria-selected:opacity-100 rounded-2xl hover:bg-white/10 hover:text-white transition-all"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]",
                day_today: "bg-white/10 text-white font-black border border-white/20",
                day_outside:
                    "day-outside text-neutral-600 opacity-50 aria-selected:bg-white/5 aria-selected:text-neutral-500 aria-selected:opacity-30",
                day_disabled: "text-neutral-800 opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
                    return <Icon className="h-4 w-4" />;
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
