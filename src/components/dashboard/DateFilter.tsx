import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { DateFilterType, DateRange } from '@/types/finance';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  filterType: DateFilterType;
  dateRange: DateRange;
  onFilterTypeChange: (type: DateFilterType) => void;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateFilter = ({
  filterType,
  dateRange,
  onFilterTypeChange,
  onDateRangeChange,
}: DateFilterProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calculate date ranges based on filter type:
  // Daily: from = today, to = today (same day)
  // Weekly: from = Monday, to = Sunday (current week, Monday as first day)
  // Monthly: from = 1st of month, to = last day of month
  // Custom: user-selected range
  const handleFilterTypeChange = (type: DateFilterType) => {
    onFilterTypeChange(type);
    
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined;

    switch (type) {
      case 'daily':
        // Today only: from = today, to = today
        from = today;
        to = today;
        break;
      case 'weekly':
        // Monday to Sunday of current week
        // startOfWeek with weekStartsOn: 1 means Monday
        from = startOfWeek(today, { weekStartsOn: 1 });
        to = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'monthly':
        // 1st to last day of current month
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      case 'custom':
        // Keep existing range for custom
        return;
    }

    onDateRangeChange({ from, to });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card/50 rounded-xl border border-border">
      <Tabs value={filterType} onValueChange={(v) => handleFilterTypeChange(v as DateFilterType)}>
        <TabsList className="bg-muted">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
      </Tabs>

      {filterType === 'custom' && (
        <div className="flex items-center gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Select date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  onDateRangeChange({ from: range?.from, to: range?.to });
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Quick presets */}
      <div className="flex gap-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateRangeChange({ from: subDays(new Date(), 7), to: new Date() })}
        >
          Last 7 days
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDateRangeChange({ from: subDays(new Date(), 30), to: new Date() })}
        >
          Last 30 days
        </Button>
      </div>
    </div>
  );
};
