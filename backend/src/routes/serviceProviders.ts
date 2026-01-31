import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createServiceProviderSchema, updateServiceProviderSchema, uuidSchema } from '../schemas/validation.js';
import type { ServiceProvider, CreateServiceProviderDTO, UpdateServiceProviderDTO } from '../types/index.js';
import { z } from 'zod';

const router = Router();

// GET /api/service-providers - Get all active service providers
router.get('/', asyncHandler(async (req, res) => {
  const result = await query<ServiceProvider>(
    'SELECT * FROM public.service_providers WHERE is_active = true ORDER BY name ASC'
  );
  res.json(result.rows);
}));

// GET /api/service-providers/search?q= - Search service providers (MUST be before /:id)
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const searchTerm = `%${q}%`;
  const result = await query<ServiceProvider>(
    `SELECT * FROM public.service_providers
     WHERE is_active = true
     AND (name ILIKE $1 OR phone_number ILIKE $1 OR license_number ILIKE $1)
     ORDER BY name ASC`,
    [searchTerm]
  );
  res.json(result.rows);
}));

// GET /api/service-providers/type/:vehicleType - Get providers by vehicle type (MUST be before /:id)
router.get('/type/:vehicleType', asyncHandler(async (req, res) => {
  const { vehicleType } = req.params;
  const result = await query<ServiceProvider>(
    'SELECT * FROM public.service_providers WHERE vehicle_type = $1 AND is_active = true ORDER BY name ASC',
    [vehicleType]
  );
  res.json(result.rows);
}));

// GET /api/service-providers/:id - Get single service provider
router.get('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query<ServiceProvider>(
    'SELECT * FROM public.service_providers WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Service provider not found' });
  }

  res.json(result.rows[0]);
}));

// POST /api/service-providers - Create new service provider
router.post('/', validateBody(createServiceProviderSchema), asyncHandler(async (req, res) => {
  const provider: CreateServiceProviderDTO = req.body;

  const result = await query<ServiceProvider>(
    `INSERT INTO public.service_providers (
      name, phone_number, license_number, vehicle_type,
      email, notes, rating, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      provider.name,
      provider.phone_number,
      provider.license_number,
      provider.vehicle_type,
      provider.email,
      provider.notes,
      provider.rating,
      provider.is_active !== undefined ? provider.is_active : true
    ]
  );

  res.status(201).json(result.rows[0]);
}));

// PUT /api/service-providers/:id - Update service provider
router.put('/:id', validateParams(z.object({ id: uuidSchema })), validateBody(updateServiceProviderSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates: UpdateServiceProviderDTO = req.body;

  const allowedFields = new Set<keyof UpdateServiceProviderDTO>([
    'name',
    'phone_number',
    'license_number',
    'vehicle_type',
    'email',
    'notes',
    'rating',
    'is_active'
  ]);

  const entries = Object.entries(updates).filter(([field, value]) =>
    allowedFields.has(field as keyof UpdateServiceProviderDTO) && value !== undefined
  );

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  const setClause = entries.map(([field], idx) => `${field} = $${idx + 2}`).join(', ');
  const values = [id, ...entries.map(([, value]) => value)];

  const result = await query<ServiceProvider>(
    `UPDATE public.service_providers SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Service provider not found' });
  }

  res.json(result.rows[0]);
}));

// DELETE /api/service-providers/:id - Soft delete (deactivate) service provider
router.delete('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query<ServiceProvider>(
    'UPDATE public.service_providers SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Service provider not found' });
  }

  res.json(result.rows[0]);
}));

export default router;
