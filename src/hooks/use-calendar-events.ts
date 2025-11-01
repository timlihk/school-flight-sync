import { useMemo } from 'react';
import { useFlights } from './use-flights';
import { useTransport } from './use-transport';
import { useNotTravelling } from './use-not-travelling';
import { mockTerms } from '@/data/mock-terms';
import { format } from 'date-fns';

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

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // Add term events from mockTerms
    const relevantTerms = mockTerms.filter(term =>
      selectedSchool === 'both' || term.school === selectedSchool
    );

    relevantTerms.forEach(term => {
      // Add term start event
      allEvents.push({
        id: `term-start-${term.id}`,
        date: term.startDate,
        type: 'term',
        school: term.school,
        title: `${term.name} - Start`,
        description: term.description || '',
        details: term
      });

      // Add term end event
      allEvents.push({
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
          allEvents.push({
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
      const school = flight.termId.startsWith('ben') ? 'benenden' : 'wycombe';
      if (selectedSchool !== 'both' && school !== selectedSchool) return;

      if (flight.departure?.date) {
        allEvents.push({
          id: `flight-${flight.id}`,
          date: flight.departure.date instanceof Date ? flight.departure.date : new Date(flight.departure.date),
          type: 'flight',
          school,
          title: `Flight ${flight.flightNumber}`,
          description: `${flight.airline} - ${flight.type}`,
          details: flight
        });
      }
    });

    // Add transport events
    transport?.forEach(item => {
      const school = item.termId.startsWith('ben') ? 'benenden' : 'wycombe';
      if (selectedSchool !== 'both' && school !== selectedSchool) return;

      if (item.pickupTime) {
        // Extract date from pickup time if it's a full datetime, otherwise use term start/end
        allEvents.push({
          id: `transport-${item.id}`,
          date: new Date(), // You may need to derive this from term dates
          type: 'transport',
          school,
          title: `Transport - ${item.type}`,
          description: `${item.direction} - ${item.driverName || 'TBD'}`,
          details: item
        });
      }
    });

    // Add not travelling events
    notTravelling?.forEach(item => {
      const school = item.termId.startsWith('ben') ? 'benenden' : 'wycombe';
      if (selectedSchool !== 'both' && school !== selectedSchool) return;

      // Find the matching term from mockTerms
      const term = mockTerms.find(t => t.id === item.termId);
      if (term) {
        allEvents.push({
          id: `not-travelling-${item.id}`,
          date: term.startDate,
          type: 'not-travelling',
          school,
          title: 'Not Travelling',
          description: 'Staying at school',
          details: { ...item, term }
        });
      }
    });

    return allEvents;
  }, [flights, transport, notTravelling, selectedSchool]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    events.forEach(event => {
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
