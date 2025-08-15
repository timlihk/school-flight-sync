import { FlightStatus, FlightStatusResponse } from '@/types/flightStatus';

// Flight status service with API rate limiting considerations
class FlightStatusService {
  private lastApiCall: Date | null = null;
  private readonly rateLimitDelay = 60000; // 1 minute between API calls
  private readonly baseUrl = 'https://api.aviationstack.com/v1';
  private readonly apiKey = import.meta.env.VITE_AVIATION_API_KEY || '';

  async getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    try {
      // For demo purposes, return mock data if no API key is provided
      if (!this.apiKey) {
        return this.getMockFlightStatus(flightNumber, date);
      }

      // Rate limiting: ensure minimum delay between API calls
      if (this.lastApiCall) {
        const timeSinceLastCall = Date.now() - this.lastApiCall.getTime();
        if (timeSinceLastCall < this.rateLimitDelay) {
          return this.getMockFlightStatus(flightNumber, date);
        }
      }

      this.lastApiCall = new Date();

      const response = await fetch(
        `${this.baseUrl}/flights?access_key=${this.apiKey}&flight_iata=${flightNumber}&flight_date=${date}&limit=1`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API error');
      }

      if (!data.data || data.data.length === 0) {
        return {
          success: false,
          error: 'Flight not found'
        };
      }

      const flight = data.data[0];
      const flightStatus = this.transformApiResponse(flight);

      return {
        success: true,
        data: flightStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch flight status'
      };
    }
  }

  private transformApiResponse(apiData: Record<string, unknown>): FlightStatus {
    const departure = apiData.departure || {};
    const arrival = apiData.arrival || {};
    
    // Calculate delays
    const scheduledDeparture = departure.scheduled ? new Date(departure.scheduled) : null;
    const actualDeparture = departure.actual ? new Date(departure.actual) : null;
    const scheduledArrival = arrival.scheduled ? new Date(arrival.scheduled) : null;
    const actualArrival = arrival.actual ? new Date(arrival.actual) : null;
    const estimatedArrival = arrival.estimated ? new Date(arrival.estimated) : null;

    const departureDelay = scheduledDeparture && actualDeparture
      ? Math.round((actualDeparture.getTime() - scheduledDeparture.getTime()) / (1000 * 60))
      : undefined;

    const arrivalDelay = scheduledArrival && (actualArrival || estimatedArrival)
      ? Math.round(((actualArrival || estimatedArrival!).getTime() - scheduledArrival.getTime()) / (1000 * 60))
      : undefined;

    return {
      flightNumber: apiData.flight?.iata || apiData.flight?.icao || 'Unknown',
      status: this.mapFlightStatus(apiData.flight_status),
      actualDeparture: actualDeparture ? {
        date: actualDeparture.toISOString().split('T')[0],
        time: actualDeparture.toTimeString().slice(0, 5),
        delay: departureDelay
      } : undefined,
      actualArrival: actualArrival ? {
        date: actualArrival.toISOString().split('T')[0],
        time: actualArrival.toTimeString().slice(0, 5),
        delay: arrivalDelay
      } : undefined,
      estimatedArrival: estimatedArrival ? {
        date: estimatedArrival.toISOString().split('T')[0],
        time: estimatedArrival.toTimeString().slice(0, 5)
      } : undefined,
      gate: arrival.gate || undefined,
      terminal: arrival.terminal || undefined,
      aircraft: apiData.aircraft ? {
        type: apiData.aircraft.iata || apiData.aircraft.icao || 'Unknown',
        registration: apiData.aircraft.registration || 'Unknown'
      } : undefined,
      lastUpdated: new Date().toISOString()
    };
  }

  private mapFlightStatus(apiStatus: string): FlightStatus['status'] {
    const statusMap: Record<string, FlightStatus['status']> = {
      'scheduled': 'scheduled',
      'active': 'active',
      'landed': 'landed',
      'cancelled': 'cancelled',
      'incident': 'diverted',
      'diverted': 'diverted'
    };

    return statusMap[apiStatus?.toLowerCase()] || 'unknown';
  }

  // Mock data for demonstration when no API key is provided
  private getMockFlightStatus(flightNumber: string, date: string): FlightStatusResponse {
    const mockStatuses: FlightStatus['status'][] = ['scheduled', 'active', 'landed', 'delayed'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
    
    const now = new Date();
    const flightDate = new Date(date);
    const isToday = flightDate.toDateString() === now.toDateString();
    
    let actualStatus = randomStatus;
    if (!isToday && flightDate < now) {
      actualStatus = 'landed'; // Past flights are landed
    } else if (!isToday && flightDate > now) {
      actualStatus = 'scheduled'; // Future flights are scheduled
    }

    const mockDelay = actualStatus === 'delayed' ? Math.floor(Math.random() * 120) + 15 : undefined;

    return {
      success: true,
      data: {
        flightNumber,
        status: actualStatus,
        actualDeparture: actualStatus === 'landed' || actualStatus === 'active' ? {
          date: flightDate.toISOString().split('T')[0],
          time: '14:30',
          delay: mockDelay
        } : undefined,
        actualArrival: actualStatus === 'landed' ? {
          date: flightDate.toISOString().split('T')[0],
          time: '16:45',
          delay: mockDelay
        } : undefined,
        estimatedArrival: actualStatus === 'active' || actualStatus === 'delayed' ? {
          date: flightDate.toISOString().split('T')[0],
          time: mockDelay ? `${16 + Math.floor(mockDelay / 60)}:${45 + (mockDelay % 60)}` : '16:45'
        } : undefined,
        gate: actualStatus === 'landed' || actualStatus === 'active' ? `A${Math.floor(Math.random() * 20) + 1}` : undefined,
        terminal: '1',
        aircraft: {
          type: 'A320',
          registration: `G-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        },
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export const flightStatusService = new FlightStatusService();