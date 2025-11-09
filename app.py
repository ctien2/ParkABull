from flask import Flask, request, Response, jsonify, Blueprint
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import os, time, threading, json, uuid
from datetime import datetime
from collections import Counter
import cv2
from inference_sdk import InferenceHTTPClient
load_dotenv()

app = Flask(__name__)

# Get frontend URL from environment variable (for CORS)
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Configure CORS to allow requests from your Next.js frontend
CORS(app, resources={
    r"/api/*": {
        "origins": [FRONTEND_URL],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Create a Blueprint with /api prefix
api = Blueprint('api', __name__, url_prefix='/api')

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)
global_id = 0

# Initialize Roboflow client for CV
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
CV_CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)
MODEL_ID = "parking-d1qyt/1"
VIDEO_PATH = "public/parking_lot_video_slow.mp4"
CONFIDENCE_THRESHOLD = 0.28

# Global flag to control the background thread
cv_thread_running = False

# ============================================
# COMPUTER VISION BACKGROUND PROCESSING
# ============================================

def parse_prediction(pred):
    """Interpret classes for the parking model."""
    cls = pred["class"].lower().strip()
    if cls == "free":
        return "free"
    if cls == "car":
        return "occupied"
    return "occupied"


def analyze_frame_from_video(frame):
    """
    Analyze a video frame and return occupancy counts.
    Saves frame temporarily for inference.
    """
    temp_frame_path = "temp_frame.jpg"
    cv2.imwrite(temp_frame_path, frame)
    
    try:
        result = CV_CLIENT.infer(temp_frame_path, model_id=MODEL_ID)
        
        free = 0
        occupied = 0
        
        for pred in result.get("predictions", []):
            if pred.get("confidence", 0) < CONFIDENCE_THRESHOLD:
                continue
            status = parse_prediction(pred)
            if status == "free":
                free += 1
            else:
                occupied += 1
        
        total = free + occupied
        
        # Clean up temp file
        if os.path.exists(temp_frame_path):
            os.remove(temp_frame_path)
        
        return {"free": free, "occupied": occupied, "total": total}
    
    except Exception as e:
        print(f"❌ Error analyzing frame: {e}")
        if os.path.exists(temp_frame_path):
            os.remove(temp_frame_path)
        return {"free": 0, "occupied": 0, "total": 0}


def update_occupancy_in_db(lot_name, occupied_spots):
    """
    Update the occupancy field in the lots table.
    Schema: occupancy = OCCUPIED spots, max_occupancy = total capacity
    """
    try:
        # Update the lots table with new occupancy data
        # occupancy = number of OCCUPIED spots (not free!)
        # max_occupancy = total spots available
        response = supabase.table('lots').update({
            'occupancy': occupied_spots,      # Number of OCCUPIED spots
        }).eq('name', lot_name).execute()
        
        print(f"✅ Updated DB")
        return response
    
    except Exception as e:
        print(f"❌ Error updating database: {e}")
        return None


def cv_background_worker():
    """
    Background thread that processes video frames every 5 seconds
    and updates the database with occupancy data.
    """
    global cv_thread_running
    
    print("\n🎥 Starting CV background worker...")
    print(f"📹 Video path: {VIDEO_PATH}")
    print(f"🔄 Update interval: 5 seconds")
    print(f"🎯 Model: {MODEL_ID}\n")
    
    if not os.path.exists(VIDEO_PATH):
        print(f"❌ Video file not found: {VIDEO_PATH}")
        return
    
    cap = cv2.VideoCapture(VIDEO_PATH)
    
    if not cap.isOpened():
        print(f"❌ Could not open video: {VIDEO_PATH}")
        return
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = int(fps * 5)  # Process every 5 seconds
    
    print(f"📊 Video info - FPS: {fps}, Total frames: {total_frames}")
    
    frame_count = 0
    cv_thread_running = True
    
    try:
        while cv_thread_running:
            ret, frame = cap.read()
            
            if not ret:
                # Loop back to start of video
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                frame_count = 0
                # print("🔄 Looping video back to start...")
                continue
            
            # Process frame every 5 seconds worth of frames
            if frame_count % frame_interval == 0:
                # print(f"\n🔍 Processing frame {frame_count}/{total_frames}...")
                
                # Analyze the frame
                results = analyze_frame_from_video(frame)
                
                # Update database
                update_occupancy_in_db(
                    lot_name="Furnas",
                    occupied_spots=results['occupied'],
                )
            
            frame_count += 1
            
            # Small sleep to prevent CPU overuse
            time.sleep(0.01)
    
    except Exception as e:
        print(f"❌ Error in CV worker: {e}")
    
    finally:
        cap.release()
        print("\n🛑 CV background worker stopped.")


def start_cv_worker():
    """Start the CV background worker thread."""
    worker_thread = threading.Thread(target=cv_background_worker, daemon=True)
    worker_thread.start()
    print("✅ CV worker thread started")


# @app.route('/')
# def home():
#     return render_template('index.html', message="Hello, Flask!")


# def check_in_range(request):
#     data = request.get_json()
#     user_latitude = data.get('user_latitude')
#     user_longitude = data.get('user_longitude')
#     lot_name = data.get('lot_name')
#     lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
#     lot_latitude = lot_data.data[0]['latitude'] 
#     lot_longitude = lot_data.data[0]['longitude']
#     if abs(lot_latitude - user_latitude) > 0.005 or abs(lot_longitude - user_longitude) > 0.005:
#         Response.status_code = 404
#         return False
#     return True 

def return_schedule_json(lot_name, top_n=5):
     # 1. Get lot_id for the given lot name
    lot_data = supabase.table('lots') \
        .select('id') \
        .eq('name', lot_name) \
        .single() \
        .execute()

    if not lot_data.data:
        print(f"❌ Lot '{lot_name}' not found")
        return []

    lot_id = lot_data.data['id']

    # 2. Fetch schedules for this specific lot
    schedules = supabase.table('schedules') \
        .select('time') \
        .eq('lot_id', lot_id) \
        .execute() \
        .data

    print(f"Fetched schedules for {lot_name}: {schedules}")

    if not schedules:
        return []

    normalized_times = []

    for s in schedules:
        t = s.get('time')

        if not t:
            continue  # Skip null values

        # ✅ Your DB stores "HH:MM", so convert to datetime to ensure sortable
        try:
            dt = datetime.strptime(t, "%H:%M:%S")
            normalized_times.append(dt.strftime("%H:%M"))
        except ValueError:
            print("⚠️ Unexpected time format (expected HH:MM):", t)
            continue

    if not normalized_times:
        return []

    # 3. Count occurrences of each time
    counter = Counter(normalized_times)

    # 4. Sort by time
    sorted_times = sorted(counter.items(), key=lambda x: x[0])

    # 5. Create response array
    result = [{"time": t, "count": cnt} for t, cnt in sorted_times[:top_n]]
    
    print("Returning formatted schedule:", result)
    return result

#for any route within lots(example: "/api/lot/furnas")
@api.route('/lot/<lot_name>', methods = ['GET'])
def fetch_occupancy(lot_name):
    print("\n=== FETCH OCCUPANCY CALLED ===")
    print(f"Request URL: {request.url}")
    print(f"Request Method: {request.method}")
    print(f"Lot ID from URL: {lot_name}")
    
    # Use lot_name from query params OR from URL path
    lot_name = request.args.get('lot_name') or lot_name
    print(f"Lot Name Parameter: {lot_name}")

    if not lot_name:
        print("❌ ERROR: Missing 'name' query parameter")
        return jsonify({"error": "Missing 'name' query parameter"}), 400

    print(f"🔍 Querying Supabase for lot: {lot_name}")
    response = supabase.table("lots") \
        .select("occupancy, max_occupancy, leaving_soon") \
        .eq("name", lot_name) \
        .single() \
        .execute()

    if not response.data:
        print(f"❌ ERROR: Lot '{lot_name}' not found in database")
        return jsonify({"error": f"Lot '{lot_name}' not found"}), 404

    occupancy = response.data["occupancy"]
    max_occ = response.data["max_occupancy"]
    available = max_occ - occupancy
    leaving_soon_count = response.data.get("leaving_soon", 0)

    print(f"✅ SUCCESS: Occupancy={occupancy}, Max={max_occ}, Available={available}, Leaving Soon={leaving_soon_count}")
    schedule = return_schedule_json(lot_name)
    result = {
        "lot": lot_name,
        "occupancy": occupancy,
        "max_occupancy": max_occ,
        "available_spots": available,
        "total_spots": max_occ,
        "leaving_soon": leaving_soon_count,
        "departures": schedule if schedule else []
    }
    print(f"Returning: {result}")
    print("=== END FETCH OCCUPANCY ===\n")
    
    return jsonify(result), 200  

# @api.route('/lot/departures', methods=['GET'])
# def get_departures():
#     print("\n=== GET DEPARTURES CALLED ===")
#     print(f"Request URL: {request.url}")
#     print(f"Request Method: {request.method}")
    
#     lot_name = request.args.get('lot_name')
#     print(f"Lot Name Parameter: {lot_name}")
    
#     if not lot_name:
#         print("❌ ERROR: Missing 'lot_name' query parameter")
#         return jsonify({"error": "Missing 'lot_name' query parameter"}), 400
    
#     print(f"🔍 Querying departures for lot: {lot_name}")
    
#     # TODO: Replace with actual database query
#     # For now, returning mock data
#     mock_departures = [
#         {"spot": "Section A - Spot 23", "time": "2:30 PM", "timeUntil": "15 min"},
#         {"spot": "Section B - Spot 45", "time": "3:00 PM", "timeUntil": "45 min"},
#     ]
    
#     print(f"✅ SUCCESS: Found {len(mock_departures)} departures")
#     print(f"Returning: {mock_departures}")
#     print("=== END GET DEPARTURES ===\n")
    
#     return jsonify({"departures": mock_departures}), 200

def revert_increment(lot_name):
    time.sleep(300)
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    leaving_soon = lot_data.data[0].get('leaving_soon') 
    supabase.table('lots').update({'leaving_soon': leaving_soon - 1}).eq('name', lot_name).execute()
    
@api.route('/leaving-soon', methods=['POST'])
def leaving_soon():
    print("\n=== LEAVING SOON CALLED ===")
    print(f"Request URL: {request.url}")
    print(f"Request Method: {request.method}")
    
    data = request.get_json()
    print(f"Request Body: {data}")
    
    # Temporarily disabled for testing - uncomment to re-enable range check
    # if check_in_range(request) == False:
    #     return jsonify({"message": "User not in range."}), 404

    lot_name = data.get('lot_name')
    # supabase.table('lots').update({'name': lot_name}).eq('').execute()
    # supabase.table('lots').update({'name': lot_name}).eq('', lot_name).execute()

    print(f"Lot Name: {lot_name}")
    
    print(f"🔍 Updating Supabase for lot: {lot_name}")
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    leaving_soon_count = lot_data.data[0].get('leaving_soon', 0)
    occupancy = lot_data.data[0].get('occupancy', 0)
    max_occ = lot_data.data[0].get('max_occupancy', 0)
    
    # Increment leaving_soon count
    new_leaving_soon = leaving_soon_count + 1
    supabase.table('lots').update({'leaving_soon': new_leaving_soon}).eq('name', lot_name).execute()
    
    threading.Thread(target=revert_increment, args=(lot_name,)).start()
    print("✅ SUCCESS: Lot status updated")
    print("=== END LEAVING SOON ===\n")
    
    # Return updated lot data
    available = max_occ - occupancy
    # schedule = return_schedule_json(lot_name)
    result = {
        "message": "Lot status updated.",
        "available_spots": available,
        "total_spots": max_occ,
        "leaving_soon": new_leaving_soon,
        # "departures": json.loads(schedule) if schedule else []
    }
    
    return jsonify(result), 200

@api.route('/submit-schedule', methods=['POST'])
def submit_schedule():
    print("\n=== SUBMIT SCHEDULE CALLED ===")
    print(f"Request URL: {request.url}")
    print(f"Request Method: {request.method}")
    
    data = request.get_json()
    print(f"Request Body: {data}")
    
    lot_name = data.get('lot_name')
    print(f"Lot Name: {lot_name}")
    
    # if check_in_range(request) == False:
    #     return jsonify({"message": "User not in range."}), 404


    # TODO: Add your schedule submission logic here
    print(f"🔍 Processing schedule for lot: {lot_name}")
    global global_id
    id = global_id
    global_id+=1
    
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    lot_id = lot_data.data[0].get('id')
    time = data.get('departure_time')
    supabase.table('schedules').insert({
        'id': id, 
        'lot_id': lot_id,
        'time': time
        }).execute()


    print("✅ SUCCESS: Schedule submitted")
    print("=== END SUBMIT SCHEDULE ===\n")
    
    return jsonify({"message": "Schedule submitted successfully."}), 200

@api.route('/lot/live-cv-data', methods=['GET'])
def get_live_cv_data():
    """Get live parking data from computer vision analysis."""
    print("\n=== GET LIVE CV DATA CALLED ===")
    
    try:
        # Read the live data JSON file created by video_parking_detector.py
        json_path = os.path.join('computer_vision', 'live_parking_data.json')
        
        if not os.path.exists(json_path):
            print("⚠️  Live data file not found - CV script may not be running")
            return jsonify({
                "error": "Live data not available",
                "message": "Computer vision script is not running or hasn't analyzed any frames yet"
            }), 404
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        print(f"✅ SUCCESS: Returning live CV data")
        print(f"   Free: {data.get('free', 0)}, Occupied: {data.get('occupied', 0)}, Total: {data.get('total', 0)}")
        print("=== END GET LIVE CV DATA ===\n")
        
        return jsonify(data), 200
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("=== END GET LIVE CV DATA ===\n")
        return jsonify({"error": str(e)}), 500


def cleanup_expired_schedules():
    while True:
        try:
            # delete any schedules where the time has passed
            now = datetime.now().strftime("%H:%M:%S")
            supabase.table('schedules').delete().lt('time', now).execute()
        except Exception as e:
            print("❌ Cleanup error:", e)

        time.sleep(60)   # check once per minute

# Register the blueprint
app.register_blueprint(api)

if __name__ == '__main__':
    threading.Thread(target=cleanup_expired_schedules, daemon=True).start()

    # Start the CV background worker
    start_cv_worker()
    
    # Use port 5001 instead of 5000 (macOS AirPlay uses 5000)
    app.run(debug=True, port=5001)
