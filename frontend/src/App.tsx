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
    <div className="flex h-[100dvh] w-full bg-base overflow-hidden font-sans relative">
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-base w-full md:pl-[88px]">
        {activeTab === 'dashboard' && <DashboardPage setActiveTab={setActiveTab} />}
        {activeTab === 'map' && <MapPage />}
        {activeTab === 'alerts' && <AlertsPage />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'prediction' && <AIPredictionPage />}
        {activeTab === 'iot' && <IoTSensorsPage />}
        
        {activeTab === 'settings' && <SettingsPage />}
      </div>
      
      {/* Sidebar handles its own fixed positioning now */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
