import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import transportRouter from './transport.js';
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

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/transport', transportRouter);
  app.use(errorHandler);
  return app;
};

describe('Transport Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/transport', () => {
    it('should return all transport records', async () => {
      const mockTransport = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          term_id: 'term-1',
          type: 'school-coach',
          direction: 'outbound',
          driver_name: null,
          phone_number: null,
          license_number: null,
          pickup_time: '08:00',
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTransport });

      const app = createApp();
      const response = await request(app)
        .get('/api/transport')
        .expect(200);

      expect(response.body).toEqual(mockTransport);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM public.transport ORDER BY created_at DESC'
      );
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const app = createApp();
      const response = await request(app)
        .get('/api/transport')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/transport', () => {
    const validTransport = {
      term_id: 'term-1',
      type: 'school-coach',
      direction: 'outbound',
      pickup_time: '08:00'
    };

    it('should create a new transport record', async () => {
      const mockCreated = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...validTransport,
        driver_name: null,
        phone_number: null,
        license_number: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCreated] });

      const app = createApp();
      const response = await request(app)
        .post('/api/transport')
        .send(validTransport)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
    });

    it('should create a taxi transport record with all required fields', async () => {
      const taxiTransport = {
        term_id: 'term-1',
        type: 'taxi',
        direction: 'return',
        driver_name: 'John Doe',
        phone_number: '+44 123 456 7890',
        license_number: 'TAXI123',
        pickup_time: '16:00'
      };

      const mockCreated = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        ...taxiTransport,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCreated] });

      const app = createApp();
      const response = await request(app)
        .post('/api/transport')
        .send(taxiTransport)
        .expect(201);

      expect(response.body).toEqual(mockCreated);
    });

    it('should validate required fields', async () => {
      const invalidTransport = {
        term_id: 'term-1'
        // Missing type, direction, pickup_time
      };

      const app = createApp();
      const response = await request(app)
        .post('/api/transport')
        .send(invalidTransport)
        .expect(400);

      expect(response.body.details).toBeDefined();
    });

    it('should require taxi-specific fields for taxi type', async () => {
      const invalidTaxi = {
        term_id: 'term-1',
        type: 'taxi',
        direction: 'outbound',
        pickup_time: '08:00'
        // Missing driver_name, phone_number, license_number
      };

      const app = createApp();
      const response = await request(app)
        .post('/api/transport')
        .send(invalidTaxi)
        .expect(400);

      expect(response.body.details).toBeDefined();
    });
  });

  describe('DELETE /api/transport/:id', () => {
    it('should delete a transport record', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: '550e8400-e29b-41d4-a716-446655440000' }] });

      const app = createApp();
      await request(app)
        .delete('/api/transport/550e8400-e29b-41d4-a716-446655440000')
        .expect(204);
    });

    it('should return 404 for non-existent transport', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app)
        .delete('/api/transport/550e8400-e29b-41d4-a716-446655440099')
        .expect(404);

      expect(response.body.error).toBe('Transport record not found');
    });

    it('should validate UUID format', async () => {
      const app = createApp();
      const response = await request(app)
        .delete('/api/transport/invalid-uuid')
        .expect(400);

      expect(response.body.details).toBeDefined();
    });
  });
});
