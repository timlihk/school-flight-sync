import { useEffect, useState } from 'react';
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
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useCalendarEvents, School, CalendarEvent } from '@/hooks/use-calendar-events';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CompactCalendarProps {
  selectedSchool: School;
  onSelectTermIds?: (termIds: string[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function CompactCalendar({ selectedSchool, onSelectTermIds, onEventClick }: CompactCalendarProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthsToShow, setMonthsToShow] = useState(1);
  const { getEventsForDate } = useCalendarEvents(selectedSchool);

  // Calculate how many months to show based on screen width; update on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateMonths = () => {
      const width = window.innerWidth;
      if (width >= 1536) return 3; // 2xl
      if (width >= 1024) return 2; // lg
      return 1;
    };

    const update = () => setMonthsToShow(calculateMonths());
    update();

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'term':
        return 'bg-purple-500';
      case 'flight':
        return 'bg-blue-500';
      case 'transport':
        return 'bg-green-500';
      case 'not-travelling':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderEventDots = (events: CalendarEvent[]) => {
    const uniqueTypes = [...new Set(events.map(e => e.type))];

    return (
      <div className="flex gap-0.5 justify-center mt-0.5">
        {uniqueTypes.slice(0, 3).map(type => (
          <div
            key={type}
            className={cn(
              'w-1 h-1 rounded-full',
              getEventTypeColor(type)
            )}
          />
        ))}
      </div>
    );
  };

  const renderEventDetails = (events: CalendarEvent[]) => {
    return (
      <div className="space-y-2 max-w-xs">
        <div className="font-semibold text-xs">
          {format(events[0].date, 'MMMM d, yyyy')}
        </div>
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              'pb-1.5',
              index !== events.length - 1 && 'border-b',
              'cursor-pointer hover:bg-accent/60 rounded-sm px-1 transition-colors'
            )}
            onClick={() => {
              if (onEventClick) {
                onEventClick(event);
              } else {
                const termIds = getTermIdsFromEvents([event]);
                openTermViaUrl(termIds, event);
              }
            }}
          >
            <div className="flex items-start gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0', getEventTypeColor(event.type))} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs">{event.title}</div>
                {event.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                )}
                {event.type === 'flight' && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <div>{event.details.departure.airport} → {event.details.arrival.airport}</div>
                  </div>
                )}
                {event.type === 'transport' && event.details.driverName && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Driver: {event.details.driverName}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {event.school === 'benenden' ? 'Ben' : 'WA'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getTermIdsFromEvents = (events: CalendarEvent[]) =>
    Array.from(
      new Set(
        events
          .map(event => {
            if (event.type === 'term') return (event.details as any)?.id;
            if (event.type === 'not-travelling') {
              return (event.details?.term as any)?.id ?? event.details?.termId;
            }
            return (event.details as any)?.termId || (event.details as any)?.term?.id;
          })
          .filter(Boolean) as string[]
      )
    );

  const openTermViaUrl = (termIds: string[], event?: CalendarEvent) => {
    if (!termIds.length) return;

    const firstTermId = termIds[0];
    const params = new URLSearchParams();
    params.set('highlight', termIds.join(','));
    params.set('termId', firstTermId);
    if (event?.type) {
      params.set('open', event.type);
    }

    navigate(`/?${params.toString()}`);
  };

  const renderMonth = (monthOffset: number) => {
    const monthDate = addMonths(currentDate, monthOffset);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <div key={monthOffset} className="flex-1 min-w-0">
        <div className="text-center mb-2">
          <h3 className="text-sm font-semibold">
            {format(monthDate, 'MMMM yyyy')}
          </h3>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {/* Week Day Headers */}
          {weekDays.map((day, i) => (
            <div
              key={i}
              className="bg-muted p-1 text-center text-xs font-medium"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map(day => {
            const events = getEventsForDate(day);
            const hasEvents = events.length > 0;
            const isCurrentMonth = isSameMonth(day, monthDate);
            const isCurrentDay = isToday(day);

            const handleDayClick = () => {
              if (!hasEvents) return;

              const termIds = getTermIdsFromEvents(events);

              if (termIds.length && onSelectTermIds) {
                onSelectTermIds(termIds);
              }

              if (onEventClick) {
                onEventClick(events[0]);
              } else {
                openTermViaUrl(termIds, events[0]);
              }
            };

            return (
              <HoverCard key={day.toString()} openDelay={200}>
                <HoverCardTrigger asChild>
                  <div
                    className={cn(
                      'bg-background p-1 min-h-[32px] sm:min-h-[40px] relative cursor-pointer hover:bg-accent transition-colors',
                      !isCurrentMonth && 'opacity-30',
                      isCurrentDay && 'ring-1 ring-primary ring-inset'
                    )}
                    onClick={handleDayClick}
                  >
                    <div className={cn(
                      'text-xs text-center',
                      isCurrentDay && 'text-primary font-bold'
                    )}>
                      {format(day, 'd')}
                    </div>
                    {hasEvents && renderEventDots(events)}
                  </div>
                </HoverCardTrigger>
                {hasEvents && (
                  <HoverCardContent className="w-auto" side="top">
                    {renderEventDetails(events)}
                  </HoverCardContent>
                )}
              </HoverCard>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upcoming Events</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Legend */}
        <div className="flex gap-3 mb-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Term Dates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Flights</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Transport</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Not Travelling</span>
          </div>
        </div>

        {/* Responsive Month Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          {Array.from({ length: monthsToShow }, (_, i) => renderMonth(i))}
        </div>
      </CardContent>
    </Card>
  );
}
