# Product Requirements Document (PRD)
## SIH Landslide Early-Warning & Risk Intelligence Platform
### Coding specification for Antigravity

**Version:** 1.0  
**Date:** 31 August 2026  
**Primary pilot region:** Dima Hasao, Assam, India  
**Project type:** Software / AI + GIS + disaster-risk platform  
**Document purpose:** Convert the team's SIH concept into an implementation-ready specification for building the MVP and then expanding it.

---

# 1. Executive Summary

Build a web-based landslide risk intelligence and early-warning platform for Dima Hasao, Assam.

The platform combines terrain, rainfall, historical landslide, satellite/radar-derived indicators and other relevant environmental factors to produce a spatial landslide-risk score. It should present the result on an interactive map and expose different views/actions for:

- **Citizens:** understand current local risk and receive understandable warnings.
- **Responders:** identify high-risk locations and prioritize field response.
- **Authorities:** monitor district-wide risk, hotspots, trends and supporting evidence.
- **AI/data pipeline:** ingest, validate, preprocess and combine geospatial data for model inference.

The system should be designed so the first demonstrable version works with a small number of high-value factors and can later accept the complete factor set.

The project discussion identified the distinction between:
- **Static factors:** relatively stable terrain/geology/land-use characteristics such as elevation and slope.
- **Dynamic factors:** conditions that change over time, especially rainfall and satellite-observed conditions.

The MVP should not attempt to reproduce every capability of government systems. It should demonstrate an integrated, explainable, localized risk workflow for Dima Hasao.

---

# 2. Source Basis and Scope

This PRD consolidates the project requirements visible in the SIH project discussions and the supplied SIH presentation template.

The supplied template requires the solution to communicate:
- proposed solution,
- detailed explanation,
- problem addressing,
- innovation/uniqueness,
- technical approach,
- technologies,
- methodology/process,
- feasibility/challenges,
- impact/benefits,
- research/references.

The project discussions establish the core direction:
- landslide prediction,
- Dima Hasao as the initial geographic focus,
- terrain/elevation/slope data,
- dynamic rainfall,
- historical landslide inventory,
- Sentinel-1 data,
- investigation of GSI and LHASA,
- AI/model training,
- phased implementation,
- eventual usefulness to citizens, responders and authorities.

**Important:** The exact final list of all 17–18 factors, final model architecture, exact alert thresholds, and production data-provider credentials were not fully specified in the available project material. These are therefore configurable requirements rather than hard-coded assumptions.

---

# 3. Problem Statement

Landslide susceptibility and short-term landslide risk depend on multiple interacting environmental factors. A useful system must combine these heterogeneous datasets, convert them into a common geospatial representation, estimate risk, explain why an area is risky, and communicate the result to different users.

The project needs a practical first version that can:
1. collect relevant geospatial data,
2. preprocess and standardize it,
3. create a training/inference dataset,
4. train or evaluate a landslide-risk model,
5. produce a spatial risk layer,
6. visualize risk on a map,
7. support warning/monitoring workflows.

---

# 4. Product Vision

**One platform that converts geospatial and environmental signals into understandable, location-specific landslide risk intelligence.**

Long-term vision:

`Data Sources → Data Processing → Feature Layers → AI Risk Model → Risk Map → Explainable Alert → Citizen / Responder / Authority Action`

---

# 5. Goals

## 5.1 MVP goals

The MVP must:

- Focus on Dima Hasao.
- Display an interactive map.
- Display a landslide-risk/susceptibility layer.
- Ingest at least:
  - elevation,
  - slope,
  - rainfall,
  - historical landslide inventory.
- Support satellite-derived information as an extensible input, with Sentinel-1 treated as a planned/advanced layer if preprocessing is not ready for the first demo.
- Convert input data to a consistent grid/coordinate system.
- Generate a risk score for each grid cell / spatial unit.
- Show risk categories such as Low / Moderate / High / Very High.
- Provide a location-level explanation using contributing factors.
- Provide a dashboard suitable for an authority/responder demonstration.
- Keep data ingestion and model inference modular.
- Provide APIs so frontend and AI/data-processing components can be developed independently.

## 5.2 Phase-2 goals

- Expand to the full selected factor set.
- Add time-series rainfall and antecedent rainfall.
- Add Sentinel-1 derived features.
- Improve historical inventory quality.
- Train/evaluate multiple models.
- Add uncertainty/confidence.
- Add automated alert generation.
- Add citizen reporting.
- Add responder task/incident workflows.
- Add notification integrations.
- Add model monitoring and data-quality monitoring.
- Expand beyond Dima Hasao after validation.

## 5.3 Non-goals for MVP

Do not make these prerequisites for the first working prototype:

- nationwide deployment,
- perfect landslide prediction,
- fully automated emergency dispatch,
- replacement of official government warning systems,
- real-time processing of every possible satellite product,
- complex mobile apps if the responsive web application can demonstrate the workflow,
- guaranteed prediction of exact landslide time/location.

The system should be described as a **risk/susceptibility and early-warning decision-support system**, not as a guarantee that a landslide will occur.

---

# 6. Users and Personas

## 6.1 Citizen

Needs:
- check risk near a location,
- understand warning severity,
- see simple reasons,
- know what action is recommended,
- optionally report a suspected landslide.

