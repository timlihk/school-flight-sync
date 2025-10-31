# Deployment Guide for Railway

This guide explains how to deploy both the frontend and backend to Railway.app.

## Prerequisites

- Railway.app account
- GitHub repository with your code
- Completed database setup (see MIGRATION_GUIDE.md)

## Architecture

- **PostgreSQL Database**: Managed by Railway
- **Backend API**: Node.js/Express server on Railway
- **Frontend**: React/Vite app on Railway (or Vercel/Netlify)

## Step 1: Deploy PostgreSQL Database

1. Log in to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Railway creates a PostgreSQL instance with automatic backups
5. Note the connection details from the "Connect" tab

### Run Database Schema

Connect to Railway PostgreSQL and create the schema:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run schema
railway run psql < railway_schema.sql
```

**Option B: Using psql directly**
```bash
psql "postgresql://user:pass@host:port/railway" < railway_schema.sql
```

**Option C: Using Railway Dashboard**
1. Go to your PostgreSQL service in Railway
2. Click "Query" tab
3. Copy and paste contents of `railway_schema.sql`
4. Click "Run"

## Step 2: Deploy Backend API

### Option A: Deploy from GitHub (Recommended)

1. In Railway dashboard, click "+ New" → "GitHub Repo"
2. Select your repository
3. Railway detects the Node.js app and starts building
4. Configure the service:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. Add environment variables (in Railway dashboard):
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.railway.app
   FAMILY_SECRET=your_family_secret_phrase
   PORT=${{PORT}}
   ```

   Note: `DATABASE_URL` and `PORT` are automatically provided by Railway if you connect the services

6. Connect the PostgreSQL service:
   - Click "Variables" tab
   - Click "Connect to Database"
   - Select your PostgreSQL service

7. Railway automatically deploys and assigns a URL like:
   `https://backend-production-abc123.up.railway.app`

### Option B: Deploy with Docker

1. In Railway, click "+ New" → "Empty Service"
2. Connect your GitHub repository
3. Set root directory to `/backend`
4. Railway will detect the `Dockerfile` and build automatically
5. Configure environment variables as above

### Verify Backend Deployment

Test the health endpoint:
```bash
curl https://your-backend-url.railway.app/health
```

Should return:
```json
{"status":"ok","database":"connected"}
```

## Step 3: Deploy Frontend

### Option A: Deploy to Railway

1. Click "+ New" → "GitHub Repo"
2. Select your repository
3. Configure:
   - **Root Directory**: `/` (root of repo)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview` (or use a static server)

4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_FAMILY_SECRET=your_family_secret_phrase
   VITE_OPENSKY_CLIENT_ID=your_opensky_client_id
   VITE_OPENSKY_CLIENT_SECRET=your_opensky_client_secret
   VITE_AVIATIONSTACK_API_KEY=your_aviationstack_key
   ```

5. Railway builds and deploys the frontend

### Option B: Deploy to Vercel (Alternative)

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `/`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add environment variables in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_FAMILY_SECRET=your_family_secret_phrase
   ```

5. Deploy

### Option C: Deploy to Netlify (Alternative)

1. Go to [Netlify](https://netlify.com)
2. Import from GitHub
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

4. Add environment variables in Netlify dashboard
5. Deploy

## Step 4: Update CORS Settings

After deploying the frontend, update your backend's CORS configuration:

1. Go to Railway backend service
2. Update `FRONTEND_URL` environment variable to your deployed frontend URL:
   ```
   FRONTEND_URL=https://your-frontend.railway.app
   ```
   OR if using Vercel/Netlify:
   ```
   FRONTEND_URL=https://your-site.vercel.app
   ```

3. Backend automatically restarts with new CORS settings

## Step 5: Import Data

After both backend and database are deployed:

1. Export data from Supabase (if not already done):
   ```bash
   npx tsx export_supabase_data.ts
   ```

2. Import to Railway PostgreSQL:
   ```bash
   # Using Railway CLI
   railway run psql < migration/supabase_export_TIMESTAMP.sql

   # OR using psql directly
   psql "YOUR_RAILWAY_DATABASE_URL" < migration/supabase_export_TIMESTAMP.sql
   ```

## Environment Variable Reference

### Backend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Provided by Railway |
| `PORT` | Server port | Provided by Railway |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://app.railway.app` |
| `FAMILY_SECRET` | Auth secret | Your secret phrase |

### Frontend Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_FAMILY_SECRET` | Auth secret | Yes |
| `VITE_OPENSKY_CLIENT_ID` | Flight tracking | No |
| `VITE_OPENSKY_CLIENT_SECRET` | Flight tracking | No |
| `VITE_AVIATIONSTACK_API_KEY` | Flight data | No |

## Monitoring & Logs

### Railway Logs

View logs in Railway dashboard:
1. Click on your service
2. Go to "Deployments" tab
3. Click on latest deployment
4. View real-time logs

### Backend Health Check

Monitor backend health:
```bash
curl https://your-backend-url.railway.app/health
```

### Database Connection

Test database connection:
```bash
# Using Railway CLI
railway run psql -c "SELECT COUNT(*) FROM flights;"
```

## Custom Domain (Optional)

### For Backend
1. In Railway, go to backend service
2. Click "Settings" → "Domains"
3. Add custom domain: `api.yourdomain.com`
4. Update DNS records as instructed by Railway

### For Frontend
1. In Railway/Vercel/Netlify, go to project settings
2. Add custom domain: `yourdomain.com`
3. Update DNS records

## Scaling & Performance

### Backend Scaling
Railway automatically handles scaling, but you can configure:
- **Memory**: Adjust based on traffic
- **Replicas**: Add more instances for high traffic
- **Database**: Upgrade PostgreSQL plan if needed

### Database Optimization
- Monitor slow queries in Railway dashboard
- Add indexes for frequently queried fields
- Enable query caching if needed

## Backup Strategy

### Database Backups
Railway provides automatic daily backups. To create manual backup:

```bash
# Export database
railway run pg_dump > backup_$(date +%Y%m%d).sql

# Restore from backup
railway run psql < backup_20250101.sql
```

### Application Backups
- GitHub stores your code
- Environment variables backed up in Railway
- Export data periodically using the export script

## Troubleshooting

### Backend Deployment Fails
- Check build logs in Railway
- Verify all dependencies in `package.json`
- Ensure TypeScript compiles without errors: `npm run build`

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is deployed and healthy

### Database Connection Issues
- Check `DATABASE_URL` is set correctly
- Verify PostgreSQL service is running in Railway
- Test connection: `railway run psql -c "SELECT 1;"`

### Authentication Errors
- Ensure `FAMILY_SECRET` matches in both frontend and backend
- Check browser dev console for errors
- Verify headers are being sent correctly

## Cost Estimates (Railway)

Free tier includes:
- $5/month credit
- 512MB RAM per service
- 1GB disk per database

Typical monthly costs:
- PostgreSQL: $5-10/month
- Backend API: $5/month
- Frontend (if on Railway): $5/month
- **Total**: ~$15-20/month

Or use free hosting for frontend (Vercel/Netlify) to reduce costs.

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS Only**: Railway provides HTTPS by default
3. **Family Secret**: Use a strong passphrase
4. **Database**: Railway encrypts connections automatically
5. **Backups**: Enable automatic backups in Railway

## Next Steps

After deployment:
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure automated backups
4. Consider setting up a staging environment
5. Document your deployment process for the team

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Your repository issues page
