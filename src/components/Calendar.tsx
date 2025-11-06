import { useState } from 'react';
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
  isSameDay,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchool, setSelectedSchool] = useState<School>('both');

  const { getEventsForDate, hasEventsOnDate } = useCalendarEvents(selectedSchool);

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

  const renderEventDetails = (events: CalendarEvent[]) => {
    return (
      <div className="space-y-3 max-w-sm">
        <div className="font-semibold text-sm">
          {format(events[0].date, 'MMMM d, yyyy')}
        </div>
        {events.map((event, index) => (
          <div key={event.id} className={cn('pb-2', index !== events.length - 1 && 'border-b')}>
            <div className="flex items-start gap-2">
              <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', getEventTypeColor(event.type))} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{event.title}</div>
                {event.description && (
                  <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                )}
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
              <Badge
                variant="outline"
                className="text-xs"
              >
                {event.school === 'benenden' ? 'Ben' : 'WA'}
              </Badge>
            </div>
          </div>
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

              return (
                <HoverCard key={day.toString()} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <div
                      className={cn(
                        'bg-background p-2 min-h-[80px] relative cursor-pointer hover:bg-accent transition-colors',
                        !isCurrentMonth && 'opacity-40',
                        isCurrentDay && 'ring-2 ring-primary ring-inset'
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
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
