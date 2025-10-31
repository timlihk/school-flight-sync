# Database Backups

This directory contains automated daily backups of the Railway PostgreSQL database.

## Backup Schedule

- **Frequency**: Daily at 2:00 AM UTC
- **Retention**: Last 7 daily backups are kept
- **Format**: PostgreSQL SQL dump files

## Backup Files

- `railway_backup_YYYYMMDD_HHMMSS.sql` - Timestamped backup files
- `railway_backup_latest.sql` - Always points to the most recent backup

## How to Restore a Backup

### Restore to Railway (Production)

```bash
# Using the latest backup
psql "YOUR_RAILWAY_DATABASE_URL" < backups/railway_backup_latest.sql

# Using a specific backup
psql "YOUR_RAILWAY_DATABASE_URL" < backups/railway_backup_20251031_020000.sql
```

### Restore to Local Database

```bash
# Create a new local database
createdb uk_flight_sync_restored

# Restore the backup
psql "postgresql://localhost/uk_flight_sync_restored" < backups/railway_backup_latest.sql
```

## Manual Backup Trigger

You can manually trigger a backup from GitHub:

1. Go to **Actions** tab in GitHub
2. Click **Daily Database Backup** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

## Backup Contents

Each backup contains:
- All tables (flights, transport, not_travelling, service_providers)
- All data and relationships
- Database schema (tables, indexes, triggers)

## Download Backups

Backups are also available as GitHub Actions artifacts for 7 days:

1. Go to **Actions** tab
2. Click on a completed backup workflow run
3. Download the **database-backup-XXX** artifact

## Important Notes

⚠️ **Keep your DATABASE_URL secret secure!**
- Never commit the actual DATABASE_URL to the repository
- It's stored as a GitHub Secret

📊 **Backup Size**
- Typical backup size: ~50KB - 500KB depending on data

🔐 **Security**
- Backups are committed to your private repository
- Only repository admins can access them
- Consider encrypting backups for sensitive data

## Automated by GitHub Actions

This backup system runs automatically via GitHub Actions workflow:
`.github/workflows/database-backup.yml`
