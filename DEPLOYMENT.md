# Deployment Guide

This guide covers deploying your full-stack parking detection application with **Vercel (frontend)** + **Render (backend)**.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub repository with your code pushed
- ✅ Supabase account with database set up
- ✅ Roboflow API key (for computer vision features)
- ✅ Accounts created on:
  - [Vercel](https://vercel.com) (frontend hosting)
  - [Render](https://render.com) (backend hosting)

---

## 🚀 Deployment Architecture

```
┌─────────────────┐
│   Vercel        │  Next.js Frontend
│   (Frontend)    │  - Serves React/TypeScript
│                 │  - Static & Server Components
└────────┬────────┘
         │ API Calls
         ▼
┌─────────────────┐
│   Render        │  Flask Backend
│   (Backend)     │  - Python API endpoints
│                 │  - CORS configured
└────────┬────────┘
         │ Database Queries
         ▼
┌─────────────────┐
│   Supabase      │  PostgreSQL Database
│   (Database)    │  - Parking lot data
└─────────────────┘
```

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

Make sure these files exist in your repo root:
- ✅ `requirements.txt` - Python dependencies
- ✅ `Procfile` - Tells Render how to run your app
- ✅ `app.py` - Your Flask application
- ✅ `.env.example` - Template for environment variables

### Step 2: Create Web Service on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect Your GitHub Repository**
   - Grant Render access to your GitHub account
   - Select your `SAAC-ubhacking-2025` repository

4. **Configure the Web Service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `saac-parking-api` (or your choice) |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` (or `deployment`) |
   | **Root Directory** | Leave blank (root) |
   | **Environment** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt` |
   | **Start Command** | `gunicorn app:app` |
   | **Instance Type** | `Free` (for testing) or `Starter` |

5. **Add Environment Variables:**

   Click "Advanced" → "Add Environment Variable" and add:

   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ROBOFLOW_API_KEY=your_roboflow_api_key
   FLASK_ENV=production
   PORT=10000
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

   **⚠️ Important:** You'll update `ALLOWED_ORIGINS` after deploying frontend in Step 3.

6. **Click "Create Web Service"**

   - Render will build and deploy your Flask API
   - Wait 2-5 minutes for deployment to complete
   - You'll get a URL like: `https://saac-parking-api.onrender.com`

### Step 3: Test Your Backend

Once deployed, test your API:

```bash
# Test health check (if you have one)
curl https://saac-parking-api.onrender.com/api/lot/furnas

# Should return JSON with parking data
```

**🎉 Your backend is now live!**

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Environment Variables Locally

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_API_URL=https://saac-parking-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New..." → "Project"**

3. **Import Your Git Repository**
   - Connect your GitHub account
   - Select `SAAC-ubhacking-2025`
   - Click "Import"

4. **Configure Project:**

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `./` (leave as is) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` (auto-detected) |

5. **Add Environment Variables:**

   In the "Environment Variables" section, add:

   ```
   NEXT_PUBLIC_API_URL=https://saac-parking-api.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. **Click "Deploy"**

   - Vercel will build and deploy your Next.js app
   - Takes 2-3 minutes
   - You'll get a URL like: `https://saac-ubhacking-2025.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? saac-ubhacking-2025
# - Directory? ./
# - Override settings? N

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL
# Paste: https://saac-parking-api.onrender.com

vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: your_supabase_url

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: your_supabase_anon_key

# Deploy to production
vercel --prod
```

**🎉 Your frontend is now live!**

---

## Part 3: Update CORS Configuration

Now that you have your frontend URL, update your backend's CORS settings:

1. **Go back to Render Dashboard**
2. **Select your `saac-parking-api` service**
3. **Go to "Environment" tab**
4. **Edit `ALLOWED_ORIGINS` variable:**

   ```
   ALLOWED_ORIGINS=http://localhost:3000,https://saac-ubhacking-2025.vercel.app
   ```

   (Keep localhost for local development)

5. **Save Changes** - Render will automatically redeploy

---

## Part 4: Computer Vision Script Deployment

### ⚠️ Important Note

The CV scripts (`video_parking_detector.py`, `video_parking_detector_auto_export.py`) **cannot run on Render/Vercel** because:
- They require video file access
- They need OpenCV and long-running processes
- Serverless platforms time out after 10-60 seconds

### Recommended Approach for CV Scripts

#### Option 1: Run Locally + Push Data (Recommended)

Run the CV script on your local machine and update Supabase directly:

```python
# Modify video_parking_detector.py to write to Supabase instead of JSON
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def update_live_data(results, lot_name="Furnas Hall Parking"):
    """Update Supabase directly instead of JSON file"""
    data = {
        "lot_name": lot_name,
        "free": results['free'],
        "occupied": results['occupied'],
        "total": results['total'],
        "last_updated": datetime.now().isoformat()
    }
    
    supabase.table('live_parking_data').upsert(data).execute()
```

Then your Flask backend reads from Supabase instead of the JSON file.

#### Option 2: Deploy to Dedicated Server

If you need the CV script running 24/7:

1. **Use a VM service:**
   - AWS EC2 (t2.micro free tier)
   - DigitalOcean Droplet ($6/month)
   - Linode ($5/month)

2. **Setup:**
   ```bash
   # SSH into your VM
   ssh user@your-vm-ip
   
   # Install Python & dependencies
   sudo apt update
   sudo apt install python3-pip
   pip3 install -r requirements.txt
   
   # Upload your video and .env file
   # Run the script
   python3 computer_vision/video_parking_detector.py
   ```

3. **Keep it running with `screen` or `tmux`:**
   ```bash
   screen -S parking-cv
   python3 computer_vision/video_parking_detector.py
   # Press Ctrl+A then D to detach
   ```

#### Option 3: Use as Analysis Tool Only

Run the CV scripts manually when you need to:
- Analyze new parking lot videos
- Generate annotated output videos
- Update parking lot configurations

---

## 🔧 Configuration Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `ROBOFLOW_API_KEY` | Roboflow API key for CV | `abc123...` |
| `FLASK_ENV` | Flask environment | `production` |
| `PORT` | Port for Flask (Render uses 10000) | `10000` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `https://yourapp.vercel.app` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://yourapi.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase key | `eyJhbGc...` |

### CV Script Configuration

Edit in `video_parking_detector.py`:

| Variable | Description | Default |
|----------|-------------|---------|
| `CONFIDENCE_THRESHOLD` | Minimum detection confidence (0.0-1.0) | `0.5` |
| `OVERLAP_THRESHOLD` | IOU threshold for NMS (0.0-1.0) | `0.5` |
| `FRAME_INTERVAL` | Seconds between analyses | `1` |
| `PLAYBACK_SPEED` | Video playback speed multiplier | `0.25` |

---

## 🧪 Testing Your Deployment

### 1. Test Backend API

```bash
# Check if backend is running
curl https://saac-parking-api.onrender.com/api/lot/furnas

# Should return JSON like:
# {"free": 10, "occupied": 5, "total": 15, ...}
```

### 2. Test Frontend

1. Visit your Vercel URL: `https://saac-ubhacking-2025.vercel.app`
2. Navigate to a parking lot page
3. Check browser console (F12) for any errors
4. Verify API calls are going to your Render backend

### 3. Test CORS

Open browser console on your frontend and check Network tab:
- ✅ Status 200 = Working
- ❌ Status 403/CORS error = Update `ALLOWED_ORIGINS` on Render

---

## 🐛 Troubleshooting

### Frontend can't reach backend

**Problem:** CORS errors or 404 on API calls

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel
2. Verify `ALLOWED_ORIGINS` includes your Vercel URL in Render
3. Make sure backend is running (check Render logs)

### Backend crashes on startup

**Problem:** Render deployment fails

**Solutions:**
1. Check Render logs for error details
2. Verify all environment variables are set
3. Ensure `requirements.txt` has all dependencies
4. Test `Procfile` command locally: `gunicorn app:app`

### Environment variables not working

**Problem:** App can't find API keys or URLs

**Solutions:**
1. **Vercel:** Variables must start with `NEXT_PUBLIC_` for client-side
2. **Render:** Check Environment tab, redeploy after changes
3. Don't commit `.env` files! Use `.env.example` as template

### Render free tier sleeping

**Problem:** Backend slow to respond initially

**Solution:** Render free tier sleeps after 15 min inactivity. Consider:
- Upgrading to Starter plan ($7/month)
- Using a cron job to ping your API every 10 minutes

---

## 💰 Pricing Summary

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| **Vercel** | ✅ 100GB bandwidth/month | Pro: $20/month |
| **Render** | ✅ 750 hours/month, sleeps after 15min | Starter: $7/month (no sleep) |
| **Supabase** | ✅ 500MB database, 1GB file storage | Pro: $25/month |
| **Total** | **$0/month** | ~$32/month for no sleep |

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

### Automatic Deployments

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic Triggers:**
   - Vercel: Deploys on every push to `main`
   - Render: Deploys on every push to `main`

### Branch Previews (Vercel)

Vercel automatically creates preview URLs for PRs:
- Push to a feature branch
- Create pull request
- Get a unique preview URL like `https://saac-pr-123.vercel.app`

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Flask Deployment](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Supabase Documentation](https://supabase.com/docs)

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Render with all env variables
- [ ] Backend URL tested and working
- [ ] Frontend deployed to Vercel with all env variables
- [ ] Frontend URL tested and can reach backend
- [ ] CORS updated with frontend URL
- [ ] Supabase database accessible from both frontend and backend
- [ ] .env files added to .gitignore (never commit secrets!)
- [ ] Test all major features work in production
- [ ] Set up custom domain (optional)
- [ ] Set up monitoring/logging (optional)

---

## 🎉 You're Done!

Your parking detection app is now live and accessible worldwide!

**Frontend URL:** `https://your-app.vercel.app`  
**Backend API:** `https://your-api.onrender.com`

Share your project and start collecting parking data! 🚗🅿️
