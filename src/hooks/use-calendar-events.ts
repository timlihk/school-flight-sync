import { useMemo } from 'react';
import { useFlights } from './use-flights';
import { useTransport } from './use-transport';
import { useNotTravelling } from './use-not-travelling';
import { mockTerms } from '@/data/mock-terms';
import { format, isValid } from 'date-fns';
import type { Term, TransportDetails } from '@/types/school';

const resolveTransportDate = (item: TransportDetails, term?: Term): Date | null => {
  if (!term) return null;

  if (item.pickupTime) {
    const directDate = new Date(item.pickupTime);
    if (!Number.isNaN(directDate.getTime())) {
      return directDate;
    }

    const timeMatch = item.pickupTime.match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const [hours, minutes] = timeMatch.slice(1).map(Number);
      const base = new Date(item.direction === 'return' ? term.endDate : term.startDate);
      if (!Number.isNaN(base.getTime())) {
        base.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        return base;
      }
    }
  }

  const fallback = new Date(item.direction === 'return' ? term.endDate : term.startDate);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
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
      // Add term start event
      addEvent(allEvents, {
        id: `term-start-${term.id}`,
        date: term.startDate,
        type: 'term',
        school: term.school,
        title: `${term.name} - Start`,
        description: term.description || '',
        details: term
      });

      // Add term end event
      addEvent(allEvents, {
        id: `term-end-${term.id}`,
        date: term.endDate,
        type: 'term',
        school: term.school,
        title: `${term.name} - End`,
        description: term.description || '',
        details: term
      });

      // Add schedule detail events
      if (term.scheduleDetails) {
        term.scheduleDetails.forEach((detail, index) => {
          addEvent(allEvents, {
            id: `schedule-${term.id}-${index}`,
            date: new Date(detail.date),
            type: 'term',
            school: term.school,
            title: detail.event,
            description: detail.time,
            details: { ...term, scheduleDetail: detail }
          });
        });
      }
    });

    // Add flight events
    flights?.forEach(flight => {
      const term = termLookup.get(flight.termId);
      if (!term) {
        return;
      }

      if (selectedSchool !== 'both' && term.school !== selectedSchool) {
        return;
      }

      if (flight.departure?.date) {
        const departureDate = new Date(flight.departure.date);
        if (!Number.isNaN(departureDate.getTime())) {
          addEvent(allEvents, {
            id: `flight-${flight.id}`,
            date: departureDate,
            type: 'flight',
            school: term.school,
            title: `Flight ${flight.flightNumber}`,
            description: `${flight.airline} - ${getFlightTypeLabel(flight.type)}`,
            details: flight
          });
        }
      }
    });

    // Add transport events
    transport?.forEach(item => {
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
        description: `${item.direction === 'return' ? 'Return' : 'Departure'}${item.driverName ? ` · ${item.driverName}` : ''}`,
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

      if (!item.noFlights && !item.noTransport) {
        return;
      }

      const titleDetails: string[] = [];
      if (item.noFlights) {
        titleDetails.push('flights');
      }
      if (item.noTransport) {
        titleDetails.push('transport');
      }

      addEvent(allEvents, {
        id: `not-travelling-${item.id ?? item.termId}`,
        date: new Date(term.startDate),
        type: 'not-travelling',
        school: term.school,
        title: titleDetails.length ? `Not travelling (${titleDetails.join(' & ')})` : 'Not travelling',
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
