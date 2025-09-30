import { FlightStatus, FlightStatusResponse } from '@/types/flightStatus';

// OpenSky Network API service for real-time flight tracking
// Provides significantly better rate limits (4000 daily credits vs 100/month)
// Uses OAuth2 Client Credentials Flow (recommended) with Basic Auth fallback
class OpenSkyService {
  private lastApiCall: Date | null = null;
  private readonly rateLimitDelay = 30000; // 30 seconds between API calls for OpenSky (stricter rate limiting)
  private readonly baseUrl = 'https://opensky-network.org/api';
  private readonly authUrl = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
  
  // OAuth2 Client Credentials (preferred method)
  private readonly clientId = import.meta.env.VITE_OPENSKY_CLIENT_ID || '';
  private readonly clientSecret = import.meta.env.VITE_OPENSKY_CLIENT_SECRET || '';
  
  // Basic Auth (legacy, being deprecated)
  private readonly username = import.meta.env.VITE_OPENSKY_USERNAME || '';
  private readonly password = import.meta.env.VITE_OPENSKY_PASSWORD || '';
  
  // Token management
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  // OAuth2 token management
  private async getAccessToken(): Promise<string | null> {
    // Skip OAuth2 in browser environment due to CORS restrictions
    return null;

    // Note: OAuth2 Client Credentials flow is blocked by CORS in browsers
    // This would work in a server environment but not in client-side JavaScript
    /*
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Only try OAuth2 if we have client credentials
    if (!this.clientId || !this.clientSecret) {
      return null;
    }

    try {
      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        console.error('Failed to obtain OAuth2 token:', response.status, response.statusText);
        return null;
      }

      const tokenData = await response.json();
      
      if (!tokenData.access_token) {
        console.error('OAuth2 response missing access_token:', tokenData);
        return null;
      }

      this.accessToken = tokenData.access_token;
      
      // Tokens expire after 30 minutes, set expiry to 25 minutes for safety
      this.tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);
      
      console.log('Successfully obtained OpenSky OAuth2 token');
      return this.accessToken;
    } catch (error) {
      console.error('Error obtaining OAuth2 token:', error);
      return null;
    }
    */
  }

