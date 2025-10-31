# Supabase to Railway Migration Guide

This guide will help you migrate from Supabase to Railway with a Node.js/Express backend.

## Overview

The migration involves:
1. Setting up PostgreSQL on Railway
2. Running the backend server
3. Updating environment variables
4. Exporting data from Supabase
5. Importing data to Railway
6. Testing the application

## Step 1: Set Up Railway PostgreSQL

1. Log in to [Railway.app](https://railway.app)
2. Create a new project or use an existing one
3. Click "+ New" and select "Database" → "PostgreSQL"
4. Railway will provision a PostgreSQL database and provide connection details

## Step 2: Get Database Connection String

1. In Railway, click on your PostgreSQL service
2. Go to the "Connect" tab
3. Copy the `DATABASE_URL` (it looks like: `postgresql://user:password@host:port/database`)

## Step 3: Run the Database Schema

Connect to your Railway PostgreSQL and run the schema creation script:

```bash
# Using psql (if you have it installed)
psql "YOUR_DATABASE_URL" < railway_schema.sql

# OR using Railway CLI
railway run psql < railway_schema.sql

# OR copy the contents of railway_schema.sql and paste into Railway's Query tab
```

## Step 4: Set Up Backend Environment

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your configuration:
   ```env
   DATABASE_URL=your_railway_postgresql_url
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   FAMILY_SECRET=your_family_secret_phrase
   ```

4. Install backend dependencies:
   ```bash
   npm install
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The server should start on http://localhost:3001

## Step 5: Update Frontend Environment

1. In the root directory, update your `.env` file to add:
   ```env
   # Keep existing variables
   VITE_FAMILY_SECRET=your_family_secret_phrase

   # Add new API URL variable
   VITE_API_URL=http://localhost:3001
   ```

2. For production, set `VITE_API_URL` to your deployed backend URL

## Step 6: Update Remaining Hooks

Update the following hook files to use `apiClient` instead of `supabase`:

### A. Update `src/hooks/use-transport.ts`

Replace import:
```typescript
import { supabase } from '@/integrations/supabase/client';
```
With:
```typescript
import { apiClient } from '@/lib/api-client';
```

Update operations:
- `supabase.from('transport').select('*')` → `apiClient.transport.getAll()`
- `supabase.from('transport').insert([dbTransport])` → `apiClient.transport.create(dbTransport)`
- `supabase.from('transport').update(dbTransport).eq('id', transportId)` → `apiClient.transport.update(transportId, dbTransport)`
- `supabase.from('transport').delete().eq('id', transportId)` → `apiClient.transport.delete(transportId)`

### B. Update `src/hooks/use-service-providers.ts`

Replace import:
```typescript
import { supabase } from '@/integrations/supabase/client';
```
With:
```typescript
import { apiClient } from '@/lib/api-client';
```

Update operations:
- `supabase.from('service_providers').select('*')` → `apiClient.serviceProviders.getAll()`
- `supabase.from('service_providers').insert([dbProvider])` → `apiClient.serviceProviders.create(dbProvider)`
- `supabase.from('service_providers').update(dbProvider).eq('id', providerId)` → `apiClient.serviceProviders.update(providerId, dbProvider)`

### C. Update `src/hooks/use-not-travelling.ts`

Replace import:
```typescript
import { supabase } from '@/integrations/supabase/client';
```
With:
```typescript
import { apiClient } from '@/lib/api-client';
```

Update operations:
- `supabase.from('not_travelling').select('*')` → `apiClient.notTravelling.getAll()`
- `supabase.from('not_travelling').upsert({...})` → `apiClient.notTravelling.upsert({...})`
- `supabase.from('not_travelling').update(updates).eq('term_id', termId)` → `apiClient.notTravelling.clear(termId)` (if clearing) or use `apiClient.notTravelling.upsert()`

## Step 7: Export Data from Supabase

1. Make sure your Supabase credentials are still in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the export script:
   ```bash
   npx tsx export_supabase_data.ts
   ```

3. This creates two files in the `migration/` directory:
   - `supabase_export_TIMESTAMP.json` - JSON backup
   - `supabase_export_TIMESTAMP.sql` - SQL INSERT statements

## Step 8: Import Data to Railway

1. Use the SQL file to import data:
   ```bash
   psql "YOUR_DATABASE_URL" < migration/supabase_export_TIMESTAMP.sql
   ```

2. Verify the data was imported:
   ```sql
   SELECT COUNT(*) FROM flights;
   SELECT COUNT(*) FROM transport;
   SELECT COUNT(*) FROM not_travelling;
   SELECT COUNT(*) FROM service_providers;
   ```

## Step 9: Test the Application

1. Start the backend (if not already running):
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd ..  # back to root directory
   npm run dev
   ```

3. Open http://localhost:5173 and test:
   - View flights, transport, and service providers
   - Add new records
   - Edit existing records
   - Delete records
   - Check that family authentication still works

## Step 10: Deploy to Railway

### Deploy Backend

1. In Railway, create a new service for the backend
2. Connect your GitHub repository
3. Set the root directory to `/backend`
4. Add environment variables in Railway dashboard:
   - `DATABASE_URL` (already set by Railway for PostgreSQL)
   - `PORT` (Railway provides this automatically)
   - `NODE_ENV=production`
   - `FRONTEND_URL` (your deployed frontend URL)
   - `FAMILY_SECRET` (your secret phrase)

5. Railway will automatically build and deploy the backend

### Deploy Frontend

1. Create another service in Railway for the frontend (or use Vercel/Netlify)
2. Add environment variables:
   - `VITE_API_URL` (your deployed backend URL from Railway)
   - `VITE_FAMILY_SECRET` (same secret as backend)
   - Other API keys as needed

3. Deploy the frontend

## Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is correctly set
- Ensure PostgreSQL is running on Railway
- Check backend logs: `railway logs` (if using Railway CLI)

### Frontend can't connect to backend
- Verify `VITE_API_URL` matches your backend URL
- Check CORS settings in `backend/src/server.ts`
- Ensure backend is accessible (test with `curl http://your-backend-url/health`)

### Authentication errors
- Verify `VITE_FAMILY_SECRET` matches `FAMILY_SECRET` in backend
- Check browser console for errors
- Verify the `X-Family-Secret` header is being sent

### Data not showing up
- Check backend logs for database errors
- Verify data was imported successfully
- Test API endpoints directly: `curl http://localhost:3001/api/flights`

## Rollback Plan

If you need to rollback to Supabase:

1. Stop using the new backend
2. Revert the hook files to use `supabase` import
3. Remove `VITE_API_URL` from `.env`
4. Restart the frontend

The Supabase data remains unchanged until you explicitly delete it.

## Next Steps

After successful migration:

1. Remove Supabase dependencies (optional):
   ```bash
   npm uninstall @supabase/supabase-js
   ```

2. Delete Supabase integration files (optional):
   - `src/integrations/supabase/`

3. Update your Supabase project to export any remaining data before closing it

4. Consider setting up automated backups for your Railway PostgreSQL database

## Files Created During Migration

- `backend/` - Complete Express.js backend server
- `railway_schema.sql` - Database schema for Railway
- `export_supabase_data.ts` - Data export script
- `src/lib/api-client.ts` - New API client for frontend
- `MIGRATION_GUIDE.md` - This guide

## Support

If you encounter issues:
- Check the console logs (browser and backend)
- Verify all environment variables are set correctly
- Ensure the database schema was created successfully
- Test each API endpoint independently
