import osmnx as ox
import geopandas as gpd
import os

def fetch_dima_hasao_boundary(output_path):
    """
    Fetches the administrative boundary of Dima Hasao using OpenStreetMap data
    and saves it as a GeoJSON file.
    """
    print("Fetching Dima Hasao boundary from OpenStreetMap...")
    place_name = "Dima Hasao, Assam, India"
    
    try:
        # Fetch the geometry from OSM
        gdf = ox.geocode_to_gdf(place_name)
        
        # Select the polygon/multipolygon geometry
        boundary = gdf[['geometry', 'display_name']]
        
        # Save to file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        boundary.to_file(output_path, driver="GeoJSON")
        print(f"Successfully saved boundary to {output_path}")
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        print("Please ensure you have an internet connection and osmnx is installed.")
        print("Alternatively, manually place the boundary GeoJSON in the 00_boundary folder.")

if __name__ == "__main__":
    output_geojson = "../DIMA_HASAO_LANDSLIDE_DATA/00_boundary/dima_hasao_boundary.geojson"
    
    # Run from the scripts directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    fetch_dima_hasao_boundary(output_geojson)