  // Get flight schedule information from OpenSky flights API
  async getFlightSchedule(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    try {
      // Validate inputs
      if (!flightNumber || !date) {
        return {
          success: false,
          error: 'Missing flight number or date'
        };
      }

      // Convert date to Unix timestamps for the day
      const flightDate = new Date(date);
      if (isNaN(flightDate.getTime())) {
        return {
          success: false,
          error: 'Invalid date format'
        };
      }

      const dayStart = new Date(flightDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(flightDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const beginTime = Math.floor(dayStart.getTime() / 1000);
      const endTime = Math.floor(dayEnd.getTime() / 1000);
      
      // Normalize callsign for search
      const callsign = this.normalizeCallsign(flightNumber);
      
      // Get authentication
      const headers: HeadersInit = {};
      const token = await this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (this.username && this.password) {
        headers.Authorization = `Basic ${btoa(`${this.username}:${this.password}`)}`;
      }

      // Prioritize airports based on flight number for more targeted search
      const airportsByFlight = this.getRelevantAirports(flightNumber);
      
      for (const airport of airportsByFlight) {
        try {
          // Add delay between airport requests to prevent rate limiting
          if (this.lastApiCall) {
            const timeSinceLastCall = Date.now() - this.lastApiCall.getTime();
            if (timeSinceLastCall < 5000) { // 5 second delay between airport searches
              await new Promise(resolve => setTimeout(resolve, 5000 - timeSinceLastCall));
            }
          }
          this.lastApiCall = new Date();

          // Check departures from this airport
          const departureUrl = `${this.baseUrl}/flights/departure?airport=${airport}&begin=${beginTime}&end=${endTime}`;
          
          const depResponse = await fetch(departureUrl, { headers });
          
          if (depResponse.status === 429) {
            break; // Stop searching if we hit rate limits
          }
          
          if (depResponse.ok) {
            const depFlights = await depResponse.json();
            
            const matchingFlight = depFlights.find((flight: Record<string, unknown>) => 
              (flight.callsign as string)?.trim().toUpperCase() === callsign.toUpperCase()
            );
            
            if (matchingFlight) {
              return this.transformOpenSkyFlightData(matchingFlight, flightNumber, 'departure');
            }
          } else {
            // Failed to fetch departures - continue to next airport
          }
          
          // For past flights only, check arrivals
          if (flightDate < new Date()) {
            const arrivalUrl = `${this.baseUrl}/flights/arrival?airport=${airport}&begin=${beginTime}&end=${endTime}`;
            
            // Add small delay between departure and arrival requests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const arrResponse = await fetch(arrivalUrl, { headers });
            
            if (arrResponse.status === 429) {
              break;
            }
            
            if (arrResponse.ok) {
              const arrFlights = await arrResponse.json();
              
              const matchingFlight = arrFlights.find((flight: Record<string, unknown>) => 
                (flight.callsign as string)?.trim().toUpperCase() === callsign.toUpperCase()
              );
              
              if (matchingFlight) {
                return this.transformOpenSkyFlightData(matchingFlight, flightNumber, 'arrival');
              }
            } else {
              // Failed to fetch arrivals - continue
            }
          }
        } catch {
          continue;
        }
      }
      
      return {
        success: false,
        error: 'Flight schedule not found in OpenSky database'
      };
      
    } catch (error) {
      console.error('OpenSky flight schedule lookup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch flight schedule'
      };
    }
  }

  async getFlightStatus(flightNumber: string, date: string): Promise<FlightStatusResponse> {
    console.log(`🔍 OpenSky: Checking status for ${flightNumber} on ${date}`);
    
    // Check if the flight date is in the future - OpenSky /states/all only shows current flights
    const flightDate = new Date(date);
    const now = new Date();
    const isFlightInFuture = flightDate.getTime() > (now.getTime() + 24 * 60 * 60 * 1000); // More than 24 hours in future
    
    if (isFlightInFuture) {
      console.log(`⏰ Flight ${flightNumber} on ${date} is more than 24 hours in the future. Trying flight schedules instead of current states.`);
      // For future flights, try to get schedule information instead
      return await this.getFlightSchedule(flightNumber, date);
    }
    
    try {
      // Rate limiting: ensure minimum delay between API calls
      if (this.lastApiCall) {
        const timeSinceLastCall = Date.now() - this.lastApiCall.getTime();
        if (timeSinceLastCall < this.rateLimitDelay) {
          console.log(`⏱️ OpenSky rate limit: ${timeSinceLastCall}ms since last call, need ${this.rateLimitDelay}ms. Skipping to fallback.`);
          return {
            success: false,
            error: 'Rate limited - too soon since last call'
          };
        }
      }

      this.lastApiCall = new Date();

      // OpenSky doesn't use flight numbers directly, so we need to search by callsign
      const callsign = this.normalizeCallsign(flightNumber);
      console.log(`🔄 Converting flight number ${flightNumber} to callsign ${callsign} for OpenSky`);
      
      // Get current flight states (anonymous access has limited success)
      const statesUrl = `${this.baseUrl}/states/all`;
      const headers: HeadersInit = {};
      
      // Try OAuth2 first (preferred method)
      const token = await this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('Using OAuth2 authentication for OpenSky API');
      } else if (this.username && this.password) {
        // Fallback to Basic Auth (legacy)
        headers.Authorization = `Basic ${btoa(`${this.username}:${this.password}`)}`;
        console.log('Using Basic Auth for OpenSky API (legacy method)');
      } else {
        console.log('No authentication credentials available, using anonymous access');
      }

      // Add timeout to prevent hanging on first call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(statesUrl, { 
        headers,
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      if (!response.ok) {
        throw new Error(`OpenSky API request failed: ${response.status}`);
      }


      const data = await response.json();

      if (!data.states || data.states.length === 0) {
        return {
          success: false,
          error: 'No flight data available'
        };
      }

      
      // Find flight by callsign - with detailed logging
      const flightState = data.states.find((state: unknown[]) => {
        const stateCallsign = (state[1] as string)?.trim().toUpperCase();
        const matches = stateCallsign === callsign.toUpperCase();
        return matches;
      });

      if (!flightState) {
        return {
          success: false,
          error: `Flight not found. Searched for: ${callsign.toUpperCase()}. Found ${data.states.length} total flights.`
        };
      }

      const flightStatus = this.transformOpenSkyResponse(flightState, flightNumber);

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

  private getRelevantAirports(flightNumber: string): string[] {
    // Prioritize airports based on airline to reduce API calls
    const airline = flightNumber.match(/^([A-Z]{2})/)?.[1];
    
    const airlineHubs: Record<string, string[]> = {
      'CX': ['VHHH'], // Cathay Pacific - Hong Kong
      'BA': ['EGLL', 'EGKK'], // British Airways - Heathrow, Gatwick
      'VS': ['EGLL', 'EGKK'], // Virgin Atlantic - Heathrow, Gatwick  
      'AF': ['LFPG'], // Air France - Charles de Gaulle
      'LH': ['EDDF'], // Lufthansa - Frankfurt
      'KL': ['EHAM'], // KLM - Amsterdam
      'EK': ['OMDB'], // Emirates - Dubai
      'SQ': ['WSSS'], // Singapore Airlines - Singapore
      'JL': ['RJAA', 'RJTT'], // Japan Airlines - Narita, Haneda
      'NH': ['RJAA', 'RJTT'], // ANA - Narita, Haneda
    };

    // Get airline-specific airports first, then add major hubs as fallback
    const airlineAirports = airlineHubs[airline || ''] || [];
    const majorHubs = ['VHHH', 'EGLL', 'EGKK', 'LFPG', 'EDDF', 'EHAM', 'OMDB', 'WSSS', 'RJAA', 'RJTT'];
    
    // Combine airline hubs first, then remaining major hubs
    const prioritized = [...airlineAirports];
    majorHubs.forEach(hub => {
      if (!prioritized.includes(hub)) {
        prioritized.push(hub);
      }
    });
    
    // For CX flights, prioritize Hong Kong heavily
    if (airline === 'CX') {
      return ['VHHH', 'EGLL', 'EGKK']; // HK + London only for Cathay Pacific
    }
    
    return prioritized.slice(0, 5); // Limit to 5 airports maximum to prevent rate limiting
  }

  private normalizeCallsign(flightNumber: string): string {
    // Convert flight number to callsign format
    // Example: "BA123" -> "BAW123" (British Airways uses BAW as callsign)
    const airlineMap: Record<string, string> = {
      'BA': 'BAW',  // British Airways
      'VS': 'VIR',  // Virgin Atlantic  
      'AF': 'AFR',  // Air France
      'LH': 'DLH',  // Lufthansa
      'KL': 'KLM',  // KLM
      'EK': 'UAE',  // Emirates
      'QR': 'QTR',  // Qatar Airways
      'SQ': 'SIA',  // Singapore Airlines
      'CX': 'CPA',  // Cathay Pacific Airways (key mapping!)
      'KA': 'HDA',  // Cathay Dragon (HK Dragon Airlines)
      'JL': 'JAL',  // Japan Airlines
      'NH': 'ANA',  // All Nippon Airways
      'UA': 'UAL',  // United Airlines
      'DL': 'DAL',  // Delta Air Lines
      'AA': 'AAL',  // American Airlines
      'TK': 'THY',  // Turkish Airlines
      'IB': 'IBE',  // Iberia
      'EY': 'ETD',  // Etihad Airways
      'TG': 'THA',  // Thai Airways
    };

    const match = flightNumber.match(/^([A-Z]{2})(\d+)$/);
    if (match) {
      const [, airline, number] = match;
      const callsignPrefix = airlineMap[airline] || airline;
      return `${callsignPrefix}${number}`;
    }

    return flightNumber;
  }

  private transformOpenSkyFlightData(flightData: Record<string, unknown>, originalFlightNumber: string, type: 'departure' | 'arrival'): FlightStatusResponse {
    try {
      // OpenSky flight data structure
      const {
        estDepartureAirport,
        estArrivalAirport,
        firstSeen,
        lastSeen
      } = flightData;

      // Convert Unix timestamps to readable times
      const departureTime = firstSeen ? new Date(firstSeen * 1000) : null;
      const arrivalTime = lastSeen ? new Date(lastSeen * 1000) : null;

      let status: FlightStatus['status'] = 'scheduled';
      if (type === 'arrival' && arrivalTime) {
        status = 'landed';
      } else if (departureTime && arrivalTime && Date.now() > departureTime.getTime() && Date.now() < arrivalTime.getTime()) {
        status = 'active';
      }

      const flightStatus: FlightStatus = {
        flightNumber: originalFlightNumber,
        status,
        actualDeparture: departureTime ? {
          date: departureTime.toISOString().split('T')[0],
          time: departureTime.toTimeString().slice(0, 5)
        } : undefined,
        actualArrival: arrivalTime ? {
          date: arrivalTime.toISOString().split('T')[0],
          time: arrivalTime.toTimeString().slice(0, 5)
        } : undefined,
        estimatedArrival: arrivalTime ? {
          date: arrivalTime.toISOString().split('T')[0],
          time: arrivalTime.toTimeString().slice(0, 5)
        } : undefined,
        lastUpdated: new Date().toISOString(),
        // Store airport information for later use
        departureAirport: estDepartureAirport,
        arrivalAirport: estArrivalAirport,
        position: {
          longitude: 0,
          latitude: 0,
          altitude: 0,
          velocity: 0,
          heading: 0
        }
      };

      return {
        success: true,
        data: flightStatus
      };
    } catch (error) {
      console.error('Error transforming OpenSky flight data:', error);
      return {
        success: false,
        error: 'Failed to parse flight data'
      };
    }
  }

  private transformOpenSkyResponse(stateVector: unknown[], originalFlightNumber: string): FlightStatus {
    // OpenSky state vector format:
    // [0] icao24, [1] callsign, [2] origin_country, [3] time_position, 
    // [4] last_contact, [5] longitude, [6] latitude, [7] baro_altitude,
    // [8] on_ground, [9] velocity, [10] true_track, [11] vertical_rate,
    // [12] sensors, [13] geo_altitude, [14] squawk, [15] spi, [16] position_source

    const [
      icao24, , , , lastContact,
      longitude, latitude, baroAltitude, onGround, velocity,
      trueTrack
    ] = stateVector as [string, string, string, number, number, number, number, number, boolean, number, number, number];

    // Determine flight status based on available data
    let status: FlightStatus['status'] = 'unknown';
    
    if (onGround === true) {
      status = 'landed';
    } else if (onGround === false && velocity > 0) {
      status = 'active';
    } else {
      status = 'scheduled';
    }

    const now = new Date();
    const lastContactTime = lastContact ? new Date(lastContact * 1000) : now;

    return {
      flightNumber: originalFlightNumber,
      status,
      actualDeparture: !onGround ? {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5)
      } : undefined,
      actualArrival: onGround ? {
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5)
      } : undefined,
      estimatedArrival: !onGround && velocity > 0 ? {
        date: now.toISOString().split('T')[0],
        time: new Date(now.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5) // Estimate 2 hours
      } : undefined,
      aircraft: {
        type: 'Unknown',
        registration: icao24 || 'Unknown'
      },
      lastUpdated: lastContactTime.toISOString(),
      // Additional OpenSky specific data
      position: longitude && latitude ? {
        longitude,
        latitude,
        altitude: baroAltitude,
        velocity: velocity || 0,
        heading: trueTrack || 0
      } : undefined
    };
  }

  // Check authentication status and method
  async getAuthenticationStatus(): Promise<{
    hasOAuth2: boolean;
    hasBasicAuth: boolean;
    currentMethod: 'oauth2' | 'basic' | 'anonymous';
    tokenValid: boolean;
  }> {
    const hasOAuth2 = !!(this.clientId && this.clientSecret);
    const hasBasicAuth = !!(this.username && this.password);
    
    let tokenValid = false;
    if (hasOAuth2) {
      const token = await this.getAccessToken();
      tokenValid = !!token;
    }
    
    let currentMethod: 'oauth2' | 'basic' | 'anonymous' = 'anonymous';
    if (hasOAuth2 && tokenValid) {
      currentMethod = 'oauth2';
    } else if (hasBasicAuth) {
      currentMethod = 'basic';
    }
    
    return {
      hasOAuth2,
      hasBasicAuth,
      currentMethod,
      tokenValid
    };
  }

  // Clear cached token (useful for testing or force refresh)
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Mock data for demonstration when API fails
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
        aircraft: {
          type: 'A320',
          registration: `G-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        },
        lastUpdated: new Date().toISOString()
      }
    };
  }
}

export const openSkyService = new OpenSkyService();