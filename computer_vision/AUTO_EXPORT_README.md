# Auto-Export Video Parking Detector

## 📋 Overview
This script automatically processes an entire parking lot video, applies computer vision detection, and exports an annotated output video with all detections visible.

## 🆚 Difference from Original Script

| Feature | Original Script | Auto-Export Script |
|---------|----------------|-------------------|
| **Pausing** | Manual - waits for user input | Automatic - shows message for 2 seconds then continues |
| **Output** | Live display only | Saves full annotated video file |
| **Interaction** | Press SPACE to continue | Fully automatic, hands-free |
| **Use Case** | Live monitoring | Creating demo videos |
| **Speed** | Configurable slow motion | Slow motion during playback, normal in export |

## 🎬 What It Does

1. **Reads** your parking lot video
2. **Analyzes** frames every 1 second with the AI model
3. **Draws** green boxes (FREE) and red boxes (OCCUPIED) on parking spots
4. **Shows** pause messages ("ANALYZING FRAME...") for 2 seconds
5. **Continues** automatically without user input
6. **Exports** complete annotated video with:
   - Bounding boxes on all parking spots
   - Live stats overlay (FREE/OCCUPIED/TOTAL)
   - Slow motion effect
   - Pause messages between analyses

## 🚀 How to Run

```bash
cd computer_vision
python video_parking_detector_auto_export.py
```

## ⚙️ Configuration

Edit these settings at the top of the file:

```python
VIDEO_PATH = "parking_lot_video.mp4"  # Your input video
OUTPUT_VIDEO_PATH = "output_annotated_parking_video.mp4"  # Output file
FRAME_INTERVAL = 1  # Analyze every N seconds
PLAYBACK_SPEED = 0.25  # 0.25 = 1/4 speed (slow motion)
AUTO_UNPAUSE_DELAY = 2  # Pause message duration in seconds
EXPORT_FPS = 30  # Output video frame rate
```

## 📊 Output Files

After running, you'll get:

1. **`output_annotated_parking_video.mp4`** - Main output video with annotations
2. **`video_frames/`** - Individual analyzed frame images
3. **`video_detection_results.txt`** - Text log of all detections
4. **`live_parking_data.json`** - Latest parking data (for web integration)

## 🎥 Output Video Features

The exported video includes:
- ✅ **Green boxes** around FREE parking spots
- 🚗 **Red boxes** around OCCUPIED parking spots
- 📊 **Stats overlay** showing:
  - FREE: X
  - OCCUPIED: Y
  - TOTAL: Z
- ⏸️ **"ANALYZING FRAME..." messages** with 2-second pauses
- 🎬 **Slow motion** effect for easy viewing
- 🏷️ **Labels** on each parking spot

## 📈 Progress Tracking

While running, you'll see:
```
📸 Snapshot 1 captured at 2025-11-08_23-45-30
🔍 Analyzing: video_frames/frame_0001_2025-11-08_23-45-30.jpg
   ✅ Free spots: 87
   🚗 Occupied spots: 63
   🅿️  Total spots: 150
Progress: 15.3% (459/3000 frames)
```

## ⏱️ Processing Time

Depends on:
- Video length
- Frame interval (analyzing every 1 second vs 3 seconds)
- Internet speed (API calls to Roboflow)
- Computer performance

**Example:** 
- 5-minute video at 30fps = 9,000 frames
- Analyzing every 1 second = ~300 API calls
- Estimated time: 10-15 minutes

## 🎯 Use Cases

### 1. Demo Videos
Create impressive demo videos showing your parking detection system in action.

### 2. Accuracy Verification
Watch the entire video to verify model accuracy across different conditions.

### 3. Presentations
Export and use in presentations, pitches, or documentation.

### 4. Social Media
Create shareable content showing your computer vision project.

### 5. Documentation
Visual documentation of how your system performs.

## 🛑 Early Exit

Press **'Q'** during processing to stop early and save a partial video.

## 💡 Tips

### Speed Up Processing
```python
FRAME_INTERVAL = 3  # Analyze less frequently
AUTO_UNPAUSE_DELAY = 1  # Shorter pause messages
```

### Slow Down Playback More
```python
PLAYBACK_SPEED = 0.1  # Very slow (1/10 speed)
```

### Higher Quality Export
```python
EXPORT_FPS = 60  # Smoother output video
```

### Smaller File Size
```python
# Use H.264 codec (edit line 232):
fourcc = cv2.VideoWriter_fourcc(*'avc1')
```

## 🐛 Troubleshooting

### Video Won't Play
Try a different codec. Edit line 232:
```python
# Instead of 'mp4v', try:
fourcc = cv2.VideoWriter_fourcc(*'XVID')  # .avi format
# Or:
fourcc = cv2.VideoWriter_fourcc(*'avc1')  # H.264
```

### Processing Too Slow
- Increase `FRAME_INTERVAL` (analyze less frequently)
- Use a shorter video for testing
- Check internet connection (API calls)

### Output Video Too Large
- Lower `EXPORT_FPS` (e.g., 24 instead of 30)
- Use better codec (H.264 instead of mp4v)
- Reduce input video resolution

### Model Not Detecting Well
- See main README for model accuracy tips
- Check video quality and lighting
- Verify camera angle

## 📝 Example Output

After completion:
```
============================================================
✅ Processing complete!
📊 Total snapshots analyzed: 150
📁 Frames saved in: video_frames
📄 Results log: video_detection_results.txt
🎬 Output video: output_annotated_parking_video.mp4
📏 Video stats: 9000 frames processed
============================================================

📦 Output video size: 245.67 MB
🎥 You can play the video: output_annotated_parking_video.mp4
```

## 🎬 Viewing the Output

Open with any video player:
- VLC Media Player
- QuickTime (Mac)
- Windows Media Player
- Browser (HTML5 video)

## 🔄 Batch Processing

To process multiple videos, edit the end of the script:
```python
videos = ["video1.mp4", "video2.mp4", "video3.mp4"]
for video in videos:
    process_video_auto_export(video)
```

## ✨ Next Steps

- Share your output video!
- Use it in presentations
- Post on social media
- Include in documentation
- Show to potential users/investors
