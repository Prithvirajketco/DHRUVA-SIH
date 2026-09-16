"""
Script 06: Run Inference
Loads the trained model and predicts risk scores across the Dima Hasao grid.
Resamples all feature rasters to a common shape before stacking.
Outputs: risk_scores.tif, risk_category.tif
"""
import os
import json
import joblib
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
import yaml

DATA_DIR  = "DIMA_HASAO_LANDSLIDE_DATA"
MODEL_DIR = os.path.join(DATA_DIR, "12_model")
OUT_DIR   = os.path.join(DATA_DIR, "predictions")

FEATURE_PATHS = {
    "elevation":                   os.path.join(DATA_DIR, "01_dem",    "dem_processed.tif"),
    "slope":                        os.path.join(DATA_DIR, "02_slope",  "slope.tif"),
    "rainfall_24h":                 os.path.join(DATA_DIR, "03_rainfall", "daily", "rainfall_24h.tif"),
    "rainfall_72h":                 os.path.join(DATA_DIR, "03_rainfall", "3day",  "rainfall_72h.tif"),
    "historical_landslide_density": os.path.join(DATA_DIR, "04_landslide_inventory", "density.tif"),
}


def load_raster_resampled(path, target_shape, target_transform, target_crs):
    """Open a raster and resample to target shape, return as float32 array."""
    with rasterio.open(path) as src:
        data = src.read(
            1,
            out_shape=(target_shape[0], target_shape[1]),
            resampling=Resampling.bilinear
        ).astype(np.float32)
        nodata = src.nodata
    if nodata is not None:
        data[data == nodata] = np.nan
    return data


def make_density_raster(inventory_path, ref_path, out_path):
    """Compute a simple landslide density raster from inventory GeoJSON."""
    import json as _json
    with rasterio.open(ref_path) as src:
        shape  = src.shape
        transform = src.transform
        crs    = src.crs

    density = np.zeros(shape, dtype=np.float32)
    try:
        with open(inventory_path) as f:
            inv = _json.load(f)
        for feat in inv.get("features", []):
            coords = feat.get("geometry", {}).get("coordinates", [])
            if len(coords) == 2:
                lon, lat = coords
                row, col = rasterio.transform.rowcol(transform, lon, lat)
                if 0 <= row < shape[0] and 0 <= col < shape[1]:
                    # Splat a 5-cell gaussian blob around each point
                    for dr in range(-5, 6):
                        for dc in range(-5, 6):
                            r2, c2 = row+dr, col+dc
                            if 0 <= r2 < shape[0] and 0 <= c2 < shape[1]:
                                density[r2, c2] += np.exp(-(dr**2 + dc**2) / 8.0)
        # Normalize to 0–1
        dmax = density.max()
        if dmax > 0:
            density /= dmax
    except Exception as e:
        print(f"  Warning: could not compute density from inventory: {e}")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with rasterio.open(
        out_path, 'w', driver='GTiff',
        height=shape[0], width=shape[1],
        count=1, dtype=np.float32,
        crs=crs, transform=transform, nodata=-9999
    ) as dst:
        dst.write(density, 1)
    print(f"  Saved density raster → {out_path}")
    return density


