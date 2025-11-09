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



if __name__ == '__main__':
    app.run(debug=True)