UI priority:
- simplicity,
- map + warning,
- local-language-ready design,
- clear action guidance.

## 6.2 Responder

Needs:
- identify hotspots,
- inspect risk-driving factors,
- view recent conditions,
- prioritize locations,
- track/report incidents.

UI priority:
- map,
- hotspot ranking,
- evidence,
- incident status.

## 6.3 Authority

Needs:
- district-wide situation awareness,
- risk distribution,
- trends,
- affected/high-risk areas,
- historical incidents,
- model confidence,
- operational overview.

UI priority:
- dashboard,
- filters,
- analytics,
- map layers,
- export/reporting.

## 6.4 Data/ML administrator

Needs:
- upload/register datasets,
- validate files,
- monitor processing jobs,
- view model version,
- trigger inference,
- inspect data quality.

---

# 7. Core User Journeys

## Journey A — Citizen checks location

1. User opens platform.
2. User selects/searches a location.
3. System loads the latest available risk result.
4. Map displays risk category.
5. User opens location details.
6. System shows:
   - risk score,
   - category,
   - contributing factors,
   - last updated time,
   - recommended action.
7. User can optionally submit a report.

## Journey B — Responder monitors hotspots

1. Responder logs into dashboard.
2. Selects date/time window.
3. Map shows risk hotspots.
4. System ranks high-risk areas.
5. Responder selects a hotspot.
6. System shows contributing factors and historical incidents.
7. Responder creates/updates an incident or field task.
8. Status becomes visible to authorized users.

## Journey C — Authority monitors district

1. Authority opens dashboard.
2. Sees:
   - current high-risk area count,
   - risk distribution,
   - recent rainfall,
   - recent incidents,
   - model/data timestamp.
3. Authority filters by administrative area.
4. Authority opens hotspot.
5. Authority reviews evidence and confidence.
6. Authority exports a situation summary.

## Journey D — Data pipeline

1. Admin registers dataset.
2. System validates metadata/file.
3. Raw file is stored.
4. Processing job begins.
5. CRS/resolution/bounds/nodata checks run.
6. Data is clipped to study area.
7. Data is resampled/reprojected where required.
8. Derived features are calculated.
9. Feature layer is stored.
10. Model inference consumes standardized features.
11. Risk raster/vector is generated.
12. API exposes the latest risk result.

## Journey E — Model training

1. Historical landslide inventory is loaded.
2. Positive samples are generated from known landslide locations.
3. Negative/background samples are generated using a documented sampling strategy.
4. Environmental factor layers are aligned.
5. Features are extracted for each sample.
6. Training/validation/test split is created using spatially appropriate separation.
7. Model is trained.
8. Metrics are calculated.
9. Model version is stored.
10. Approved model is used for inference.

---

# 8. Functional Requirements

## FR-001 Interactive Map

The system shall provide an interactive geospatial map.

Minimum:
- pan/zoom,
- search/select location,
- risk overlay,
- legend,
- layer toggles,
- click-to-inspect,
- current/latest timestamp.

Recommended:
- OpenStreetMap-compatible basemap,
- administrative boundaries,
- roads/settlements where available,
- historical landslide points/polygons.

## FR-002 Risk Layer

The system shall generate a spatial risk layer.

Each spatial unit should contain:

```text
cell_id
latitude
longitude / geometry
risk_score
risk_category
model_version
prediction_timestamp
confidence (if available)
```

Risk score should be normalized to `0–1` internally.

Example configurable categories:

```text
0.00–0.25 = Low
0.25–0.50 = Moderate
0.50–0.75 = High
0.75–1.00 = Very High
```

Thresholds MUST be configuration values, not hard-coded business logic.

## FR-003 Location Details

When a user clicks a map cell/location, show:

- risk score,
- risk category,
- model timestamp,
- model version,
- confidence/uncertainty if available,
- elevation,
- slope,
- rainfall/current rainfall indicator,
- historical landslide proximity/count,
- satellite-derived indicator if available,
- other available factors,
- top risk contributors,
- recommended action.

## FR-004 Rainfall

Support rainfall as a dynamic factor.

Data model should support:

```text
rainfall_1h
rainfall_3h
rainfall_6h
rainfall_24h
rainfall_72h
rainfall_7d
rainfall_anomaly
```

Not all fields are required for MVP. The schema should allow them.

## FR-005 Terrain

Support static terrain features.

Minimum:
- elevation,
- slope.

Extensible:
- aspect,
- curvature,
- relief,
- terrain ruggedness,
- drainage-related indices.

## FR-006 Historical Landslide Inventory

The system shall support historical landslide records with:

```text
event_id
geometry
event_date
source
location
confidence/quality if available
optional size
optional trigger
optional description
```

Inventory may be point, line or polygon source data, but the preprocessing pipeline should convert it into a standardized representation for modelling.

## FR-007 Satellite Layer

The architecture shall support Sentinel-1-derived data.

Potential feature families:
- backscatter,
- temporal change,
- coherence/change indicators where a suitable workflow is available,
- other derived deformation/change features.

MVP may show a placeholder/data-ready state if the full Sentinel-1 processing pipeline is not yet stable.

## FR-008 Data Ingestion

Support common geospatial formats:

- GeoTIFF,
- GeoJSON,
- Shapefile/ZIP,
- CSV with coordinates.

Every dataset must have metadata:

