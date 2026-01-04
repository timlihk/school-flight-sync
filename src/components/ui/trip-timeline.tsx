import { memo, useMemo } from "react";
import { format, formatDistanceToNow, isAfter, isSameDay, startOfDay } from "date-fns";
import { Plane, Car, School, Calendar, ChevronRight, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Term, FlightDetails, TransportDetails } from "@/types/school";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

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
  onAddFlight?: () => void;
  onAddTransport?: () => void;
  selectedSchool: 'both' | 'benenden' | 'wycombe';
}

const combineDateAndTime = (date: Date, time?: string) => {
  if (!time) return new Date(date);
  const datePart = format(date, 'yyyy-MM-dd');
  const combined = new Date(`${datePart}T${time}`);
  if (!Number.isNaN(combined.getTime())) return combined;
  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number.parseInt(hoursStr, 10);
  const minutes = Number.parseInt(minutesStr ?? '0', 10);
  const fallback = new Date(date);
  if (!Number.isNaN(hours)) {
    fallback.setHours(hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
  }
  return fallback;
};

export const TripTimeline = memo(function TripTimeline({
  terms,
  flights,
  transport,
  onFlightClick,
  onTransportClick,
  onTermClick,
  onAddFlight,
  onAddTransport,
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

    const transportsByKey = new Map<string, TransportDetails[]>();
    transport.forEach(item => {
      const dir = item.direction || 'outbound';
      const key = `${item.termId}-${dir}`;
      const list = transportsByKey.get(key) || [];
      list.push(item);
      transportsByKey.set(key, list);
    });
    const matchedTransportIds = new Set<string>();

    // Add flight events (and pair transport entries on the same day)
    flights.forEach(flight => {
      const term = terms.find(t => t.id === flight.termId);
      if (!term) return;
      if (selectedSchool !== 'both' && term.school !== selectedSchool) return;
      const departureDateTime = combineDateAndTime(flight.departure.date, flight.departure.time);
      if (!isAfter(departureDateTime, now) && !isSameDay(departureDateTime, now)) return;

      allEvents.push({
        id: `flight-${flight.id}`,
        type: 'flight',
        date: departureDateTime,
        title: `${flight.airline} ${flight.flightNumber}`,
        subtitle: flight.type === 'outbound' ? 'From School' : 'To School',
        detail: `${flight.departure.airport} to ${flight.arrival.airport}`,
        school: term.school,
        termId: term.id,
        termName: term.name,
        raw: flight
      });

      const key = `${flight.termId}-${flight.type}`;
      const candidates = transportsByKey.get(key) || [];
      const matched = candidates
        .map(item => {
          const alignedDate = combineDateAndTime(departureDateTime, item.pickupTime);
          return { item, alignedDate };
        })
        .sort((a, b) => a.alignedDate.getTime() - b.alignedDate.getTime())
        .find(({ alignedDate }) => isAfter(alignedDate, now) || isSameDay(alignedDate, now));

      if (matched) {
        matchedTransportIds.add(matched.item.id);
        allEvents.push({
          id: `transport-${matched.item.id}`,
          type: 'transport',
          date: matched.alignedDate,
          title: matched.item.type === 'school-coach' ? 'School Coach' : 'Taxi',
          subtitle: matched.item.direction === 'return' ? 'To School' : 'From School',
          detail: matched.item.driverName ? `Driver: ${matched.item.driverName}` : 'Transport booked',
          school: term.school,
          termId: term.id,
          termName: term.name,
          raw: matched.item
        });
      } else {
        const placeholder: TransportDetails = {
          id: `transport-missing-${flight.id}`,
          termId: flight.termId,
          type: 'taxi',
          direction: flight.type,
          driverName: '',
          phoneNumber: '',
          licenseNumber: '',
          pickupTime: flight.departure.time || '',
          notes: 'Transport not booked'
        };
        allEvents.push({
          id: `transport-missing-${flight.id}`,
          type: 'transport',
          date: departureDateTime,
          title: 'Transport (not booked)',
          subtitle: flight.type === 'return' ? 'To School' : 'From School',
          detail: 'Add taxi or coach details',
          school: term.school,
          termId: term.id,
          termName: term.name,
          raw: placeholder
        });
      }
    });

    // Add remaining transport events not paired with flights
    transport.forEach(item => {
      if (matchedTransportIds.has(item.id)) return;
      const term = terms.find(t => t.id === item.termId);
      if (!term) return;
      if (selectedSchool !== 'both' && term.school !== selectedSchool) return;

      const baseDate = item.direction === 'return' ? term.endDate : term.startDate;
      const eventDate = combineDateAndTime(baseDate, item.pickupTime);

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

  const formatTimeValue = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return format(parsed, 'h:mm a');
    }
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      const placeholder = new Date();
      placeholder.setHours(hours, minutes, 0, 0);
      return format(placeholder, 'h:mm a');
    }
    return value;
  };

  const getEventTimeLabel = (event: TimelineEvent) => {
    if (event.type === 'flight') {
      const flight = event.raw as FlightDetails;
      return formatTimeValue(flight?.departure?.time) || format(event.date, 'h:mm a');
    }
    if (event.type === 'transport') {
      const transport = event.raw as TransportDetails;
      return formatTimeValue(transport?.pickupTime) || format(event.date, 'h:mm a');
    }
    return null;
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
    const actions = [];
    if (onAddFlight) {
      actions.push({ label: "Add Flight", onClick: onAddFlight });
    }
    if (onAddTransport) {
      actions.push({ label: "Add Transport", onClick: onAddTransport, variant: 'outline' as const });
    }

    return (
      <EmptyState
        variant="trips"
        actions={actions}
      />
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
                {group.events.map((event, eventIndex) => {
                  const timeLabel = getEventTimeLabel(event);
                  return (
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
                          {timeLabel && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {timeLabel}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TripTimeline;
