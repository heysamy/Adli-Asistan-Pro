import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../../pages/Dashboard';
import FileManagement from '../../pages/FileManagement';
import CalendarView from '../../pages/CalendarView';
import TaskManagement from '../../pages/TaskManagement';
import ProfileView from '../../pages/ProfileView';
import MilaPanel from '../MilaPanel';
import AddFileModal from '../AddFileModal';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMilaOpen, setIsMilaOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [selectedFileNo, setSelectedFileNo] = useState<string | undefined>();

  const handleFileSelect = (fileNo: string) => {
    setSelectedFileNo(fileNo);
    setIsMilaOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] w-full">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onAddFile={() => setIsAddFileOpen(true)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
             {activeTab === 'dashboard' && <Dashboard />}
             {activeTab === 'files' && <FileManagement onSelectFile={handleFileSelect} />}
             {activeTab === 'tasks' && <TaskManagement />}
             {activeTab === 'calendar' && <CalendarView />}
             {activeTab === 'profile' && <ProfileView onLogout={onLogout} />}
          </div>
        </main>
      </div>

      <MilaPanel 
        isOpen={isMilaOpen} 
        onClose={() => setIsMilaOpen(false)} 
        selectedFile={selectedFileNo} 
      />

      <AddFileModal 
        isOpen={isAddFileOpen} 
        onClose={() => setIsAddFileOpen(false)} 
        onSuccess={() => {
            // Trigger refresh logic here if needed
            window.location.reload(); // Simple for now, can be better
        }} 
      />
    </div>
  );
};

export default MainLayout;
