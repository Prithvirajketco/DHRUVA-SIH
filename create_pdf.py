from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'DHRUVA - Landslide Early Warning System', new_x="LMARGIN", new_y="NEXT", align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', new_x="LMARGIN", new_y="NEXT", align='C')

pdf = PDF()
pdf.add_page()
pdf.set_font('helvetica', '', 12)

content = """Project Overview: DHRUVA Landslide Early Warning System

1. Introduction
The DHRUVA system addresses the SIH26001 problem statement: "AI-Based early warning and landslide Risk Monitoring System in NER" under the Disaster Management theme. Our team, Team DHRUVA, has built a comprehensive software platform designed to shift disaster management from reactive response to proactive, data-driven early intervention.

2. Problem Statement
Identifying high-risk landslide and flood zones in advance is difficult. Authorities lack localized, real-time risk information, and early warnings are often delayed or non-actionable. Fragmented disaster information, communication failures during disasters, and rapidly changing environmental conditions exacerbate the issue.

3. Proposed Solution (SLOPE-X Platform)
Our solution integrates multiple advanced technologies into a unified GIS command center:
- Physics-Informed 3D Digital Twin: Continuously monitors pore-water pressure, soil saturation, and slope displacement.
- Multi-Sensor Fusion Engine: Integrates Sentinel-1 InSAR radar, DEM elevation, IMD rainfall feeds, and ground-level IoT moisture sensors.
- Ensemble AI (XGBoost + LSTM): Computes dynamic slope susceptibility scoring and provides 6h-72h predictive warnings.
- GIS Command Dashboard: A Next.js & Mapbox dark interface providing localized risk heatmaps, community evacuation routes, and automated siren triggers.
- Offline-First Resilience: Utilizes PWA edge caching and mesh synchronization to ensure full alert operations during network blackouts.

4. Technical Approach
- Data integration into a unified PostGIS spatial datastore.
- Real-time physics engine calculating Factor of Safety (FoS).
- Machine learning pipeline predicting risk escalation.
- Offline-first capabilities for citizen reporting and alert synchronization.

5. Impact and Benefits
The platform combines IMD, CWC, GSI, and NDMA data into one decision-support system. It converts these inputs into location-specific risk insights, helps authorities prioritize critical incidents, and integrates real-time citizen reports. It functions even during connectivity failures, ensuring that warnings and evacuation plans remain accessible.

6. Conclusion
DHRUVA provides a complete, deployable ecosystem for landslide prediction and management, transforming the way the NER region handles natural disasters.
"""

# Replace unsupported characters if necessary
content = content.replace('\u2014', '-')

pdf.multi_cell(0, 8, text=content)
    
pdf.output("DHRUVA_Project_Explanation.pdf")
print("PDF created successfully: DHRUVA_Project_Explanation.pdf")