def main():
    print("Starting script 06: Running Inference...")
    os.makedirs(OUT_DIR, exist_ok=True)

    # Load thresholds
    try:
        with open(os.path.join("config", "thresholds.yaml")) as f:
            thresholds = yaml.safe_load(f)["risk_thresholds"]
    except Exception:
        thresholds = {"low": 0.25, "moderate": 0.50, "high": 0.75}

    # Load model
    model = None
    for candidate in ["randomforest_v1.pkl", "logisticregression_v1.pkl"]:
        mp = os.path.join(MODEL_DIR, candidate)
        if os.path.exists(mp):
            try:
                model = joblib.load(mp)
                print(f"  Loaded model: {mp}")
                break
            except Exception as e:
                print(f"  Could not load {mp}: {e}")

    # ── Determine reference shape from DEM ──────────────────────────────────
    ref_path = FEATURE_PATHS["elevation"]
    if not os.path.exists(ref_path):
        print(f"  ERROR: DEM not found at {ref_path}. Cannot run inference.")
        return

    with rasterio.open(ref_path) as src:
        ref_shape     = src.shape        # (rows, cols)
        ref_transform = src.transform
        ref_crs       = src.crs

    print(f"  Reference grid: {ref_shape[0]}×{ref_shape[1]} pixels  CRS={ref_crs}")

    # ── Generate density raster if missing ──────────────────────────────────
    density_path     = FEATURE_PATHS["historical_landslide_density"]
    inventory_path   = os.path.join(DATA_DIR, "04_landslide_inventory", "merged_inventory.geojson")
    if not os.path.exists(density_path):
        print("  Computing historical landslide density raster...")
        make_density_raster(inventory_path, ref_path, density_path)

    # ── Load & resample all feature rasters ─────────────────────────────────
    feature_names = ["elevation", "slope", "rainfall_24h", "rainfall_72h",
                     "historical_landslide_density"]
    rasters = {}
    for name in feature_names:
        path = FEATURE_PATHS[name]
        if os.path.exists(path):
            rasters[name] = load_raster_resampled(path, ref_shape, ref_transform, ref_crs)
            print(f"  Loaded {name}: shape={rasters[name].shape}  "
                  f"range=[{np.nanmin(rasters[name]):.2f}, {np.nanmax(rasters[name]):.2f}]")
        else:
            print(f"  WARNING: {path} missing — using zeros for {name}")
            rasters[name] = np.zeros(ref_shape, dtype=np.float32)

    # ── Build flat feature matrix ────────────────────────────────────────────
    flat = {n: rasters[n].flatten() for n in feature_names}
    stack = np.column_stack([flat[n] for n in feature_names])   # (N, 5)

    valid = (
        ~np.isnan(stack).any(axis=1)
        & (stack != -9999.0).all(axis=1)
    )
    print(f"  Valid pixels: {valid.sum()} / {len(valid)}")

    scores = np.full(stack.shape[0], -9999.0, dtype=np.float32)

    if model is not None and valid.sum() > 0:
        # Normalise features for model (match training scale)
        X = stack[valid].copy()

        # Check if model can predict 2 classes
        try:
            proba = model.predict_proba(X)
            if proba.shape[1] >= 2:
                scores[valid] = proba[:, 1].astype(np.float32)
            else:
                scores[valid] = proba[:, 0].astype(np.float32)
            print(f"  Model inference complete. score range: "
                  f"[{scores[valid].min():.3f}, {scores[valid].max():.3f}]")
        except Exception as e:
            print(f"  Model predict failed ({e}). Generating terrain-based heuristic scores.")
            # Terrain heuristic: steep slope + high rainfall + high density → high risk
            elev_n  = np.clip(flat["elevation"][valid] / 1900.0, 0, 1)
            slope_n = np.clip(flat["slope"][valid]    / 70.0,   0, 1)
            rain_n  = np.clip(flat["rainfall_24h"][valid] / 350.0, 0, 1)
            hist_n  = flat["historical_landslide_density"][valid]
            scores[valid] = (0.1*elev_n + 0.35*slope_n + 0.35*rain_n + 0.20*hist_n).astype(np.float32)
    else:
        print("  No model — using terrain-based heuristic scores.")
        elev_n  = np.clip(flat["elevation"]  / 1900.0, 0, 1)
        slope_n = np.clip(flat["slope"]      / 70.0,   0, 1)
        rain_n  = np.clip(flat["rainfall_24h"] / 350.0, 0, 1)
        hist_n  = flat["historical_landslide_density"]
        heuristic = (0.1*elev_n + 0.35*slope_n + 0.35*rain_n + 0.20*hist_n).astype(np.float32)
        scores[valid] = heuristic[valid]

    scores_2d = scores.reshape(ref_shape)

    # ── Categorise ───────────────────────────────────────────────────────────
    lo = thresholds.get("low",      0.25)
    mo = thresholds.get("moderate", 0.50)
    hi = thresholds.get("high",     0.75)

    cats = np.full(ref_shape, -9999, dtype=np.int32)
    m = scores_2d != -9999.0
    cats[m & (scores_2d < lo)]              = 1
    cats[m & (scores_2d >= lo) & (scores_2d < mo)] = 2
    cats[m & (scores_2d >= mo) & (scores_2d < hi)] = 3
    cats[m & (scores_2d >= hi)]             = 4

    # ── Save outputs ─────────────────────────────────────────────────────────
    meta = {
        "driver": "GTiff", "height": ref_shape[0], "width": ref_shape[1],
        "count": 1, "crs": ref_crs, "transform": ref_transform
    }

    score_path = os.path.join(OUT_DIR, "risk_scores.tif")
    with rasterio.open(score_path, "w", dtype=np.float32, nodata=-9999.0, **meta) as dst:
        dst.write(scores_2d, 1)
    print(f"  Saved {score_path}")

    cat_path = os.path.join(OUT_DIR, "risk_category.tif")
    with rasterio.open(cat_path, "w", dtype=np.int32, nodata=-9999, **meta) as dst:
        dst.write(cats, 1)
    print(f"  Saved {cat_path}")

    valid_cats = cats[cats != -9999]
    unique, counts = np.unique(valid_cats, return_counts=True)
    print("\n  Pixel counts by risk category:")
    labels = {1: "Low", 2: "Moderate", 3: "High", 4: "Very High"}
    for u, c in zip(unique, counts):
        print(f"    {labels.get(u, u):12s}: {c:5d} px")


if __name__ == "__main__":
    main()
