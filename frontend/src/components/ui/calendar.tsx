"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

// Button variant styles for calendar navigation and day buttons
const navButtonStyles = "inline-flex items-center justify-center border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500 rounded-lg h-7 w-7 p-0 opacity-50 hover:opacity-100"
const dayButtonStyles = "inline-flex items-center justify-center bg-transparent text-gray-700 hover:bg-gray-100 rounded-lg h-9 w-9 p-0 font-normal aria-selected:opacity-100"

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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: navButtonStyles,
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-100/50 dark:[&:has([aria-selected].day-outside)]:bg-blue-900/30 [&:has([aria-selected])]:bg-blue-100 dark:[&:has([aria-selected])]:bg-blue-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: dayButtonStyles,
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
        day_outside:
          "day-outside text-gray-400 dark:text-gray-500 aria-selected:bg-blue-100/50 dark:aria-selected:bg-blue-900/30 aria-selected:text-gray-500",
        day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-blue-100 dark:aria-selected:bg-blue-900/50 aria-selected:text-blue-700 dark:aria-selected:text-blue-300",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => 
          orientation === "left" 
            ? <ChevronLeft className="h-4 w-4" /> 
            : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
