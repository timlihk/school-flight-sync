import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import notTravellingRouter from './notTravelling.js';
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
  app.use('/api/not-travelling', notTravellingRouter);
  app.use(errorHandler);
  return app;
};

describe('Not Travelling Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/not-travelling', () => {
    it('should return all not-travelling records', async () => {
      const mockRecords = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          term_id: 'term-1',
          no_flights: true,
          no_transport: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockRecords });

      const app = createApp();
      const response = await request(app)
        .get('/api/not-travelling')
        .expect(200);

      expect(response.body).toEqual(mockRecords);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const app = createApp();
      const response = await request(app)
        .get('/api/not-travelling')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/not-travelling/term/:termId', () => {
    it('should return not-travelling record for a term', async () => {
      const mockRecord = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        term_id: 'term-1',
        no_flights: true,
        no_transport: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockRecord] });

      const app = createApp();
      const response = await request(app)
        .get('/api/not-travelling/term/term-1')
        .expect(200);

      expect(response.body).toEqual(mockRecord);
    });

    it('should return 404 for non-existent term record', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app)
        .get('/api/not-travelling/term/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Not travelling record not found');
    });
  });

  describe('POST /api/not-travelling', () => {
    const validRecord = {
      term_id: 'term-1',
      no_flights: true,
      no_transport: false
    };

    it('should create a new not-travelling record', async () => {
      const mockCreated = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...validRecord,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCreated] });

      const app = createApp();
      const response = await request(app)
        .post('/api/not-travelling')
        .send(validRecord)
        .expect(200);

      expect(response.body).toEqual(mockCreated);
    });

    it('should upsert existing record on conflict', async () => {
      const existingRecord = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        term_id: 'term-1',
        no_flights: false,
        no_transport: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [existingRecord] });

      const app = createApp();
      const response = await request(app)
        .post('/api/not-travelling')
        .send({ term_id: 'term-1', no_transport: true })
        .expect(200);

      expect(response.body).toEqual(existingRecord);
    });

    it('should validate required fields', async () => {
      const invalidRecord = {};

      const app = createApp();
      const response = await request(app)
        .post('/api/not-travelling')
        .send(invalidRecord)
        .expect(400);

      expect(response.body.details).toBeDefined();
    });
  });

  describe('PUT /api/not-travelling/term/:termId/clear', () => {
    it('should clear not-travelling flags', async () => {
      const mockUpdated = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        term_id: 'term-1',
        no_flights: false,
        no_transport: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] });

      const app = createApp();
      const response = await request(app)
        .put('/api/not-travelling/term/term-1/clear')
        .send({})
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
    });

    it('should clear only flights flag when type is flights', async () => {
      const mockUpdated = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        term_id: 'term-1',
        no_flights: false,
        no_transport: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdated] });

      const app = createApp();
      const response = await request(app)
        .put('/api/not-travelling/term/term-1/clear')
        .send({ type: 'flights' })
        .expect(200);

      expect(response.body).toEqual(mockUpdated);
    });

    it('should return 404 for non-existent term', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app)
        .put('/api/not-travelling/term/non-existent/clear')
        .send({})
        .expect(404);

      expect(response.body.error).toBe('Not travelling record not found');
    });
  });

  describe('DELETE /api/not-travelling/term/:termId', () => {
    it('should delete a not-travelling record', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: '550e8400-e29b-41d4-a716-446655440000' }] });

      const app = createApp();
      await request(app)
        .delete('/api/not-travelling/term/term-1')
        .expect(204);
    });

    it('should return 404 for non-existent record', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const app = createApp();
      const response = await request(app)
        .delete('/api/not-travelling/term/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Not travelling record not found');
    });
  });
});
