import { FlightDetails, TransportDetails, Term } from '@/types/school';
import { format } from 'date-fns';

interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

function formatICSDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

function escapeICSText(text: string): string {
  return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
}

function createICSEvent(event: CalendarEvent): string {
  const now = new Date();

  return [
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36)}@school-flight-sync`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(event.endDate)}`,
    `SUMMARY:${escapeICSText(event.summary)}`,
    event.description ? `DESCRIPTION:${escapeICSText(event.description)}` : '',
    event.location ? `LOCATION:${escapeICSText(event.location)}` : '',
    'END:VEVENT'
  ].filter(Boolean).join('\r\n');
}

export function exportFlightToCalendar(flight: FlightDetails, term: Term) {
  const startTime = flight.departureTime || '12:00';
  const endTime = flight.arrivalTime || '12:00';

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startDate = new Date(flight.departureDate);
  startDate.setHours(startHour, startMinute, 0);

  const endDate = new Date(flight.arrivalDate || flight.departureDate);
  endDate.setHours(endHour, endMinute, 0);

  const event: CalendarEvent = {
    summary: `Flight ${flight.flightNumber} - ${flight.airline}`,
    description: `${flight.type === 'outbound' ? 'Outbound' : 'Return'} flight for ${term.termName}\\n` +
                 `From: ${flight.departureAirport}\\n` +
                 `To: ${flight.arrivalAirport}\\n` +
                 (flight.confirmationCode ? `Confirmation: ${flight.confirmationCode}\\n` : '') +
                 (flight.notes ? `Notes: ${flight.notes}` : ''),
    location: flight.departureAirport,
    startDate,
    endDate
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//School Flight Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    createICSEvent(event),
    'END:VCALENDAR'
  ].join('\r\n');

  downloadICS(icsContent, `flight-${flight.flightNumber}-${term.id}.ics`);
}

export function exportTransportToCalendar(transport: TransportDetails, term: Term, type: 'departure' | 'return') {
  const pickupTime = transport.pickupTime || '12:00';
  const [hour, minute] = pickupTime.split(':').map(Number);

  const date = type === 'departure' ? term.startDate : term.endDate;
  const startDate = new Date(date);
  startDate.setHours(hour, minute, 0);

  const endDate = new Date(startDate);
  endDate.setHours(hour + 2, minute, 0); // Assume 2 hour duration

  const event: CalendarEvent = {
    summary: `${transport.type === 'school-coach' ? 'School Coach' : 'Taxi'} - ${term.termName}`,
    description: `${type === 'departure' ? 'Departure' : 'Return'} transport\\n` +
                 `Driver: ${transport.driverName}\\n` +
                 `Phone: ${transport.phoneNumber}\\n` +
                 `License: ${transport.licenseNumber}\\n` +
                 (transport.notes ? `Notes: ${transport.notes}` : ''),
    location: term.school === 'benenden' ? 'Benenden School' : 'Wycombe Abbey School',
    startDate,
    endDate
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//School Flight Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    createICSEvent(event),
    'END:VCALENDAR'
  ].join('\r\n');

  downloadICS(icsContent, `transport-${term.id}-${type}.ics`);
}

export function exportTermToCalendar(term: Term, _flights: FlightDetails[], _transport: TransportDetails[]) {
  const events: CalendarEvent[] = [];

  // Add term start event
  const termStart = new Date(term.startDate);
  termStart.setHours(9, 0, 0);
  const termStartEnd = new Date(termStart);
  termStartEnd.setHours(10, 0, 0);

  events.push({
    summary: `${term.termName} Start - ${term.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}`,
    description: `Term start at ${format(term.startDate, 'PPP')}`,
    location: term.school === 'benenden' ? 'Benenden School' : 'Wycombe Abbey School',
    startDate: termStart,
    endDate: termStartEnd
  });

  // Add term end event
  const termEnd = new Date(term.endDate);
  termEnd.setHours(15, 0, 0);
  const termEndEnd = new Date(termEnd);
  termEndEnd.setHours(16, 0, 0);

  events.push({
    summary: `${term.termName} End - ${term.school === 'benenden' ? 'Benenden' : 'Wycombe Abbey'}`,
    description: `Term end at ${format(term.endDate, 'PPP')}`,
    location: term.school === 'benenden' ? 'Benenden School' : 'Wycombe Abbey School',
    startDate: termEnd,
    endDate: termEndEnd
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//School Flight Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events.map(event => createICSEvent(event)),
    'END:VCALENDAR'
  ].join('\r\n');

  downloadICS(icsContent, `${term.id}-term-dates.ics`);
}

function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
