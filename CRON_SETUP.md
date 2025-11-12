# Cron Job Setup for Render Free Tier

Render's free tier spins down services after 15 minutes of inactivity. To keep your services alive, you can use cron jobs to ping them regularly.

## Endpoints

### Backend
- **Health Check**: `https://parkabull.onrender.com/api/health`
- **Ping**: `https://parkabull.onrender.com/api/ping`

### Frontend
- **Health Check**: `https://parkabull-1.onrender.com/api/health`
- **Ping**: `https://parkabull-1.onrender.com/api/ping`

## Option 1: Cron-Job.org (Recommended - Free & Easy)

1. Go to https://cron-job.org
2. Sign up for a free account
3. Create a new cron job:
   - **Title**: Keep Backend Alive
   - **URL**: `https://parkabull.onrender.com/api/health`
   - **Schedule**: Every 10 minutes
   - **Save**

4. Create another cron job:
   - **Title**: Keep Frontend Alive
   - **URL**: `https://parkabull-1.onrender.com/api/health`
   - **Schedule**: Every 10 minutes
   - **Save**

## Option 2: UptimeRobot (Free Monitoring)

1. Go to https://uptimerobot.com
2. Sign up for a free account
3. Add New Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Backend Health
   - **URL**: `https://parkabull.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes
   - **Create Monitor**

4. Add another monitor for frontend:
   - **URL**: `https://parkabull-1.onrender.com/api/health`

## Option 3: GitHub Actions (Free for Public Repos)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Services Alive

on:
  schedule:
    # Run every 10 minutes
    - cron: '*/10 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping-services:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: curl https://parkabull.onrender.com/api/health
      
      - name: Ping Frontend
        run: curl https://parkabull-1.onrender.com/api/health
```

## Option 4: EasyCron (Free Tier Available)

1. Go to https://www.easycron.com
2. Sign up for free account
3. Add cron jobs for both endpoints
4. Set to run every 10-14 minutes

## Testing

You can test the endpoints manually:

```bash
# Backend health check
curl https://parkabull.onrender.com/api/health

# Frontend health check
curl https://parkabull-1.onrender.com/api/health

# Backend ping
curl https://parkabull.onrender.com/api/ping

# Frontend ping
curl https://parkabull-1.onrender.com/api/ping
```

Expected responses:
```json
{
  "status": "healthy",
  "service": "backend",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

## Important Notes

- **Frequency**: Ping every 10-14 minutes (Render spins down after 15 minutes)
- **Don't overdo it**: More than every 5 minutes is unnecessary and wastes resources
- **Monitor both**: Make sure to set up cron jobs for BOTH frontend and backend
- **Free tier limits**: Render free tier has monthly usage limits, but health checks use minimal resources

## Recommended: Cron-Job.org

We recommend **Cron-Job.org** because:
- ✅ Free forever
- ✅ Reliable
- ✅ Easy to set up
- ✅ No credit card required
- ✅ Email notifications on failures
- ✅ Can run every 10 minutes

## Alternative: Paid Render Plans

If you want to avoid spin-down entirely, consider upgrading to Render's paid plans:
- **Starter**: $7/month per service (no spin-down)
- **Standard**: $25/month per service (more resources)
