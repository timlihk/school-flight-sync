import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateParams } from '../middleware/validation.js';
import { createFlightSchema, updateFlightSchema, uuidSchema } from '../schemas/validation.js';
import type { Flight, CreateFlightDTO, UpdateFlightDTO } from '../types/index.js';
import { z } from 'zod';

const router = Router();

// GET /api/flights - Get all flights
router.get('/', asyncHandler(async (req, res) => {
  const result = await query<Flight>(
    'SELECT * FROM public.flights ORDER BY departure_date ASC'
  );
  res.json(result.rows);
}));

// GET /api/flights/:id - Get single flight
router.get('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await query<Flight>(
    'SELECT * FROM public.flights WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Flight not found' });
  }

  res.json(result.rows[0]);
}));

// GET /api/flights/term/:termId - Get flights for a specific term
router.get('/term/:termId', asyncHandler(async (req, res) => {
  const { termId } = req.params;
  const result = await query<Flight>(
    'SELECT * FROM public.flights WHERE term_id = $1 ORDER BY departure_date ASC',
    [termId]
  );
  res.json(result.rows);
}));

// POST /api/flights - Create new flight
router.post('/', validateBody(createFlightSchema), asyncHandler(async (req, res) => {
  const flight: CreateFlightDTO = req.body;

  const result = await query<Flight>(
    `INSERT INTO public.flights (
      term_id, type, airline, flight_number,
      departure_airport, departure_date, departure_time,
      arrival_airport, arrival_date, arrival_time,
      confirmation_code, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      flight.term_id,
      flight.type,
      flight.airline,
      flight.flight_number,
      flight.departure_airport,
      flight.departure_date,
      flight.departure_time,
      flight.arrival_airport,
      flight.arrival_date,
      flight.arrival_time,
      flight.confirmation_code,
      flight.notes
    ]
  );

  res.status(201).json(result.rows[0]);
}));

// PUT /api/flights/:id - Update flight
router.put('/:id', validateParams(z.object({ id: uuidSchema })), validateBody(updateFlightSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates: UpdateFlightDTO = req.body;

  const allowedFields = new Set<keyof UpdateFlightDTO>([
    'term_id',
    'type',
    'airline',
    'flight_number',
    'departure_airport',
    'departure_date',
    'departure_time',
    'arrival_airport',
    'arrival_date',
    'arrival_time',
    'confirmation_code',
    'notes'
  ]);

  const entries = Object.entries(updates).filter(([field, value]) =>
    allowedFields.has(field as keyof UpdateFlightDTO) && value !== undefined
  );

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No valid fields provided for update' });
  }

  const setClause = entries.map(([field], idx) => `${field} = $${idx + 2}`).join(', ');
  const values = [id, ...entries.map(([, value]) => value)];

  const result = await query<Flight>(
    `UPDATE public.flights SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Flight not found' });
  }

  res.json(result.rows[0]);
}));

// DELETE /api/flights/:id - Delete flight
router.delete('/:id', validateParams(z.object({ id: uuidSchema })), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'DELETE FROM public.flights WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Flight not found' });
  }

  res.status(204).send();
}));

export default router;
