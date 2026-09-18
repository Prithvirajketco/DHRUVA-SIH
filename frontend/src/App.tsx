import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapPage from './pages/MapPage';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import AIPredictionPage from './pages/AIPredictionPage';
import IoTSensorsPage from './pages/IoTSensorsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-base overflow-hidden font-sans">
      <div className="flex-1 relative overflow-hidden bg-base order-1 md:order-2">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'map' && <MapPage />}
        {activeTab === 'alerts' && <AlertsPage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'prediction' && <AIPredictionPage />}
        {activeTab === 'iot' && <IoTSensorsPage />}
        
        {activeTab === 'settings' && <SettingsPage />}
      </div>
      
      <div className="order-2 md:order-1 z-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
