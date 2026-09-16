"""
Script 07: Export Risk GeoJSON
Converts risk rasters to a GeoJSON FeatureCollection for the backend API.
- Reads REAL feature values (meters, degrees, mm) from actual rasters
- Generates human-readable top_contributors from feature importances
- Outputs: predictions/risk_map.geojson, predictions/risk_summary.json
"""
import os
import json
import numpy as np
import rasterio
from rasterio.enums import Resampling
from datetime import datetime, timezone

DATA_DIR = "DIMA_HASAO_LANDSLIDE_DATA"
OUT_DIR  = os.path.join(DATA_DIR, "predictions")

# Real raster paths (actual units: meters, degrees, mm)
REAL_FEATURE_PATHS = {
    "elevation":    os.path.join(DATA_DIR, "01_dem",      "dem_processed.tif"),
    "slope":        os.path.join(DATA_DIR, "02_slope",    "slope.tif"),
    "rainfall_24h": os.path.join(DATA_DIR, "03_rainfall", "daily", "rainfall_24h.tif"),
    "rainfall_72h": os.path.join(DATA_DIR, "03_rainfall", "3day",  "rainfall_72h.tif"),
    "historical_landslide_density": os.path.join(DATA_DIR, "04_landslide_inventory", "density.tif"),
}

CAT_LABELS = {1: "Low", 2: "Moderate", 3: "High", 4: "Very High"}

ACTIONS = {
    "Low":       "No immediate action required. Stay informed about local advisories.",
    "Moderate":  "Monitor local advisories. Avoid unstable slopes during rainfall.",
    "High":      "Avoid travel near slopes. Follow district authority instructions.",
    "Very High": "Evacuate if instructed. Stay away from hillsides and streams.",
}


def load_raster_resampled(path, target_shape):
    """Load a raster resampled to target_shape, return float32 array + nodata."""
    with rasterio.open(path) as src:
        data = src.read(
            1,
            out_shape=(target_shape[0], target_shape[1]),
            resampling=Resampling.bilinear
        ).astype(np.float32)
        nodata = src.nodata
    if nodata is not None:
        data[data == float(nodata)] = np.nan
    return data


def compute_top_contributors(props, feature_importances):
    """Rank features by importance × normalised value → top 3 human labels."""
    LABEL_MAP = {
        "rainfall_24h":                 "High recent rainfall",
        "slope":                        "Steep terrain",
        "historical_landslide_density": "Nearby historical landslides",
        "elevation":                    "High elevation",
        "rainfall_72h":                 "Sustained multi-day rainfall",
    }
    # Normalise each factor
    ranges = {
        "elevation":    (50,   1900),
        "slope":        (0,    70),
        "rainfall_24h": (0,    350),
        "rainfall_72h": (0,    900),
        "historical_landslide_density": (0, 1),
    }
    scores = {}
    for feat, (lo, hi) in ranges.items():
        val   = props.get(feat, 0) or 0
        norm  = max(0.0, min(1.0, (val - lo) / max(hi - lo, 1)))
        imp   = feature_importances.get(feat, 0.2)
        scores[feat] = norm * imp

    ranked = sorted(scores, key=scores.get, reverse=True)[:3]
    return [LABEL_MAP.get(f, f) for f in ranked if scores[f] > 0.01]


