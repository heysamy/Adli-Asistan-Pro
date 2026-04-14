import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Bell, CreditCard, ChevronRight, LogOut, ArrowLeft, Save, Mail, Briefcase, Hash, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

interface ProfileViewProps {
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [birimler, setBirimler] = useState<any[]>([]);
  const userSicil = localStorage.getItem('userSicil') || '';
  
  // Yerel State'ler (Kalıcılık için localStorage kullanıyoruz)
  const [fullUserInfo, setFullUserInfo] = useState<any>(JSON.parse(localStorage.getItem('userInfo') || '{}'));
  
  const [userInfo, setUserInfo] = useState({
    adSoyad: fullUserInfo.ad_soyad || '',
    unvan: fullUserInfo.unvan || '',
    birim_id: fullUserInfo.birim_id || ''
  });

  const [passwordInfo, setPasswordInfo] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  useEffect(() => {
    fetchBirimler();
  }, []);

  const fetchBirimler = async () => {
    try {
      const response = await authApi.getBirimler();
      setBirimler(response.data);
    } catch (err) {
      console.error("Birimler yüklenemedi");
    }
  };

  const menuItems = [
    { id: 'personal', label: 'Kişisel Bilgiler & Birim', icon: User, desc: 'Ad, unvan ve mahkeme değişikliği' },
    { id: 'security', label: 'Güvenlik', icon: Shield, desc: 'Şifre değiştirme ve oturum yönetimi' },
    { id: 'notifications', label: 'Bildirim Tercihleri', icon: Bell, desc: 'E-posta ve sistem uyarısı ayarları' },
    { id: 'license', label: 'Lisans ve Abonelik', icon: CreditCard, desc: 'PRO sürüm detayları ve süresi' },
  ];

  const handleSavePersonal = async () => {
    try {
      const response = await authApi.updateProfile(userSicil, {
        ad_soyad: userInfo.adSoyad,
        unvan: userInfo.unvan,
        birim_id: userInfo.birim_id ? parseInt(userInfo.birim_id) : null
      });
      
      if (response.data.status === 'success') {
        const updatedUser = response.data.user;
        // KRİTİK: LocalStorage'ı tamamen güncelle
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        localStorage.setItem('userName', updatedUser.ad_soyad);
        localStorage.setItem('userTitle', updatedUser.unvan);
        localStorage.setItem('userBirimId', updatedUser.birim_id || '');
        
        setFullUserInfo(updatedUser);
        toast.success('Bilgileriniz başarıyla güncellendi.');
        setTimeout(() => window.location.reload(), 1000); 
      }
    } catch (err) {
      toast.error('Güncelleme sırasında bir hata oluştu.');
    }
  };

