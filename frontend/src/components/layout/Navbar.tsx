import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onProfileClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onProfileClick }) => {
  const userName = localStorage.getItem('userName') || 'Bilinmiyor';
  const userTitle = localStorage.getItem('userTitle') || 'Kullanıcı';
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-8 bg-gold rounded-full"></div>
        <h2 className="text-xl font-bold text-slate-800">Hoş Geldiniz, <span className="text-royal-blue">{userName.split(' ')[0]} Bey/Hanım</span></h2>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
            <button className="p-3 bg-slate-50 text-slate-400 hover:text-royal-blue hover:bg-royal-blue/10 rounded-2xl transition-all relative group">
                <Bell className="w-6 h-6" />
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                <div className="absolute top-full mt-2 right-0 w-64 bg-white shadow-xl rounded-2xl p-4 hidden group-hover:block border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                    <p className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2">Bildirimler</p>
                    <p className="text-xs text-slate-500">Henüz yeni bildiriminiz yok.</p>
                </div>
            </button>
        </div>

        <div 
          onClick={onProfileClick}
          className="flex items-center gap-4 pl-8 border-l border-slate-100 cursor-pointer group"
        >
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 group-hover:text-royal-blue transition-colors">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{userTitle}</p>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl transition-all hover:bg-slate-100">
             <div className="w-10 h-10 bg-royal-blue rounded-xl flex items-center justify-center text-white font-bold group-hover:bg-royal-blue-dark shadow-md shadow-royal-blue/20 transition-all group-hover:scale-105">
                {getInitials(userName)}
             </div>
             <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
