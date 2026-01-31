import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import providersRouter from './serviceProviders.js';
import { errorHandler } from '../middleware/errorHandler.js';
import * as poolModule from '../db/pool.js';

// Mock auth middleware
vi.mock('../middleware/auth.js', () => ({
  requireAuth: (_req: any, _res: any, next: any) => next()
}));

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/service-providers', providersRouter);
  app.use(errorHandler);
  return app;
};

describe('Service Providers Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/service-providers', () => {
    it('should return all active service providers', async () => {
      const mockProviders = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'ABC Transport',
          phone_number: '+44 123 456 7890',
          license_number: 'LIC123',
          vehicle_type: 'school-coach',
          email: 'info@abctransport.com',
          notes: 'Reliable service',
          rating: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      vi.spyOn(poolModule, 'query').mockResolvedValueOnce({ rows: mockProviders } as any);

      const app = createApp();
      const response = await request(app)
        .get('/api/service-providers')
        .expect(200);

      expect(response.body).toEqual(mockProviders);
    });

    it('should handle database errors', async () => {
      vi.spyOn(poolModule, 'query').mockRejectedValueOnce(new Error('Database error'));

      const app = createApp();
      const response = await request(app)
        .get('/api/service-providers')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/service-providers/search', () => {
    it('should search providers by query', async () => {
      const mockProviders = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'ABC Transport',
          phone_number: '+44 123 456 7890',
          vehicle_type: 'school-coach',
          is_active: true
        }
      ];

      vi.spyOn(poolModule, 'query').mockResolvedValueOnce({ rows: mockProviders } as any);

      const app = createApp();
      const response = await request(app)
        .get('/api/service-providers/search?q=ABC')
        .expect(200);

      expect(response.body).toEqual(mockProviders);
    });

    it('should require query parameter', async () => {
      const app = createApp();
      const response = await request(app)
        .get('/api/service-providers/search')
        .expect(400);

      expect(response.body.error).toBe('Query parameter "q" is required');
    });
  });

  describe('POST /api/service-providers', () => {
    const validProvider = {
      name: 'New Transport Co',
      phone_number: '+44 987 654 3210',
      vehicle_type: 'taxi',
      email: 'contact@newtransport.com',
      notes: 'New service provider',
      rating: 4
    };

    it('should create a new service provider', async () => {
      const mockCreated = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        ...validProvider,
        license_number: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      vi.spyOn(poolModule, 'query').mockResolvedValueOnce({ rows: [mockCreated] } as any);

      const app = createApp();
      const response = await request(app)
        .post('/api/service-providers')
        .send(validProvider)
        .expect(201);

      expect(response.body.name).toBe('New Transport Co');
      expect(response.body.vehicle_type).toBe('taxi');
    });

    it('should validate required fields', async () => {
      const invalidProvider = {
        email: 'invalid-email'
      };

      const app = createApp();
      const response = await request(app)
        .post('/api/service-providers')
        .send(invalidProvider)
        .expect(400);

      expect(response.body.details).toBeDefined();
    });

    it('should validate vehicle type enum', async () => {
      const invalidProvider = {
        name: 'Test Provider',
        phone_number: '+44 123 456 7890',
        vehicle_type: 'invalid-type'
      };

      const app = createApp();
      const response = await request(app)
        .post('/api/service-providers')
        .send(invalidProvider)
        .expect(400);

      expect(response.body.details).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidProvider = {
        name: 'Test Provider',
        phone_number: '+44 123 456 7890',
        vehicle_type: 'taxi',
        email: 'not-an-email'
      };

      const app = createApp();
      const response = await request(app)
        .post('/api/service-providers')
        .send(invalidProvider)
        .expect(400);

      expect(response.body.details).toBeDefined();
    });
  });
});