  const handleSaveSecurity = async () => {
    if (!passwordInfo.newPass || passwordInfo.newPass !== passwordInfo.confirm) {
      toast.error('Yeni şifreler boş olamaz ve birbiriyle eşleşmelidir!');
      return;
    }

    try {
      const response = await authApi.updateProfile(userSicil, {
        sifre: passwordInfo.newPass
      });
      
      if (response.data.status === 'success') {
        toast.success('Şifreniz başarıyla değiştirildi.');
        setPasswordInfo({current: '', newPass: '', confirm: ''});
        setTimeout(() => setCurrentSection(null), 500);
      }
    } catch (err) {
      toast.error('Şifre güncellenirken bir hata oluştu.');
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'personal':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setCurrentSection(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                 <ArrowLeft className="w-6 h-6 text-slate-400" />
               </button>
               <h2 className="text-2xl font-bold text-slate-900">Kişisel Bilgiler & Birim (Tayin)</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Ad Soyad</label>
                   <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={userInfo.adSoyad} 
                        onChange={(e) => setUserInfo({...userInfo, adSoyad: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900" 
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Sicil Numarası</label>
                   <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" readOnly defaultValue={userSicil} className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none font-bold text-slate-500 cursor-not-allowed" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Unvan</label>
                   <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={userInfo.unvan} 
                        onChange={(e) => setUserInfo({...userInfo, unvan: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900 appearance-none"
                      >
                         <option value="Müdür">Yazı İşleri Müdürü</option>
                         <option value="Katip">Zabıt Katibi</option>
                         <option value="Hakim">Hakim</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Görev Birimi (Tayin Durumu)</label>
                   <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        value={userInfo.birim_id} 
                        onChange={(e) => setUserInfo({...userInfo, birim_id: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900 appearance-none"
                      >
                         <option value="">Birim Seçin...</option>
                         {birimler.map(b => (
                            <option key={b.id} value={b.id}>{b.ad}</option>
                         ))}
                      </select>
                   </div>
                </div>
                <div className="md:col-span-2 pt-4">
                   <button onClick={handleSavePersonal} className="w-full py-4 bg-royal-blue text-white font-bold rounded-2xl shadow-lg shadow-royal-blue/20 flex items-center justify-center gap-2 hover:bg-royal-blue-dark transition-all">
                      <Save className="w-5 h-5" /> Değişiklikleri Veritabanına Kaydet
                   </button>
                </div>
             </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setCurrentSection(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                 <ArrowLeft className="w-6 h-6 text-slate-400" />
               </button>
               <h2 className="text-2xl font-bold text-slate-900">Güvenlik Ayarları</h2>
             </div>
             <div className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Yeni Şifre</label>
                   <input 
                    type="password" 
                    placeholder="Yenı şifreniz" 
                    value={passwordInfo.newPass}
                    onChange={(e) => setPasswordInfo({...passwordInfo, newPass: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 ml-1">Yeni Şifre (Tekrar)</label>
                   <input 
                    type="password" 
                    placeholder="Yeni şifre tekrarı" 
                    value={passwordInfo.confirm}
                    onChange={(e) => setPasswordInfo({...passwordInfo, confirm: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all" 
                   />
                </div>
                <button onClick={handleSaveSecurity} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all">
                   Şifreyi Güncelle
                </button>
             </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setCurrentSection(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                 <ArrowLeft className="w-6 h-6 text-slate-400" />
               </button>
               <h2 className="text-2xl font-bold text-slate-900">Bildirim Tercihleri</h2>
             </div>
             <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden divide-y divide-slate-50">
                {[
                  { title: 'Sistem Uyarıları', desc: 'Yeni dosya atandığında ve görevler yaklaştığında', active: true },
                  { title: 'E-Posta Bildirimleri', desc: 'Günlük özet raporları e-posta kutuma gelsin', active: false },
                  { title: 'Mila AI Sesli Yanıt', desc: 'Asistan sesli iletişim kursun', active: true },
                  { title: 'Tarayıcı Bildirimleri', desc: 'Uygulama kapalıyken masaüstü uyarısı gönder', active: true },
                ].map((item, id) => (
                  <div key={id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                       <h4 className="font-bold text-slate-900">{item.title}</h4>
                       <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${item.active ? 'bg-royal-blue' : 'bg-slate-200'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'license':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
             <div className="flex items-center gap-4 mb-8 text-left">
               <button onClick={() => setCurrentSection(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                 <ArrowLeft className="w-6 h-6 text-slate-400" />
               </button>
               <h2 className="text-2xl font-bold text-slate-900">Lisans ve Abonelik</h2>
             </div>
             <div className="bg-royal-blue p-12 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                   <div className="p-4 bg-gold rounded-3xl w-fit mx-auto mb-6">
                      <CreditCard className="w-12 h-12 text-royal-blue" />
                   </div>
                   <h3 className="text-3xl font-black mb-2">PRO Sürüm Aktif</h3>
                   <p className="text-white/60 mb-8">Kurumsal Lisans - Adalet Bakanlığı</p>
                   <div className="inline-block px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                      <p className="text-sm font-bold">Kalan Süre: <span className="text-gold">364 Gün</span></p>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             </div>
          </div>
        );
      default:
        return (
          <>
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-royal-blue">
                  <User className="w-64 h-64" />
              </div>
              <div className="w-32 h-32 bg-royal-blue rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-royal-blue/20 relative z-10">
                {getInitials(userInfo.adSoyad)}
              </div>
              <div className="text-center md:text-left flex-grow relative z-10">
                <h1 className="text-3xl font-black text-slate-900 mb-2">{userInfo.adSoyad || 'Bilinmiyor'}</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs mb-4">{userInfo.unvan === 'Müdür' ? 'Yazı İşleri Müdürü' : (userInfo.unvan === 'Katip' ? 'Zabıt Katibi' : userInfo.unvan)}</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                   <span className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-100 flex items-center gap-2">
                       <Hash className="w-3 h-3" /> Sicil: {userSicil}
                   </span>
                   <span className="px-4 py-2 bg-royal-blue/5 text-royal-blue rounded-xl text-xs font-bold border border-royal-blue/10 flex items-center gap-2">
                       <Building2 className="w-3 h-3" /> {fullUserInfo.birim?.ad || birimler.find((b: any) => b.id === (fullUserInfo.birim_id || parseInt(localStorage.getItem('userBirimId') || '0')))?.ad || 'Birim Atanmadı'}
                   </span>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="px-8 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all flex items-center gap-3 relative z-10"
              >
                <LogOut className="w-5 h-5" />
                Oturumu Kapat
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setCurrentSection(item.id)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-royal-blue/20 transition-all group cursor-pointer flex items-center justify-between"
                >
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
          </>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {renderSection()}
    </div>
  );
};

export default ProfileView;
