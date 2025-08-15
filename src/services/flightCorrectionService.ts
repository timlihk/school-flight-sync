import { supabase } from '@/integrations/supabase/client';
import { flightCacheService } from './flightCacheService';
import { FlightDetails } from '@/types/school';
import { FlightLookupResult } from './flightLookupService';

// Service to handle manual flight corrections and database updates
// When user manually corrects flight information, this service:
// 1. Updates the corrected information in cache
// 2. Scans database for similar flights and updates them
// 3. Ensures future lookups use the corrected data

interface FlightCorrection {
  flightNumber: string;
  date: string;
  correctedData: {
    airline: string;
    departure: {
      airport: string;
      time: string;
      terminal?: string;
    };
    arrival: {
      airport: string;
      date: string;
      time: string;
      terminal?: string;
    };
    aircraft?: {
      type: string;
    };
  };
}

interface FlightCorrectionStats {
  cacheUpdated: boolean;
  databaseFlightsUpdated: number;
  similarFlightsFound: number;
  errors: string[];
}

class FlightCorrectionService {
  
  /**
   * Apply manual correction to a flight and update related data
   */
  async applyManualCorrection(
    flightNumber: string,
    originalDate: string,
    correctedFlight: FlightDetails
  ): Promise<FlightCorrectionStats> {
    const stats: FlightCorrectionStats = {
      cacheUpdated: false,
      databaseFlightsUpdated: 0,
      similarFlightsFound: 0,
      errors: []
    };

    try {
      // 1. Create corrected lookup data format
      const correctedLookupData: FlightLookupResult['data'] = {
        airline: correctedFlight.airline,
        flightNumber: correctedFlight.flightNumber,
        departure: {
          airport: correctedFlight.departure.airport,
          date: originalDate,
          time: correctedFlight.departure.time,
          terminal: this.extractTerminal(correctedFlight.departure.airport)
        },
        arrival: {
          airport: correctedFlight.arrival.airport,
          date: correctedFlight.arrival.date.toISOString().split('T')[0],
          time: correctedFlight.arrival.time,
          terminal: this.extractTerminal(correctedFlight.arrival.airport)
        },
        aircraft: undefined // Will be preserved from original data if available
      };

      // 2. Update cache with corrected data (extends to 60 days)
      try {
        flightCacheService.cacheFlight(flightNumber, originalDate, correctedLookupData);
        stats.cacheUpdated = true;
        console.log(`✅ Updated cache for ${flightNumber} on ${originalDate}`);
      } catch (error) {
        stats.errors.push(`Cache update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // 3. Find and update similar flights in database
      const similarFlights = await this.findSimilarFlights(flightNumber);
      stats.similarFlightsFound = similarFlights.length;

      for (const flight of similarFlights) {
        try {
          const updated = await this.updateFlightInDatabase(flight, correctedLookupData);
          if (updated) {
            stats.databaseFlightsUpdated++;
            console.log(`✅ Updated database flight ${flight.id} (${flightNumber})`);
          }
        } catch (error) {
          stats.errors.push(`Database update failed for flight ${flight.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 4. Cache corrected data for future similar date lookups
      await this.cacheForSimilarDates(flightNumber, originalDate, correctedLookupData);

      console.log(`🔧 Flight correction completed for ${flightNumber}:`, {
        ...stats,
        originalDate,
        correctedAirline: correctedFlight.airline,
        correctedDeparture: `${correctedFlight.departure.airport} at ${correctedFlight.departure.time}`,
        correctedArrival: `${correctedFlight.arrival.airport} at ${correctedFlight.arrival.time}`
      });

      return stats;

    } catch (error) {
      stats.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return stats;
    }
  }

  /**
   * Find flights in database with same flight number
   */
  private async findSimilarFlights(flightNumber: string): Promise<FlightDetails[]> {
    try {
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('flight_number', flightNumber.toUpperCase());

      if (error) {
        console.error('Error finding similar flights:', error);
        return [];
      }

      return data?.map(dbFlight => this.transformDbToFlight(dbFlight)) || [];
    } catch (error) {
      console.error('Error in findSimilarFlights:', error);
      return [];
    }
  }

  /**
   * Update a flight record in the database with corrected information
   */
  private async updateFlightInDatabase(
    flight: FlightDetails, 
    correctedData: FlightLookupResult['data']
  ): Promise<boolean> {
    if (!correctedData) return false;

    try {
      const updateData = {
        airline: correctedData.airline,
        departure_airport: correctedData.departure.airport,
        departure_time: correctedData.departure.time,
        arrival_airport: correctedData.arrival.airport,
        arrival_time: correctedData.arrival.time,
        // Only update arrival_date if it's different from departure date
        arrival_date: correctedData.arrival.date !== correctedData.departure.date 
          ? correctedData.arrival.date 
          : undefined
      };

      // Remove undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const { error } = await supabase
        .from('flights')
        .update(cleanUpdateData)
        .eq('id', flight.id);

      if (error) {
        console.error('Error updating flight in database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateFlightInDatabase:', error);
      return false;
    }
  }

  /**
   * Cache corrected data for similar dates (same flight number on different dates)
   * This helps when users book the same flight for different terms
   */
  private async cacheForSimilarDates(
    flightNumber: string,
    originalDate: string,
    correctedData: FlightLookupResult['data']
  ): Promise<void> {
    if (!correctedData) return;

    // Cache for next few months (common booking patterns)
    const originalDateObj = new Date(originalDate);
    const dates = [];

    // Generate dates for same flight number over next 6 months
    for (let monthOffset = 1; monthOffset <= 6; monthOffset++) {
      const futureDate = new Date(originalDateObj);
      futureDate.setMonth(futureDate.getMonth() + monthOffset);
      
      // Same day of month in future months
      if (futureDate.getDate() === originalDateObj.getDate()) {
        dates.push(futureDate.toISOString().split('T')[0]);
      }
    }

    // Cache corrected data for these future dates
    for (const date of dates) {
      try {
        const futureCorrectedData = {
          ...correctedData,
          departure: {
            ...correctedData.departure,
            date: date
          },
          arrival: {
            ...correctedData.arrival,
            date: this.calculateArrivalDate(date, correctedData.departure.time, correctedData.arrival.time)
          }
        };

        flightCacheService.cacheFlight(flightNumber, date, futureCorrectedData);
      } catch (error) {
        console.error(`Error caching for future date ${date}:`, error);
      }
    }
  }

  /**
   * Calculate arrival date based on departure date and times
   */
  private calculateArrivalDate(departureDate: string, departureTime: string, arrivalTime: string): string {
    const depDate = new Date(departureDate);
    
    // Parse times
    const [depHour, depMinute] = departureTime.split(':').map(Number);
    const [arrHour, arrMinute] = arrivalTime.split(':').map(Number);
    
    // If arrival time is before departure time, assume next day
    if (arrHour < depHour || (arrHour === depHour && arrMinute < depMinute)) {
      depDate.setDate(depDate.getDate() + 1);
    }
    
    return depDate.toISOString().split('T')[0];
  }

  /**
   * Extract terminal from airport string (e.g., "LHR T3" -> "T3")
   */
  private extractTerminal(airportString: string): string {
    const match = airportString.match(/\s+(T\d+|Terminal\s+\d+|Pier\s+[A-Z]|North|South)/i);
    return match ? match[1] : '';
  }

  /**
   * Transform database record to FlightDetails format
   */
  private transformDbToFlight(dbFlight: any): FlightDetails {
    return {
      id: dbFlight.id,
      termId: dbFlight.term_id,
      type: dbFlight.type,
      airline: dbFlight.airline,
      flightNumber: dbFlight.flight_number,
      departure: {
        airport: dbFlight.departure_airport,
        date: new Date(dbFlight.departure_date),
        time: dbFlight.departure_time
      },
      arrival: {
        airport: dbFlight.arrival_airport,
        date: new Date(dbFlight.arrival_date),
        time: dbFlight.arrival_time
      },
      confirmationCode: dbFlight.confirmation_code,
      notes: dbFlight.notes
    };
  }

  /**
   * Get correction statistics for a flight number
   */
  async getCorrectionStats(flightNumber: string): Promise<{
    cachedVersions: number;
    databaseFlights: number;
    lastCorrectionDate?: string;
  }> {
    try {
      // Get cache stats
      const cacheStats = flightCacheService.getCacheStats();
      
      // Count database flights
      const { data: dbFlights } = await supabase
        .from('flights')
        .select('id')
        .eq('flight_number', flightNumber.toUpperCase());

      return {
        cachedVersions: 0, // Would need cache inspection method
        databaseFlights: dbFlights?.length || 0,
        lastCorrectionDate: undefined // Could be tracked in future
      };
    } catch (error) {
      console.error('Error getting correction stats:', error);
      return {
        cachedVersions: 0,
        databaseFlights: 0
      };
    }
  }
}

export const flightCorrectionService = new FlightCorrectionService();