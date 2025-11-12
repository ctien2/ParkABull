# Health Check & Cron Job Endpoints

## ✅ Endpoints Created

### Backend (Flask)
- **GET** `/api/health` - Returns health status with timestamp
- **GET** `/api/ping` - Simple pong response

### Frontend (Next.js)
- **GET** `/api/health` - Returns health status with timestamp
- **GET** `/api/ping` - Simple pong response

## 🎯 Purpose

These endpoints are designed for:
1. **Cron Jobs**: Keep Render free tier services alive (they spin down after 15 min of inactivity)
2. **Uptime Monitoring**: Monitor service availability
3. **Load Balancer Health Checks**: For production deployments
4. **Status Pages**: Display service health on dashboards

## 📋 Testing Locally

### Backend (Port 5001)
```bash
curl http://localhost:5001/api/health
curl http://localhost:5001/api/ping
```

### Frontend (Port 3000)
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ping
```

## 🌐 Production URLs

### Backend
```
https://parkabull.onrender.com/api/health
https://parkabull.onrender.com/api/ping
```

### Frontend
```
https://parkabull-1.onrender.com/api/health
https://parkabull-1.onrender.com/api/ping
```

## 🔄 Setting Up Cron Jobs

See [CRON_SETUP.md](./CRON_SETUP.md) for detailed instructions on:
- Cron-Job.org (Recommended)
- UptimeRobot
- GitHub Actions
- EasyCron

**Quick Start**: Use Cron-Job.org to ping both endpoints every 10 minutes.

## 📊 Response Format

### /api/health
```json
{
  "status": "healthy",
  "service": "backend",  // or "frontend"
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

### /api/ping
```json
{
  "message": "pong"
}
```

## 🚀 Deployment Checklist

- [ ] Deploy backend to Render
- [ ] Deploy frontend to Render
- [ ] Test both health endpoints
- [ ] Set up cron job for backend (every 10 min)
- [ ] Set up cron job for frontend (every 10 min)
- [ ] Monitor for 24 hours to ensure no spin-down

## ⚠️ Important Notes

1. **Frequency**: Ping every 10-14 minutes (Render spins down after 15)
2. **Both Services**: Set up cron for BOTH frontend AND backend
3. **Free Tier Limits**: Each service has 750 hours/month free (enough for 24/7 with one instance)
4. **Don't Spam**: More than every 5 minutes is unnecessary

## 💡 Why This Matters

Without cron jobs:
- ❌ Services spin down after 15 minutes of inactivity
- ❌ First request after spin-down takes 30-60 seconds to wake up
- ❌ Poor user experience with slow load times

With cron jobs:
- ✅ Services stay awake 24/7
- ✅ Instant response times
- ✅ Professional user experience
- ✅ No cold starts
