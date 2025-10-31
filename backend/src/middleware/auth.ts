import { Request, Response, NextFunction } from 'express';

// Simple family authentication middleware
export function authenticateFamily(req: Request, res: Response, next: NextFunction) {
  const familySecret = req.headers['x-family-secret'];
  const expectedSecret = process.env.FAMILY_SECRET;

  if (!expectedSecret) {
    console.warn('Warning: FAMILY_SECRET not configured');
    return next(); // Allow in development if not configured
  }

  if (familySecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid family secret' });
  }

  next();
}
