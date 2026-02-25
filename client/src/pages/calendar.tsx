import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/layout";
import { useTrackerEntries, useTrackers } from "@/hooks/use-trackers";
import { BottomSheet } from "@/components/bottom-sheet";
import { motion } from "framer-motion";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStr = format(currentMonth, "yyyy-MM");
  
  const { data: entries } = useTrackerEntries({ month: monthStr });
  const { data: trackers } = useTrackers();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Calculate empty cells for the first row to align days of week
  const startDayOfWeek = startOfMonth(currentMonth).getDay();
  const emptyDays = Array.from({ length: startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 }); // Assuming Monday start
  
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <AppLayout>
      <div className="sticky top-0 z-30 glass px-6 pt-safe pb-4 flex items-center justify-between border-b border-border/50">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-secondary rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</h1>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-secondary rounded-full">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
          {weekDays.map(day => (
            <div key={day} className="text-xs font-semibold text-muted-foreground mb-2">{day}</div>
          ))}
          
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-14" />
          ))}

          {days.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayEntries = entries?.filter(e => e.date === dateStr) || [];
            const isToday = isSameDay(day, new Date());
            
            return (
              <motion.button
                whileTap={{ scale: 0.9 }}
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`h-14 flex flex-col items-center justify-start py-1 rounded-xl transition-colors ${isToday ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-secondary'}`}
              >
                <span className="text-sm mb-1">{format(day, "d")}</span>
                
                {/* Dots container */}
                <div className="flex flex-wrap justify-center gap-0.5 px-1 max-w-full">
                  {dayEntries.slice(0, 4).map(entry => {
                    const tracker = trackers?.find(t => t.id === entry.trackerId);
                    return (
                      <div 
                        key={entry.id} 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: tracker?.color || 'gray' }}
                      />
                    );
                  })}
                  {dayEntries.length > 4 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Day Details Sheet */}
      <BottomSheet 
        isOpen={!!selectedDate} 
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(selectedDate, "EEEE, MMMM d") : ""}
      >
        <div className="space-y-4 pb-6">
          {(() => {
            if (!selectedDate) return null;
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            const dayEntries = entries?.filter(e => e.date === dateStr) || [];

            if (dayEntries.length === 0) {
              return <div className="text-center text-muted-foreground py-8">No trackers recorded for this day.</div>;
            }

            return dayEntries.map(entry => {
              const tracker = trackers?.find(t => t.id === entry.trackerId);
              if (!tracker) return null;
              
              return (
                <div key={entry.id} className="p-4 rounded-2xl bg-secondary/30 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tracker.color }} />
                    <span className="font-semibold">{tracker.name}</span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-foreground bg-card p-3 rounded-xl shadow-sm border border-border/50">
                      {entry.note}
                    </p>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </BottomSheet>
    </AppLayout>
  );
}
