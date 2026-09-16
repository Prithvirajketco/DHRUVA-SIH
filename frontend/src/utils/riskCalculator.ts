import { DemoLocation } from '../data/demoLocations';

export interface RiskResult {
  score: number;
  level: 'SAFE' | 'MEDIUM' | 'HIGH';
  contributors: string[];
  fos: number; // Factor of Safety
}

export function calculateRisk(location: DemoLocation): RiskResult {
  // PHYSICS-INFORMED DIGITAL TWIN PROXY (Infinite Slope Stability Model)
  // Constants for generic Assam loose soil/clay mixture
  const cohesion = 15; // kPa
  const frictionAngle = 28; // degrees
  const soilUnitWeight = 19; // kN/m^3
  const waterUnitWeight = 9.81; // kN/m^3
  const failureDepth = 2.5; // meters (assumed slip surface depth)

  // Convert angles to radians
  const slopeRad = location.slope * (Math.PI / 180);
  const frictionRad = frictionAngle * (Math.PI / 180);

  // Pore Water Pressure (simulated based on rainfall and soil moisture)
  // High rainfall + high moisture = high pore water pressure (destabilizing)
  const saturationRatio = Math.min(1.0, (location.soil_moisture + (location.rainfall * 0.2)) / 100);
  const waterTableHeight = failureDepth * saturationRatio;
  const poreWaterPressure = waterTableHeight * waterUnitWeight;

  // Factor of Safety (FoS) Equation
  // FoS = (c' + (sigma - u) * tan(phi')) / (tau)
  // Where: c' = cohesion, sigma = total stress, u = pore water pressure, phi' = friction angle, tau = shear stress

  const totalStress = soilUnitWeight * failureDepth * Math.cos(slopeRad) * Math.cos(slopeRad);
  const effectiveStress = Math.max(0, totalStress - poreWaterPressure);
  
  const resistingForce = cohesion + (effectiveStress * Math.tan(frictionRad));
  const drivingForce = soilUnitWeight * failureDepth * Math.sin(slopeRad) * Math.cos(slopeRad);

  // Avoid division by zero if flat
  const fos = drivingForce > 0.1 ? resistingForce / drivingForce : 5.0;

  // Map FoS to a 0-100 Risk Score
  // FoS < 1.0 means imminent failure (Risk 80-100)
  // FoS 1.0 - 1.5 means marginal stability (Risk 50-80)
  // FoS > 1.5 means stable (Risk < 50)
  
  let rawScore = 0;
  if (fos <= 1.0) {
    rawScore = 80 + ((1.0 - fos) * 40); // 80 to 100+
  } else if (fos <= 1.5) {
    rawScore = 50 + ((1.5 - fos) * 60); // 50 to 80
  } else {
    rawScore = Math.max(0, 50 - ((fos - 1.5) * 20)); // Below 50
  }
  
  // Add heuristic penalties for historical and deformation data
  const penalty = (location.historical_landslides * 1.5) + (location.ground_deformation * 0.5);
  let score = Math.min(100, Math.round(rawScore + penalty));

  let level: 'SAFE' | 'MEDIUM' | 'HIGH' = 'SAFE';
  if (score >= 70) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';

  // Determine top contributors dynamically based on physical state
  const contributors = [];
  if (poreWaterPressure > 10) contributors.push('High Pore Water Pressure');
  else if (location.rainfall > 50) contributors.push('Heavy Rainfall Accumulation');
  
  if (location.slope > 30) contributors.push('Critically Steep Slope');
  if (location.soil_moisture > 70) contributors.push('Saturated Soil');
  if (location.ground_deformation > 10) contributors.push('Active Ground Deformation');
  if (location.historical_landslides > 2) contributors.push('Historical Instability');

  // Fallback
  if (contributors.length === 0) contributors.push('Marginal slope conditions');

  return { 
    score, 
    level, 
    contributors: contributors.slice(0, 3),
    fos: Number(fos.toFixed(2))
  };
}
