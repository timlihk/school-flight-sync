import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { upsertNotTravellingSchema, clearNotTravellingSchema } from '../schemas/validation.js';
import type { NotTravelling, UpsertNotTravellingDTO } from '../types/index.js';
import { z } from 'zod';

const router = Router();

// GET /api/not-travelling - Get all not travelling records
router.get('/', asyncHandler(async (req, res) => {
  const result = await query<NotTravelling>(
    'SELECT * FROM public.not_travelling ORDER BY created_at DESC'
  );
  res.json(result.rows);
}));

// GET /api/not-travelling/term/:termId - Get not travelling status for a term
router.get('/term/:termId', asyncHandler(async (req, res) => {
  const { termId } = req.params;
  const result = await query<NotTravelling>(
    'SELECT * FROM public.not_travelling WHERE term_id = $1',
    [termId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Not travelling record not found' });
  }

  res.json(result.rows[0]);
}));

// POST /api/not-travelling - Upsert not travelling status
router.post('/', validateBody(upsertNotTravellingSchema), asyncHandler(async (req, res) => {
  const data: UpsertNotTravellingDTO = req.body;

  const result = await query<NotTravelling>(
    `INSERT INTO public.not_travelling (term_id, no_flights, no_transport)
     VALUES ($1, $2, $3)
     ON CONFLICT (term_id)
     DO UPDATE SET
       no_flights = COALESCE($2, not_travelling.no_flights),
       no_transport = COALESCE($3, not_travelling.no_transport),
       updated_at = now()
     RETURNING *`,
    [
      data.term_id,
      data.no_flights !== undefined ? data.no_flights : null,
      data.no_transport !== undefined ? data.no_transport : null
    ]
  );

  res.status(200).json(result.rows[0]);
}));

// PUT /api/not-travelling/term/:termId/clear - Clear not travelling status for a term
router.put('/term/:termId/clear', validateBody(clearNotTravellingSchema), asyncHandler(async (req, res) => {
  const { termId } = req.params;
  const { type } = req.body as { type?: 'flights' | 'transport' | 'both' } ?? {};

  let clearFlights = true;
  let clearTransport = true;

  if (type === 'flights') {
    clearTransport = false;
  } else if (type === 'transport') {
    clearFlights = false;
  } else if (type && type !== 'both') {
    return res.status(400).json({ error: 'Invalid type provided' });
  }

  const updates: string[] = [];
  if (clearFlights) {
    updates.push('no_flights = false');
  }
  if (clearTransport) {
    updates.push('no_transport = false');
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nothing to clear' });
  }

  updates.push('updated_at = now()');

  const setClause = updates.join(', ');

  const result = await query<NotTravelling>(
    `UPDATE public.not_travelling
     SET ${setClause}
     WHERE term_id = $1
     RETURNING *`,
    [termId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Not travelling record not found' });
  }

  res.json(result.rows[0]);
}));

// DELETE /api/not-travelling/term/:termId - Delete not travelling record
router.delete('/term/:termId', asyncHandler(async (req, res) => {
  const { termId } = req.params;

  const result = await query(
    'DELETE FROM public.not_travelling WHERE term_id = $1 RETURNING id',
    [termId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Not travelling record not found' });
  }

  res.status(204).send();
}));

export default router;
