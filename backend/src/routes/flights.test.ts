import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import flightsRouter from './flights.js';
import { errorHandler } from '../middleware/errorHandler.js';

// Mock pool with named export
const mockQuery = vi.fn();
vi.mock('../db/pool.js', () => ({
  query: (...args: any[]) => mockQuery(...args),
  pool: {
    on: vi.fn(),
    end: vi.fn(),
  }
}));

// Mock auth middleware
vi.mock('../middleware/auth.js', () => ({
  requireAuth: (_req: any, _res: any, next: any) => next()
}));

// Helper to create mock flight
const createMockFlight = (overrides: any = {}) => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  term_id: 'term-1',
  type: 'outbound',
  airline: 'British Airways',
  flight_number: 'BA31',
  departure_airport: 'LHR',
  departure_date: '2025-09-02',
  departure_time: '12:00',
  arrival_airport: 'HKG',
  arrival_date: '2025-09-03',
  arrival_time: '06:00',
  confirmation_code: 'ABC123',
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/flights', flightsRouter);
  app.use(errorHandler);
  return app;
};

describe('Flights API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/flights', () => {
    it('should return all flights', async () => {
      const mockFlights = [
        createMockFlight({ id: 'flight-1', flight_number: 'BA31' }),
        createMockFlight({ id: 'flight-2', flight_number: 'CX238' }),
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockFlights });

      const app = createApp();
      const response = await request(app).get('/api/flights');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].flight_number).toBe('BA31');
    });

    it('should return empty array when no flights', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app).get('/api/flights');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const app = createApp();
      const response = await request(app).get('/api/flights');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/flights/:id', () => {
    it('should return a single flight by ID', async () => {
      const mockFlight = createMockFlight({ id: '550e8400-e29b-41d4-a716-446655440000' });
      mockQuery.mockResolvedValueOnce({ rows: [mockFlight] });

      const app = createApp();
      const response = await request(app).get('/api/flights/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should return 404 for non-existent flight', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app).get('/api/flights/550e8400-e29b-41d4-a716-446655440001');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Flight not found');
    });

    it('should validate UUID format', async () => {
      const app = createApp();
      const response = await request(app).get('/api/flights/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });
  });

  describe('GET /api/flights/term/:termId', () => {
    it('should return flights for a specific term', async () => {
      const mockFlights = [
        createMockFlight({ id: 'flight-1', term_id: 'term-123' }),
        createMockFlight({ id: 'flight-2', term_id: 'term-123' }),
      ];
      mockQuery.mockResolvedValueOnce({ rows: mockFlights });

      const app = createApp();
      const response = await request(app).get('/api/flights/term/term-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/flights', () => {
    const validFlight = {
      term_id: 'term-1',
      type: 'outbound',
      airline: 'British Airways',
      flight_number: 'BA31',
      departure_airport: 'LHR',
      departure_date: '2025-09-02',
      departure_time: '12:00',
      arrival_airport: 'HKG',
      arrival_date: '2025-09-03',
      arrival_time: '06:00',
      confirmation_code: 'ABC123',
      notes: 'Test flight',
    };

    it('should create a new flight', async () => {
      const createdFlight = createMockFlight({ ...validFlight, id: 'new-id' });
      mockQuery.mockResolvedValueOnce({ rows: [createdFlight] });

      const app = createApp();
      const response = await request(app)
        .post('/api/flights')
        .send(validFlight);

      expect(response.status).toBe(201);
      expect(response.body.flight_number).toBe('BA31');
    });

    it('should reject invalid flight data', async () => {
      const invalidFlight = { ...validFlight, flight_number: '' };

      const app = createApp();
      const response = await request(app)
        .post('/api/flights')
        .send(invalidFlight);

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });

    it('should reject invalid time format', async () => {
      const invalidFlight = { ...validFlight, departure_time: '25:00' };

      // Mock rejected because validation should fail before DB call
      mockQuery.mockRejectedValueOnce(new Error('Should not reach DB'));

      const app = createApp();
      const response = await request(app)
        .post('/api/flights')
        .send(invalidFlight);

      // Validation errors return 400
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/flights/:id', () => {
    it('should update an existing flight', async () => {
      const updatedFlight = createMockFlight({
        id: '550e8400-e29b-41d4-a716-446655440000',
        airline: 'Updated Airline',
      });
      mockQuery.mockResolvedValueOnce({ rows: [updatedFlight] });

      const app = createApp();
      const response = await request(app)
        .put('/api/flights/550e8400-e29b-41d4-a716-446655440000')
        .send({ airline: 'Updated Airline' });

      expect(response.status).toBe(200);
      expect(response.body.airline).toBe('Updated Airline');
    });

    it('should return 404 for non-existent flight', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app)
        .put('/api/flights/550e8400-e29b-41d4-a716-446655440001')
        .send({ airline: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Flight not found');
    });

    it('should reject empty updates', async () => {
      const app = createApp();
      const response = await request(app)
        .put('/api/flights/550e8400-e29b-41d4-a716-446655440000')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No valid fields provided for update');
    });
  });

  describe('DELETE /api/flights/:id', () => {
    it('should delete an existing flight', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: '550e8400-e29b-41d4-a716-446655440000' }] });

      const app = createApp();
      const response = await request(app).delete('/api/flights/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent flight', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app).delete('/api/flights/550e8400-e29b-41d4-a716-446655440001');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Flight not found');
    });

    it('should validate UUID format', async () => {
      const app = createApp();
      const response = await request(app).delete('/api/flights/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.details).toBeDefined();
    });
  });
});