```text
dataset_id
name
source
factor
format
crs
resolution
time_start
time_end
spatial_extent
ingested_at
quality_status
version
```

## FR-009 Data Validation

Validation must check:

- file exists,
- readable format,
- CRS exists,
- valid geometry where applicable,
- coordinate bounds,
- nodata percentage,
- spatial overlap with Dima Hasao,
- expected resolution,
- missing values,
- duplicate records,
- timestamp validity for temporal data.

Invalid data should not silently enter model inference.

## FR-010 Preprocessing

The pipeline shall:

1. load raw dataset,
2. validate,
3. clip to study boundary,
4. reproject to common CRS,
5. resample to common grid,
6. normalize/transform where required,
7. handle missing values,
8. generate derived features,
9. save processed layer,
10. record processing metadata.

## FR-011 Feature Stack

Create a common feature stack where every cell has aligned features.

Example:

```text
cell_id
elevation
slope
rainfall_24h
rainfall_72h
historical_landslide_density
distance_to_landslide
sentinel_feature_1
...
```

The exact full factor list should be configurable.

## FR-012 Model Training

The backend shall support at least one baseline classification/regression model.

Recommended development order:

1. Logistic Regression baseline.
2. Random Forest baseline.
3. Gradient boosting model.
4. Advanced spatial/deep-learning model only if justified by data volume and validation results.

Model choice must be driven by validation performance, interpretability, data availability and compute requirements—not by complexity alone.

## FR-013 Model Output

Inference shall produce:

```text
risk_score
risk_category
model_version
prediction_timestamp
confidence/uncertainty
```

The output must be queryable by geometry/location.

## FR-014 Explainability

For every prediction, expose the major contributing features.

For tree models, use feature importance/SHAP-style explanations where practical.

Citizen-facing explanation must translate technical factors into plain language.

Example:

```text
High risk because:
• recent rainfall is high
• slope is steep
• historical landslides are nearby
```

The exact wording should be generated from structured factor values, not from unconstrained AI hallucination.

## FR-015 Alerts

The system should support configurable alert rules.

Example:

```text
IF risk_score >= configured_threshold
AND rainfall_trigger_condition is satisfied
THEN create warning candidate
```

Alert states:

```text
NORMAL
WATCH
ALERT
HIGH_ALERT
```

Alert rules must be configurable and auditable.

## FR-016 Incident Reporting

Authorized users/citizens may submit:

```text
report_id
location
time
description
photo(s) if implemented
reporter_type
status
created_at
```

Status:

```text
NEW
UNDER_REVIEW
VERIFIED
REJECTED
RESOLVED
```

## FR-017 Hotspot Ranking

Responders/authorities shall be able to see the highest-risk areas.

Ranking should support:
- risk score,
- administrative area,
- rainfall condition,
- recent incident count,
- time window.

## FR-018 Dashboard

Dashboard cards:

- current high-risk cells,
- very-high-risk cells,
- recent rainfall,
- recent landslide reports,
- latest model update,
- data freshness,
- top hotspots.

Charts:
- risk distribution,
- rainfall trend,
- landslide event timeline,
- hotspot trend.

## FR-019 Search and Filters

Filters should include:
- location,
- administrative boundary,
- risk category,
- date/time,
- factor/layer,
- incident status.

## FR-020 Auditability

Store:
- data source,
- dataset version,
- processing version,
- model version,
- inference timestamp,
- threshold version,
- user action where applicable.

---

# 9. Data Requirements

## 9.1 Factor architecture

Factors should be divided into four practical groups for project management:

### A. Terrain / topography
Examples:
- elevation,
- slope,
- aspect,
- curvature,
- relief/ruggedness.

### B. Hydrology / rainfall
Examples:
- rainfall intensity,
- cumulative rainfall,
- antecedent rainfall,
- drainage-related indicators.

### C. Geology / land / environment
Potential examples:
- lithology/geology,
- soil,
- land cover,
- vegetation,
- distance to roads/streams/faults where relevant.

### D. Historical / remote sensing / human activity
Examples:
- historical landslide inventory,
- Sentinel-1-derived indicators,
- proximity to previous landslides,
- road-cut/settlement indicators where reliable data exists.

**Note:** This grouping is an implementation structure. The final 17–18 factor inventory from the team's research should be inserted into `config/factors.yaml` before final model training.

## 9.2 Static vs dynamic

### Static

Changes slowly or rarely:

- elevation,
- slope,
- aspect,
- geology,
- soil,
- long-term land characteristics.

### Dynamic

Changes with time:

- rainfall,
- rainfall accumulation,
- satellite observations,
- vegetation/change indicators,
- active/temporary ground-condition indicators.

The frontend must display the data timestamp so users know whether a layer is current or historical.

---

# 10. Recommended Data Pipeline

```text
                 ┌──────────────────┐
                 │ External Sources  │
                 └────────┬─────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
       Terrain         Rainfall        Landslide
       DEM/Slope       Time Series      Inventory
          │               │                │
          └───────────────┼────────────────┘
                          │
                    Satellite Data
                          │
                          ▼
                 ┌─────────────────┐
                 │ Raw Data Store  │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │ Validation      │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │ Preprocessing   │
                 │ CRS/Clip/Grid   │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │ Feature Stack   │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │ ML Model        │
                 │ Train / Infer   │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │ Risk Layer      │
                 └────────┬────────┘
                          ▼
             ┌────────────┼─────────────┐
             ▼            ▼             ▼
          Citizen      Responder     Authority
             │            │             │
             └────────────┼─────────────┘
                          ▼
                    Action / Alert
```

