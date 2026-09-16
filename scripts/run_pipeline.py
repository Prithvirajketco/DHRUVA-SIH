import os
import subprocess
import time

def run_step(step_name, script_path, expected_output):
    print(f"\n{'='*50}")
    print(f"Running: {step_name}")
    print(f"{'='*50}")
    
    if not os.path.exists(script_path):
        print(f"Skipping {step_name}: Script {script_path} not found.")
        return False

    start_time = time.time()
    try:
        result = subprocess.run(["python", script_path], check=True, text=True)
        success = True
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_path}: {e}")
        success = False
    except Exception as e:
        print(f"Unexpected error: {e}")
        success = False

    elapsed = time.time() - start_time
    
    if expected_output:
        if os.path.exists(expected_output):
            print(f"[{step_name}] -> SUCCESS (Found {expected_output}) in {elapsed:.1f}s")
        else:
            print(f"[{step_name}] -> FAILED (Missing {expected_output}) in {elapsed:.1f}s")
            success = False
    else:
        print(f"[{step_name}] -> Finished in {elapsed:.1f}s")
        
    return success

def main():
    print("Starting SIH Landslide Pipeline...\n")
    start_total = time.time()
    
    steps = [
        ("Step 0:   Generate Synthetic Rasters", "scripts/00_generate_synthetic_rasters.py", "DIMA_HASAO_LANDSLIDE_DATA/01_dem/dem_processed.tif"),
        ("Step 1/7: Fetch boundary", "scripts/01_fetch_boundary.py", "DIMA_HASAO_LANDSLIDE_DATA/00_boundary/dima_hasao_boundary.geojson"),
        ("Step 2/7: Process DEM + Slope", "scripts/02_process_dem_and_slope.py", "DIMA_HASAO_LANDSLIDE_DATA/02_slope/slope.tif"),
        ("Step 3/7: Process Rainfall", "scripts/03_process_rainfall.py", "DIMA_HASAO_LANDSLIDE_DATA/03_rainfall/daily/rainfall_24h.tif"),
        ("Step 3b: Fetch Inventory", "scripts/03b_fetch_landslide_inventory.py", "DIMA_HASAO_LANDSLIDE_DATA/04_landslide_inventory/merged_inventory.geojson"),
        ("Step 4/7: Build Training Dataset", "scripts/04_build_training_dataset.py", "DIMA_HASAO_LANDSLIDE_DATA/12_model/training.csv"),
        ("Step 5/7: Train Model", "scripts/05_train_model.py", "DIMA_HASAO_LANDSLIDE_DATA/12_model/randomforest_v1.pkl"),
        ("Step 6/7: Run Inference", "scripts/06_run_inference.py", "DIMA_HASAO_LANDSLIDE_DATA/predictions/risk_scores.tif"),
        ("Step 7/7: Export GeoJSON", "scripts/07_export_risk_geojson.py", "DIMA_HASAO_LANDSLIDE_DATA/predictions/risk_map.geojson")
    ]
    
    results = []
    for name, script, output in steps:
        res = run_step(name, script, output)
        results.append((name, res))
        
    print(f"\n{'='*50}")
    print("Pipeline Summary")
    print(f"{'='*50}")
    for name, res in results:
        status = "SUCCESS" if res else "FAILED/SKIPPED"
        print(f"{name.ljust(35)} : {status}")
        
    total_elapsed = time.time() - start_total
    print(f"\nTotal Pipeline Runtime: {total_elapsed:.1f}s")

if __name__ == '__main__':
    main()
