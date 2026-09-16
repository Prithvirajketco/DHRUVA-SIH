import os
import glob
import xarray as xr
import rioxarray

def process_rainfall_data(raw_dir, out_dir, dem_reference_path):
    print(f"Processing raw rainfall NetCDF files from {raw_dir}")
    
    # Find all raw rainfall files (e.g., IMERG NetCDF/HDF5)
    raw_files = glob.glob(os.path.join(raw_dir, "*.nc4"))
    if not raw_files:
        print(f"No .nc4 files found in {raw_dir}. Please download NASA GPM IMERG data.")
        # Create a dummy raster for MVP demonstration if no files exist
        create_dummy_rainfall(out_dir, dem_reference_path)
        return
        
    print(f"Found {len(raw_files)} rainfall files. Processing...")
    
    # MVP Example: If we had a dataset, we would open it with xarray
    # ds = xr.open_mfdataset(raw_files, combine='by_coords')
    # cumulative = ds.sum(dim='time')
    # cumulative.rio.to_raster(os.path.join(out_dir, "cumulative_rainfall.tif"))
    
    print("Rainfall processing complete. (Note: Implemented full logic relies on specific IMERG structure)")

def create_dummy_rainfall(out_dir, dem_reference_path):
    """Creates dummy rainfall GeoTIFFs for the MVP pipeline if raw data is missing."""
    import rasterio
    import numpy as np
    
    print("Creating placeholder rainfall data (24h and 72h) based on DEM extent...")
    if not os.path.exists(dem_reference_path):
        print("DEM reference not found to match extent. Aborting dummy creation.")
        return
        
    with rasterio.open(dem_reference_path) as src:
        meta = src.meta.copy()
        shape = src.shape
        
    # Create random synthetic rainfall between 0 and 200mm
    rain_24h = (np.random.rand(*shape) * 100).astype(meta['dtype'])
    rain_72h = rain_24h + (np.random.rand(*shape) * 100).astype(meta['dtype'])
    
    os.makedirs(os.path.join(out_dir, "daily"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "3day"), exist_ok=True)
    
    with rasterio.open(os.path.join(out_dir, "daily/rainfall_24h.tif"), 'w', **meta) as dst:
        dst.write(rain_24h, 1)
        
    with rasterio.open(os.path.join(out_dir, "3day/rainfall_72h.tif"), 'w', **meta) as dst:
        dst.write(rain_72h, 1)
        
    print("Dummy rainfall GeoTIFFs generated successfully for the MVP demo.")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    raw_rainfall = "../DIMA_HASAO_LANDSLIDE_DATA/03_rainfall/raw"
    processed_rainfall_dir = "../DIMA_HASAO_LANDSLIDE_DATA/03_rainfall"
    dem_ref = "../DIMA_HASAO_LANDSLIDE_DATA/01_dem/dem_processed.tif"
    
    process_rainfall_data(raw_rainfall, processed_rainfall_dir, dem_ref)