---

# 11. Proposed Technical Architecture

## 11.1 Frontend

Recommended:
- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- MapLibre GL JS or Leaflet
- Recharts/ECharts for dashboard visualizations

Frontend responsibilities:
- map,
- dashboard,
- risk legend,
- layer controls,
- location details,
- authentication UI,
- incident reports,
- alerts,
- responsive design.

## 11.2 Backend

Recommended:
- Python
- FastAPI
- Pydantic
- SQLAlchemy

Responsibilities:
- authentication/authorization,
- REST APIs,
- risk queries,
- dataset metadata,
- model inference,
- alerts,
- incident reports,
- dashboard aggregation.

## 11.3 Geospatial processing

Recommended Python ecosystem:
- rasterio,
- GDAL,
- geopandas,
- shapely,
- pyproj,
- numpy,
- xarray where temporal raster stacks are required.

## 11.4 ML

Recommended:
- scikit-learn for baseline models,
- XGBoost/LightGBM if available and appropriate,
- SHAP for explanations if used.

Keep the model interface generic:

```python
predict(features) -> RiskPrediction
```

so models can be replaced without changing the frontend.

## 11.5 Database

Recommended:
- PostgreSQL
- PostGIS

Store:
- users,
- roles,
- datasets,
- dataset versions,
- model versions,
- risk metadata,
- incidents,
- alerts,
- administrative boundaries,
- processing jobs.

Large raster files should generally remain in object/file storage rather than being stored as ordinary relational rows.

## 11.6 Storage

Development:
- local filesystem or Docker volume.

Production-ready architecture:
- S3-compatible object storage.

Suggested structure:

```text
data/
  raw/
  processed/
  features/
  models/
  predictions/
  boundaries/
```

---

# 12. API Requirements

Base path:

```text
/api/v1
```

## Public/read endpoints

```http
GET /health
GET /map/risk
GET /map/risk/{cell_id}
GET /locations/search?q=
GET /layers
GET /layers/{layer_id}
GET /alerts
GET /incidents
GET /dashboard/summary
GET /dashboard/hotspots
```

## Authentication

```http
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

## Citizen/responder incident APIs

```http
POST /incidents
GET /incidents/{id}
PATCH /incidents/{id}
POST /incidents/{id}/verify
```

## Admin/data APIs

```http
POST /datasets
GET /datasets
GET /datasets/{id}
POST /datasets/{id}/validate
POST /datasets/{id}/process
GET /jobs/{id}
```

## Model APIs

```http
GET /models
POST /models/train
POST /models/{id}/activate
POST /models/{id}/infer
GET /models/{id}/metrics
```

---

# 13. Example API Response

```json
{
  "cell_id": "dh_18_204",
  "geometry": {
    "type": "Point",
    "coordinates": [93.01, 25.51]
  },
  "risk_score": 0.82,
  "risk_category": "VERY_HIGH",
  "confidence": 0.78,
  "model_version": "rf-v1",
  "prediction_timestamp": "2026-08-31T15:30:00Z",
  "factors": {
    "elevation": 1240.3,
    "slope": 34.8,
    "rainfall_24h": 118.4,
    "historical_landslide_density": 0.71
  },
  "top_contributors": [
    "high recent rainfall",
    "steep slope",
    "nearby historical landslides"
  ]
}
```

---

# 14. Database Schema

## users

```text
id
name
email
password_hash / auth_provider_id
role
created_at
updated_at
```

Roles:

```text
CITIZEN
RESPONDER
AUTHORITY
ADMIN
```

## datasets

```text
id
name
factor
source
format
crs
resolution
time_start
time_end
file_uri
status
version
created_at
```

## processing_jobs

```text
id
dataset_id
status
started_at
finished_at
logs
error_message
```

## model_versions

```text
id
name
algorithm
feature_list
training_dataset_version
metrics_json
artifact_uri
status
created_at
```

## risk_predictions

For MVP metadata:

```text
id
cell_id
risk_score
risk_category
confidence
model_version_id
prediction_time
```

If using a raster output, store the raster in object storage and maintain metadata in the database.

## incidents

```text
id
reporter_id
geometry
event_time
description
media_uri
status
verified_by
created_at
updated_at
```

## alerts

```text
id
geometry
severity
risk_score
trigger_reason
status
created_at
expires_at
```

---

# 15. ML / Data Science Requirements

## 15.1 Training dataset

Each training row represents a spatial sample:

```text
sample_id
geometry
label
elevation
slope
rainfall_features...
historical_features...
satellite_features...
other_features...
```

Label definition must be documented.

Example:

```text
1 = landslide-positive sample
0 = non-landslide/background sample
```

Do not randomly split nearby pixels without checking spatial leakage.

## 15.2 Sampling

Preferred:
- event-based positive samples from historical inventory,
- carefully selected negative/background samples,
- spatially separated validation/test areas.

## 15.3 Baseline model

Start with Random Forest because it:
- handles nonlinear relationships,
- works with mixed-scale features,
- is relatively easy to explain,
- can provide feature importance,
- is practical for an MVP.

Benchmark it against a simple baseline such as Logistic Regression.

## 15.4 Metrics

At minimum:
- precision,
- recall,
- F1,
- ROC-AUC where appropriate,
- PR-AUC for imbalanced data,
- confusion matrix.

For spatial risk maps, additionally inspect:
- false-negative hotspots,
- spatial consistency,
- calibration if probabilities are interpreted as risk,
- performance across geographic subregions.

## 15.5 Leakage prevention

Never allow future information to enter a historical prediction.

Examples:
- future rainfall cannot be used for past-event labels,
- post-landslide imagery must not accidentally become a predictor of pre-landslide risk,
- duplicated landslide polygons must not appear in both train and test.

---

# 16. Risk Engine

The risk engine must be independent from the UI.

Interface:

```python
class RiskEngine:
    def predict(self, feature_stack) -> RiskMap:
        ...
