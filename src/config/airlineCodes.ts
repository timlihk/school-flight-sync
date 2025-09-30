/**
 * Airline Code Mappings (IATA to ICAO)
 *
 * Maps IATA two-letter airline codes to ICAO three-letter codes
 * used by FlightAware and other aviation systems.
 */

export const AIRLINE_CODE_MAP: Record<string, string> = {
  'CX': 'CPA',    // Cathay Pacific
  'BA': 'BAW',    // British Airways
  'AY': 'FIN',    // Finnair
  'AA': 'AAL',    // American Airlines
  'EK': 'UAE',    // Emirates
  'QF': 'QFA',    // Qantas
  'SQ': 'SIA',    // Singapore Airlines
  'LH': 'DLH',    // Lufthansa
  'AF': 'AFR',    // Air France
  'KL': 'KLM',    // KLM
  'UA': 'UAL',    // United Airlines
  'DL': 'DAL',    // Delta Airlines
  'VS': 'VIR',    // Virgin Atlantic
  'JL': 'JAL',    // Japan Airlines
  'NH': 'ANA',    // All Nippon Airways
  'LX': 'SWR',    // Swiss
  'QR': 'QTR',    // Qatar Airways
  'EY': 'ETD',    // Etihad
  'TG': 'THA',    // Thai Airways
  'MH': 'MAS',    // Malaysia Airlines
};

/**
 * Convert IATA airline code to ICAO code
 * @param iataCode - Two-letter IATA airline code (e.g., 'CX')
 * @returns Three-letter ICAO code (e.g., 'CPA') or original code if not found
 */
export function convertAirlineCode(iataCode: string): string {
  return AIRLINE_CODE_MAP[iataCode.toUpperCase()] || iataCode;
}

/**
 * Convert full flight number from IATA to ICAO format
 * @param flightNumber - Flight number in IATA format (e.g., 'CX238')
 * @returns Flight number in ICAO format (e.g., 'CPA238') or original if pattern doesn't match
 */
export function convertFlightNumber(flightNumber: string): string {
  const match = flightNumber.match(/^([A-Z]{2})(\d+)$/);
  if (!match) {
    return flightNumber;
  }

  const [, airlineCode, flightNum] = match;
  const icaoCode = convertAirlineCode(airlineCode);
  return `${icaoCode}${flightNum}`;
}