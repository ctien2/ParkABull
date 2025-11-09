from flask import Flask, request, Response, jsonify, Blueprint
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import os, time, threading, json, uuid
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from your Next.js frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
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


# @app.route('/')
# def home():
#     return render_template('index.html', message="Hello, Flask!")


def check_in_range(request):
    data = request.get_json()
    user_latitude = data.get('user_latitude')
    user_longitude = data.get('user_longitude')
    lot_name = data.get('lot_name')
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    lot_latitude = lot_data.data[0]['latitude'] 
    lot_longitude = lot_data.data[0]['longitude']
    if abs(lot_latitude - user_latitude) > 0.005 or abs(lot_longitude - user_longitude) > 0.005:
        Response.status_code = 404
        return False
    return True 

def return_schedule_json(lot_name):
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    lot_id = lot_data.data[0]['id']
    list = supabase.table('schedules').select('*').eq('lot_id', lot_id).execute()
    return json.dumps(list.data)

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
        .select("occupancy, max_occupancy") \
        .eq("name", lot_name) \
        .single() \
        .execute()

    if not response.data:
        print(f"❌ ERROR: Lot '{lot_name}' not found in database")
        return jsonify({"error": f"Lot '{lot_name}' not found"}), 404

    occupancy = response.data["occupancy"]
    max_occ = response.data["max_occupancy"]
    available = max_occ - occupancy

    print(f"✅ SUCCESS: Occupancy={occupancy}, Max={max_occ}, Available={available}")
    schedule = return_schedule_json(lot_name)
    result = {
        "lot": lot_name,
        "occupancy": occupancy,
        "max_occupancy": max_occ,
        "available": available, 
        "schedule": schedule
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
    
    lot_name = data.get('lot_name')
    # supabase.table('lots').update({'name': lot_name}).eq('').execute()
    # supabase.table('lots').update({'name': lot_name}).eq('', lot_name).execute()

    print(f"Lot Name: {lot_name}")
    
    print(f"🔍 Updating Supabase for lot: {lot_name}")
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    leaving_soon = lot_data.data[0].get('leaving_soon')
    supabase.table('lots').update({'leaving_soon': leaving_soon+1}).eq('name', lot_name).execute()
    
    threading.Thread(target=revert_increment, args=(lot_name,)).start()
    print("✅ SUCCESS: Lot status updated")
    print("=== END LEAVING SOON ===\n")
    
    return jsonify({"message": "Lot status updated."}), 200

@api.route('/submit-schedule', methods=['POST'])
def submit_schedule():
    # print("\n=== SUBMIT SCHEDULE CALLED ===")
    # print(f"Request URL: {request.url}")
    # print(f"Request Method: {request.method}")
    
    data = request.get_json()
    # print(f"Request Body: {data}")
    
    lot_name = data.get('lot_name')
    # print(f"Lot Name: {lot_name}")
    
    # TODO: Add your schedule submission logic here
    # print(f"🔍 Processing schedule for lot: {lot_name}")
    id = uuid.uuid4()
    
    lot_data = supabase.table('lots').select('*').eq('name', lot_name).execute()
    lot_id = lot_data.data[0].get('id')
    time = data.get('time')
    supabase.table('schedules').insert({
        'id': id, 
        'lot_id': lot_id,
        'time': time
        }).execute()


    # print("✅ SUCCESS: Schedule submitted")
    # print("=== END SUBMIT SCHEDULE ===\n")
    
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

# Register the blueprint
app.register_blueprint(api)

if __name__ == '__main__':
    # Use port 5001 instead of 5000 (macOS AirPlay uses 5000)
    app.run(debug=True, port=5001)