```

Pipeline:

```text
Input features
      ↓
Schema validation
      ↓
Missing-value handling
      ↓
Feature transformation
      ↓
Model prediction
      ↓
Probability calibration (if used)
      ↓
Risk score 0–1
      ↓
Configurable thresholds
      ↓
Risk category
      ↓
Explanation
```

---

# 17. Alert Engine

Alert engine should not directly equate "high model score" with "confirmed landslide."

It should create a warning candidate using configurable rules.

Example:

```yaml
risk_thresholds:
  watch: 0.50
  alert: 0.70
  high_alert: 0.85

rainfall:
  enabled: true
  minimum_24h_mm: 100
```

The exact thresholds are placeholders and must be calibrated using the project's data and validation results.

Alert record must include:
- why it was triggered,
- data timestamps,
- model version,
- threshold version,
- affected geometry,
- creation time,
- expiry time.

---

# 18. Frontend Pages

## Page 1 — Public Home / Map

Components:
- header,
- location search,
- interactive map,
- risk legend,
- current alert banner,
- layer selector,
- "use my location" if browser permission is granted,
- basic safety/action information.

## Page 2 — Location Risk Detail

Components:
- location name,
- risk score,
- severity,
- factor cards,
- contributing-factor chart,
- historical incidents nearby,
- timestamp,
- recommended action.

## Page 3 — Authority Dashboard

Components:
- KPI cards,
- district risk map,
- hotspot table,
- rainfall trend,
- landslide incident trend,
- alerts,
- data/model freshness.

## Page 4 — Responder Dashboard

Components:
- hotspot map,
- prioritized locations,
- incident list,
- incident details,
- status update.

## Page 5 — Admin/Data

Components:
- dataset list,
- upload/register dataset,
- validation status,
- processing jobs,
- model versions,
- model metrics,
- inference controls.

---

# 19. Map Requirements

Map should support:

### Basemap
- OpenStreetMap or another appropriately licensed basemap.

### Operational layers
- risk raster,
- risk contours/polygons if generated,
- rainfall,
- elevation,
- slope,
- historical landslides,
- administrative boundaries,
- incident reports.

### Interactions
- layer on/off,
- opacity slider,
- click cell,
- legend,
- time selector where temporal layers exist.

### Performance
Do not send huge raw GeoTIFF files directly to the browser.

Preferred:
- pre-generated map tiles,
- vector tiles for vector layers,
- raster tiles/COGs for raster layers,
- API query for selected-cell information.

---

# 20. Data Processing Folder Structure

Recommended repository:

```text
landslide-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── map/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── main.py
│   └── tests/
│
├── ml/
│   ├── data/
│   ├── preprocessing/
│   ├── features/
│   ├── training/
│   ├── inference/
│   ├── evaluation/
│   └── models/
│
├── geospatial/
│   ├── ingestion/
│   ├── preprocessing/
│   ├── tiling/
│   └── scripts/
│
├── config/
│   ├── factors.yaml
│   ├── thresholds.yaml
│   └── study_area.yaml
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── features/
│   └── predictions/
│
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 21. Configuration

Do not hard-code:
- study-area paths,
- factor names,
- risk thresholds,
- model path,
- dataset paths,
- API URLs.

Example:

```yaml
study_area:
  name: "Dima Hasao"
  state: "Assam"
  country: "India"

grid:
  resolution_m: 30

factors:
  - elevation
  - slope
  - rainfall_24h
  - historical_landslide_density

risk_thresholds:
  low: 0.25
  moderate: 0.50
  high: 0.75
```

The grid resolution above is a configurable example, not a mandated final resolution.

---

# 22. MVP Data Strategy

## MVP priority 1

**Elevation**
- Required.
- Static terrain input.

**Slope**
- Derived from elevation/DEM.
- Required.

**Rainfall**
- Required dynamic input.
- Start with a reliable cumulative rainfall metric.

**Historical landslide inventory**
- Required for supervised modelling/validation.
- Must contain dates where possible.

## MVP priority 2

**Sentinel-1**
- Add when a reliable processing pipeline is available.

## MVP priority 3

Add remaining factors after the base pipeline is working.

The key principle is:

`4 strong, validated factors > 18 poorly processed factors`

for the first functional prototype.

---

# 23. Data Source Abstraction

The application must not directly couple model code to a specific provider.

Create interfaces:

