import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isValid,
  startOfDay,
  isAfter,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plane, Car, CalendarDays, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCalendarEvents, School, CalendarEvent } from '@/hooks/use-calendar-events';

interface CompactCalendarProps {
  selectedSchool: School;
  onEventClick?: (event: CalendarEvent) => void;
}

export function CompactCalendar({ selectedSchool, onEventClick }: CompactCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { getEventsForDate, events } = useCalendarEvents(selectedSchool);

  // Update responsive state
  useEffect(() => {
    const updateResponsive = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateResponsive();
    window.addEventListener('resize', updateResponsive);
    return () => window.removeEventListener('resize', updateResponsive);
  }, []);

  // Auto-select first upcoming event date on load
  useEffect(() => {
    const today = startOfDay(new Date());
    const upcoming = events
      ?.filter(e => isAfter(startOfDay(e.date), today) || startOfDay(e.date).getTime() === today.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    if (upcoming && !selectedDate) {
      setCurrentDate(startOfMonth(upcoming.date));
      setSelectedDate(startOfDay(upcoming.date));
    }
  }, [events, selectedDate]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate, getEventsForDate]);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Event type color
  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'flight': return 'bg-blue-500';
      case 'transport': return 'bg-green-500';
      case 'not-travelling': return 'bg-orange-400';
      default: return 'bg-purple-500';
    }
  };

  // Event icon
  const EventIcon = ({ type }: { type: CalendarEvent['type'] }) => {
    switch (type) {
      case 'flight': return <Plane className="w-3.5 h-3.5" />;
      case 'transport': return <Car className="w-3.5 h-3.5" />;
      case 'not-travelling': return <Home className="w-3.5 h-3.5" />;
      default: return <CalendarDays className="w-3.5 h-3.5" />;
    }
  };

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
    }
  }, [getEventsForDate]);

  // Handle event click
  const handleEventClick = useCallback((event: CalendarEvent) => {
    onEventClick?.(event);
  }, [onEventClick]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Calendar Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                const todayEvents = getEventsForDate(today);
                if (todayEvents.length > 0) setSelectedDate(today);
              }}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {isMobile ? day.charAt(0) : day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const hasEvents = dayEvents.length > 0;
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const isSelected = selectedDate && startOfDay(day).getTime() === startOfDay(selectedDate).getTime();

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  disabled={!hasEvents}
                  className={cn(
                    'relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all',
                    'hover:bg-accent/50',
                    !isCurrentMonth && 'opacity-25',
                    isCurrentDay && 'bg-primary/10 font-semibold',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    hasEvents && !isSelected && 'cursor-pointer',
                    !hasEvents && 'cursor-default'
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    isCurrentDay && !isSelected && 'text-primary',
                    isSelected && 'text-primary-foreground'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            getEventColor(event.type),
                            isSelected && 'bg-primary-foreground/70'
                          )}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className={cn(
                          'text-[8px] leading-none',
                          isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">
              {isValid(selectedDate) && format(selectedDate, 'EEEE, MMMM d')}
            </h4>
            <span className="text-xs text-muted-foreground">
              {selectedDateEvents.length} event{selectedDateEvents.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {selectedDateEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="w-full flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white',
                  getEventColor(event.type)
                )}>
                  <EventIcon type={event.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      event.school === 'benenden' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    )}>
                      {event.school === 'benenden' ? 'Ben' : 'WA'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span>School</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Flight</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Transport</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span>Staying</span>
        </div>
      </div>
    </div>
  );
}

export default CompactCalendar;
