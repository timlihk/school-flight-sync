import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createTransportSchema, updateTransportSchema, uuidSchema } from '../schemas/validation.js';
import type { Transport, CreateTransportDTO, UpdateTransportDTO } from '../types/index.js';
import { z } from 'zod';

const router = Router();

// GET /api/transport - Get all transport records
router.get('/', asyncHandler(async (req, res) => {
  const result = await query<Transport>(
    'SELECT * FROM public.transport ORDER BY created_at DESC'
  );
  res.json(result.rows);
}));

// GET /api/transport/:id - Get single transport record
router.get('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query<Transport>(
    'SELECT * FROM public.transport WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Transport record not found' });
  }

  res.json(result.rows[0]);
}));

// GET /api/transport/term/:termId - Get transport for a specific term
router.get('/term/:termId', asyncHandler(async (req, res) => {
  const { termId } = req.params;
  const result = await query<Transport>(
    'SELECT * FROM public.transport WHERE term_id = $1',
    [termId]
  );
  res.json(result.rows);
}));

// POST /api/transport - Create new transport record
router.post('/', validateBody(createTransportSchema), asyncHandler(async (req, res) => {
  const transport: CreateTransportDTO = req.body;

  const result = await query<Transport>(
    `INSERT INTO public.transport (
      term_id, type, direction, driver_name,
      phone_number, license_number, pickup_time, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      transport.term_id,
      transport.type,
      transport.direction,
      transport.driver_name,
      transport.phone_number,
      transport.license_number,
      transport.pickup_time,
      transport.notes
    ]
  );

  res.status(201).json(result.rows[0]);
}));

// PUT /api/transport/:id - Update transport record
router.put('/:id', validateParams(z.object({ id: uuidSchema })), validateBody(updateTransportSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates: UpdateTransportDTO = req.body;

  const allowedFields = new Set<keyof UpdateTransportDTO>([
    'term_id',
    'type',
    'direction',
    'driver_name',
    'phone_number',
    'license_number',
    'pickup_time',
    'notes'
  ]);

  const entries = Object.entries(updates).filter(([field, value]) =>
    allowedFields.has(field as keyof UpdateTransportDTO) && value !== undefined
  );

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  const setClause = entries.map(([field], idx) => `${field} = $${idx + 2}`).join(', ');
  const values = [id, ...entries.map(([, value]) => value)];

  const result = await query<Transport>(
    `UPDATE public.transport SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Transport record not found' });
  }

  res.json(result.rows[0]);
}));

// DELETE /api/transport/:id - Delete transport record
router.delete('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'DELETE FROM public.transport WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Transport record not found' });
  }

  res.status(204).send();
}));

export default router;
