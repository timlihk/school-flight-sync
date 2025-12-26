import { FlightDetails, TransportDetails, Term, NotTravellingStatus } from '@/types/school';
import { format } from 'date-fns';

// CSV Export Utilities
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle special cases for CSV formatting
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

// JSON Export Utilities
export function exportToJSON(data: Record<string, unknown> | Record<string, unknown>[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

// File Download Helper
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Flight Data Transformation for CSV
export function transformFlightsForCSV(flights: FlightDetails[], terms: Term[]) {
  return flights.map(flight => {
    const term = terms.find(t => t.id === flight.termId);
    return {
      'Term': term?.name || 'Unknown',
      'School': term?.school || 'Unknown',
      'Academic Year': term?.academicYear || 'Unknown',
      'Flight Type': flight.type === 'outbound' ? 'From School' : 'To School',
      'Airline': flight.airline,
      'Flight Number': flight.flightNumber,
      'Departure Airport': flight.departure.airport,
      'Departure Date': format(flight.departure.date, 'dd/MM/yyyy'),
      'Departure Time': flight.departure.time,
      'Arrival Airport': flight.arrival.airport,
      'Arrival Date': format(flight.arrival.date, 'dd/MM/yyyy'),
      'Arrival Time': flight.arrival.time,
      'Confirmation Code': flight.confirmationCode || '',
      'Notes': flight.notes || ''
    };
  });
}

// Transport Data Transformation for CSV
export function transformTransportForCSV(transport: TransportDetails[], terms: Term[]) {
  return transport.map(t => {
    const term = terms.find(term => term.id === t.termId);
    return {
      'Term': term?.name || 'Unknown',
      'School': term?.school || 'Unknown',
      'Academic Year': term?.academicYear || 'Unknown',
      'Transport Type': t.type === 'school-coach' ? 'School Coach' : 'Taxi',
      'Driver Name': t.driverName,
      'Phone Number': t.phoneNumber,
      'License Number': t.licenseNumber,
      'Pickup Time': t.pickupTime,
      'Notes': t.notes || ''
    };
  });
}

// Complete Data Backup (JSON)
export function createCompleteBackup(
  flights: FlightDetails[],
  transport: TransportDetails[],
  notTravelling: NotTravellingStatus[],
  terms: Term[]
) {
  return {
    exportInfo: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      application: 'School Flight Sync',
      description: 'Complete family travel data backup'
    },
    data: {
      flights: flights.map(flight => ({
        ...flight,
        departure: {
          ...flight.departure,
          date: flight.departure.date.toISOString()
        },
        arrival: {
          ...flight.arrival,
          date: flight.arrival.date.toISOString()
        }
      })),
      transport,
      notTravelling,
      terms: terms.map(term => ({
        ...term,
        startDate: term.startDate.toISOString(),
        endDate: term.endDate.toISOString()
      }))
    }
  };
}

// Print-friendly Data Transformation
export function transformForPrint(
  flights: FlightDetails[],
  transport: TransportDetails[],
  notTravelling: NotTravellingStatus[],
  terms: Term[]
) {
  const groupedBySchool = terms.reduce((acc, term) => {
    if (!acc[term.school]) {
      acc[term.school] = [];
    }
    
    const termFlights = flights.filter(f => f.termId === term.id);
    const termTransport = transport.filter(t => t.termId === term.id);
    const termNotTravelling = notTravelling.find(nt => nt.termId === term.id);
    
    
    acc[term.school].push({
      term,
      flights: termFlights,
      transport: termTransport,
      notTravelling: termNotTravelling
    });
    
    return acc;
  }, {} as Record<string, Array<{
    term: Term;
    flights: FlightDetails[];
    transport: TransportDetails[];
    notTravelling?: NotTravellingStatus;
  }>>);

  return groupedBySchool;
}
