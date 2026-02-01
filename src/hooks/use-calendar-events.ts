import { useMemo } from 'react';
import { useFlights } from './use-flights';
import { useTransport } from './use-transport';
import { useNotTravelling } from './use-not-travelling';
import { mockTerms } from '@/data/mock-terms';
import { format, isValid } from 'date-fns';
import type { Term, TransportDetails } from '@/types/school';

// Normalize date to YYYY-MM-DD for comparison (avoid timezone issues)
const toDateKey = (date: Date): string => {
  // Use UTC methods to avoid timezone shifting
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

const resolveTransportDate = (item: TransportDetails, term?: Term): Date | null => {
  if (!term) return null;

  if (item.pickupTime) {
    const directDate = new Date(item.pickupTime);
    if (!Number.isNaN(directDate.getTime())) {
      return directDate;
    }
  }

  const base = new Date(item.direction === 'return' ? term.endDate : term.startDate);
  return Number.isNaN(base.getTime()) ? null : combineDateAndTime(base, item.pickupTime);
};

const getFlightTypeLabel = (type: 'outbound' | 'return') =>
  type === 'outbound' ? 'From School' : 'To School';

export type School = 'benenden' | 'wycombe' | 'both';

export interface CalendarEvent {
  id: string;
  date: Date;
  type: 'term' | 'flight' | 'transport' | 'not-travelling';
  school: 'benenden' | 'wycombe';
  title: string;
  description?: string;
  details: any;
}

export const useCalendarEvents = (selectedSchool: School = 'both') => {
  const { flights } = useFlights();
  const { transport } = useTransport();
  const { notTravelling } = useNotTravelling();

  const termLookup = useMemo(() => {
    const map = new Map<string, Term>();
    mockTerms.forEach(term => map.set(term.id, term));
    return map;
  }, []);

  const transportCountByTerm = useMemo(() => {
    const map = new Map<string, number>();
    transport?.forEach(item => {
      map.set(item.termId, (map.get(item.termId) || 0) + 1);
    });
    return map;
  }, [transport]);

  const addEvent = (allEvents: CalendarEvent[], event: CalendarEvent) => {
    if (!isValid(event.date)) {
      console.warn('[useCalendarEvents] Skipping event with invalid date', { id: event.id, type: event.type });
      return;
    }
    allEvents.push(event);
  };

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // Add term events from mockTerms
    const relevantTerms = mockTerms.filter(term =>
      selectedSchool === 'both' || term.school === selectedSchool
    );

    relevantTerms.forEach(term => {
      // Collect schedule detail dates to avoid duplicates
      const scheduleDates = new Set<string>();
      if (term.scheduleDetails) {
        term.scheduleDetails.forEach((detail, index) => {
          const detailDate = new Date(detail.date);
          const dateKey = toDateKey(detailDate);
          scheduleDates.add(dateKey);
          
          addEvent(allEvents, {
            id: `schedule-${term.id}-${index}`,
            date: detailDate,
            type: 'term',
            school: term.school,
            title: detail.event,
            description: detail.time,
            details: { ...term, scheduleDetail: detail }
          });
        });
      }

      // Only add term start event if there's no schedule detail on the same date
      const startDateKey = toDateKey(term.startDate);
      if (!scheduleDates.has(startDateKey)) {
        addEvent(allEvents, {
          id: `term-start-${term.id}`,
          date: term.startDate,
          type: 'term',
          school: term.school,
          title: `${term.name} - Start`,
          description: term.description || '',
          details: term
        });
      }

      // Only add term end event if there's no schedule detail on the same date
      const endDateKey = toDateKey(term.endDate);
      if (!scheduleDates.has(endDateKey)) {
        addEvent(allEvents, {
          id: `term-end-${term.id}`,
          date: term.endDate,
          type: 'term',
          school: term.school,
          title: `${term.name} - End`,
          description: term.description || '',
          details: term
        });
      }
    });

    const transportsByKey = new Map<string, TransportDetails[]>();
    transport?.forEach(item => {
      const dir = item.direction || 'outbound';
      const key = `${item.termId}-${dir}`;
      const list = transportsByKey.get(key) || [];
      list.push(item);
      transportsByKey.set(key, list);
    });
    const matchedTransportIds = new Set<string>();

    // Add flight events (plus transport entries for the same day)
    flights?.forEach(flight => {
      const term = termLookup.get(flight.termId);
      if (!term) {
        return;
      }

      if (selectedSchool !== 'both' && term.school !== selectedSchool) {
        return;
      }

      const departureDate = combineDateAndTime(flight.departure.date, flight.departure.time);
      addEvent(allEvents, {
        id: `flight-${flight.id}`,
        date: departureDate,
        type: 'flight',
        school: term.school,
        title: `Flight ${flight.flightNumber}`,
        description: `${flight.airline} - ${getFlightTypeLabel(flight.type)}`,
        details: flight
      });

      const key = `${flight.termId}-${flight.type}`;
      const candidates = transportsByKey.get(key) || [];
      const matched = candidates
        .map(item => {
          const alignedDate = combineDateAndTime(departureDate, item.pickupTime);
          return { item, alignedDate };
        })
        .sort((a, b) => a.alignedDate.getTime() - b.alignedDate.getTime())[0];

      if (matched) {
        matchedTransportIds.add(matched.item.id);
        addEvent(allEvents, {
          id: `transport-${matched.item.id}`,
          date: matched.alignedDate,
          type: 'transport',
          school: term.school,
          title: `Transport - ${matched.item.type}`,
          description: `${matched.item.direction === 'return' ? 'Return' : 'Departure'}${matched.item.driverName ? ` with ${matched.item.driverName}` : ''}`,
          details: matched.item
        });
      } else {
        addEvent(allEvents, {
          id: `transport-missing-${flight.id}`,
          date: departureDate,
          type: 'transport',
          school: term.school,
          title: 'Transport - Not booked',
          description: flight.type === 'return' ? 'To school (needs transport)' : 'From school (needs transport)',
          details: { term, flightId: flight.id, missingTransport: true }
        });
      }
    });

    // Add remaining transport events
    transport?.forEach(item => {
      if (matchedTransportIds.has(item.id)) return;
      const term = termLookup.get(item.termId);
      if (!term) {
        return;
      }

      if (selectedSchool !== 'both' && term.school !== selectedSchool) {
        return;
      }

      const eventDate = resolveTransportDate(item, term);
      if (!eventDate) {
        return;
      }

      addEvent(allEvents, {
        id: `transport-${item.id}`,
        date: eventDate,
        type: 'transport',
        school: term.school,
        title: `Transport - ${item.type}`,
        description: `${item.direction === 'return' ? 'Return' : 'Departure'}${item.driverName ? ` with ${item.driverName}` : ''}`,
        details: item
      });
    });

    // Add not travelling events
    notTravelling?.forEach(item => {
      const term = termLookup.get(item.termId);
      if (!term) {
        return;
      }

      if (selectedSchool !== 'both' && term.school !== selectedSchool) {
        return;
      }

      if (!item.noFlights) {
        return;
      }

      addEvent(allEvents, {
        id: `not-travelling-${item.id ?? item.termId}`,
        date: new Date(term.startDate),
        type: 'not-travelling',
        school: term.school,
        title: 'Not travelling (flights)',
        description: 'Staying at school',
        details: { ...item, term }
      });
    });

    return allEvents;
  }, [flights, transport, notTravelling, selectedSchool, termLookup]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach(event => {
      if (!isValid(event.date)) return;
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });

    return grouped;
  }, [events]);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  };

  const hasEventsOnDate = (date: Date): boolean => {
    return getEventsForDate(date).length > 0;
  };

  return {
    events,
    eventsByDate,
    getEventsForDate,
    hasEventsOnDate
  };
};
