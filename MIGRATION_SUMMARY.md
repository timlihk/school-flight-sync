# Migration Summary: Supabase → Railway

## ✅ Migration Complete!

Your UK Flight Sync application has been successfully prepared for migration from Supabase to Railway.app with a Node.js/Express backend.

## What Was Done

### 1. Backend Infrastructure Created
- ✅ Full Express.js REST API server (`backend/`)
- ✅ PostgreSQL connection pool with Railway support
- ✅ RESTful API endpoints for all tables:
  - `/api/flights` - Flight management
  - `/api/transport` - Transport management
  - `/api/service-providers` - Service provider management
  - `/api/not-travelling` - Not travelling status
- ✅ Family authentication middleware
- ✅ Error handling and logging
- ✅ CORS configuration for frontend access
- ✅ Health check endpoint

### 2. Frontend Updated
- ✅ New API client (`src/lib/api-client.ts`) to replace Supabase SDK
- ✅ All hooks updated to use new API client:
  - `use-flights.ts` - ✅ Updated
  - `use-transport.ts` - ✅ Updated
  - `use-service-providers.ts` - ✅ Updated
  - `use-not-travelling.ts` - ✅ Updated
- ✅ Maintains React Query for caching and optimistic updates
- ✅ Same user experience, different backend

### 3. Database Schema
- ✅ Consolidated SQL schema (`railway_schema.sql`)
- ✅ Includes all 4 tables:
  - `flights` - Flight information with confirmation codes
  - `transport` - Ground transportation with direction field
  - `not_travelling` - Terms without travel requirements
  - `service_providers` - Reusable transport provider database
- ✅ Automatic timestamp triggers
- ✅ Indexes for performance
- ✅ Check constraints for data validation

### 4. Data Migration Tools
- ✅ Export script (`export_supabase_data.ts`)
  - Exports all data from Supabase
  - Creates JSON backup
  - Generates SQL INSERT statements
- ✅ Ready to import into Railway PostgreSQL

### 5. Deployment Configuration
- ✅ Railway deployment files
- ✅ Docker support
- ✅ Environment variable templates
- ✅ Comprehensive deployment guide

### 6. Documentation
- ✅ `MIGRATION_GUIDE.md` - Step-by-step migration instructions
- ✅ `DEPLOYMENT.md` - Railway deployment guide
- ✅ Updated `.env.example` with new variables

## Project Structure

```
UK-flight-sync/
├── backend/                      # New Express.js API server
│   ├── src/
│   │   ├── server.ts            # Main server file
│   │   ├── db/
│   │   │   └── pool.ts          # PostgreSQL connection pool
│   │   ├── routes/              # API routes
│   │   │   ├── flights.ts
│   │   │   ├── transport.ts
│   │   │   ├── serviceProviders.ts
│   │   │   └── notTravelling.ts
│   │   ├── middleware/          # Auth & error handling
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   └── types/
│   │       └── index.ts         # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile               # For Docker deployment
│   ├── railway.json             # Railway configuration
│   └── .env.example
│
├── src/
│   ├── lib/
│   │   └── api-client.ts        # New API client
│   ├── hooks/                    # Updated hooks
│   │   ├── use-flights.ts       ✅ Uses apiClient
│   │   ├── use-transport.ts     ✅ Uses apiClient
│   │   ├── use-service-providers.ts ✅ Uses apiClient
│   │   └── use-not-travelling.ts ✅ Uses apiClient
│   └── integrations/supabase/   # ⚠️ Can be removed after migration
│
├── railway_schema.sql           # Database schema for Railway
├── export_supabase_data.ts     # Data export script
├── MIGRATION_GUIDE.md          # How to migrate
├── DEPLOYMENT.md               # How to deploy
└── .env.example                 # Updated with VITE_API_URL

```

## Next Steps

### For Local Development

1. **Set up backend locally**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your Railway DATABASE_URL
   npm install
   npm run dev  # Starts on http://localhost:3001
   ```

2. **Update frontend environment**:
   ```bash
   # In root directory
   # Add to your .env file:
   VITE_API_URL=http://localhost:3001
   ```

3. **Test locally**:
   ```bash
   npm run dev  # Starts frontend on http://localhost:5173
   ```

### For Production Deployment

Follow the detailed guides:
1. **Database Setup**: See `MIGRATION_GUIDE.md` Step 1-3
2. **Export Data**: See `MIGRATION_GUIDE.md` Step 7
3. **Deploy Backend**: See `DEPLOYMENT.md` Step 2
4. **Deploy Frontend**: See `DEPLOYMENT.md` Step 3
5. **Import Data**: See `DEPLOYMENT.md` Step 5

## API Endpoints Reference

### Flights
- `GET /api/flights` - Get all flights
- `GET /api/flights/:id` - Get single flight
- `GET /api/flights/term/:termId` - Get flights for term
- `POST /api/flights` - Create flight
- `PUT /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight

