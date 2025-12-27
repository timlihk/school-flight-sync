import { useEffect, useMemo, useState } from 'react';
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
  isValid
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import {
  InteractiveHoverCard,
  InteractiveHoverCardContent,
  InteractiveHoverCardTrigger,
} from '@/components/ui/interactive-hover-card';
import { useCalendarEvents, School, CalendarEvent } from '@/hooks/use-calendar-events';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CompactCalendarProps {
  selectedSchool: School;
  onSelectTermIds?: (termIds: string[]) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

export function CompactCalendar({ selectedSchool, onSelectTermIds: _onSelectTermIds, onEventClick }: CompactCalendarProps) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthsToShow, setMonthsToShow] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileEvents, setMobileEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { getEventsForDate } = useCalendarEvents(selectedSchool);
  const hasAnyEvents = useMemo(() => {
    for (let i = 0; i < monthsToShow; i++) {
      const monthDate = addMonths(currentDate, i);
      const monthStart = startOfWeek(startOfMonth(monthDate));
      const monthEnd = endOfWeek(endOfMonth(monthDate));
      let day = monthStart;
      while (day <= monthEnd) {
        if (getEventsForDate(day).length > 0) return true;
        day = addDays(day, 1);
      }
    }
    return false;
  }, [currentDate, monthsToShow, getEventsForDate]);

  const flatEvents = useMemo(() => {
    const items: { date: Date; events: CalendarEvent[] }[] = [];
    for (let i = 0; i < monthsToShow; i++) {
      const monthDate = addMonths(currentDate, i);
      const monthStart = startOfWeek(startOfMonth(monthDate));
      const monthEnd = endOfWeek(endOfMonth(monthDate));
      let day = monthStart;
      while (day <= monthEnd) {
        const events = getEventsForDate(day);
        if (events.length) {
          items.push({ date: day, events });
        }
        day = addDays(day, 1);
      }
    }
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentDate, monthsToShow, getEventsForDate]);

  // Calculate how many months to show based on screen width; update on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const calculateMonths = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);
      setViewMode(prev => {
        if (mobile) return 'list';
        return prev === 'list' ? 'grid' : prev;
      });
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

  const eventTypeLabel = useMemo(() => ({
    term: 'School Date',
    flight: 'Flight',
    transport: 'Transport',
    'not-travelling': 'Not travelling'
  }), []);

  const flightDirectionLabel = (event: CalendarEvent) => {
    if (event.type !== 'flight') return eventTypeLabel[event.type];
    return (event as any)?.details?.type === 'outbound' ? 'From School' : 'To School';
  };

  const renderEventDetails = (events: CalendarEvent[]) => {
    const formattedDate = events[0]?.date && isValid(events[0].date)
      ? format(events[0].date, 'MMMM d, yyyy')
      : 'Date to be confirmed';

    return (
      <div className="space-y-2 max-w-xs">
        <div className="font-semibold text-xs">
          {formattedDate}
        </div>
        {events.map((event, index) => (
          <button
            key={event.id}
            type="button"
            className={cn(
              'w-full text-left pb-1.5',
              index !== events.length - 1 && 'border-b',
              'cursor-pointer hover:bg-accent/60 rounded-sm px-1 transition-colors'
            )}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[CompactCalendar] Event clicked:', event.title, event.type);
              if (onEventClick) {
                console.log('[CompactCalendar] Using onEventClick callback');
                onEventClick(event);
              } else {
                const termIds = getTermIdsFromEvents([event]);
                console.log('[CompactCalendar] termIds:', termIds);
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
                <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                  <Badge variant="secondary" className="text-[10px]">
                    {flightDirectionLabel(event)}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {event.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}
                  </Badge>
                </div>
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
            </div>
          </button>
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
            const handleMobileOpen = () => {
              if (isMobile && hasEvents) {
                setMobileEvents({ date: day, events });
              }
            };

            if (isMobile) {
              return (
                <div
                  key={day.toString()}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    hasEvents
                      ? `Events on ${format(day, 'MMMM d')}`
                      : `No events on ${format(day, 'MMMM d')}`
                  }
                  className={cn(
                    'bg-background p-1 min-h-[32px] sm:min-h-[40px] relative hover:bg-accent transition-colors',
                    !isCurrentMonth && 'opacity-30',
                    isCurrentDay && 'ring-1 ring-primary ring-inset',
                    hasEvents && 'cursor-pointer'
                  )}
                  onClick={handleMobileOpen}
                >
                  <div className={cn(
                    'text-xs text-center',
                    isCurrentDay && 'text-primary font-bold'
                  )}>
                    {format(day, 'd')}
                  </div>
                  {hasEvents && renderEventDots(events)}
                </div>
              );
            }

            return (
              <InteractiveHoverCard key={day.toString()}>
                <InteractiveHoverCardTrigger asChild>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={
                      hasEvents
                        ? `Events on ${format(day, 'MMMM d')}`
                        : `No events on ${format(day, 'MMMM d')}`
                    }
                    className={cn(
                      'bg-background p-1 min-h-[32px] sm:min-h-[40px] relative hover:bg-accent transition-colors',
                      !isCurrentMonth && 'opacity-30',
                      isCurrentDay && 'ring-1 ring-primary ring-inset',
                      hasEvents && 'cursor-pointer'
                    )}
                  >
                    <div className={cn(
                      'text-xs text-center',
                      isCurrentDay && 'text-primary font-bold'
                    )}>
                      {format(day, 'd')}
                    </div>
                    {hasEvents && renderEventDots(events)}
                  </div>
                </InteractiveHoverCardTrigger>
                {hasEvents && (
                  <InteractiveHoverCardContent className="w-auto" side="top">
                    {renderEventDetails(events)}
                  </InteractiveHoverCardContent>
                )}
              </InteractiveHoverCard>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
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
            {isMobile && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            )}
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

          {viewMode === 'grid' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
                {Array.from({ length: monthsToShow }, (_, i) => renderMonth(i))}
              </div>
              {!hasAnyEvents && (
                <div className="mt-3 text-xs text-muted-foreground">
                  No events visible for these months yet.
                </div>
              )}
            </>
          )}

          {viewMode === 'list' && (
            <div className="space-y-2">
              {flatEvents.length === 0 && (
                <div className="text-xs text-muted-foreground">No events to show yet.</div>
              )}
              {flatEvents.map(({ date, events }) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  className="w-full text-left rounded-lg border border-border/60 bg-card/60 p-3 hover:bg-accent transition-colors"
                  onClick={() => setMobileEvents({ date, events })}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {isValid(date) ? format(date, 'EEE, MMM d') : 'Date'}
                    </div>
                    <div className="flex items-center gap-1">
                      {renderEventDots(events)}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    {events.map(event => (
                      <div key={event.id} className="flex items-center gap-2 text-xs">
                        <div className={cn('w-1.5 h-1.5 rounded-full', getEventTypeColor(event.type))} />
                        <span className="font-medium truncate">{event.title}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {event.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {isMobile && mobileEvents && (
      <Sheet open={!!mobileEvents} onOpenChange={(open) => !open && setMobileEvents(null)}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <div className="mx-auto h-1 w-12 rounded-full bg-muted-foreground/40 mb-3" />
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle>
              {mobileEvents.date && isValid(mobileEvents.date) ? format(mobileEvents.date, 'MMMM d, yyyy') : 'Events'}
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={() => setMobileEvents(null)}>
              Close
            </Button>
          </SheetHeader>
          <div className="mt-3">
            {renderEventDetails(mobileEvents.events)}
          </div>
        </SheetContent>
        </Sheet>
      )}
    </>
  );
}
