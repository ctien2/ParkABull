from flask import Flask, request, Response
from supabase import create_client, Client
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)


url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)


# @app.route('/')
# def home():
#     return render_template('index.html', message="Hello, Flask!")




@app.route('/location')
def check_location():
    data = request.get_json()
    user_latitude = data.get('user_latitude')
    user_longitude = data.get('user_longitude')
    lot_id = data.get('lot_id')
#     const { data, error } = await supabase
#   .from('characters')
#   .select()
    lot_latitude = 0.0 
    lot_longitude = 0.0
    if abs(lot_latitude - user_latitude) > 0.005 or abs(lot_longitude - user_longitude) > 0.005:
        Response.status_code = 404
        return {}

#for any route within lots(example: "/lots/ketter")
@app.route('/lots/*', method = ['GET'])
def fetch_occupancy():
    lot_name = request.args.get('name')
    #error handling

    occupancy = supabase.table("Lots").select("occupancy").eq("name", lot_name).execute()
    max_occ = supabase.table("Lots").select("max_occupancy").eq("name", lot_name).execute()
    if not occupancy.data or not max_occ.data:
        return jsonify({"message": "User not found"}), 404
    
    available = occupancy - max_occ

if __name__ == '__main__':
    app.run(debug=True)