def main():
    print("Starting script 07: Export Risk GeoJSON...")
    os.makedirs(OUT_DIR, exist_ok=True)

    score_path = os.path.join(OUT_DIR, "risk_scores.tif")
    cat_path   = os.path.join(OUT_DIR, "risk_category.tif")

    if not os.path.exists(score_path) or not os.path.exists(cat_path):
        print("  ERROR: Run script 06 first.")
        return

    # ── Load model metadata ──────────────────────────────────────────────────
    meta_path = os.path.join(DATA_DIR, "12_model", "model_metadata.json")
    fi_path   = os.path.join(DATA_DIR, "12_model", "feature_importances.json")

    model_version       = "rf-v1"
    prediction_timestamp = datetime.now(timezone.utc).isoformat()

    if os.path.exists(meta_path):
        with open(meta_path) as f:
            meta = json.load(f)
        model_version        = meta.get("model_version", model_version)
        prediction_timestamp = meta.get("trained_at", prediction_timestamp)

    feature_importances = {}
    if os.path.exists(fi_path):
        with open(fi_path) as f:
            feature_importances = json.load(f)

    # Default equal weights if none stored
    if not feature_importances:
        feature_importances = {k: 0.2 for k in REAL_FEATURE_PATHS}

    # ── Load risk rasters ────────────────────────────────────────────────────
    with rasterio.open(score_path) as src:
        scores     = src.read(1).astype(np.float32)
        ref_shape  = src.shape
        transform  = src.transform
        scores[scores == src.nodata] = np.nan

    with rasterio.open(cat_path) as src:
        cats = src.read(1).astype(np.int32)
        cats[cats == src.nodata] = -9999

    # ── Load REAL feature rasters (actual units) ─────────────────────────────
    feat_arrays = {}
    for name, path in REAL_FEATURE_PATHS.items():
        if os.path.exists(path):
            feat_arrays[name] = load_raster_resampled(path, ref_shape)
            print(f"  {name}: [{np.nanmin(feat_arrays[name]):.1f}, "
                  f"{np.nanmax(feat_arrays[name]):.1f}]  "
                  f"(shape {feat_arrays[name].shape})")
        else:
            feat_arrays[name] = np.zeros(ref_shape, dtype=np.float32)
            print(f"  WARNING: {name} raster not found — using zeros")

    # ── Downsample grid for output ───────────────────────────────────────────
    DOWNSAMPLE = 8   # Every 8th pixel → ~80 m / 8 ≈ ~1 km spacing at this grid
    features_list = []
    cat_counts = {1: 0, 2: 0, 3: 0, 4: 0}
    score_sum  = 0.0
    max_score  = 0.0
    rain_values= []

    for row in range(0, ref_shape[0], DOWNSAMPLE):
        for col in range(0, ref_shape[1], DOWNSAMPLE):
            score = float(scores[row, col])
            cat   = int(cats[row, col])

            if np.isnan(score) or cat == -9999 or cat == 0:
                continue

            lon, lat = rasterio.transform.xy(transform, row, col)

            # Build properties from REAL raster values
            props = {
                "cell_id":   f"dh_{row}_{col}",
                "lat":       round(float(lat), 5),
                "lon":       round(float(lon), 5),
                "risk_score":     round(score, 3),
                "risk_category":  cat,
                "risk_label":     CAT_LABELS.get(cat, "Unknown"),
                "model_version":  model_version,
                "prediction_timestamp": prediction_timestamp,
                "is_demo_data":   True,
            }

            # Attach real feature values rounded to sensible precision
            ROUND_FMT = {
                "elevation":    1,   # meters
                "slope":        2,   # degrees
                "rainfall_24h": 1,   # mm
                "rainfall_72h": 1,   # mm
                "historical_landslide_density": 3,
            }
            for name in REAL_FEATURE_PATHS:
                val = float(feat_arrays[name][row, col])
                if np.isnan(val):
                    val = 0.0
                props[name] = round(val, ROUND_FMT[name])

            props["top_contributors"] = compute_top_contributors(props, feature_importances)
            props["recommended_action"] = ACTIONS.get(CAT_LABELS.get(cat, "Low"), "Stay informed.")

            # Small square polygon (0.02° ≈ 2 km)
            d = 0.01
            coords = [
                [lon-d, lat-d], [lon+d, lat-d],
                [lon+d, lat+d], [lon-d, lat+d], [lon-d, lat-d]
            ]

            features_list.append({
                "type": "Feature",
                "geometry": {"type": "Polygon", "coordinates": [coords]},
                "properties": props
            })

            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            score_sum += score
            max_score  = max(max_score, score)
            rain_values.append(props["rainfall_24h"])

    total = len(features_list)
    print(f"\n  Exported {total} grid cells")
    for c, n in cat_counts.items():
        print(f"    {CAT_LABELS[c]:12s}: {n:4d} ({100*n//max(1,total):2d}%)")

    # ── Save GeoJSON ─────────────────────────────────────────────────────────
    geo_path = os.path.join(OUT_DIR, "risk_map.geojson")
    with open(geo_path, "w") as f:
        json.dump({"type": "FeatureCollection", "features": features_list}, f)
    print(f"\n  Saved {geo_path}")

    # ── Save summary ─────────────────────────────────────────────────────────
    summary = {
        "total_cells":          total,
        "low_risk_cells":       cat_counts.get(1, 0),
        "moderate_risk_cells":  cat_counts.get(2, 0),
        "high_risk_cells":      cat_counts.get(3, 0),
        "very_high_risk_cells": cat_counts.get(4, 0),
        "max_risk_score":       round(max_score, 3),
        "mean_risk_score":      round(score_sum / max(1, total), 3),
        "max_rainfall_24h":     round(max(rain_values) if rain_values else 0, 1),
        "model_version":        model_version,
        "prediction_timestamp": prediction_timestamp,
        "is_demo_data":         True,
    }
    sum_path = os.path.join(OUT_DIR, "risk_summary.json")
    with open(sum_path, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"  Saved {sum_path}")
    print(f"\n  max_risk_score={max_score:.3f}  "
          f"max_rain={summary['max_rainfall_24h']} mm  "
          f"model={model_version}")


if __name__ == "__main__":
    main()
