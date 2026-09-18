import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

interface InteractiveCalendarProps {
  initialHolidays?: Date[];
  onSave: (dates: Date[]) => void;
  loading?: boolean;
}

export default function InteractiveCalendar({ initialHolidays = [], onSave, loading }: InteractiveCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>(initialHolidays);

  const handleSelect = (dates: Date[] | undefined) => {
    setSelectedDates(dates || []);
  };

  return (
    <div className="flex flex-col items-center bg-card p-4 rounded-xl border border-border shadow-sm">
      <h3 className="text-sm font-bold mb-2">Select Blackout Dates (Holidays)</h3>
      <p className="text-xs text-muted-foreground mb-4 text-center">
        Click to toggle days off. No deliveries will be scheduled on these dates.
      </p>
      
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onSelect={handleSelect}
        className="rounded-md border shadow-sm"
        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
        classNames={{
          day_selected: "bg-rose-500 text-white hover:bg-rose-600 focus:bg-rose-600",
        }}
      />
      
      <div className="flex justify-end w-full mt-4">
        <Button 
          onClick={() => onSave(selectedDates)} 
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          {loading ? "Saving..." : "Save Calendar"}
        </Button>
      </div>
    </div>
  )
}
