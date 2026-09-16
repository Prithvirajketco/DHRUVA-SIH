"""
Script 00: Generate synthetic GeoTIFFs for DEM, slope, and rainfall
when real downloads are unavailable. Produces geographically plausible
data for Dima Hasao (hilly terrain, Assam monsoon rainfall).

This is DEMO DATA and is clearly labelled as such.
"""

import os
import numpy as np
import rasterio
from rasterio.transform import from_bounds

# Dima Hasao bounding box (WGS84)
MIN_LON, MAX_LON = 92.2, 93.8
MIN_LAT, MAX_LAT = 25.0, 26.2

# Grid resolution (0.01 degrees ≈ 1 km)
RES = 0.01
COLS = int((MAX_LON - MIN_LON) / RES)
ROWS = int((MAX_LAT - MIN_LAT) / RES)

BASE_DIR = "DIMA_HASAO_LANDSLIDE_DATA"

def make_transform():
    return from_bounds(MIN_LON, MIN_LAT, MAX_LON, MAX_LAT, COLS, ROWS)

def write_tif(path, data, dtype='float32', nodata=-9999.0):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    transform = make_transform()
    with rasterio.open(
        path, 'w', driver='GTiff',
        height=ROWS, width=COLS,
        count=1, dtype=dtype,
        crs='EPSG:4326', transform=transform,
        nodata=nodata
    ) as dst:
        dst.write(data.astype(dtype), 1)
    print(f"  [DEMO] Wrote {path}  shape={data.shape}")

def generate_all():
    print("Generating synthetic GeoTIFFs for Dima Hasao [DEMO DATA]...\n")

    np.random.seed(42)

    # --- DEM (elevation) ---
    # Dima Hasao is hilly: 200-1800 m. Higher in south-east.
    # Create a smooth gradient + noise
    lon_grid = np.linspace(MIN_LON, MAX_LON, COLS)
    lat_grid = np.linspace(MAX_LAT, MIN_LAT, ROWS)  # top-to-bottom
    lon_2d, lat_2d = np.meshgrid(lon_grid, lat_grid)

    # Base: higher in SE (low lat, high lon)
    elevation = (
        400
        + 600 * ((MAX_LON - lon_2d) / (MAX_LON - MIN_LON))   # higher in west
        + 800 * ((MAX_LAT - lat_2d) / (MAX_LAT - MIN_LAT))   # higher in south
        + 200 * np.random.randn(ROWS, COLS)                    # noise
    ).clip(50, 1900).astype('float32')

    dem_path = os.path.join(BASE_DIR, "01_dem", "dem_processed.tif")
    dem_raw_path = os.path.join(BASE_DIR, "01_dem", "dem_raw.tif")
    write_tif(dem_path, elevation)
    write_tif(dem_raw_path, elevation)

    # --- Slope (degrees) ---
    # Derived from elevation gradient; high elevation areas have steeper slopes
    dy, dx = np.gradient(elevation, RES * 111000, RES * 111000)  # approx meters
    slope = np.degrees(np.arctan(np.sqrt(dx**2 + dy**2))).clip(0, 70).astype('float32')

    slope_path = os.path.join(BASE_DIR, "02_slope", "slope.tif")
    write_tif(slope_path, slope)

    # --- Rainfall 24h (mm) ---
    # Assam monsoon: 50-300 mm/day at peak. Higher in SW (windward side).
    rainfall_24h = (
        80
        + 150 * (1 - (lon_2d - MIN_LON) / (MAX_LON - MIN_LON))   # wetter in west
        + 50  * np.random.rand(ROWS, COLS)
        + 30  * np.random.randn(ROWS, COLS)
    ).clip(10, 350).astype('float32')

    r24_path = os.path.join(BASE_DIR, "03_rainfall", "daily", "rainfall_24h.tif")
    os.makedirs(os.path.dirname(r24_path), exist_ok=True)
    write_tif(r24_path, rainfall_24h)

    # --- Rainfall 72h (mm) ---
    rainfall_72h = (rainfall_24h * 2.5 + 30 * np.random.randn(ROWS, COLS)).clip(30, 900).astype('float32')
    r72_path = os.path.join(BASE_DIR, "03_rainfall", "3day", "rainfall_72h.tif")
    os.makedirs(os.path.dirname(r72_path), exist_ok=True)
    write_tif(r72_path, rainfall_72h)

    print("\n[DEMO] All synthetic GeoTIFFs generated successfully.")
    print(f"  Grid: {ROWS} x {COLS} pixels @ {RES}° (~1 km) resolution")
    print("  Elevation range: 50 – 1900 m")
    print("  Slope range: 0 – 70°")
    print("  Rainfall 24h: 10 – 350 mm")

if __name__ == "__main__":
    generate_all()