```python
class RasterProvider:
    def fetch(self, request) -> RasterDataset:
        ...

class RainfallProvider:
    def fetch(self, request) -> RainfallDataset:
        ...

class LandslideInventoryProvider:
    def fetch(self, request) -> VectorDataset:
        ...

class SatelliteProvider:
    def fetch(self, request) -> SatelliteDataset:
        ...
```

A provider can initially read downloaded files and later be replaced by an automated API/download process.

This prevents external data-source changes from breaking the ML/application layer.

---

# 24. Data Quality Requirements

Every layer must have a quality status:

```text
VALID
WARNING
INVALID
STALE
```

Quality checks should include:

- spatial coverage,
- missing pixels,
- temporal freshness,
- CRS,
- resolution,
- value ranges.

Example:
- negative slope → invalid,
- impossible rainfall value → warning/invalid depending on source,
- missing CRS → invalid.

---

# 25. Security

Minimum:
- password hashing if local authentication is used,
- JWT/session-based authorization,
- role-based access control,
- input validation,
- upload size/type restrictions,
- no secrets in source code,
- `.env` for credentials,
- audit log for privileged actions.

Citizen location/report information should be handled conservatively.

---

# 26. Reliability and Error Handling

Backend should return structured errors:

```json
{
  "error": {
    "code": "DATASET_INVALID",
    "message": "Dataset CRS is missing",
    "request_id": "..."
  }
}
```

Long-running tasks such as:
- raster processing,
- Sentinel processing,
- model training,
- district-wide inference

must run as background jobs rather than blocking HTTP requests.

---

# 27. Observability

Log:
- API errors,
- processing jobs,
- model inference,
- data validation,
- alert creation,
- authentication failures.

Track:
- processing duration,
- dataset freshness,
- inference duration,
- number of valid/invalid cells,
- model version.

---

# 28. Testing Requirements

## Unit tests

Test:
- factor calculations,
- normalization,
- risk thresholding,
- API validation,
- alert rules,
- model input schema.

## Data tests

Test:
- CRS,
- extent,
- nodata,
- geometry validity,
- expected ranges.

## Integration tests

Test:

```text
upload → validate → process → feature stack → inference → API → map
```

## UI tests

Test:
- map loads,
- risk layer toggles,
- cell click works,
- dashboard loads,
- incident submission works.

## Model tests

Test:
- reproducibility,
- feature schema,
- no train/test leakage,
- metrics generation,
- model artifact loading.

---

# 29. Definition of Done — MVP

The MVP is considered complete when all are true:

### Data
- [ ] Dima Hasao study boundary available.
- [ ] Elevation layer processed.
- [ ] Slope generated.
- [ ] Rainfall layer/time series available.
- [ ] Historical landslide inventory loaded.
- [ ] All four layers share a documented spatial reference/grid strategy.

### ML
- [ ] Training dataset generated.
- [ ] Baseline model trained.
- [ ] Validation metrics recorded.
- [ ] Model artifact versioned.
- [ ] Inference pipeline works.
- [ ] Risk score generated spatially.
- [ ] Risk categories generated.

### Backend
- [ ] API runs locally.
- [ ] Risk map endpoint works.
- [ ] Location detail endpoint works.
- [ ] Dashboard endpoints work.
- [ ] Model metadata is exposed.
- [ ] Health check works.

### Frontend
- [ ] Interactive map works.
- [ ] Risk layer works.
- [ ] Legend works.
- [ ] Location details work.
- [ ] Authority/responder dashboard works.
- [ ] Responsive layout works.

### Demo
A user can go from:

`open application → view Dima Hasao → see risk hotspots → click hotspot → see factors → understand why risk is high`

without manual database editing.

---

# 30. SIH Demonstration Flow

The demo should be short and visual:

1. Open Dima Hasao map.
2. Show current risk map.
3. Zoom to a high-risk hotspot.
4. Click hotspot.
5. Show:
   - risk score,
   - rainfall,
   - slope,
   - elevation,
   - historical landslide context.
6. Show explainable reason for the risk.
7. Switch to responder/authority dashboard.
8. Show hotspot ranking and alert.
9. Show historical incident layer.
10. Optionally demonstrate a citizen report.
11. Show model/data timestamp.

The pitch should emphasize that the system integrates heterogeneous geospatial information into an actionable interface.

---

# 31. Suggested Product Differentiation

The product's differentiators should be demonstrated through the actual prototype rather than unsupported claims.

Potential differentiators:

1. **Localized focus**
   - Starts with Dima Hasao rather than attempting an unvalidated national model.

2. **Multi-source fusion**
   - Terrain + rainfall + historical landslide + satellite-ready architecture.

3. **Explainable risk**
   - Shows the factors behind a risk result.

4. **Role-based interface**
   - Same underlying intelligence presented differently to citizen, responder and authority.

5. **Temporal awareness**
   - Separates static susceptibility factors from dynamic triggering conditions.

6. **Modular data pipeline**
   - New factors/providers can be added without rewriting the entire system.

---

# 32. AI Assistant / Agent Layer

If the team decides to add an AI assistant, it must sit **on top of verified platform data**, not replace the risk model.

Example questions:

- "Why is this area high risk?"
- "Which areas have the highest risk today?"
- "What factors are driving this hotspot?"
- "Show recent high-risk areas."

The assistant should call structured APIs/tools:

