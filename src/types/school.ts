export interface Term {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  type: 'term' | 'half-term' | 'holiday';
  school: 'benenden' | 'wycombe';
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
  notes?: string;
}

export interface SchoolData {
  name: string;
  color: string;
  terms: Term[];
}