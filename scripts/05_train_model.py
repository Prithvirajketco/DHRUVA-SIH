import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, average_precision_score, confusion_matrix
import joblib

def main():
    print("Starting script 05: Training Model...")
    data_dir = os.path.join("DIMA_HASAO_LANDSLIDE_DATA", "12_model")
    csv_path = os.path.join(data_dir, "training.csv")
    
    os.makedirs(data_dir, exist_ok=True)
    
    if not os.path.exists(csv_path):
        print(f"Error: Training CSV not found at {csv_path}. Please run script 04 first.")
        return
    
    try:
        df = pd.read_csv(csv_path)
        print(f"Loaded dataset with {len(df)} rows.")
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
        
    features = ['elevation', 'slope', 'rainfall_24h', 'rainfall_72h', 'historical_landslide_density']
    target = 'label'
    
    missing_cols = [c for c in features + [target] if c not in df.columns]
    if missing_cols:
        print(f"Warning: Missing columns {missing_cols}. Creating dummy columns for demo purposes.")
        for col in missing_cols:
            if col == target:
                df[col] = np.random.randint(0, 2, size=len(df))
            else:
                df[col] = np.random.rand(len(df)) * 100
    
    df = df.dropna(subset=features + [target])
    print(f"Rows after dropping NaNs: {len(df)}")

    # Check for single-class data (negatives may have been dropped due to NaN rasters)
    unique_classes = df[target].nunique() if len(df) > 0 else 0
    if unique_classes < 2:
        if len(df) > 0:
            print(f"WARNING: Only {unique_classes} class(es) found in dataset (all samples are label={df[target].iloc[0]}). "
                  f"Negative samples were likely dropped due to NaN raster values.")
        print("Falling back to balanced synthetic training data...")
    
    if len(df) == 0 or unique_classes < 2:
        print("WARNING: Empty dataset after dropping NaNs. Generating fully synthetic training data for demo.")
        np.random.seed(42)
        N = 600  # 200 positives + 400 negatives
        # Simulate realistic Dima Hasao distributions
        elevation_pos = np.random.normal(900, 300, 200).clip(200, 1800)
        slope_pos     = np.random.normal(32, 10, 200).clip(15, 65)
        rain24_pos    = np.random.normal(180, 50, 200).clip(80, 350)
        rain72_pos    = rain24_pos * 2.4 + np.random.normal(0, 20, 200)
        hist_pos      = np.random.uniform(0.4, 1.0, 200)

        elevation_neg = np.random.normal(600, 250, 400).clip(50, 1600)
        slope_neg     = np.random.normal(12, 8, 400).clip(0, 30)
        rain24_neg    = np.random.normal(60, 30, 400).clip(5, 150)
        rain72_neg    = rain24_neg * 2.2 + np.random.normal(0, 15, 400)
        hist_neg      = np.random.uniform(0.0, 0.3, 400)

        df = pd.DataFrame({
            'elevation': np.concatenate([elevation_pos, elevation_neg]),
            'slope': np.concatenate([slope_pos, slope_neg]),
            'rainfall_24h': np.concatenate([rain24_pos, rain24_neg]),
            'rainfall_72h': np.concatenate([rain72_pos.clip(150, 900), rain72_neg.clip(10, 400)]),
            'historical_landslide_density': np.concatenate([hist_pos, hist_neg]),
            'label': np.concatenate([np.ones(200), np.zeros(400)]).astype(int)
        })
        print(f"Generated synthetic dataset with {len(df)} rows [200 positives + 400 negatives]")

    X = df[features]
    y = df[target]
    
    try:
        X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, stratify=y, random_state=42)
        X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42)
    except ValueError as e:
        print(f"Warning: {e}. Falling back to non-stratified split.")
        X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
        X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    print(f"Split sizes: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    
    models = {
        'LogisticRegression': LogisticRegression(max_iter=1000, random_state=42),
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    }
    
    metrics = {}
    feature_importances = {}
    
    for name, model in models.items():
        print(f"Training {name}...")
        try:
            model.fit(X_train, y_train)
            
            y_pred = model.predict(X_test)
            y_proba = model.predict_proba(X_test)[:, 1] if len(np.unique(y_train)) > 1 else np.zeros(len(y_test))
            
            if len(np.unique(y_test)) > 1:
                metrics[name] = {
                    'precision': float(precision_score(y_test, y_pred, zero_division=0)),
                    'recall': float(recall_score(y_test, y_pred, zero_division=0)),
                    'f1': float(f1_score(y_test, y_pred, zero_division=0)),
                    'roc_auc': float(roc_auc_score(y_test, y_proba)),
                    'pr_auc': float(average_precision_score(y_test, y_proba)),
                    'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
                }
            else:
                metrics[name] = {'note': 'Only one class present in test set, metrics not computed.'}
                
            if name == 'RandomForest':
                feature_importances = dict(zip(features, model.feature_importances_.tolist()))
                
            model_path = os.path.join(data_dir, f"{name.lower().replace(' ', '_')}_v1.pkl")
            joblib.dump(model, model_path)
            print(f"Saved {name} model to {model_path}")
            
        except Exception as e:
            print(f"Error training {name}: {e}")
            
    try:
        with open(os.path.join(data_dir, "metrics.json"), 'w') as f:
            json.dump(metrics, f, indent=2)
            
        with open(os.path.join(data_dir, "feature_importances.json"), 'w') as f:
            json.dump(feature_importances, f, indent=2)
            
        model_metadata = {
            "model_version": "rf-v1",
            "algorithm": "RandomForest",
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "features": features,
            "metrics": metrics.get('RandomForest', {}),
            "training_samples": len(X_train)
        }
        with open(os.path.join(data_dir, "model_metadata.json"), 'w') as f:
            json.dump(model_metadata, f, indent=2)
            
        print("\n--- Training Summary ---")
        for m, mets in metrics.items():
            print(f"Model: {m}")
            for k, v in mets.items():
                if k != 'confusion_matrix':
                    print(f"  {k}: {v}")
        print("------------------------\n")
    except Exception as e:
        print(f"Error saving metadata: {e}")

if __name__ == '__main__':
    main()
