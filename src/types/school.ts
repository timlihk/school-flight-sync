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
  // Flight status tracking
  status?: {
    current: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'delayed' | 'diverted' | 'unknown';
    actualDeparture?: {
      date: string;
      time: string;
      delay?: number;
    };
    actualArrival?: {
      date: string;
      time: string;
      delay?: number;
    };
    estimatedArrival?: {
      date: string;
      time: string;
    };
    gate?: string;
    terminal?: string;
    lastUpdated?: string;
  };
}

export interface TransportDetails {
  id: string;
  termId: string;
  type: 'school-coach' | 'taxi';
  direction?: 'outbound' | 'return'; // outbound = from school, return = to school (optional for backwards compatibility)
  driverName: string;
  phoneNumber: string;
  licenseNumber: string;
  pickupTime: string;
  notes?: string;
}

export interface NotTravellingStatus {
  id?: string;
  termId: string;
  noFlights?: boolean;
  noTransport?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  phoneNumber: string;
  licenseNumber?: string;
  vehicleType: 'school-coach' | 'taxi';
  email?: string;
  notes?: string;
  rating?: number; // 1-5 stars
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolData {
  name: string;
  color: string;
  terms: Term[];
}
