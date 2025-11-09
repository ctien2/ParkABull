"""
video_parking_detector_auto_export.py
Automatically processes entire video and exports annotated output with detections.
No manual pause - fully automated with slow motion playback.
"""

import os
import cv2
import time
import json
from datetime import datetime
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient

load_dotenv()

# ============================================
# CONFIGURATION
# ============================================
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
MODEL_ID = "parking-lot-j4ojc/1"
VIDEO_PATH = "parking_lot_video.mp4"  # Input video
FRAME_INTERVAL = 1  # seconds between model analyses
PLAYBACK_SPEED = 0.25  # Slow motion: 0.25 = 1/4 speed
OUTPUT_DIR = "video_frames"
RESULTS_LOG = "video_detection_results.txt"
LIVE_DATA_FILE = "live_parking_data.json"

# Video export settings
OUTPUT_VIDEO_PATH = "output_annotated_parking_video.mp4"  # Output video file
EXPORT_FPS = 30  # FPS for output video
AUTO_UNPAUSE_DELAY = 2  # Seconds to show pause message before auto-continuing

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Initialize Roboflow client
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)


# ============================================
# HELPER FUNCTIONS
# ============================================
def parse_prediction(pred):
    """Interpret classes for parking-lot-j4ojc/1."""
    cls = pred["class"].lower().strip()

    if cls == "free":
        return "free"
    if cls == "car":
        return "occupied"

    # fallback
    return "occupied"


def analyze_frame(image_path):
    """
    Run inference on a single frame and return counts.
    
    Returns:
        dict: {"free": int, "occupied": int, "total": int}
    """
    print(f"🔍 Analyzing: {image_path}")
    
    try:
        result = CLIENT.infer(image_path, model_id=MODEL_ID)
        
        free = 0
        occupied = 0

        for pred in result.get("predictions", []):
            status = parse_prediction(pred)
            if status == "free":
                free += 1
            else:
                occupied += 1

        total = free + occupied
        
        return {
            "free": free,
            "occupied": occupied,
            "total": total,
            "predictions": result.get("predictions", [])
        }
    
    except Exception as e:
        print(f"❌ Error analyzing frame: {e}")
        return {"free": 0, "occupied": 0, "total": 0, "predictions": []}


