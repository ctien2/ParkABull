# Video Parking Detector - Usage Guide

## 📋 Overview
`video_parking_detector.py` captures frames from a video every 3 seconds and detects parking spot occupancy using the Roboflow model.

## 🚀 Quick Start

### 1. Install Required Dependencies
```bash
pip install opencv-python inference-sdk python-dotenv
```

### 2. Set Up Environment Variables
Make sure your `.env` file contains:
```
ROBOFLOW_API_KEY=your_api_key_here
```

### 3. Run the Script

**Option A: Process a video file**
```bash
python video_parking_detector.py
```
(Edit `VIDEO_PATH` in the script to point to your video file)

**Option B: Use webcam**
Edit line 238 in the script:
```python
process_video(0)  # 0 for default webcam
```

**Option C: Specify video path**
Edit line 241 in the script:
```python
process_video("/parking_lot_video.mp4")
```

## 📊 Output

### 🖥️ Live Video Feed
A live video window shows:
- ✅ **Green boxes** around FREE parking spots
- 🚗 **Red boxes** around OCCUPIED parking spots
- 📊 **Real-time stats overlay** showing:
  - FREE: number of available spots
  - OCCUPIED: number of taken spots
  - TOTAL: total parking spots detected

**Press 'Q' to quit the live feed**

### Console Output
Real-time display of:
```
📸 Snapshot 1 captured at 2025-11-08_23-30-15
🔍 Analyzing: video_frames/frame_0001_2025-11-08_23-30-15.jpg
   ✅ Free spots: 87
   🚗 Occupied spots: 63
   🅿️  Total spots: 150
```

### Generated Files
1. **`video_frames/`** - Directory containing captured frame images
   - `frame_0001_2025-11-08_23-30-15.jpg`
   - `frame_0002_2025-11-08_23-30-18.jpg`
   - etc.

2. **`video_detection_results.txt`** - Detailed log of all detections
   ```
   ============================================================
   Timestamp: 2025-11-08 23:30:15
   Frame: 1
   ✅ Free spots: 87
   🚗 Occupied spots: 63
   🅿️  Total spots: 150
   ```

## ⚙️ Configuration

Edit these variables at the top of the script:

```python
VIDEO_PATH = "video.mp4"          # Path to your video file
FRAME_INTERVAL = 3                # Seconds between snapshots
OUTPUT_DIR = "video_frames"       # Where to save frame images
RESULTS_LOG = "video_detection_results.txt"  # Results log file
MODEL_ID = "parking-lot-j4ojc/1"  # Roboflow model ID
```

## 🎯 Model Output Structure

The `analyze_frame()` function returns:
```python
{
    "free": 87,           # Number of empty parking spots
    "occupied": 63,       # Number of occupied parking spots
    "total": 150,         # Total number of detected spots
    "predictions": [...]  # Raw predictions from the model
}
```

## 🛠️ Features

- ✅ **Live video feed** with visual bounding boxes
- ✅ **Color-coded detection**: Green = Free, Red = Occupied
- ✅ **Real-time stats overlay** on video feed
- ✅ Processes video frame-by-frame
- ✅ Captures snapshots at regular intervals (default: 3 seconds)
- ✅ Detects free and occupied parking spots
- ✅ Saves frames as images
- ✅ Logs results to text file
- ✅ Real-time console output
- ✅ Supports video files and webcam input
- ✅ Keyboard interrupt support (Ctrl+C)

## 💡 Tips

1. **Adjust frame interval**: Change `FRAME_INTERVAL` for more/less frequent snapshots
2. **Video format**: Supports common formats (mp4, avi, mov, etc.)
3. **Webcam**: Use `0` for default webcam, `1` for second camera, etc.
4. **Performance**: Longer intervals = faster processing, less storage used

## 🐛 Troubleshooting

**Error: "Could not open video source"**
- Check that VIDEO_PATH points to a valid video file
- Ensure the file format is supported by OpenCV

**Error: "ROBOFLOW_API_KEY not found"**
- Make sure `.env` file exists with your API key
- Check that python-dotenv is installed

**Low accuracy**
- Ensure lighting conditions are similar to training data
- Try adjusting camera angle for better view of parking lot

## 📝 Example Usage in Your Flask Backend

```python
from video_parking_detector import analyze_frame

# Capture a frame and analyze it
results = analyze_frame("current_frame.jpg")

# Use results in your API
@api.route('/lot/occupancy', methods=['GET'])
def get_occupancy():
    return jsonify({
        "free": results['free'],
        "occupied": results['occupied'],
        "total": results['total']
    })
```
