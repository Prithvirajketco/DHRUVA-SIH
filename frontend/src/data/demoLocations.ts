export interface DemoLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  rainfall: number;
  slope: number;
  elevation: number;
  soil_moisture: number;
  historical_landslides: number;
  ground_deformation: number; // 0-100 scale
}

export const DIMA_HASAO_LOCATIONS: DemoLocation[] = [
  { id: 'loc-1', name: 'Haflong', lat: 25.176, lon: 93.023, rainfall: 15, slope: 37, elevation: 820, soil_moisture: 45, historical_landslides: 4, ground_deformation: 8 },
  { id: 'loc-2', name: 'Mahur', lat: 25.172, lon: 93.111, rainfall: 5, slope: 29, elevation: 650, soil_moisture: 35, historical_landslides: 2, ground_deformation: 3 },
  { id: 'loc-3', name: 'Umrangso', lat: 25.523, lon: 92.730, rainfall: 0, slope: 18, elevation: 420, soil_moisture: 25, historical_landslides: 1, ground_deformation: 1 },
  { id: 'loc-4', name: 'Maibong', lat: 25.301, lon: 93.136, rainfall: 2, slope: 22, elevation: 350, soil_moisture: 30, historical_landslides: 2, ground_deformation: 2 },
  { id: 'loc-5', name: 'Harangajao', lat: 25.044, lon: 92.932, rainfall: 25, slope: 32, elevation: 710, soil_moisture: 55, historical_landslides: 3, ground_deformation: 10 },
  { id: 'loc-6', name: 'Diyungbra', lat: 25.405, lon: 92.845, rainfall: 0, slope: 15, elevation: 310, soil_moisture: 20, historical_landslides: 0, ground_deformation: 0 },
  { id: 'loc-7', name: 'Jatinga', lat: 25.122, lon: 93.024, rainfall: 35, slope: 41, elevation: 850, soil_moisture: 60, historical_landslides: 5, ground_deformation: 12 },
  { id: 'loc-8', name: 'Khepre', lat: 25.260, lon: 93.200, rainfall: 0, slope: 25, elevation: 480, soil_moisture: 25, historical_landslides: 1, ground_deformation: 2 },
  { id: 'loc-9', name: 'Gunjung', lat: 25.350, lon: 92.990, rainfall: 8, slope: 28, elevation: 600, soil_moisture: 40, historical_landslides: 2, ground_deformation: 4 },
  { id: 'loc-10', name: 'Dehangi',  lat: 25.210, lon: 93.080, rainfall: 12, slope: 30, elevation: 680, soil_moisture: 42, historical_landslides: 3, ground_deformation: 5 },
  { id: 'loc-11', name: 'Langting', lat: 25.476, lon: 93.023, rainfall: 2, slope: 20, elevation: 290, soil_moisture: 30, historical_landslides: 1, ground_deformation: 1  }
];
