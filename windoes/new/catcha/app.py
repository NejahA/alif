"""
Catcha - Smart Fishing Logbook
A comprehensive fishing journal with analytics and user authentication
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, session, send_file
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.binary import Binary
import bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import io

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'catcha-fishing-app-secret-keys')

# MongoDB setup
MONGODB_URI = os.getenv('MONGODB_URI')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'catchit')

client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
users_collection = db['users']
catches_collection = db['catches']
spots_collection = db['spots']

# GridFS for file storage
from pymongo import MongoClient
gridfs_catch = db.gridfs_catch
gridfs_spot = db.gridfs_spot

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.username = user_data['username']
        self.email = user_data['email']

@login_manager.user_loader
def load_user(user_id):
    user_data = users_collection.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(user_data)
    return None

@app.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('index.html', username=current_user.username)
    return redirect(url_for('login'))

@app.route('/login')
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/signup')
def signup():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    # Validate input
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400
    
    # Check if user already exists
    if users_collection.find_one({'$or': [{'username': username}, {'email': email}]}):
        return jsonify({'success': False, 'message': 'Username or email already exists'}), 400
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user
    user_data = {
        'username': username,
        'email': email,
        'password': hashed_password,
        'created_at': datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    user_data['_id'] = result.inserted_id
    
    # Log user in
    user = User(user_data)
    login_user(user)
    
    return jsonify({'success': True, 'message': 'Account created successfully'})

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Find user
    user_data = users_collection.find_one({'username': username})
    
    if not user_data:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Check password
    if bcrypt.checkpw(password.encode('utf-8'), user_data['password']):
        user = User(user_data)
        login_user(user)
        return jsonify({'success': True, 'message': 'Login successful'})
    
    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/catches', methods=['GET', 'POST'])
@login_required
def catches():
    if request.method == 'POST':
        data = request.json
        data['user_id'] = current_user.id
        data['created_at'] = datetime.utcnow()
        
        result = catches_collection.insert_one(data)
        return jsonify({'success': True, 'id': str(result.inserted_id)})
    
    else:  # GET
        catches = list(catches_collection.find({'user_id': current_user.id}).sort('date', -1).sort('time', -1))
        
        # Convert ObjectId to string
        for catch in catches:
            catch['_id'] = str(catch['_id'])
        
        return jsonify(catches)
@app.route('/api/catches/<catch_id>/photos', methods=['POST'])
@login_required
def upload_photos(catch_id):
    if 'photos' not in request.files:
        return jsonify({'success': False, 'message': 'No photos provided'}), 400

    photos = request.files.getlist('photos')

    if len(photos) > 3:
        return jsonify({'success': False, 'message': 'Maximum 3 photos allowed'}), 400

    # Validate each photo
    for photo in photos:
        if photo.filename == '':
            continue
        if not photo.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            return jsonify({'success': False, 'message': 'Invalid file type. Only images are allowed.'}), 400

    # Store photos in GridFS
    catch = catches_collection.find_one({'_id': ObjectId(catch_id), 'user_id': current_user.id})
    if not catch:
        return jsonify({'success': False, 'message': 'Catch not found'}), 404

    # Store photo metadata in the database
    photo_urls = []
    
    for i, photo in enumerate(photos):
        if photo.filename == '':
            continue

        # Read file content
        file_content = photo.read()
        filename = f'photo_{i+1}_{datetime.utcnow().timestamp()}.{photo.filename.split(".")[-1]}'
        
        # Store in GridFS
        photo_id = gridfs_catch.put(
            file_content,
            filename=filename,
            content_type=photo.content_type
        )
        
        photo_urls.append(f'/api/catches/{catch_id}/photos/{photo_id}')

    # Update catch document with photo URLs
    catches_collection.update_one(
        {'_id': ObjectId(catch_id)},
        {'$set': {'photos': photo_urls}}
    )

    return jsonify({'success': True, 'photos': photo_urls})

@app.route('/api/catches/<catch_id>/photos/<photo_id>')
@login_required
def get_catch_photo(catch_id, photo_id):
    """Retrieve a photo from GridFS"""
    try:
        photo = gridfs_catch.find_one({'_id': ObjectId(photo_id)})
        if not photo:
            return jsonify({'success': False, 'message': 'Photo not found'}), 404
        
        # Verify ownership
        catch = catches_collection.find_one({'_id': ObjectId(catch_id), 'user_id': current_user.id})
        if not catch:
            return jsonify({'success': False, 'message': 'Catch not found'}), 404
        
        return send_file(
            io.BytesIO(photo.read()),
            mimetype=photo.content_type,
            as_attachment=False,
            download_name=photo.filename
        )
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/analytics')
@login_required
def analytics():
    user_catches = list(catches_collection.find({'user_id': current_user.id}))
    
    total_catches = len(user_catches)
    
    # By species
    species_count = {}
    for catch in user_catches:
        species = catch.get('species', 'Unknown')
        species_count[species] = species_count.get(species, 0) + 1
    
    by_species = [{'species': k, 'count': v} for k, v in sorted(species_count.items(), key=lambda x: x[1], reverse=True)]
    
    # Best bait
    bait_count = {}
    for catch in user_catches:
        bait = catch.get('bait')
        if bait:
            bait_count[bait] = bait_count.get(bait, 0) + 1
    
    best_baits = [{'bait': k, 'count': v} for k, v in sorted(bait_count.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # By time of day
    time_periods = {'Morning': 0, 'Afternoon': 0, 'Evening': 0, 'Night': 0}
    for catch in user_catches:
        time_str = catch.get('time', '12:00')
        hour = int(time_str.split(':')[0])
        if 5 <= hour <= 11:
            time_periods['Morning'] += 1
        elif 12 <= hour <= 17:
            time_periods['Afternoon'] += 1
        elif 18 <= hour <= 20:
            time_periods['Evening'] += 1
        else:
            time_periods['Night'] += 1
    
    by_time = [{'period': k, 'count': v} for k, v in time_periods.items() if v > 0]
    
    # Average weight by species
    species_weights = {}
    species_counts = {}
    for catch in user_catches:
        species = catch.get('species', 'Unknown')
        weight = catch.get('weight')
        if weight:
            species_weights[species] = species_weights.get(species, 0) + weight
            species_counts[species] = species_counts.get(species, 0) + 1
    
    avg_weights = [{'species': k, 'avg_weight': round(species_weights[k] / species_counts[k], 2)} 
                   for k in species_weights.keys()]
    
    return jsonify({
        'total_catches': total_catches,
        'by_species': by_species,
        'best_baits': best_baits,
        'by_time': by_time,
        'avg_weights': avg_weights
    })

@app.route('/api/spots', methods=['GET', 'POST'])
@login_required
def spots():
    if request.method == 'POST':
        data = request.json
        data['user_id'] = current_user.id
        data['created_at'] = datetime.utcnow()
        
        result = spots_collection.insert_one(data)
        return jsonify({'success': True, 'id': str(result.inserted_id)})
    
    else:  # GET
        spots = list(spots_collection.find({'user_id': current_user.id}).sort('rating', -1))
        
        # Convert ObjectId to string
        for spot in spots:
            spot['_id'] = str(spot['_id'])
        
        return jsonify(spots)

@app.route('/api/spots/<spot_id>/photos', methods=['POST'])
@login_required
def upload_spot_photos(spot_id):
    if 'photos' not in request.files:
        return jsonify({'success': False, 'message': 'No photos provided'}), 400

    photos = request.files.getlist('photos')

    if len(photos) > 3:
        return jsonify({'success': False, 'message': 'Maximum 3 photos allowed'}), 400

    # Validate each photo
    for photo in photos:
        if photo.filename == '':
            continue
        if not photo.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            return jsonify({'success': False, 'message': 'Invalid file type. Only images are allowed.'}), 400

    # Store photos in GridFS
    spot = spots_collection.find_one({'_id': ObjectId(spot_id), 'user_id': current_user.id})
    if not spot:
        return jsonify({'success': False, 'message': 'Spot not found'}), 404

    # Store photo metadata in the database
    photo_urls = []
    
    for i, photo in enumerate(photos):
        if photo.filename == '':
            continue

        # Read file content
        file_content = photo.read()
        filename = f'photo_{i+1}_{datetime.utcnow().timestamp()}.{photo.filename.split(".")[-1]}'
        
        # Store in GridFS
        photo_id = gridfs_spot.put(
            file_content,
            filename=filename,
            content_type=photo.content_type
        )
        
        photo_urls.append(f'/api/spots/{spot_id}/photos/{photo_id}')

    # Update spot document with photo URLs
    spots_collection.update_one(
        {'_id': ObjectId(spot_id)},
        {'$set': {'photos': photo_urls}}
    )

    return jsonify({'success': True, 'photos': photo_urls})

@app.route('/api/spots/<spot_id>/photos/<photo_id>')
@login_required
def get_spot_photo(spot_id, photo_id):
    """Retrieve a photo from GridFS"""
    try:
        photo = gridfs_spot.find_one({'_id': ObjectId(photo_id)})
        if not photo:
            return jsonify({'success': False, 'message': 'Photo not found'}), 404
        
        # Verify ownership
        spot = spots_collection.find_one({'_id': ObjectId(spot_id), 'user_id': current_user.id})
        if not spot:
            return jsonify({'success': False, 'message': 'Spot not found'}), 404
        
        return send_file(
            io.BytesIO(photo.read()),
            mimetype=photo.content_type,
            as_attachment=False,
            download_name=photo.filename
        )
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/weather')
@login_required
def get_weather():
    """
    Get weather data from Open-Meteo API (Free, no API key required)
    Accepts optional lat/lon or city parameters
    """
    # Get location from query parameters
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    city = request.args.get('city')
    
    try:
        # If city is provided, get coordinates using geocoding
        if city and not (lat and lon):
            geocode_url = f'https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json'
            geo_response = requests.get(geocode_url, timeout=5)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            
            if 'results' in geo_data and len(geo_data['results']) > 0:
                lat = geo_data['results'][0]['latitude']
                lon = geo_data['results'][0]['longitude']
                location_name = geo_data['results'][0]['name']
                if 'country' in geo_data['results'][0]:
                    location_name += f", {geo_data['results'][0]['country']}"
            else:
                # Default to London if city not found
                lat, lon = 51.5074, -0.1278
                location_name = 'London, UK'
        elif lat and lon:
            location_name = f"Lat: {lat}, Lon: {lon}"
        else:
            # Default location (London)
            lat, lon = 51.5074, -0.1278
            location_name = 'London, UK'
        
        # Get weather data from Open-Meteo
        weather_url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m&timezone=auto'
        weather_response = requests.get(weather_url, timeout=5)
        weather_response.raise_for_status()
        weather_data = weather_response.json()
        
        current = weather_data['current']
        
        # Extract weather data
        temperature = round(current['temperature_2m'])
        humidity = current['relative_humidity_2m']
        pressure = round(current['surface_pressure'])
        wind_speed = round(current['wind_speed_10m'])
        weather_code = current['weather_code']
        
        # Convert weather code to conditions
        conditions, weather_type = get_weather_conditions(weather_code)
        
        # Calculate fishing score (1-10)
        fishing_score = calculate_fishing_score(
            temperature=temperature,
            pressure=pressure,
            wind_speed=wind_speed,
            humidity=humidity,
            conditions=weather_type
        )
        
        return jsonify({
            'temperature': temperature,
            'conditions': conditions,
            'wind_speed': wind_speed,
            'pressure': pressure,
            'humidity': humidity,
            'fishing_score': fishing_score,
            'location': location_name
        })
        
    except requests.exceptions.RequestException as e:
        # Return placeholder data on error
        return jsonify({
            'temperature': 22,
            'conditions': 'Unable to fetch weather',
            'wind_speed': 12,
            'pressure': 1013,
            'humidity': 65,
            'fishing_score': 7.5,
            'location': 'Unknown',
            'error': str(e)
        })

def get_weather_conditions(code):
    """
    Convert Open-Meteo weather code to readable conditions
    Returns: (description, type)
    """
    weather_codes = {
        0: ('Clear Sky', 'Clear'),
        1: ('Mainly Clear', 'Clear'),
        2: ('Partly Cloudy', 'Clouds'),
        3: ('Overcast', 'Clouds'),
        45: ('Foggy', 'Fog'),
        48: ('Foggy', 'Fog'),
        51: ('Light Drizzle', 'Rain'),
        53: ('Moderate Drizzle', 'Rain'),
        55: ('Dense Drizzle', 'Rain'),
        61: ('Slight Rain', 'Rain'),
        63: ('Moderate Rain', 'Rain'),
        65: ('Heavy Rain', 'Rain'),
        71: ('Slight Snow', 'Snow'),
        73: ('Moderate Snow', 'Snow'),
        75: ('Heavy Snow', 'Snow'),
        77: ('Snow Grains', 'Snow'),
        80: ('Slight Rain Showers', 'Rain'),
        81: ('Moderate Rain Showers', 'Rain'),
        82: ('Violent Rain Showers', 'Rain'),
        85: ('Slight Snow Showers', 'Snow'),
        86: ('Heavy Snow Showers', 'Snow'),
        95: ('Thunderstorm', 'Thunderstorm'),
        96: ('Thunderstorm with Hail', 'Thunderstorm'),
        99: ('Thunderstorm with Hail', 'Thunderstorm')
    }
    
    return weather_codes.get(code, ('Unknown', 'Unknown'))

def calculate_fishing_score(temperature, pressure, wind_speed, humidity, conditions):
    """
    Calculate fishing activity score based on weather conditions
    Score: 1-10 (10 = best fishing conditions)
    """
    score = 5.0  # Base score
    
    # Temperature factor (ideal: 15-25°C)
    if 15 <= temperature <= 25:
        score += 2
    elif 10 <= temperature < 15 or 25 < temperature <= 30:
        score += 1
    elif temperature < 5 or temperature > 35:
        score -= 2
    
    # Pressure factor (ideal: 1010-1020 hPa, rising pressure is good)
    if 1010 <= pressure <= 1020:
        score += 1.5
    elif pressure < 1000:
        score -= 1
    
    # Wind factor (ideal: 5-20 km/h)
    if 5 <= wind_speed <= 20:
        score += 1.5
    elif wind_speed > 30:
        score -= 2
    elif wind_speed < 5:
        score += 0.5
    
    # Humidity factor (ideal: 50-70%)
    if 50 <= humidity <= 70:
        score += 0.5
    
    # Weather conditions factor
    good_conditions = ['Clear', 'Clouds', 'Mist', 'Fog']
    bad_conditions = ['Thunderstorm', 'Snow', 'Extreme']
    
    if conditions in good_conditions:
        score += 1
    elif conditions in bad_conditions:
        score -= 2
    elif conditions == 'Rain':
        score -= 0.5  # Light rain can be okay
    
    # Clamp score between 1 and 10
    score = max(1.0, min(10.0, score))
    
    return round(score, 1)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
