import { FlightStatusResponse } from '@/types/flightStatus';

// AviationStack API service for real-time flight schedule data
// Free plan: 100 requests/month - use sparingly for schedule lookups
class AviationStackService {
  private readonly baseUrl = 'https://api.aviationstack.com/v1';
  private readonly apiKey = import.meta.env.VITE_AVIATIONSTACK_API_KEY || '';
  private lastApiCall: Date | null = null;
  private readonly rateLimitDelay = 5000; // 5 seconds between calls to conserve quota

  // Check if API key is configured
  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  // Get flight schedule information for a specific flight and date
  async getFlightSchedule(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'AviationStack API key not configured'
      };
    }

    try {
      // Rate limiting: ensure minimum delay between API calls
      if (this.lastApiCall) {
        const timeSinceLastCall = Date.now() - this.lastApiCall.getTime();
        if (timeSinceLastCall < this.rateLimitDelay) {
          return {
            success: false,
            error: 'Rate limit: Please wait before making another request'
          };
        }
      }

      this.lastApiCall = new Date();

      // Convert date to YYYY-MM-DD format
      const flightDate = new Date(date);
      const dateString = flightDate.toISOString().split('T')[0];

      // AviationStack flights endpoint - get flights for specific date
      // Use correct API parameters: flight_iata for flight number, flight_date for date
      const url = `${this.baseUrl}/flights?access_key=${this.apiKey}&flight_iata=${flightNumber}&flight_date=${dateString}&limit=1`;


      const response = await fetch(url);

      if (!response.ok) {
        // Try to get more detailed error information
        let errorDetails = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          errorDetails += ` - ${errorData}`;
        } catch (e) {
          // Ignore errors reading response body
        }
        throw new Error(`AviationStack API request failed: ${errorDetails}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data.error) {
        return {
          success: false,
          error: `AviationStack API error: ${data.error.message || 'Unknown error'}`
        };
      }

      // Check if flight data was found
      if (!data.data || data.data.length === 0) {
        return {
          success: false,
          error: 'Flight not found in AviationStack database'
        };
      }

      // Get the first matching flight
      const flight = data.data[0];

      return this.transformAviationStackResponse(flight, flightNumber);

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch flight schedule'
      };
    }
  }

  private transformAviationStackResponse(flightData: Record<string, unknown>, originalFlightNumber: string): FlightStatusResponse {
    try {
      const {
        flight_status,
        departure,
        arrival,
        airline,
        aircraft
      } = flightData;

      // Convert AviationStack status to our format
      let status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'delayed' | 'unknown' = 'scheduled';
      
      switch (flight_status?.toLowerCase()) {
        case 'scheduled':
          status = 'scheduled';
          break;
        case 'active':
        case 'en-route':
          status = 'active';
          break;
        case 'landed':
          status = 'landed';
          break;
        case 'cancelled':
          status = 'cancelled';
          break;
        case 'delayed':
          status = 'delayed';
          break;
        default:
          status = 'unknown';
      }

      // Extract departure information
      const departureTime = departure?.scheduled || departure?.estimated || departure?.actual;
      const departureDate = departureTime ? new Date(departureTime) : null;

      // Extract arrival information  
      const arrivalTime = arrival?.scheduled || arrival?.estimated || arrival?.actual;
      const arrivalDate = arrivalTime ? new Date(arrivalTime) : null;

      const flightStatus = {
        flightNumber: originalFlightNumber,
        status,
        actualDeparture: departureDate ? {
          date: departureDate.toISOString().split('T')[0],
          time: departureDate.toTimeString().slice(0, 5)
        } : undefined,
        actualArrival: arrivalDate ? {
          date: arrivalDate.toISOString().split('T')[0],
          time: arrivalDate.toTimeString().slice(0, 5)
        } : undefined,
        estimatedArrival: arrivalDate ? {
          date: arrivalDate.toISOString().split('T')[0],
          time: arrivalDate.toTimeString().slice(0, 5)
        } : undefined,
        aircraft: aircraft ? {
          type: aircraft.iata || 'Unknown',
          registration: aircraft.registration || 'Unknown'
        } : undefined,
        lastUpdated: new Date().toISOString(),
        // Store airport information for later use
        departureAirport: departure?.iata,
        arrivalAirport: arrival?.iata,
        gate: departure?.gate,
        terminal: departure?.terminal,
        arrivalGate: arrival?.gate,
        arrivalTerminal: arrival?.terminal,
        airline: airline?.name
      };

      return {
        success: true,
        data: flightStatus
      };

    } catch (error) {
      console.error('Error transforming AviationStack response:', error);
      return {
        success: false,
        error: 'Failed to parse flight data from AviationStack'
      };
    }
  }

  // Alias for getFlightSchedule to match interface expected by hybrid service
  async getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    console.log('🔄 AviationStack: getFlightStatus called (aliased to getFlightSchedule)');
    return await this.getFlightSchedule(flightNumber, date);
  }

  // Get usage statistics (useful for monitoring free plan quota)
  async getUsageStats(): Promise<{ remaining?: number; used?: number; limit?: number } | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      // AviationStack doesn't provide a dedicated usage endpoint in the free plan
      // This would need to be tracked client-side or upgraded to paid plan
      return null;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return null;
    }
  }
}

export const aviationStackService = new AviationStackService();