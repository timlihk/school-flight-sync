// Flight status types for real-time tracking
export interface FlightStatus {
  flightNumber: string;
  status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'delayed' | 'diverted' | 'unknown';
  actualDeparture?: {
    date: string;
    time: string;
    delay?: number; // minutes
  };
  actualArrival?: {
    date: string;
    time: string;
    delay?: number; // minutes
  };
  estimatedArrival?: {
    date: string;
    time: string;
  };
  gate?: string;
  terminal?: string;
  arrivalGate?: string;
  arrivalTerminal?: string;
  aircraft?: {
    type: string;
    registration: string;
  };
  // Additional position data for OpenSky API
  position?: {
    longitude: number;
    latitude: number;
    altitude?: number;
    velocity: number;
    heading: number;
  };
  // Airport information from OpenSky API
  departureAirport?: string;
  arrivalAirport?: string;
  lastUpdated: string;
  // Optional note for status messages (e.g., rate limiting info)
  note?: string;
}

export interface FlightStatusResponse {
  success: boolean;
  data?: FlightStatus;
  error?: string;
}

export interface FlightTrackingService {
  getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse>;
}