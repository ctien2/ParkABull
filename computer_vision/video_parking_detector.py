"""
video_parking_detector.py
Captures frames from video every 3 seconds and detects parking spot occupancy.
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
VIDEO_PATH = "parking_lot_video.mp4"  # Change this to your video path or use 0 for webcam
FRAME_INTERVAL = 1  # seconds between snapshots (1 = real-time updates every second)
PLAYBACK_SPEED = 0.25  # Slow motion: 0.25 = 1/4 speed, 0.5 = 1/2 speed, 1.0 = normal speed
OUTPUT_DIR = "video_frames"
RESULTS_LOG = "video_detection_results.txt"

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
def process_video(video_source=VIDEO_PATH):
    """
    Process video and analyze parking spots every FRAME_INTERVAL seconds.
    
    Args:
        video_source: Path to video file or 0 for webcam
    """
    print("\n" + "="*60)
    print("🎥 PARKING SPOT VIDEO DETECTOR")
    print("="*60)
    print(f"Video source: {video_source}")
    print(f"Model: {MODEL_ID}")
    print(f"Capture interval: {FRAME_INTERVAL} seconds")
    print(f"Playback speed: {PLAYBACK_SPEED}x (slower = easier to see)")
    print(f"Output directory: {OUTPUT_DIR}")
    print("="*60)
    print("\n⌨️  KEYBOARD CONTROLS:")
    print("   SPACE = Pause/Resume")
    print("   Q = Quit")
    print("   N = Skip to next analysis")
    print("="*60 + "\n")
    
    # Initialize results log
    with open(RESULTS_LOG, "w") as f:
        f.write("PARKING SPOT DETECTION - VIDEO ANALYSIS\n")
        f.write("="*60 + "\n")
    
    # Open video
    cap = cv2.VideoCapture(video_source)
    
    if not cap.isOpened():
        print(f"❌ Error: Could not open video source: {video_source}")
        return
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    print(f"📹 Video FPS: {fps}")
    print(f"📊 Total frames: {total_frames}")
    print(f"⏱️  Video duration: {total_frames/fps:.2f} seconds\n")
    
    frame_count = 0
    snapshot_count = 0
    frames_to_skip = int(fps * FRAME_INTERVAL)
    
    # Store the latest results for display
    latest_results = {"free": 0, "occupied": 0, "total": 0, "predictions": []}
    annotated_frame = None
    
    # Pause/play control
    paused = False
    skip_to_next = False
    
    print("🖥️  Live video feed opened.\n")
    
    try:
        while True:
            ret, frame = cap.read()
            
            if not ret:
                print("\n✅ End of video or stream")
                break
            
            # Check if we're about to analyze (notify user)
            about_to_analyze = (frame_count % frames_to_skip == 0)
            
            # Notify before model update and auto-pause
            if about_to_analyze and not skip_to_next:
                snapshot_count += 1
                print(f"\n⏸️  PAUSED - About to analyze frame {snapshot_count}")
                print(f"   Press SPACE to continue, or N to skip this analysis")
                paused = True
                
                # Use current frame if annotated_frame is None
                display_frame = annotated_frame if annotated_frame is not None else frame
                
                # Wait for user input
                while paused:
                    key = cv2.waitKey(100) & 0xFF
                    if key == ord(' '):  # Space to resume
                        paused = False
                        print("▶️  Resuming...\n")
                    elif key == ord('n') or key == ord('N'):  # Skip this analysis
                        skip_to_next = True
                        paused = False
                        print("⏭️  Skipping this analysis...\n")
                    elif key == ord('q') or key == ord('Q'):  # Quit
                        print("\n⚠️  User interrupted")
                        cap.release()
                        cv2.destroyAllWindows()
                        return
                    
                    # Show the frame while paused
                    pause_frame = display_frame.copy()
                    cv2.putText(pause_frame, "PAUSED - Press SPACE to continue", 
                               (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)
                    cv2.imshow('Parking Spot Detection - Press Q to Quit', pause_frame)
            
            # Process frame every FRAME_INTERVAL seconds
            if about_to_analyze and not skip_to_next:
                timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                
                # Save frame
                frame_filename = f"frame_{snapshot_count:04d}_{timestamp}.jpg"
                frame_path = os.path.join(OUTPUT_DIR, frame_filename)
                cv2.imwrite(frame_path, frame)
                
                print(f"📸 Snapshot {snapshot_count} captured at {timestamp}")
                
                # Analyze frame
                latest_results = analyze_frame(frame_path)
                
                # Display results
                print(f"   ✅ Free spots: {latest_results['free']}")
                print(f"   🚗 Occupied spots: {latest_results['occupied']}")
                print(f"   🅿️  Total spots: {latest_results['total']}")
                
                # Log results
                log_results(timestamp, snapshot_count, latest_results)
                
                # Draw predictions on frame and keep them
                annotated_frame = draw_predictions_on_frame(frame, latest_results['predictions'])
                skip_to_next = False  # Reset skip flag
            elif skip_to_next:
                # Skip this analysis, keep previous bounding boxes if available
                if annotated_frame is not None and len(latest_results.get('predictions', [])) > 0:
                    # Draw previous predictions on new frame
                    annotated_frame = draw_predictions_on_frame(frame, latest_results['predictions'])
                else:
                    annotated_frame = frame.copy()
                skip_to_next = False  # Reset skip flag
            else:
                # Keep showing previous bounding boxes on new frames
                if len(latest_results.get('predictions', [])) > 0:
                    # Draw the same bounding boxes on the current frame
                    annotated_frame = draw_predictions_on_frame(frame, latest_results['predictions'])
                else:
                    # No predictions yet, just show raw frame
                    annotated_frame = frame.copy()
            
            # Add stats overlay to every frame
            if annotated_frame is not None:
                # Add semi-transparent background for text
                overlay = annotated_frame.copy()
                cv2.rectangle(overlay, (10, 10), (400, 120), (0, 0, 0), -1)
                cv2.addWeighted(overlay, 0.6, annotated_frame, 0.4, 0, annotated_frame)
                
                # Add text information
                cv2.putText(annotated_frame, f"FREE: {latest_results['free']}", 
                           (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"OCCUPIED: {latest_results['occupied']}", 
                           (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                cv2.putText(annotated_frame, f"TOTAL: {latest_results['total']}", 
                           (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                
                # Show the annotated frame
                cv2.imshow('Parking Spot Detection - Press Q to Quit', annotated_frame)
                
            frame_count += 1
            
            # Calculate delay for slow motion playback
            # Normal video plays at 1/fps delay, multiply by inverse of playback speed
            delay_ms = int((1000 / fps) / PLAYBACK_SPEED)
            
            # Check for keyboard input
            key = cv2.waitKey(delay_ms) & 0xFF
            
            if key == ord('q') or key == ord('Q'):  # Quit
                print("\n⚠️  User interrupted")
                break
            elif key == ord(' '):  # Space to pause/resume manually
                if not paused:
                    paused = True
                    print("\n⏸️  PAUSED (manual) - Press SPACE to resume")
                    
                    # Manual pause loop
                    while paused:
                        manual_key = cv2.waitKey(100) & 0xFF
                        if manual_key == ord(' '):
                            paused = False
                            print("▶️  Resumed\n")
                        elif manual_key == ord('q') or manual_key == ord('Q'):
                            print("\n⚠️  User interrupted")
                            cap.release()
                            cv2.destroyAllWindows()
                            return
                        
                        # Show paused indicator
                        if annotated_frame is not None:
                            pause_frame = annotated_frame.copy()
                            cv2.putText(pause_frame, "PAUSED - Press SPACE to resume", 
                                       (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)
                            cv2.imshow('Parking Spot Detection - Press Q to Quit', pause_frame)
                
    except KeyboardInterrupt:
        print("\n⚠️  Process interrupted by user")
    
    finally:
        cap.release()
        cv2.destroyAllWindows()
        
        print("\n" + "="*60)
        print(f"✅ Processing complete!")
        print(f"📊 Total snapshots analyzed: {snapshot_count}")
        print(f"📁 Frames saved in: {OUTPUT_DIR}")
        print(f"📄 Results log: {RESULTS_LOG}")
        print("="*60 + "\n")


# ============================================
# ENTRY POINT
# ============================================
if __name__ == "__main__":
    # Option 1: Process a video file
    process_video(VIDEO_PATH)
    
    # Option 2: Use webcam (uncomment below)
    # process_video(0)
    
    # Option 3: Use a different video file
    # process_video("path/to/your/video.mp4")
