import geopandas as gpd
import pandas as pd
import rasterio
import numpy as np
import os
import glob

def extract_raster_values(points_gdf, raster_path, column_name):
    """Extracts values from a raster at the locations of the given points."""
    if not os.path.exists(raster_path):
        print(f"Warning: Raster {raster_path} not found. Skipping feature {column_name}.")
        points_gdf[column_name] = np.nan
        return points_gdf
        
    with rasterio.open(raster_path) as src:
        # Ensure CRS matches
        points_gdf = points_gdf.to_crs(src.crs)
        coords = [(x, y) for x, y in zip(points_gdf.geometry.x, points_gdf.geometry.y)]
        
        # Sample the raster
        values = [val[0] for val in src.sample(coords)]
        points_gdf[column_name] = values
        
    return points_gdf

def generate_negative_samples(boundary_gdf, num_samples, min_distance_from_positives=None):
    """Generates random points within the boundary to serve as non-landslide samples."""
    # For a real pipeline, we'd ensure these points are far from known landslides
    bounds = boundary_gdf.total_bounds
    
    # Generate random points within bounding box, then filter by boundary polygon
    x = np.random.uniform(bounds[0], bounds[2], num_samples * 3)
    y = np.random.uniform(bounds[1], bounds[3], num_samples * 3)
    
    random_points = gpd.GeoDataFrame(geometry=gpd.points_from_xy(x, y), crs=boundary_gdf.crs)
    
    # Clip to boundary
    valid_points = gpd.clip(random_points, boundary_gdf)
    
    # Take the exact number requested
    if len(valid_points) > num_samples:
        valid_points = valid_points.sample(num_samples)
        
    valid_points['label'] = 0
    return valid_points

def build_dataset(inventory_path, boundary_path, feature_rasters, output_csv):
    print("Building training dataset...")
    
    # 1. Load Positive Samples (Known Landslides)
    if os.path.exists(inventory_path):
        positives = gpd.read_file(inventory_path)
        positives['label'] = 1
    else:
        print(f"Landslide inventory not found at {inventory_path}.")
        print("For MVP demo, generating synthetic positive points...")
        # Create dummy positive samples if no inventory exists yet
        boundary = gpd.read_file(boundary_path)
        positives = generate_negative_samples(boundary, 50)
        positives['label'] = 1 # Fake positives for the sake of pipeline demonstration

    boundary = gpd.read_file(boundary_path)
    
    # 2. Generate Negative Samples (Non-Landslides)
    print("Generating negative/background samples...")
    negatives = generate_negative_samples(boundary, len(positives) * 2)
    
    # Combine
    dataset = pd.concat([positives, negatives], ignore_index=True)
    
    # 3. Extract Features
    for feature_name, raster_path in feature_rasters.items():
        print(f"Extracting {feature_name}...")
        dataset = extract_raster_values(dataset, raster_path, feature_name)
        
    # 4. Clean and Export
    # Drop geometry for standard CSV, but keep lat/lon
    # We must ensure it's in WGS84 for lat/lon representation
    dataset_wgs84 = dataset.to_crs("EPSG:4326")
    dataset_wgs84['lat'] = dataset_wgs84.geometry.y
    dataset_wgs84['lon'] = dataset_wgs84.geometry.x
    
    df = pd.DataFrame(dataset_wgs84.drop(columns=['geometry']))
    
    # Drop rows with nodata values (-9999 or NaNs)
    df.replace(-9999.0, np.nan, inplace=True)
    df.dropna(inplace=True)
    
    df.to_csv(output_csv, index=False)
    print(f"Successfully generated training dataset at {output_csv}")
    print(f"Total samples: {len(df)}")
    print(df.head())

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    inventory = "../DIMA_HASAO_LANDSLIDE_DATA/04_landslide_inventory/merged_inventory.geojson"
    boundary_file = "../DIMA_HASAO_LANDSLIDE_DATA/00_boundary/dima_hasao_boundary.geojson"
    out_csv = "../DIMA_HASAO_LANDSLIDE_DATA/12_model/training.csv"
    
    features = {
        "elevation": "../DIMA_HASAO_LANDSLIDE_DATA/01_dem/dem_processed.tif",
        "slope": "../DIMA_HASAO_LANDSLIDE_DATA/02_slope/slope.tif",
        "rainfall_24h": "../DIMA_HASAO_LANDSLIDE_DATA/03_rainfall/daily/rainfall_24h.tif",
        "rainfall_72h": "../DIMA_HASAO_LANDSLIDE_DATA/03_rainfall/3day/rainfall_72h.tif"
    }
    
    if not os.path.exists(boundary_file):
        print(f"Boundary file missing: {boundary_file}. Please run 01_fetch_boundary.py first.")
    else:
        build_dataset(inventory, boundary_file, features, out_csv)