def draw_predictions_on_frame(frame, predictions):
    """
    Draw bounding boxes and labels on the frame.
    
    Args:
        frame: The image frame to draw on
        predictions: List of prediction objects from the model
        
    Returns:
        Annotated frame
    """
    annotated = frame.copy()
    
    for pred in predictions:
        # Get bounding box coordinates
        x = int(pred.get("x", 0))
        y = int(pred.get("y", 0))
        width = int(pred.get("width", 0))
        height = int(pred.get("height", 0))
        
        # Calculate corner points
        x1 = int(x - width / 2)
        y1 = int(y - height / 2)
        x2 = int(x + width / 2)
        y2 = int(y + height / 2)
        
        # Determine status and color
        status = parse_prediction(pred)
        if status == "free":
            color = (0, 255, 0)  # Green for free
            label = "FREE"
        else:
            color = (0, 0, 255)  # Red for occupied
            label = "OCCUPIED"
        
        # Draw bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        # Draw label background
        label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
        cv2.rectangle(annotated, (x1, y1 - label_size[1] - 10), 
                     (x1 + label_size[0], y1), color, -1)
        
        # Draw label text
        cv2.putText(annotated, label, (x1, y1 - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
    
    return annotated


def update_live_data(results, lot_name="Furnas Hall Parking"):
    """Update the live data JSON file for web app consumption."""
    live_data = {
        "lot_name": lot_name,
        "free": results['free'],
        "occupied": results['occupied'],
        "total": results['total'],
        "timestamp": datetime.now().isoformat(),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    try:
        with open(LIVE_DATA_FILE, "w") as f:
            json.dump(live_data, f, indent=2)
    except Exception as e:
        print(f"⚠️  Warning: Could not update live data file: {e}")


def log_results(timestamp, frame_num, results):
    """Log results to file."""
    with open(RESULTS_LOG, "a") as f:
        f.write(f"\n{'='*60}\n")
        f.write(f"Timestamp: {timestamp}\n")
        f.write(f"Frame: {frame_num}\n")
        f.write(f"✅ Free spots: {results['free']}\n")
        f.write(f"🚗 Occupied spots: {results['occupied']}\n")
        f.write(f"🅿️  Total spots: {results['total']}\n")


# ============================================
# MAIN VIDEO PROCESSING
# ============================================
def process_video_auto_export(video_source=VIDEO_PATH):
    """
    Process entire video automatically and export annotated output.
    Shows pause messages but continues automatically.
    
    Args:
        video_source: Path to video file or 0 for webcam
    """
    print("\n" + "="*60)
    print("🎥 PARKING SPOT VIDEO DETECTOR - AUTO EXPORT MODE")
    print("="*60)
    print(f"Video source: {video_source}")
    print(f"Model: {MODEL_ID}")
    print(f"Capture interval: {FRAME_INTERVAL} seconds")
    print(f"Playback speed: {PLAYBACK_SPEED}x (slow motion)")
    print(f"Output video: {OUTPUT_VIDEO_PATH}")
    print(f"Auto-unpause delay: {AUTO_UNPAUSE_DELAY} seconds")
    print("="*60 + "\n")
    
    # Initialize results log
    with open(RESULTS_LOG, "w") as f:
        f.write("PARKING SPOT DETECTION - VIDEO ANALYSIS (AUTO EXPORT)\n")
        f.write("="*60 + "\n")
    
    # Open video
    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print(f"❌ Error: Could not open video source: {video_source}")
        return
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"📹 Video FPS: {fps}")
    print(f"📊 Total frames: {total_frames}")
    print(f"📐 Resolution: {width}x{height}")
    print(f"⏱️  Video duration: {total_frames/fps:.2f} seconds\n")
    
    # Initialize video writer for output
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUTPUT_VIDEO_PATH, fourcc, EXPORT_FPS, (width, height))
    
    frame_count = 0
    snapshot_count = 0
    frames_to_skip = int(fps * FRAME_INTERVAL)
    
    # Store the latest results for display
    latest_results = {"free": 0, "occupied": 0, "total": 0, "predictions": []}
    
    print("🎬 Processing video... Press 'q' to quit early.\n")
    
    try:
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print("\n✅ End of video reached")
                break
            
            # Check if we're about to analyze
            about_to_analyze = (frame_count % frames_to_skip == 0)
            
            # Show "analyzing" message frames
            if about_to_analyze:
                snapshot_count += 1
                
                # Show pause message with countdown
                pause_message_frame = frame.copy()
                cv2.putText(pause_message_frame, f"ANALYZING FRAME {snapshot_count}...", 
                           (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 255), 3)
                cv2.putText(pause_message_frame, "Please wait", 
                           (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
                
                # Write pause message frames (simulate pause in output video)
                pause_frames = int(EXPORT_FPS * AUTO_UNPAUSE_DELAY)
                for _ in range(pause_frames):
                    out.write(pause_message_frame)
                
                # Show in window
                cv2.imshow('Processing Video - Press Q to Quit', pause_message_frame)
                cv2.waitKey(1)
                
                # Analyze frame
                timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                frame_filename = f"frame_{snapshot_count:04d}_{timestamp}.jpg"
                frame_path = os.path.join(OUTPUT_DIR, frame_filename)
                cv2.imwrite(frame_path, frame)
                
                print(f"📸 Snapshot {snapshot_count} captured at {timestamp}")
                
                latest_results = analyze_frame(frame_path)
                
                print(f"   ✅ Free spots: {latest_results['free']}")
                print(f"   🚗 Occupied spots: {latest_results['occupied']}")
                print(f"   🅿️  Total spots: {latest_results['total']}")
                
                # Update live data and log
                update_live_data(latest_results)
                log_results(timestamp, snapshot_count, latest_results)
            
            # Draw predictions on frame (persistent)
            if len(latest_results.get('predictions', [])) > 0:
                annotated_frame = draw_predictions_on_frame(frame, latest_results['predictions'])
            else:
                annotated_frame = frame.copy()
            
            # Add stats overlay
            overlay = annotated_frame.copy()
            cv2.rectangle(overlay, (10, 10), (400, 120), (0, 0, 0), -1)
            cv2.addWeighted(overlay, 0.6, annotated_frame, 0.4, 0, annotated_frame)
            
            cv2.putText(annotated_frame, f"FREE: {latest_results['free']}", 
                       (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(annotated_frame, f"OCCUPIED: {latest_results['occupied']}", 
                       (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.putText(annotated_frame, f"TOTAL: {latest_results['total']}", 
                       (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            # Write to output video
            out.write(annotated_frame)
            
            # Show in window
            cv2.imshow('Processing Video - Press Q to Quit', annotated_frame)
            
            # Progress indicator
            progress = (frame_count / total_frames) * 100
            if frame_count % 30 == 0:  # Update every 30 frames
                print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")
            
            frame_count += 1
            
            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n⚠️  User interrupted - saving partial video")
                break
                
    except KeyboardInterrupt:
        print("\n⚠️  Process interrupted by user - saving partial video")
    
    finally:
        cap.release()
        out.release()
        cv2.destroyAllWindows()
        
        print("\n" + "="*60)
        print(f"✅ Processing complete!")
        print(f"📊 Total snapshots analyzed: {snapshot_count}")
        print(f"📁 Frames saved in: {OUTPUT_DIR}")
        print(f"📄 Results log: {RESULTS_LOG}")
        print(f"🎬 Output video: {OUTPUT_VIDEO_PATH}")
        print(f"📏 Video stats: {frame_count} frames processed")
        print("="*60 + "\n")
        
        # Show final video info
        if os.path.exists(OUTPUT_VIDEO_PATH):
            file_size = os.path.getsize(OUTPUT_VIDEO_PATH) / (1024 * 1024)  # MB
            print(f"📦 Output video size: {file_size:.2f} MB")
            print(f"🎥 You can play the video: {OUTPUT_VIDEO_PATH}")


# ============================================
# ENTRY POINT
# ============================================
if __name__ == "__main__":
    print("Starting automated video processing with export...")
    print("This will process the entire video automatically.")
    print("Pause messages will be shown but playback will continue.\n")
    
    # Process video and export
    process_video_auto_export(VIDEO_PATH)
    
    print("\n✨ Done! Check the output video file.")
