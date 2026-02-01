import { FlightDetails } from '@/types/school';
import { format } from 'date-fns';

// Database record type for flights table
interface DbFlightRecord {
  id: string;
  term_id: string;
  type: 'outbound' | 'return';
  airline: string;
  flight_number: string;
  departure_airport: string;
  departure_date: string;
  departure_time: string;
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string;
  confirmation_code: string | null;
  notes: string | null;
}

// Transform FlightDetails to database format
export function transformFlightToDb(flight: Omit<FlightDetails, 'id'>): Omit<DbFlightRecord, 'id'> {
  return {
    term_id: flight.termId,
    type: flight.type,
    airline: flight.airline,
    flight_number: flight.flightNumber,
    departure_airport: flight.departure.airport,
    departure_date: format(flight.departure.date, 'yyyy-MM-dd'),
    departure_time: flight.departure.time,
    arrival_airport: flight.arrival.airport,
    arrival_date: format(flight.arrival.date, 'yyyy-MM-dd'),
    arrival_time: flight.arrival.time,
    confirmation_code: flight.confirmationCode || null,
    notes: flight.notes || null,
  };
}

// Transform database record to FlightDetails format
export function transformDbToFlight(dbFlight: DbFlightRecord): FlightDetails {
  return {
    id: dbFlight.id,
    termId: dbFlight.term_id,
    type: dbFlight.type,
    airline: dbFlight.airline,
    flightNumber: dbFlight.flight_number,
    departure: {
      airport: dbFlight.departure_airport,
      date: new Date(dbFlight.departure_date),
      time: dbFlight.departure_time,
    },
    arrival: {
      airport: dbFlight.arrival_airport,
      date: new Date(dbFlight.arrival_date),
      time: dbFlight.arrival_time,
    },
    confirmationCode: dbFlight.confirmation_code || undefined,
    notes: dbFlight.notes || undefined,
  };
}

// Transform multiple database records to FlightDetails array
export function transformDbFlightsArray(dbFlights: DbFlightRecord[]): FlightDetails[] {
  return dbFlights.map(transformDbToFlight);
}