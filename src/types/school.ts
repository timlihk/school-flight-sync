export type SchoolType = 'benenden' | 'wycombe';

export type TermType = 
  | 'term' 
  | 'half-term' 
  | 'holiday' 
  | 'exeat' 
  | 'short-leave' 
  | 'long-leave';

export interface ScheduleDetail {
  date: string;
  time: string;
  event: string;
}

export interface Term {
  id: string;
  school: SchoolType;
  name: string;
  type: TermType;
  startDate: Date;
  endDate: Date;
  academicYear: string;
  description?: string;
  scheduleDetails?: ScheduleDetail[];
}

export interface FlightDetails {
  id: string;
  termId: string;
  type: 'outbound' | 'return';
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    date: Date;
    time: string;
  };
  arrival: {
    airport: string;
    date: Date;
    time: string;
  };
  confirmationCode?: string;
  notes?: string;
}

export interface TransportDetails {
  id: string;
  termId: string;
  type: 'school-coach' | 'taxi';
  driverName: string;
  phoneNumber: string;
  licenseNumber: string;
  pickupTime: string;
  notes?: string;
}

export interface NotTravellingStatus {
  termId: string;
  noFlights?: boolean;
  noTransport?: boolean;
}

export interface SchoolData {
  name: string;
  color: string;
  terms: Term[];
}