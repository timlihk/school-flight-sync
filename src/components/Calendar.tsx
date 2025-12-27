import { useEffect, useMemo, useRef, useState } from 'react';
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
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchool, setSelectedSchool] = useState<School>('both');
  const { getEventsForDate, events } = useCalendarEvents(selectedSchool);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileEvents, setMobileEvents] = useState<{ date: Date; events: CalendarEvent[] } | null>(null);
  const autoSetRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    autoSetRef.current = false;
  }, [selectedSchool]);

  useEffect(() => {
    if (autoSetRef.current) return;
    const today = startOfDay(new Date());
    const next = events
      ?.filter(e => startOfDay(e.date) >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    if (next) {
      setCurrentDate(startOfMonth(next.date));
      autoSetRef.current = true;
    }
  }, [events]);

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getTermIdFromEvent = (event: CalendarEvent) => {
    if (event.type === 'term') {
      return (event.details as any)?.id;
    }
    if (event.type === 'not-travelling') {
      return (event.details?.term as any)?.id ?? event.details?.termId;
    }

    return event.details?.termId ?? event.details?.term?.id;
  };

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
      <div className="flex gap-1 justify-center mt-1">
        {uniqueTypes.slice(0, 3).map(type => (
          <div
            key={type}
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              getEventTypeColor(type)
            )}
          />
        ))}
        {uniqueTypes.length > 3 && (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        )}
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
      <div className="space-y-3 max-w-sm">
        <div className="font-semibold text-sm">
          {formattedDate}
        </div>
        {events.map((event, index) => (
          <button
            key={event.id}
            type="button"
            className={cn(
              'w-full text-left pb-2',
              index !== events.length - 1 && 'border-b',
              'cursor-pointer hover:bg-accent/60 rounded-sm px-1 transition-colors'
            )}
            onClick={(e) => {
              e.stopPropagation();
              console.log('[Calendar] Event clicked:', event.title, event.type);
              const termId = getTermIdFromEvent(event);
              console.log('[Calendar] termId:', termId);
              if (!termId) return;

              const url = `/?highlight=${termId}&open=${event.type}&termId=${termId}`;
              console.log('[Calendar] Navigating to:', url);
              navigate(url);
            }}
          >
            <div className="flex items-start gap-2">
              <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', getEventTypeColor(event.type))} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{event.title}</div>
                {event.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                )}
                <div className="mt-1 flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary" className="text-[10px]">
                    {flightDirectionLabel(event)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                  >
                    {event.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}
                  </Badge>
                </div>
                {event.type === 'flight' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>{event.details.departure.airport} → {event.details.arrival.airport}</div>
                    <div>{event.details.departure.time} - {event.details.arrival.time}</div>
                  </div>
                )}
                {event.type === 'transport' && event.details.driverName && (
                  <div className="text-xs text-muted-foreground mt-1">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Schedule
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-6 w-6" />
              Calendar View
            </h1>
            <div className="w-[140px]" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                School Events & Travel
              </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedSchool === 'both' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSchool('both')}
              >
                Both Schools
              </Button>
              <Button
                variant={selectedSchool === 'benenden' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSchool('benenden')}
              >
                Benenden
              </Button>
              <Button
                variant={selectedSchool === 'wycombe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSchool('wycombe')}
              >
                Wycombe Abbey
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Term Dates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Flights</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Transport</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Not Travelling</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Week Day Headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="bg-muted p-2 text-center text-sm font-medium"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map(day => {
              const events = getEventsForDate(day);
              const hasEvents = events.length > 0;
              const isCurrentMonth = isSameMonth(day, currentDate);
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
                    className={cn(
                      'bg-background p-2 min-h-[80px] relative hover:bg-accent transition-colors',
                      !isCurrentMonth && 'opacity-40',
                      isCurrentDay && 'ring-2 ring-primary ring-inset',
                      hasEvents && 'cursor-pointer hover:ring-2 hover:ring-primary/50'
                    )}
                    onClick={handleMobileOpen}
                  >
                    <div className={cn(
                      'text-sm font-medium',
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
                        'bg-background p-2 min-h-[80px] relative hover:bg-accent transition-colors',
                        !isCurrentMonth && 'opacity-40',
                        isCurrentDay && 'ring-2 ring-primary ring-inset',
                        hasEvents && 'cursor-pointer hover:ring-2 hover:ring-primary/50'
                      )}
                    >
                      <div className={cn(
                        'text-sm font-medium',
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
        </CardContent>
      </Card>
      </div>
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
            <div className="mt-4">
              {renderEventDetails(mobileEvents.events)}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