### Transport
- `GET /api/transport` - Get all transport
- `GET /api/transport/:id` - Get single transport
- `GET /api/transport/term/:termId` - Get transport for term
- `POST /api/transport` - Create transport
- `PUT /api/transport/:id` - Update transport
- `DELETE /api/transport/:id` - Delete transport

### Service Providers
- `GET /api/service-providers` - Get active providers
- `GET /api/service-providers/:id` - Get single provider
- `GET /api/service-providers/type/:vehicleType` - Get by type
- `GET /api/service-providers/search?q=` - Search providers
- `POST /api/service-providers` - Create provider
- `PUT /api/service-providers/:id` - Update provider
- `DELETE /api/service-providers/:id` - Deactivate provider

### Not Travelling
- `GET /api/not-travelling` - Get all records
- `GET /api/not-travelling/term/:termId` - Get by term
- `POST /api/not-travelling` - Upsert status
- `PUT /api/not-travelling/term/:termId/clear` - Clear status
- `DELETE /api/not-travelling/term/:termId` - Delete record

## Environment Variables

### Backend (.env in backend/)
```env
DATABASE_URL=postgresql://user:pass@host:port/database
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FAMILY_SECRET=your_family_secret
```

### Frontend (.env in root/)
```env
VITE_API_URL=http://localhost:3001
VITE_FAMILY_SECRET=your_family_secret
# Keep your existing OpenSky and AviationStack keys
```

## Authentication

The family authentication system remains unchanged:
- Frontend sends `X-Family-Secret` header with each API request
- Backend validates the secret via middleware
- Same user experience as before

## Rollback Plan

If needed, you can rollback to Supabase:
1. Revert the hook imports back to `@/integrations/supabase/client`
2. Remove `VITE_API_URL` from `.env`
3. Restart the frontend
4. Your Supabase data remains untouched

## Testing Checklist

Before going to production, test:
- [ ] View all flights
- [ ] Add new flight
- [ ] Edit existing flight
- [ ] Delete flight
- [ ] View transport records
- [ ] Add transport
- [ ] Edit transport
- [ ] Delete transport
- [ ] View service providers
- [ ] Add service provider
- [ ] Search service providers
- [ ] Set not travelling status
- [ ] Clear not travelling status
- [ ] Family authentication works
- [ ] Flight status checking works (FlightAware integration)

## Performance Notes

- React Query caching still works (2-5 minute stale times)
- Optimistic updates still provide instant UI feedback
- Backend connection pooling handles concurrent requests
- Same fast user experience as Supabase

## Cost Comparison

### Supabase (Before)
- Free tier: 500MB database, 2GB transfer
- Paid: $25/month for Pro plan

### Railway (After)
- Free: $5/month credit (enough for small usage)
- PostgreSQL: ~$5-10/month
- Backend API: ~$5/month
- Frontend: Free (use Vercel/Netlify) or $5/month
- **Total**: $10-20/month with more control

## Support & Troubleshooting

See the detailed guides:
- `MIGRATION_GUIDE.md` - Troubleshooting section
- `DEPLOYMENT.md` - Support section

Common issues:
1. **Backend won't start**: Check DATABASE_URL
2. **Frontend can't connect**: Verify VITE_API_URL
3. **Auth errors**: Ensure FAMILY_SECRET matches in both frontend and backend
4. **CORS errors**: Update FRONTEND_URL in backend

## Files You Can Remove After Migration

Once everything is working on Railway:
- `supabase/` directory (keep for reference or delete)
- `src/integrations/supabase/` (optional, can remove)
- Supabase dependencies: `npm uninstall @supabase/supabase-js`

## Questions?

Refer to:
1. `MIGRATION_GUIDE.md` - Step-by-step migration
2. `DEPLOYMENT.md` - Production deployment
3. Railway Docs: https://docs.railway.app
4. Express.js Docs: https://expressjs.com

---

**Status**: ✅ Ready for migration!

All code has been prepared. Follow the guides to complete the migration to Railway.
