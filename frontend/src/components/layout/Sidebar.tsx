import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  Calendar, 
  Settings, 
  Plus, 
  LogOut, 
  ChevronRight, 
  Scale,
  User,
  ClipboardList,
  Library,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddFile: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onAddFile, onLogout }) => {
  const userName = localStorage.getItem('userName') || 'Bilinmiyor';
  const userTitle = localStorage.getItem('userTitle') || 'Kullanıcı';
  const isMudur = userTitle.toLocaleLowerCase('tr-TR').includes('müdür');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Ana Panel', icon: LayoutDashboard },
    { id: 'files', label: 'Dosya Yönetimi', icon: Files },
    { id: 'tasks', label: 'Görev Takibi', icon: ClipboardList },
    { id: 'scenarios', label: 'Senaryo Yönetimi', icon: Library },
    { id: 'calendar', label: 'Takvim View', icon: Calendar },
    ...(isMudur ? [{ id: 'manager', label: 'Müdür Konsolu', icon: ShieldCheck }] : []),
    { id: 'profile', label: 'Profilim', icon: User },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div className="w-72 bg-royal-blue min-h-screen flex flex-col text-white p-6 justify-between border-r border-white/10 shadow-2xl relative z-50">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-gold/20 rounded-xl border border-gold/30">
                <Scale className="w-6 h-6 text-gold" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ADLİ ASİSTAN <span className="text-gold font-black italic">PRO</span></h1>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-gold text-royal-blue shadow-lg shadow-gold/20 font-bold' 
                  : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-royal-blue' : 'group-hover:text-gold'}`} />
              <span className="text-sm font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-royal-blue rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8 px-2">
             <button 
                onClick={onAddFile}
                className="w-full flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-gold hover:bg-white/10 transition-all group"
             >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-bold">Yeni Dosya Kaydı</span>
             </button>
        </div>
      </div>

      <div className="space-y-5">
        <div 
          onClick={() => setActiveTab('profile')}
          className="p-5 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-all font-inter"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full -mr-12 -mt-12 transition-all group-hover:bg-gold/10"></div>
            <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold font-bold text-xs">
                  {getInitials(userName)}
               </div>
               <div>
                  <p className="text-xs text-white/40 mb-0 uppercase tracking-widest font-semibold">Aktif Kullanıcı</p>
                  <p className="text-sm font-bold text-white group-hover:text-gold transition-colors truncate max-w-[120px]">{userName}</p>
               </div>
            </div>
            <p className="text-[10px] text-gold/80 font-medium px-2 py-1 bg-gold/10 rounded-lg inline-block border border-gold/20">{userTitle}</p>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50/10 rounded-2xl transition-all font-bold group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Güvenli Çıkış</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