```text
User question
   ↓
Intent detection
   ↓
Platform API/tool call
   ↓
Verified data
   ↓
Natural-language response
```

It must not invent risk scores or warnings.

For safety-critical statements, responses should include:
- data timestamp,
- model timestamp,
- disclaimer that the system is decision support,
- direction to follow official emergency instructions where applicable.

---

# 33. Accessibility and UX

Requirements:
- high-contrast risk indicators,
- text labels in addition to map symbology,
- keyboard-accessible controls,
- mobile-responsive layout,
- plain-language explanations,
- avoid relying on color alone,
- clear timestamps,
- clear distinction between observed data and model output.

Future:
- Assamese/local-language support,
- multilingual warning templates.

---

# 34. Deployment

## Development

Use Docker Compose:

```text
frontend
backend
postgres/postgis
worker
```

Optional:
- Redis for job queue/caching.

## Production target

```text
Browser
   ↓
Reverse Proxy
   ↓
Frontend
   ↓
FastAPI
   ├── PostgreSQL/PostGIS
   ├── Object Storage
   ├── ML Service
   └── Worker/Queue
```

---

# 35. Environment Variables

Example:

```text
DATABASE_URL=
SECRET_KEY=
JWT_SECRET=
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
MAP_TILE_URL=
MODEL_STORAGE_PATH=
```

Never commit real credentials.

---

# 36. Antigravity Build Instructions

Build the product incrementally. Do not generate the entire application blindly in one step.

## Sprint 1 — Foundation

Create:
- repository structure,
- frontend shell,
- backend shell,
- PostGIS database,
- Docker Compose,
- health endpoint,
- environment configuration.

Acceptance:
- all services start,
- frontend can call backend,
- database connection succeeds.

## Sprint 2 — Map

Implement:
- map,
- Dima Hasao boundary,
- layer control,
- mock risk raster/vector layer,
- legend,
- location click.

Acceptance:
- map works without ML dependency.

## Sprint 3 — Data pipeline

Implement:
- dataset metadata,
- raster/vector upload/registration,
- validation,
- preprocessing scripts,
- common grid.

Acceptance:
- elevation, slope, rainfall and inventory can be converted to model-ready layers.

## Sprint 4 — Baseline ML

Implement:
- sample generation,
- feature extraction,
- train/validation/test workflow,
- Random Forest baseline,
- metrics,
- model artifact,
- inference.

Acceptance:
- model produces a spatial risk output.

## Sprint 5 — API integration

Connect:
- risk layer,
- location details,
- dashboard,
- hotspots,
- model metadata.

Acceptance:
- frontend displays real model output.

## Sprint 6 — Roles and alerts

Implement:
- role-based access,
- responder dashboard,
- authority dashboard,
- alert engine,
- incident reports.

## Sprint 7 — Explainability and polish

Implement:
- factor contribution display,
- timestamps,
- data freshness,
- responsive UI,
- error states,
- demo workflow.

## Sprint 8 — Advanced factors

Add:
- Sentinel-1 derived features,
- remaining researched factors,
- improved model comparison.

---

# 37. Coding Rules for Antigravity

1. Use TypeScript on the frontend.
2. Use Python/FastAPI on the backend.
3. Keep ML code separate from API routes.
4. Keep geospatial preprocessing separate from ML training.
5. Use PostGIS for spatial metadata/querying.
6. Never hard-code risk thresholds.
7. Never hard-code provider credentials.
8. Every model must have a version.
9. Every prediction must have a timestamp.
10. Every dataset must have source and version metadata.
11. Do not silently discard invalid data.
12. Do not claim real-time data unless the actual pipeline is real-time.
13. Do not expose raw model internals to citizens unless translated into understandable language.
14. Keep mock data clearly labelled as mock/demo data.
15. Use interfaces/abstractions for external data providers.
16. Add tests as each feature is implemented.
17. Prefer a working simple pipeline over premature microservices.
18. Preserve reproducibility: record preprocessing and model configuration.
19. Do not let an LLM generate safety-critical risk values.
20. Do not describe the system as guaranteeing landslide prediction.

---

# 38. Mock Data Strategy

Before all external datasets are integrated, create synthetic/demo layers.

Required demo assets:
- Dima Hasao boundary,
- synthetic elevation raster,
- derived slope,
- synthetic rainfall,
- historical landslide points,
- synthetic risk layer.

**All synthetic data must be visibly labelled DEMO/MOCK in development.**

This lets the frontend/backend team build independently from the data team.

---

# 39. Suggested UI Risk Card

Example:

```text
Dima Hasao — Selected Area

VERY HIGH RISK
Risk score: 0.82
Updated: 31 Aug 2026, 21:30

Main contributing factors
━━━━━━━━━━━━━━━━━━━━
Rainfall       HIGH
Slope          HIGH
Elevation      MODERATE
Historical     HIGH

Why?
Recent rainfall is high and the location
has steep terrain with nearby historical
landslide activity.

Recommended:
Follow local authority advisories and
avoid unnecessary travel through exposed
slopes during severe rainfall.
```

The wording is an example only; final warning language should be reviewed by the team/mentor and, where applicable, relevant authorities.

---

# 40. Data and Model Versioning

Every production/demo prediction must be traceable:

```text
Prediction
 ├── model_version
 ├── feature_schema_version
 ├── dataset_versions
 ├── preprocessing_version
 ├── threshold_version
 └── timestamp
```

