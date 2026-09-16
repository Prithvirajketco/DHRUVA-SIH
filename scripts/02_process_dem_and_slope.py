import rasterio
import rasterio.mask
import geopandas as gpd
import numpy as np
import os

def clip_dem_to_boundary(raw_dem_path, boundary_path, out_dem_path):
    print(f"Clipping DEM using boundary: {boundary_path}")
    if not os.path.exists(raw_dem_path):
        print(f"Raw DEM not found at {raw_dem_path}. Please download and place Copernicus DEM here.")
        return False
        
    boundary = gpd.read_file(boundary_path)
    
    with rasterio.open(raw_dem_path) as src:
        # Ensure CRS matches
        boundary = boundary.to_crs(src.crs)
        shapes = [feature["geometry"] for _, feature in boundary.iterrows()]
        
        out_image, out_transform = rasterio.mask.mask(src, shapes, crop=True)
        out_meta = src.meta.copy()
        
        out_meta.update({
            "driver": "GTiff",
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform
        })
        
        with rasterio.open(out_dem_path, "w", **out_meta) as dest:
            dest.write(out_image)
            
    print(f"Saved clipped DEM to {out_dem_path}")
    return True

def calculate_slope(dem_path, out_slope_path):
    print("Calculating slope from DEM...")
    if not os.path.exists(dem_path):
        print("Processed DEM not found. Cannot calculate slope.")
        return
        
    with rasterio.open(dem_path) as src:
        elevation = src.read(1)
        transform = src.transform
        nodata = src.nodata
        
        # Grid resolution
        dx = transform[0]
        dy = -transform[4]  # Pixel size in Y is usually negative
        
        # Calculate gradients using finite difference
        # NOTE: For an MVP, assuming a projected CRS (meters) or pseudo-meters for degree CRS
        # If the DEM is in EPSG:4326 (degrees), the slope value will not be true degrees unless reprojected.
        # For this prototype, we'll use a simple numpy gradient.
        dy, dx = np.gradient(elevation, dy, dx)
        
        # Calculate slope in degrees
        slope = np.arctan(np.sqrt(dx**2 + dy**2)) * (180.0 / np.pi)
        
        # Handle nodata
        if nodata is not None:
            slope[elevation == nodata] = -9999.0
            
        out_meta = src.meta.copy()
        out_meta.update({
            "dtype": 'float32',
            "nodata": -9999.0
        })
        
        with rasterio.open(out_slope_path, "w", **out_meta) as dest:
            dest.write(slope.astype('float32'), 1)
            
    print(f"Saved slope raster to {out_slope_path}")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    raw_dem = "../DIMA_HASAO_LANDSLIDE_DATA/01_dem/dem_raw.tif"
    processed_dem = "../DIMA_HASAO_LANDSLIDE_DATA/01_dem/dem_processed.tif"
    boundary = "../DIMA_HASAO_LANDSLIDE_DATA/00_boundary/dima_hasao_boundary.geojson"
    slope_out = "../DIMA_HASAO_LANDSLIDE_DATA/02_slope/slope.tif"
    
    # We will simulate success or prompt the user if files are missing
    if clip_dem_to_boundary(raw_dem, boundary, processed_dem):
        calculate_slope(processed_dem, slope_out)
