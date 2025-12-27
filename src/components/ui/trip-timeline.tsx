import { memo, useMemo } from "react";
import { format, formatDistanceToNow, isAfter, isSameDay, startOfDay } from "date-fns";
import { Plane, Car, School, Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Term, FlightDetails, TransportDetails } from "@/types/school";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  type: 'flight' | 'transport' | 'term-start' | 'term-end';
  date: Date;
  title: string;
  subtitle: string;
  detail?: string;
  school: 'benenden' | 'wycombe';
  termId: string;
  termName: string;
  raw: FlightDetails | TransportDetails | Term;
}

interface TripTimelineProps {
  terms: Term[];
  flights: FlightDetails[];
  transport: TransportDetails[];
  onFlightClick: (termId: string) => void;
  onTransportClick: (termId: string) => void;
  onTermClick: (termId: string) => void;
  selectedSchool: 'both' | 'benenden' | 'wycombe';
}

export const TripTimeline = memo(function TripTimeline({
  terms,
  flights,
  transport,
  onFlightClick,
  onTransportClick,
  onTermClick,
  selectedSchool
}: TripTimelineProps) {
  const events = useMemo(() => {
    const now = startOfDay(new Date());
    const allEvents: TimelineEvent[] = [];

    // Filter terms by school
    const filteredTerms = selectedSchool === 'both'
      ? terms
      : terms.filter(t => t.school === selectedSchool);

    // Add term events
    filteredTerms.forEach(term => {
      if (isAfter(term.startDate, now) || isSameDay(term.startDate, now)) {
        allEvents.push({
          id: `term-start-${term.id}`,
          type: 'term-start',
          date: term.startDate,
          title: term.name,
          subtitle: term.type === 'holiday' ? 'Holiday starts' : 'Term starts',
          school: term.school,
          termId: term.id,
          termName: term.name,
          raw: term
        });
      }
      if (isAfter(term.endDate, now) || isSameDay(term.endDate, now)) {
        allEvents.push({
          id: `term-end-${term.id}`,
          type: 'term-end',
          date: term.endDate,
          title: term.name,
          subtitle: term.type === 'holiday' ? 'Holiday ends' : 'Term ends',
          school: term.school,
          termId: term.id,
          termName: term.name,
          raw: term
        });
      }
    });

    // Add flight events
    flights.forEach(flight => {
      const term = terms.find(t => t.id === flight.termId);
      if (!term) return;
      if (selectedSchool !== 'both' && term.school !== selectedSchool) return;
      if (!isAfter(flight.departure.date, now) && !isSameDay(flight.departure.date, now)) return;

      allEvents.push({
        id: `flight-${flight.id}`,
        type: 'flight',
        date: flight.departure.date,
        title: `${flight.airline} ${flight.flightNumber}`,
        subtitle: flight.type === 'outbound' ? 'From School' : 'To School',
        detail: `${flight.departure.airport} → ${flight.arrival.airport}`,
        school: term.school,
        termId: term.id,
        termName: term.name,
        raw: flight
      });
    });

    // Add transport events
    transport.forEach(item => {
      const term = terms.find(t => t.id === item.termId);
      if (!term) return;
      if (selectedSchool !== 'both' && term.school !== selectedSchool) return;

      let eventDate: Date;
      if (item.pickupTime) {
        eventDate = new Date(item.pickupTime);
      } else {
        eventDate = item.direction === 'return' ? term.endDate : term.startDate;
      }

      if (!isAfter(eventDate, now) && !isSameDay(eventDate, now)) return;

      allEvents.push({
        id: `transport-${item.id}`,
        type: 'transport',
        date: eventDate,
        title: item.type === 'school-coach' ? 'School Coach' : 'Taxi',
        subtitle: item.direction === 'return' ? 'To School' : 'From School',
        detail: item.driverName ? `Driver: ${item.driverName}` : undefined,
        school: term.school,
        termId: term.id,
        termName: term.name,
        raw: item
      });
    });

    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [terms, flights, transport, selectedSchool]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { date: Date; events: TimelineEvent[] }[] = [];

    events.forEach(event => {
      const dateKey = startOfDay(event.date).getTime();
      const existing = groups.find(g => startOfDay(g.date).getTime() === dateKey);

      if (existing) {
        existing.events.push(event);
      } else {
        groups.push({ date: event.date, events: [event] });
      }
    });

    return groups;
  }, [events]);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'flight':
        return <Plane className="h-4 w-4" />;
      case 'transport':
        return <Car className="h-4 w-4" />;
      case 'term-start':
      case 'term-end':
        return <School className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type'], school: 'benenden' | 'wycombe') => {
    const schoolColor = school === 'benenden' ? 'blue' : 'green';

    switch (type) {
      case 'flight':
        return `bg-${schoolColor}-500 text-white`;
      case 'transport':
        return `bg-${schoolColor}-400 text-white`;
      case 'term-start':
        return `bg-${schoolColor}-600 text-white`;
      case 'term-end':
        return `bg-${schoolColor}-300 text-${schoolColor}-900`;
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    switch (event.type) {
      case 'flight':
        onFlightClick(event.termId);
        break;
      case 'transport':
        onTransportClick(event.termId);
        break;
      case 'term-start':
      case 'term-end':
        onTermClick(event.termId);
        break;
    }
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Plane className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No upcoming trips</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Add flights or transport to see your travel timeline here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {groupedEvents.map((group, groupIndex) => {
          const isToday = isSameDay(group.date, new Date());
          const isPast = !isAfter(group.date, new Date()) && !isToday;
          const distance = formatDistanceToNow(group.date, { addSuffix: true });

          return (
            <div key={group.date.toISOString()} className="relative">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 border-background",
                  isToday ? "bg-primary text-primary-foreground" : isPast ? "bg-muted text-muted-foreground" : "bg-card text-foreground border-border"
                )}>
                  <div className="text-center">
                    <div className="text-xs font-bold">{format(group.date, 'MMM')}</div>
                    <div className="text-sm font-bold leading-none">{format(group.date, 'd')}</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold">
                    {isToday ? 'Today' : format(group.date, 'EEEE')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {distance}
                  </div>
                </div>
              </div>

              {/* Events for this date */}
              <div className="ml-14 space-y-2">
                {group.events.map((event, eventIndex) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-all",
                      "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                      "bg-card hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        event.school === 'benenden' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      )}>
                        {getEventIcon(event.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold truncate">{event.title}</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 py-0",
                              event.school === 'benenden' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                            )}
                          >
                            {event.school === 'benenden' ? 'Ben' : 'WA'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{event.subtitle}</div>
                        {event.detail && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {event.detail}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(event.date, 'h:mm a')}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TripTimeline;
