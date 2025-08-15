// Simple caching service to reduce API calls
// Caches flight lookup results in localStorage for 24 hours

interface CachedFlightData {
  flightNumber: string;
  date: string;
  data: any;
  timestamp: number;
}

class FlightCacheService {
  private readonly CACHE_KEY = 'flight_lookup_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached flights

  // Get cached flight data
  getCachedFlight(flightNumber: string, date: string): any | null {
    try {
      const cache = this.getAllCached();
      const cacheKey = this.getCacheKey(flightNumber, date);
      const cached = cache[cacheKey];

      if (!cached) {
        return null;
      }

      // Check if cache is expired
      const now = Date.now();
      if (now - cached.timestamp > this.CACHE_DURATION) {
        // Remove expired cache entry
        delete cache[cacheKey];
        this.saveCache(cache);
        return null;
      }

      console.log(`Using cached data for ${flightNumber} on ${date}`);
      return cached.data;
    } catch (error) {
      console.error('Error reading flight cache:', error);
      return null;
    }
  }

  // Cache flight data
  cacheFlight(flightNumber: string, date: string, data: any): void {
    try {
      const cache = this.getAllCached();
      const cacheKey = this.getCacheKey(flightNumber, date);

      // Add new cache entry
      cache[cacheKey] = {
        flightNumber,
        date,
        data,
        timestamp: Date.now()
      };

      // Limit cache size
      const keys = Object.keys(cache);
      if (keys.length > this.MAX_CACHE_SIZE) {
        // Remove oldest entries
        const sortedKeys = keys.sort((a, b) => {
          return cache[a].timestamp - cache[b].timestamp;
        });
        
        const keysToRemove = sortedKeys.slice(0, keys.length - this.MAX_CACHE_SIZE);
        keysToRemove.forEach(key => delete cache[key]);
      }

      this.saveCache(cache);
      console.log(`Cached data for ${flightNumber} on ${date}`);
    } catch (error) {
      console.error('Error caching flight data:', error);
    }
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    try {
      const cache = this.getAllCached();
      const now = Date.now();
      let hasChanges = false;

      Object.keys(cache).forEach(key => {
        if (now - cache[key].timestamp > this.CACHE_DURATION) {
          delete cache[key];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        this.saveCache(cache);
        console.log('Cleared expired cache entries');
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Clear all cache
  clearAllCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('Cleared all flight cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache statistics
  getCacheStats(): { total: number; expired: number; valid: number } {
    try {
      const cache = this.getAllCached();
      const now = Date.now();
      let expired = 0;
      let valid = 0;

      Object.values(cache).forEach((entry: any) => {
        if (now - entry.timestamp > this.CACHE_DURATION) {
          expired++;
        } else {
          valid++;
        }
      });

      return {
        total: Object.keys(cache).length,
        expired,
        valid
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { total: 0, expired: 0, valid: 0 };
    }
  }

  // Private helper methods
  private getCacheKey(flightNumber: string, date: string): string {
    return `${flightNumber.toUpperCase()}_${date}`;
  }

  private getAllCached(): Record<string, CachedFlightData> {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error('Error parsing cache:', error);
      return {};
    }
  }

  private saveCache(cache: Record<string, CachedFlightData>): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error saving cache:', error);
      // If localStorage is full, clear old entries and try again
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearExpiredCache();
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        } catch (retryError) {
          console.error('Failed to save cache after clearing:', retryError);
        }
      }
    }
  }
}

export const flightCacheService = new FlightCacheService();