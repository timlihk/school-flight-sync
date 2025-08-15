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
  aircraft?: {
    type: string;
    registration: string;
  };
  lastUpdated: string;
}

export interface FlightStatusResponse {
  success: boolean;
  data?: FlightStatus;
  error?: string;
}

export interface FlightTrackingService {
  getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse>;
}