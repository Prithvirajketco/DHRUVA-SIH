import os
import json
import random
import requests
import geopandas as gpd
from shapely.geometry import Point
from datetime import datetime, timedelta

def load_study_area_bbox(config_path):
    try:
        import yaml
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
        return config['study_area']['bbox']
    except Exception as e:
        print(f"Failed to load bbox from config, using defaults: {e}")
        return {'min_lon': 92.2, 'max_lon': 93.8, 'min_lat': 25.0, 'max_lat': 26.2}

def generate_synthetic_landslides(boundary_path, num_points=100):
    try:
        if os.path.exists(boundary_path):
            boundary = gpd.read_file(boundary_path).geometry.iloc[0]
            minx, miny, maxx, maxy = boundary.bounds
        else:
            print(f"Boundary file not found at {boundary_path}, using bounding box.")
            boundary = None
            minx, maxx, miny, maxy = 92.2, 93.8, 25.0, 26.2
        
        points = []
        while len(points) < num_points:
            lon = random.uniform(minx, maxx)
            lat = random.uniform(miny, maxy)
            point = Point(lon, lat)
            if boundary is None or boundary.contains(point):
                # Bias toward south/east (higher lat/lon in this rough box)
                if random.random() < 0.6 and (lat < 25.6 or lon < 93.0):
                    continue
                points.append(point)
        
        features = []
        start_date = datetime(2015, 6, 1)
        for i, pt in enumerate(points):
            random_days = random.randint(0, 9 * 365)
            evt_date = start_date + timedelta(days=random_days)
            # bias towards monsoon (June-Sept)
            if evt_date.month not in [6, 7, 8, 9] and random.random() < 0.8:
                m = random.choice([6, 7, 8, 9])
                import calendar
                max_day = calendar.monthrange(evt_date.year, m)[1]
                evt_date = evt_date.replace(month=m, day=min(evt_date.day, max_day))

            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [pt.x, pt.y]},
                "properties": {
                    "id": f"syn_{i}",
                    "event_date": evt_date.strftime("%Y-%m-%d"),
                    "source": "Synthetic Demo Data",
                    "description": "Synthetic landslide point for Dima Hasao demonstration",
                    "is_demo_data": True
                }
            })
        return features
    except Exception as e:
        print(f"Error generating synthetic landslides: {e}")
        return []

def main():
    print("Starting script 03b: Fetching Landslide Inventory...")
    out_dir = os.path.join("DIMA_HASAO_LANDSLIDE_DATA", "04_landslide_inventory")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "merged_inventory.geojson")

    url = "https://maps.nccs.nasa.gov/arcgis/rest/services/landslide_v3/MapServer/0/query?where=Country+LIKE+%27%25India%25%27&outFields=*&f=geojson"
    bbox = load_study_area_bbox(os.path.join("config", "study_area.yaml"))
    
    features = []
    source = "NASA GLC"
    is_synthetic = False
    
    try:
        print(f"Attempting to fetch data from: {url}")
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        for feature in data.get('features', []):
            coords = feature.get('geometry', {}).get('coordinates', [])
            if coords and len(coords) == 2:
                lon, lat = coords
                if bbox['min_lon'] <= lon <= bbox['max_lon'] and bbox['min_lat'] <= lat <= bbox['max_lat']:
                    feature['properties']['is_demo_data'] = False
                    features.append(feature)
        print(f"Fetched {len(features)} points from NASA GLC.")
    except Exception as e:
        print(f"Failed to fetch or process NASA data: {e}")
    
    if len(features) < 5:
        print("Less than 5 points found. Falling back to synthetic data generation.")
        is_synthetic = True
        boundary_path = os.path.join("DIMA_HASAO_LANDSLIDE_DATA", "00_boundary", "dima_hasao_boundary.geojson")
        features = generate_synthetic_landslides(boundary_path, num_points=100)
        source = "Synthetic Demo Data"
    
    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    
    try:
        with open(out_file, 'w') as f:
            json.dump(feature_collection, f, indent=2)
        print(f"Saved {len(features)} landslide points to {out_file}")
        print(f"Status: Success | Source: {source} | Synthetic: {is_synthetic}")
    except Exception as e:
        print(f"Error saving file {out_file}: {e}")

if __name__ == '__main__':
    main()
