from flask import Flask, request

app = Flask(__name__)

# @app.route('/')
# def home():
#     return render_template('index.html', message="Hello, Flask!")




@app.route('/location')
def check_location():
    data = request.get_json()
    user_latitude = data.get('user_latitude')
    user_longitude = data.get('user_longitude')
    lot_id = data.get('lot_id')
    lot_latitude = 0.0 
    lot_longitude = 0.0
    if abs(lot_latitude - user_latitude) > 0.005 or abs(lot_longitude - user_longitude) > 0.005:
        response.status_code = 404
        return {}



if __name__ == '__main__':
    app.run(debug=True)
