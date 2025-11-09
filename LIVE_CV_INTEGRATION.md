# Live Computer Vision Integration

This setup connects the computer vision parking detector directly to the web frontend for real-time parking availability updates.

## 📁 Files Created

1. **`computer_vision/live_parking_data.json`** - Shared data file updated by CV script
2. **`app/lot/furnas-live-cv/page.tsx`** - New page that displays live CV data
3. **Flask API Endpoint** - `GET /api/lot/live-cv-data` in `app.py`
4. **Updated `video_parking_detector.py`** - Now writes to JSON file

## 🚀 How to Use

### Step 1: Start the Computer Vision Script

```bash
cd computer_vision
python video_parking_detector.py
```

This will:
- Analyze the video
- Update `live_parking_data.json` every second
- Display the video with bounding boxes

### Step 2: Start the Flask Backend

In a new terminal:
```bash
python app.py
```

Flask will serve the live data from the JSON file at `http://localhost:5001/api/lot/live-cv-data`

### Step 3: Start the Next.js Frontend

In another terminal:
```bash
npm run dev
```

### Step 4: View the Live Page

Navigate to: **`http://localhost:3000/lot/furnas-live-cv`**

## 🎯 What You'll See

The new page shows:
- **Live Free Spots** - Updates every 2 seconds
- **Live Occupied Spots** - Real-time from CV
- **Total Detected Spots** - From the model
- **Last Updated Timestamp** - When CV last analyzed
- **Occupancy Rate Progress Bar** - Visual representation
- **Status Badge** - Available/Limited/Full based on occupancy

## 📊 Data Flow

```
video_parking_detector.py 
    ↓ (writes every second)
live_parking_data.json
    ↓ (read by Flask)
Flask API: /api/lot/live-cv-data
    ↓ (polled every 2 seconds)
Next.js Frontend: /lot/furnas-live-cv
    ↓ (displays)
User sees live data!
```

## 🔧 Configuration

### Polling Frequency (Frontend)
Edit `app/lot/furnas-live-cv/page.tsx` line 111:
```tsx
const interval = setInterval(fetchLiveCVData, 2000); // 2000ms = 2 seconds
```

### CV Analysis Frequency
Edit `computer_vision/video_parking_detector.py` line 22:
```python
FRAME_INTERVAL = 1  # seconds between snapshots
```

## 🎨 Features

### Live Page vs Original Page

**Original (`/lot/furnas`):**
- Static hardcoded values
- No real-time updates
- For demo/design purposes

**Live CV (`/lot/furnas-live-cv`):**
- Real-time data from video analysis
- Auto-updates every 2 seconds
- Shows last updated timestamp
- Error handling if CV script isn't running
- Occupancy rate progress bar
- Color-coded availability status

## 🔍 Troubleshooting

### "Live data not available" Error

**Cause:** The computer vision script isn't running or hasn't analyzed any frames yet.

**Solution:**
1. Make sure `video_parking_detector.py` is running
2. Wait for the first frame to be analyzed
3. Check that `computer_vision/live_parking_data.json` exists and has data

### Data Not Updating

**Check:**
1. CV script is still running (not paused/crashed)
2. Flask backend is running on port 5001
3. Browser console for fetch errors
4. Flask logs for API call errors

### CORS Errors

Make sure Flask CORS is configured properly in `app.py`:
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        ...
    }
})
```

## 💡 Pro Tips

1. **Multiple Monitors**: Run CV script on one screen, web page on another to see both
2. **Video Loop**: Edit `video_parking_detector.py` to loop the video for continuous testing
3. **Pause Feature**: Use SPACE to pause CV analysis when needed
4. **Manual Testing**: Modify `live_parking_data.json` manually to test frontend updates

## 📝 Example JSON Data

```json
{
  "lot_name": "Furnas Hall Parking",
  "free": 87,
  "occupied": 63,
  "total": 150,
  "timestamp": "2025-11-08T23:45:30.123456",
  "last_updated": "2025-11-08 23:45:30"
}
```

## 🎯 Next Steps

- Add historical data tracking
- Create charts/graphs of occupancy over time
- Add alerts when spots become available
- Integrate with multiple parking lots
- Add video stream to frontend (advanced)
