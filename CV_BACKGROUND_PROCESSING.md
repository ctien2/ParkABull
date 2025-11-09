# Computer Vision Background Processing - Documentation

## Overview

The Flask backend now automatically processes the parking lot video every 3 seconds and updates the database with real-time occupancy data. This simulates a "live stream" for your mockup.

## How It Works

### 1. Background Thread
When you start the Flask app with `python app.py`, a background daemon thread automatically starts that:
- Reads frames from `public/parking_lot_video.mp4`
- Processes one frame every 3 seconds (configurable)
- Runs the Roboflow parking detection model on each frame
- Updates the Supabase database with the results
- Loops the video when it reaches the end

### 2. Processing Flow

```
Video Frame (every 3 sec) 
    ↓
Save as temp file
    ↓
Run Roboflow Inference
    ↓
Parse predictions (free/occupied)
    ↓
Update Supabase 'lots' table
    ↓
Frontend polls and displays updated data
```

### 3. Database Updates

The system updates the `lots` table with these fields:
- `occupancy`: Number of FREE spots (not occupied)
- `total_spots`: Total parking spots detected
- `last_updated`: Timestamp of the update

**Example Update:**
```python
supabase.table('lots').update({
    'occupancy': 12,           # 12 free spots
    'total_spots': 25,         # 25 total spots detected
    'last_updated': '2025-11-09T14:30:00'
}).eq('name', 'Furnas Hall Parking').execute()
```

### 4. Configuration

You can adjust these settings at the top of `app.py`:

```python
MODEL_ID = "parking-d1qyt/1"              # Roboflow model to use
VIDEO_PATH = "public/parking_lot_video.mp4"  # Video file path
CONFIDENCE_THRESHOLD = 0.28                # Minimum confidence for detections
frame_interval = int(fps * 3)              # Process every 3 seconds
```

To change the update frequency, modify the `3` in `frame_interval = int(fps * 3)` inside the `cv_background_worker()` function.

## Key Functions

### `parse_prediction(pred)`
Interprets the model output:
- `"free"` class → Free parking spot
- `"car"` class → Occupied spot

### `analyze_frame_from_video(frame)`
- Takes a video frame
- Saves it temporarily as `temp_frame.jpg`
- Runs Roboflow inference
- Filters by confidence threshold
- Returns `{free, occupied, total}`
- Cleans up temp file

### `update_occupancy_in_db(lot_name, free_spots, occupied_spots, total_spots)`
- Updates the Supabase `lots` table
- Sets `occupancy` to the number of FREE spots
- Updates `total_spots` and `last_updated` timestamp
- Uses the same pattern as other database updates in your app

### `cv_background_worker()`
Main background loop that:
- Opens the video file
- Processes frames at the specified interval
- Loops video when it ends
- Runs continuously until Flask shuts down

### `start_cv_worker()`
- Creates and starts the background thread
- Thread is a daemon, so it stops when Flask stops

## Console Output

You'll see real-time logging like:

```
🎥 Starting CV background worker...
📹 Video path: public/parking_lot_video.mp4
🔄 Update interval: 3 seconds
🎯 Model: parking-d1qyt/1

📊 Video info - FPS: 30.0, Total frames: 1500
✅ CV worker thread started

🔍 Processing frame 0/1500...
   ✅ Free: 12 | 🚗 Occupied: 13 | 🅿️  Total: 25
✅ Updated DB: Furnas Hall Parking - Free: 12, Occupied: 13, Total: 25

🔍 Processing frame 90/1500...
   ✅ Free: 11 | 🚗 Occupied: 14 | 🅿️  Total: 25
✅ Updated DB: Furnas Hall Parking - Free: 11, Occupied: 14, Total: 25
```

## Frontend Integration

Your frontend already polls the backend every 30 seconds:

```typescript
// In furnas/page.tsx
useEffect(() => {
    const fetchOccupancy = async () => {
        const response = await fetch('http://localhost:5001/api/lot/furnas');
        const data = await response.json();
        setLotData({
            available_spots: data.available_spots,
            leaving_soon: data.leaving_soon,
            total_spots: data.total_spots
        });
    };
    
    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 30000);
    return () => clearInterval(interval);
}, []);
```

The frontend will automatically display the updated occupancy data from the background CV processing!

## Dependencies

Make sure you have these in your `requirements.txt`:
```
flask==3.0.0
flask-cors==4.0.0
supabase==2.0.0
python-dotenv==1.0.0
opencv-python==4.8.1.78
inference-sdk==0.9.12
```

## Environment Variables Required

In your `.env` file:
```
ROBOFLOW_API_KEY=your_roboflow_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Stopping the Background Worker

The worker thread is a daemon thread, so it will automatically stop when you:
- Press Ctrl+C to stop Flask
- Close the terminal
- Stop the Flask process

To manually control it, you can set `cv_thread_running = False`.

## Performance Notes

- **CPU Usage**: The thread sleeps 0.01s between frames to prevent high CPU usage
- **Video Looping**: Automatically restarts from the beginning when video ends
- **Error Handling**: Catches and logs errors without crashing the main Flask app
- **Temp Files**: Automatically cleans up temporary frame images

## Troubleshooting

**Video not found error?**
- Check that `public/parking_lot_video.mp4` exists
- Update `VIDEO_PATH` if your video is in a different location

**Database not updating?**
- Verify Supabase credentials in `.env`
- Check that the `lots` table has a row with `name = 'Furnas Hall Parking'`
- Look for error messages in Flask console

**High CPU usage?**
- Increase the `time.sleep(0.01)` value in the while loop
- Increase the `frame_interval` (e.g., process every 5 seconds instead of 3)

**Model not working?**
- Verify `ROBOFLOW_API_KEY` is set correctly
- Check that `MODEL_ID` matches your Roboflow model

## Testing

1. Start Flask: `python app.py`
2. Watch the console for CV processing logs
3. Check your Supabase dashboard to see the `lots` table updating
4. Open the frontend and see the numbers change every 30 seconds

## Future Enhancements

- Add multiple parking lots with different video sources
- Store historical occupancy data in a separate table
- Add API endpoint to pause/resume CV processing
- Implement actual live stream support (RTSP, WebRTC)
- Add real-time WebSocket updates instead of polling

---

**Status**: ✅ Fully functional - Ready for demo!
