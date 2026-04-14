import React from 'react';
import { User, Shield, Key, Bell, CreditCard, ChevronRight, LogOut } from 'lucide-react';

interface ProfileViewProps {
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  const userSicil = localStorage.getItem('userSicil') || 'Bilinmiyor';

  const menuItems = [
    { label: 'Kişisel Bilgiler', icon: User, desc: 'Ad, soyad ve unvan bilgileri' },
    { label: 'Güvenlik', icon: Shield, desc: 'Şifre degiştirme ve oturum yönetimi' },
    { label: 'Bildirim Tercihleri', icon: Bell, desc: 'E-posta ve sistem uyarısı ayarları' },
    { label: 'Lisans ve Abonelik', icon: CreditCard, desc: 'PRO sürüm detayları ve süresi' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="w-32 h-32 bg-royal-blue rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-royal-blue/20">
          {userSicil.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Semih Çetin</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mb-4">Yazı İşleri Müdürü</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
             <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100">Sicil: {userSicil}</span>
             <span className="px-4 py-2 bg-royal-blue/5 text-royal-blue rounded-xl text-xs font-bold border border-royal-blue/10">Bursa 4. İş Mahkemesi</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-8 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center gap-3"
        >
          <LogOut className="w-5 h-5" />
          Oturumu Kapat
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-royal-blue/20 transition-all group cursor-pointer flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-royal-blue/5 transition-colors">
                <item.icon className="w-6 h-6 text-slate-400 group-hover:text-royal-blue" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{item.label}</h3>
                <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-royal-blue" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;
