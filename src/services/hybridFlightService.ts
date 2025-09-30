import { FlightStatusResponse } from '@/types/flightStatus';
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

      // If both APIs fail due to rate limiting, provide basic scheduled status
      const isRateLimited = (primaryResult.error?.includes('Rate limited') || primaryResult.error?.includes('429')) &&
                           (fallbackResult.error?.includes('API key not configured') || fallbackResult.error?.includes('429'));
      
      if (isRateLimited) {
        console.log('⏰ APIs rate limited - providing basic scheduled flight information');
        return {
          success: true,
          data: {
            flightNumber: flightNumber,
            status: 'scheduled',
            lastUpdated: new Date().toISOString(),
            // Add note about rate limiting
            note: 'Real-time status unavailable due to API rate limits. Check again later for live updates.'
          }
        };
      }

      // For other errors, return detailed error message
      console.log('❌ Both real-time APIs failed. Status refresh requires live data, not static schedules.');
      return {
        success: false,
        error: `Real-time status unavailable. OpenSky: ${primaryResult.error}. AviationStack: ${fallbackResult.error}. Try again later for live status updates.`
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
        await openSkyPromise;
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