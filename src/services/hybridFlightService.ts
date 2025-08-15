import { FlightStatus, FlightStatusResponse } from '@/types/flightStatus';
import { aviationStackService } from './aviationStackService';
import { openSkyService } from './openSkyService';

// Hybrid flight service that tries multiple APIs for better reliability
class HybridFlightService {
  private primaryService = openSkyService;  // Start with OpenSky (better rate limits)
  private fallbackService = aviationStackService;  // Fall back to Aviation Stack
  private lastServiceUsed: 'opensky' | 'aviationstack' | null = null;

  async getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    console.log(`🚀 Hybrid Service: Starting flight status check for ${flightNumber} on ${date}`);
    
    try {
      // Validate inputs
      if (!flightNumber || !date) {
        return {
          success: false,
          error: 'Missing flight number or date'
        };
      }

      // Try primary service first (OpenSky)
      console.log('🔄 Step 1: Attempting flight status check with OpenSky Network...');
      let primaryResult;
      try {
        primaryResult = await this.primaryService.getFlightStatus(flightNumber, date);
        console.log('OpenSky result:', primaryResult.success ? '✅ Success' : `❌ Failed: ${primaryResult.error}`);
      } catch (error) {
        console.error('OpenSky service threw error:', error);
        primaryResult = { success: false, error: error instanceof Error ? error.message : 'OpenSky service error' };
      }
      
      if (primaryResult.success && primaryResult.data) {
        this.lastServiceUsed = 'opensky';
        console.log('✅ Successfully retrieved flight status from OpenSky Network');
        return primaryResult;
      }

      // If primary service fails, try fallback (Aviation Stack)
      console.log('🔄 Step 2: OpenSky failed, trying Aviation Stack as fallback...');
      let fallbackResult;
      try {
        fallbackResult = await this.fallbackService.getFlightStatus(flightNumber, date);
        console.log('AviationStack result:', fallbackResult.success ? '✅ Success' : `❌ Failed: ${fallbackResult.error}`);
      } catch (error) {
        console.error('AviationStack service threw error:', error);
        fallbackResult = { success: false, error: error instanceof Error ? error.message : 'AviationStack service error' };
      }
      
      if (fallbackResult.success && fallbackResult.data) {
        this.lastServiceUsed = 'aviationstack';
        console.log('✅ Successfully retrieved flight status from Aviation Stack');
        return fallbackResult;
      }

      // If both APIs fail, try static schedules as last resort
      console.log('🔄 Step 3: Both APIs failed, trying static schedules as last resort...');
      const staticResult = this.getStaticFlightStatus(flightNumber, date);
      
      if (staticResult.success) {
        console.log('✅ Using static schedule data');
        return staticResult;
      }

      // If everything fails, return the most informative error
      console.log('❌ All sources failed. Primary error:', primaryResult.error, 'Fallback error:', fallbackResult.error);
      return {
        success: false,
        error: `All sources failed. OpenSky: ${primaryResult.error}. AviationStack: ${fallbackResult.error}. No static data available.`
      };

    } catch (error) {
      console.error('Hybrid flight service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Flight status service error'
      };
    }
  }

  // Get information about which service was last used successfully
  getLastServiceUsed(): string {
    switch (this.lastServiceUsed) {
      case 'opensky':
        return 'OpenSky Network (4000 daily credits)';
      case 'aviationstack':
        return 'Aviation Stack (100 monthly calls)';
      default:
        return 'Mock data (no API available)';
    }
  }

  // Get detailed authentication status
  async getAuthenticationInfo(): Promise<{
    opensky: {
      available: boolean;
      method: 'oauth2' | 'basic' | 'anonymous';
      tokenValid?: boolean;
      recommended: boolean;
    };
    aviationstack: {
      available: boolean;
      method: 'api_key' | 'anonymous';
    };
  }> {
    const openskyStatus = await this.primaryService.getAuthenticationStatus();
    
    return {
      opensky: {
        available: openskyStatus.hasOAuth2 || openskyStatus.hasBasicAuth,
        method: openskyStatus.currentMethod,
        tokenValid: openskyStatus.tokenValid,
        recommended: openskyStatus.currentMethod === 'oauth2'
      },
      aviationstack: {
        available: !!(import.meta.env.VITE_AVIATION_API_KEY),
        method: import.meta.env.VITE_AVIATION_API_KEY ? 'api_key' : 'anonymous'
      }
    };
  }

  // Method to check service availability
  async checkServiceAvailability(): Promise<{
    opensky: boolean;
    aviationstack: boolean;
  }> {
    const results = {
      opensky: false,
      aviationstack: false
    };

    try {
      // Quick test with a common flight number
      const testFlight = 'BA001';
      const testDate = new Date().toISOString().split('T')[0];

      // Test OpenSky (timeout after 5 seconds)
      const openSkyPromise = Promise.race([
        this.primaryService.getFlightStatus(testFlight, testDate),
        new Promise<FlightStatusResponse>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
      ]);

      try {
        const openSkyResult = await openSkyPromise;
        results.opensky = true;
      } catch (error) {
        console.log('OpenSky service not available:', error);
      }

      // Test Aviation Stack (timeout after 5 seconds)
      const aviationStackPromise = Promise.race([
        this.fallbackService.getFlightStatus(testFlight, testDate),
        new Promise<FlightStatusResponse>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
      ]);

      try {
        const aviationStackResult = await aviationStackPromise;
        results.aviationstack = aviationStackResult.success;
      } catch (error) {
        console.log('Aviation Stack service not available:', error);
      }

    } catch (error) {
      console.error('Service availability check failed:', error);
    }

    return results;
  }

  // Static flight schedules as last resort fallback
  private getStaticFlightStatus(flightNumber: string, date: string): FlightStatusResponse {
    const staticSchedules: Record<string, any> = {
      // Cathay Pacific Hong Kong routes
      'CX238': {
        status: 'scheduled',
        departure: { time: '11:05', airport: 'HKG' },
        arrival: { time: '18:00', airport: 'LHR' },
        daysOfWeek: [0, 2, 4, 6] // Sunday, Tuesday, Thursday, Saturday
      },
      'CX239': {
        status: 'scheduled',
        departure: { time: '11:00', airport: 'HKG' },
        arrival: { time: '17:55', airport: 'LHR' },
        daysOfWeek: [1, 3, 5] // Monday, Wednesday, Friday
      },
      'CX252': {
        status: 'scheduled',
        departure: { time: '00:05', airport: 'LHR' },
        arrival: { time: '18:30', airport: 'HKG' },
      },
      'CX253': {
        status: 'scheduled',
        departure: { time: '21:45', airport: 'LHR' },
        arrival: { time: '17:15', airport: 'HKG' },
      },
      // British Airways Hong Kong routes
      'BA31': {
        status: 'scheduled',
        departure: { time: '11:25', airport: 'LHR' },
        arrival: { time: '06:05', airport: 'HKG' },
      },
      'BA32': {
        status: 'scheduled',
        departure: { time: '18:40', airport: 'HKG' },
        arrival: { time: '23:00', airport: 'LHR' },
      },
    };

    const schedule = staticSchedules[flightNumber.toUpperCase()];
    if (!schedule) {
      return {
        success: false,
        error: 'No static schedule data available for this flight'
      };
    }

    // Calculate arrival date
    const flightDate = new Date(date);
    let arrivalDate = new Date(flightDate);
    
    // For westbound flights (HKG to LHR), same day arrival due to time zones
    // For eastbound flights (LHR to HKG), next day arrival
    if (schedule.departure.airport === 'LHR' && schedule.arrival.airport === 'HKG') {
      arrivalDate.setDate(arrivalDate.getDate() + 1);
    }

    return {
      success: true,
      data: {
        flightNumber,
        status: schedule.status,
        actualDeparture: {
          date: flightDate.toISOString().split('T')[0],
          time: schedule.departure.time
        },
        estimatedArrival: {
          date: arrivalDate.toISOString().split('T')[0],
          time: schedule.arrival.time
        },
        departureAirport: schedule.departure.airport,
        arrivalAirport: schedule.arrival.airport,
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export const hybridFlightService = new HybridFlightService();