import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapPage from './pages/MapPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import AIPredictionPage from './pages/AIPredictionPage';
import IoTSensorsPage from './pages/IoTSensorsPage';

function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="flex h-screen w-full bg-base overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 relative overflow-hidden bg-base">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'map' && <MapPage />}
        {activeTab === 'alerts' && <AlertsPage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'prediction' && <AIPredictionPage />}
        {activeTab === 'iot' && <IoTSensorsPage />}
        
        {/* Placeholders for Settings */}
        {['settings'].includes(activeTab) && (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{activeTab.toUpperCase()}</h2>
              <p>This module will be implemented in the next phase.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
