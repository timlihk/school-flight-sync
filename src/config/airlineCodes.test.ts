import { describe, it, expect } from 'vitest';
import { convertAirlineCode, convertFlightNumber, AIRLINE_CODE_MAP } from './airlineCodes';

describe('airlineCodes', () => {
  describe('AIRLINE_CODE_MAP', () => {
    it('should contain common airline mappings', () => {
      expect(AIRLINE_CODE_MAP['CX']).toBe('CPA');
      expect(AIRLINE_CODE_MAP['BA']).toBe('BAW');
      expect(AIRLINE_CODE_MAP['AA']).toBe('AAL');
    });

    it('should have consistent key-value types', () => {
      Object.entries(AIRLINE_CODE_MAP).forEach(([iata, icao]) => {
        expect(iata).toHaveLength(2);
        expect(icao).toHaveLength(3);
        expect(iata).toMatch(/^[A-Z]{2}$/);
        expect(icao).toMatch(/^[A-Z]{3}$/);
      });
    });
  });

  describe('convertAirlineCode', () => {
    it('should convert known IATA codes to ICAO codes', () => {
      expect(convertAirlineCode('CX')).toBe('CPA');
      expect(convertAirlineCode('BA')).toBe('BAW');
      expect(convertAirlineCode('QF')).toBe('QFA');
    });

    it('should handle lowercase input', () => {
      expect(convertAirlineCode('cx')).toBe('CPA');
      expect(convertAirlineCode('ba')).toBe('BAW');
    });

    it('should return original code if not found', () => {
      expect(convertAirlineCode('XX')).toBe('XX');
      expect(convertAirlineCode('ZZ')).toBe('ZZ');
    });
  });

  describe('convertFlightNumber', () => {
    it('should convert valid flight numbers', () => {
      expect(convertFlightNumber('CX238')).toBe('CPA238');
      expect(convertFlightNumber('BA31')).toBe('BAW31');
      expect(convertFlightNumber('QF1')).toBe('QFA1');
    });

    it('should handle multi-digit flight numbers', () => {
      expect(convertFlightNumber('CX8888')).toBe('CPA8888');
      expect(convertFlightNumber('BA123')).toBe('BAW123');
    });

    it('should return original if pattern does not match', () => {
      expect(convertFlightNumber('INVALID')).toBe('INVALID');
      expect(convertFlightNumber('CX')).toBe('CX');
      expect(convertFlightNumber('238')).toBe('238');
      expect(convertFlightNumber('CX238A')).toBe('CX238A');
    });

    it('should return original if airline code not in map', () => {
      expect(convertFlightNumber('XX123')).toBe('XX123');
    });
  });
});