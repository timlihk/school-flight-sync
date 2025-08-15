import { FlightStatus, FlightStatusResponse } from '@/types/flightStatus';
import { flightStatusService } from './flightStatusService';
import { openSkyService } from './openSkyService';

// Hybrid flight service that tries multiple APIs for better reliability
class HybridFlightService {
  private primaryService = openSkyService;  // Start with OpenSky (better rate limits)
  private fallbackService = flightStatusService;  // Fall back to Aviation Stack
  private lastServiceUsed: 'opensky' | 'aviationstack' | null = null;

  async getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    try {
      // Try primary service first (OpenSky)
      console.log('Attempting flight status check with OpenSky Network...');
      const primaryResult = await this.primaryService.getFlightStatus(flightNumber, date);
      
      if (primaryResult.success && primaryResult.data) {
        this.lastServiceUsed = 'opensky';
        console.log('Successfully retrieved flight status from OpenSky Network');
        return primaryResult;
      }

      // If primary service fails, try fallback (Aviation Stack)
      console.log('OpenSky failed, trying Aviation Stack as fallback...');
      const fallbackResult = await this.fallbackService.getFlightStatus(flightNumber, date);
      
      if (fallbackResult.success && fallbackResult.data) {
        this.lastServiceUsed = 'aviationstack';
        console.log('Successfully retrieved flight status from Aviation Stack');
        return fallbackResult;
      }

      // If both fail, return the most informative error
      return {
        success: false,
        error: 'Flight status unavailable from all sources'
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
}

export const hybridFlightService = new HybridFlightService();