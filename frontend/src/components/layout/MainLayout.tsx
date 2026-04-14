import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from '../../pages/Dashboard';
import FileManagement from '../../pages/FileManagement';
import FileDetailView from '../../pages/FileDetailView';
import CalendarView from '../../pages/CalendarView';
import TaskManagement from '../../pages/TaskManagement';
import ProfileView from '../../pages/ProfileView';
import ScenarioManagement from '../../pages/ScenarioManagement';
import ManagerConsole from '../../pages/ManagerConsole';
import MilaPanel from '../MilaPanel';
import AddFileModal from '../AddFileModal';

interface MainLayoutProps {
  onLogout: () => void;
}

interface SelectedFileType {
  id: number;
  no: string; // "2026/1"
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMilaOpen, setIsMilaOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [selectedFileNo, setSelectedFileNo] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<SelectedFileType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Satıra tıklanınca → detay sayfası (görüntüleme)
  const handleFileSelect = (fileId: number, fileNo: string) => {
    setSelectedFile({ id: fileId, no: fileNo });
  };

  // Mila ikonuna tıklanınca → Mila panel
  const handleOpenMila = (fileNo: string) => {
    setSelectedFileNo(fileNo);
    setIsMilaOpen(true);
  };

  // Detay sayfasından geri
  const handleBackToList = () => {
    setSelectedFile(null);
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] w-full">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedFile(null); // herhangi bir tab'a geçince detaydan çık
        }}
        onAddFile={() => setIsAddFileOpen(true)}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar onProfileClick={() => { setActiveTab('profile'); setSelectedFile(null); }} />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'files' && (
              selectedFile ? (
                <FileDetailView
                  fileId={selectedFile.id}
                  fileNo={selectedFile.no}
                  onBack={handleBackToList}
                  onOpenMila={handleOpenMila}
                />
              ) : (
                <FileManagement
                  key={refreshKey}
                  onSelectFile={handleFileSelect}
                  onAddFile={() => setIsAddFileOpen(true)}
                  onOpenMila={handleOpenMila}
                />
              )
            )}
            {activeTab === 'tasks' && <TaskManagement />}
            {activeTab === 'scenarios' && <ScenarioManagement />}
            {activeTab === 'manager' && <ManagerConsole />}
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
          setRefreshKey(prev => prev + 1);
        }}
        onSelectFile={(fileId, fileNo) => {
          setActiveTab('files');
          setSelectedFile({ id: fileId, no: fileNo });
        }}
      />
    </div>
  );
};

export default MainLayout;