Example:

```text
model: rf-v1.2
features: factors-v1.0
elevation: dem-v1
rainfall: rain-2026-08-31
inventory: inventory-v1
thresholds: risk-v1
```

---

# 41. Performance Targets

Initial development targets:

- map initial UI load: target < 3 seconds on a normal development connection,
- ordinary API request: target < 1 second where practical,
- location risk query: target < 1 second for cached/precomputed results,
- district-wide inference: asynchronous job,
- frontend must remain usable on mobile.

These are engineering targets, not guarantees.

---

# 42. Future Expansion

After the Dima Hasao MVP is validated:

1. Add more districts.
2. Add broader Assam coverage.
3. Validate transferability between regions.
4. Introduce region-aware models if one model does not generalize.
5. Add automated data refresh.
6. Add notification channels.
7. Add field-data feedback loops.
8. Retrain using verified new events.
9. Introduce model drift/data drift monitoring.
10. Consider operational integration with authorized agencies.

---

# 43. Open Decisions

The coding team must explicitly resolve these before production ML:

- Final 17–18 factor list.
- Exact data sources for each factor.
- Licensing/usage permission for each dataset.
- Common CRS.
- Common raster resolution.
- Exact Dima Hasao boundary source.
- Historical inventory definition and date range.
- Positive/negative sampling method.
- Model selection after benchmark.
- Risk threshold calibration.
- Alert policy.
- Definition of "real-time" for rainfall/satellite data.
- Final user roles and permissions.
- Official emergency-message wording.
- Whether Sentinel-1 is MVP or Phase 2.
- Final deployment platform.

Do not hide these decisions in code. Put them in configuration/documentation.

---

# 44. Immediate Task List

## Data team

- [ ] Obtain Dima Hasao boundary.
- [ ] Obtain DEM/elevation.
- [ ] Derive slope.
- [ ] Obtain rainfall data.
- [ ] Obtain historical landslide inventory.
- [ ] Document source, date, resolution and format.
- [ ] Identify all remaining factors.
- [ ] Evaluate Sentinel-1 feasibility.

## ML team

- [ ] Define training label.
- [ ] Build feature stack.
- [ ] Create spatially valid train/validation/test split.
- [ ] Train Logistic Regression baseline.
- [ ] Train Random Forest.
- [ ] Compare metrics.
- [ ] Generate first risk map.
- [ ] Produce feature-importance explanation.

## Backend team

- [ ] Create FastAPI project.
- [ ] Create PostGIS schema.
- [ ] Implement dataset metadata APIs.
- [ ] Implement risk APIs.
- [ ] Implement dashboard APIs.
- [ ] Implement incident APIs.
- [ ] Add authentication/roles.

## Frontend team

- [ ] Build map.
- [ ] Build risk legend.
- [ ] Build layer controls.
- [ ] Build location detail card.
- [ ] Build authority dashboard.
- [ ] Build responder dashboard.
- [ ] Build alert UI.

## Integration team

- [ ] Connect real risk output.
- [ ] Verify map alignment.
- [ ] Verify timestamps.
- [ ] Test end-to-end demo.
- [ ] Prepare SIH demonstration.

---

# 45. Final MVP Architecture Summary

```text
             ┌──────────────────────────┐
             │ Terrain / Rain / Events  │
             │ Satellite / Other Data   │
             └────────────┬─────────────┘
                          ▼
                ┌──────────────────┐
                │ Data Ingestion   │
                └────────┬─────────┘
                         ▼
                ┌──────────────────┐
                │ Validation       │
                └────────┬─────────┘
                         ▼
                ┌──────────────────┐
                │ Geo Processing   │
                │ CRS + Grid +     │
                │ Derived Factors  │
                └────────┬─────────┘
                         ▼
                ┌──────────────────┐
                │ Feature Stack    │
                └────────┬─────────┘
                         ▼
                ┌──────────────────┐
                │ ML Risk Model    │
                └────────┬─────────┘
                         ▼
                ┌──────────────────┐
                │ Risk Map +       │
                │ Explanation      │
                └────────┬─────────┘
                         ▼
             ┌───────────┼────────────┐
             ▼           ▼            ▼
         Citizen      Responder    Authority
             │           │            │
             └───────────┼────────────┘
                         ▼
                 Alerts / Reports
```

---

# 46. One-Sentence Build Prompt for Antigravity

> Build a responsive, map-first landslide risk intelligence web platform for Dima Hasao, Assam using React/TypeScript, Python/FastAPI and PostgreSQL/PostGIS, with a modular geospatial data pipeline for elevation, slope, rainfall and historical landslide inventory, a versioned ML risk engine, explainable spatial risk scores, role-based citizen/responder/authority interfaces, configurable alerts, incident reporting, dataset/model metadata, and a development path that can later add Sentinel-1 and the complete researched factor set without rewriting the core architecture.

---

# 47. Success Definition

The project succeeds at the MVP stage when the team can demonstrate:

**Real/validated input data → standardized geospatial features → trained baseline model → spatial risk map → explainable hotspot → actionable role-specific dashboard**

for **Dima Hasao**.

The system should be judged on:
- data correctness,
- spatial alignment,
- model validation,
- explainability,
- usability,
- end-to-end reliability,
- and ability to expand with additional factors.

