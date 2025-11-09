from flask import Flask, request, Response, jsonify
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

#for any route within lots(example: "/lots/ketter")
@app.route('/lots/*', method = ['GET'])
def fetch_occupancy():
    lot_name = request.args.get('name')

    if not lot_name:
        return jsonify({"error": "Missing 'name' query parameter"}), 400

    response = supabase.table("Lots") \
        .select("occupancy, max_occupancy") \
        .eq("name", lot_name) \
        .single() \
        .execute()

    if not response.data:
        return jsonify({"error": f"Lot '{lot_name}' not found"}), 404

    occupancy = response.data["occupancy"]
    max_occ = response.data["max_occupancy"]

    available = max_occ - occupancy

    return jsonify({
        "lot": lot_name,
        "occupancy": occupancy,
        "max_occupancy": max_occ,
        "available": available
    }), 200  

@app.route('/leaving-soon', methods=['POST'])
def leaving_soon():
    data = request.get_json()
    lot_name = data.get('lot_name')
    # supabase.table('lots').update({'name': lot_name}).eq('').execute()
    return jsonify({"message": "Lot status updated."}), 200

if __name__ == '__main__':
    app.run(debug=True)
