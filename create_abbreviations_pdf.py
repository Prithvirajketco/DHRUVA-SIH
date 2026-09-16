from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'DHRUVA - Acronyms & Full Forms', new_x="LMARGIN", new_y="NEXT", align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', new_x="LMARGIN", new_y="NEXT", align='C')

pdf = PDF()
pdf.add_page()
pdf.set_font('helvetica', '', 12)

content = """Here is the complete list of acronyms and their full forms used in the DHRUVA Landslide Early Warning System project:

General & Domain Terms:
- SIH: Smart India Hackathon
- NER: North Eastern Region
- AI: Artificial Intelligence
- IoT: Internet of Things
- FoS: Factor of Safety

Government & Institutional Bodies:
- IMD: India Meteorological Department
- CWC: Central Water Commission
- GSI: Geological Survey of India
- NDMA: National Disaster Management Authority

Technology & Software:
- GIS: Geographic Information System
- PWA: Progressive Web App
- XGBoost: eXtreme Gradient Boosting (Machine Learning algorithm)
- LSTM: Long Short-Term Memory (Recurrent Neural Network architecture)

Sensors & Geospatial Data:
- InSAR: Interferometric Synthetic Aperture Radar
- DEM: Digital Elevation Model
- TDR: Time-Domain Reflectometry (used for soil moisture sensing)
- GNSS: Global Navigation Satellite System (used for ground displacement)
- MEMS: Micro-Electromechanical Systems (used in micro-seismometers)
"""

pdf.multi_cell(0, 8, text=content)
    
pdf.output("DHRUVA_Abbreviations.pdf")
print("PDF created successfully: DHRUVA_Abbreviations.pdf")
