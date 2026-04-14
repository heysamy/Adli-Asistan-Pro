import React, { useState, useEffect } from 'react';
import { User, Lock, Scale, CheckCircle2, AlertCircle, Building2, Plus } from 'lucide-react';
import MatrixOverlay from '../components/MatrixOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface LoginProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [showMatrix, setShowMatrix] = useState(false);
  const [sicil, setSicil] = useState('');
  const [sifre, setSifre] = useState('');

  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Kayıt formu için ek state'ler
  const [adSoyad, setAdSoyad] = useState('');
  const [unvan, setUnvan] = useState('Katip');
  const [birimler, setBirimler] = useState<any[]>([]);
  const [seciliBirimId, setSeciliBirimId] = useState<string>('');
  const [yeniBirimAd, setYeniBirimAd] = useState('');
  const [isYeniBirim, setIsYeniBirim] = useState(false);

  useEffect(() => {
    if (isRegister) {
      fetchBirimler();
    }
  }, [isRegister]);

  const fetchBirimler = async () => {
    try {
      const response = await authApi.getBirimler();
      setBirimler(response.data);
    } catch (err) {
      console.error("Birimler yüklenemedi");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setYukleniyor(true);
    
    try {
      if (isRegister) {
        let birimId = seciliBirimId;
        
        if (isYeniBirim && yeniBirimAd) {
           const bRes = await authApi.createBirim(yeniBirimAd);
           birimId = bRes.data.id;
        }

        const response = await authApi.register({ 
            sicil_no: sicil, 
            sifre, 
            ad_soyad: adSoyad, 
            unvan,
            birim_id: birimId ? parseInt(birimId) : null
        });
        if (response.data) {
            toast.success("Kayıt başarıyla oluşturuldu. Şimdi giriş yapabilirsiniz.");
            setIsRegister(false);
        }
      } else {
        const response = await authApi.login(sicil, sifre);
        if (response.data.status === 'success') {
          toast.success("Giriş başarılı! Hoş geldiniz.");
          localStorage.setItem('userLoggedIn', 'true');
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
          localStorage.setItem('userSicil', sicil);
          localStorage.setItem('userId', response.data.user.id);
          localStorage.setItem('userName', response.data.user.ad_soyad);
          localStorage.setItem('userTitle', response.data.user.unvan || 'Kullanıcı');
          localStorage.setItem('userBirimId', response.data.user.birim_id || '');
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      setHata(err.response?.data?.detail || "İşlem başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
      <AnimatePresence>
        {showMatrix && <MatrixOverlay onClose={() => setShowMatrix(false)} />}
      </AnimatePresence>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Sol Panel: Karşılama */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-royal-blue text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-royal-blue-light/30 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gold/20 rounded-2xl backdrop-blur-sm border border-gold/30">
                <Scale className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">ADLİ ASİSTAN <span className="text-gold font-black italic">PRO</span></h2>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Yargı Hizmetlerinde <br /> 
              <span className="text-gold">Yeni Nesil</span> İş Akışı
            </h1>
            
            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-sm">
               Kalem, Mahkeme ve Savcılık birimleri için özel olarak tasarlanmış, akıllı dosya takip ve senaryo yönetim sistemi.
            </p>

            <div className="space-y-6 pt-4">
              {[
                "Otomatik Vade ve Sükut Takibi",
                "Kalem İçi İş Paylaşımı ve Aktarımı",
                "Müdür Onaylı Dosya Arşivi"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold" />
                  <span className="text-white/90 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div 
            onClick={() => setShowMatrix(true)}
            className="relative z-10 mt-12 pt-8 border-t border-white/10 cursor-pointer group/dev"
          >
             <div className="space-y-1">
               <h4 className="text-[10px] font-black text-white/40 tracking-[0.2em] group-hover/dev:text-gold transition-colors">GELİŞTİRİCİ</h4>
               <p className="text-gold font-bold text-sm">Semih Çetin</p>
               <p className="text-white/30 text-[10px]">Bursa 4. İş Mahkemesi Yazı İşleri Müdürü</p>
             </div>
          </div>
        </div>

        {/* Sağ Panel: Login Formu */}
        <div className="flex flex-col justify-center p-8 md:p-16 bg-white overflow-y-auto max-h-screen">
          <div className="mb-8">
             <h2 className="text-3xl font-black text-slate-900 mb-2">
                {isRegister ? 'Yeni Kayıt' : 'Hoş Geldiniz'}
             </h2>
             <p className="text-slate-400 text-sm font-medium">
                {isRegister 
                  ? 'Adli Asistan PRO ailesine katılmak için bilgilerinizi girin.' 
                  : 'Devam etmek için sicil numaranızla giriş yapın.'}
             </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {hata && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5" />
                {hata}
              </div>
            )}
            
            {isRegister && (
               <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Ad Soyad</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-royal-blue transition-colors" />
                        <input 
                          type="text" 
                          required
                          value={adSoyad}
                          onChange={(e) => setAdSoyad(e.target.value)}
                          placeholder="Adınızı ve soyadınızı girin"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 focus:bg-white focus:border-royal-blue outline-none transition-all text-sm font-semibold"
                        />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Unvan</label>
                        <select 
                        value={unvan}
                        onChange={(e) => setUnvan(e.target.value)}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 focus:bg-white focus:border-royal-blue outline-none transition-all text-sm font-semibold appearance-none"
                        >
                            <option value="Katip">Zabıt Katibi</option>
                            <option value="Müdür">Yazı İşleri Müdürü</option>
                            <option value="Hakim">Hakim</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Sicil No</label>
                        <input 
                          type="text" 
                          required
                          value={sicil}
                          onChange={(e) => setSicil(e.target.value)}
                          placeholder="123456"
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 focus:bg-white focus:border-royal-blue outline-none transition-all text-sm font-semibold"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Görev Birimi (Mahkeme/Büro)</label>
                    {!isYeniBirim ? (
                        <div className="flex gap-2">
                           <div className="relative flex-grow group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-royal-blue transition-colors" />
                                <select 
                                    value={seciliBirimId}
                                    onChange={(e) => setSeciliBirimId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 focus:bg-white focus:border-royal-blue outline-none transition-all text-sm font-semibold appearance-none"
                                >
                                    <option value="">Birim Seçin...</option>
                                    {birimler.map(b => (
                                        <option key={b.id} value={b.id}>{b.ad}</option>
                                    ))}
                                </select>
                           </div>
                           <button 
                            type="button"
                            onClick={() => setIsYeniBirim(true)}
                            className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                           >
                            <Plus className="w-5 h-5" />
                           </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={yeniBirimAd}
                                onChange={(e) => setYeniBirimAd(e.target.value)}
                                placeholder="Örn: Bursa 4. İş Mahkemesi"
                                className="flex-grow px-4 py-3.5 bg-white border border-royal-blue rounded-xl focus:ring-4 focus:ring-royal-blue/5 outline-none transition-all text-sm font-semibold"
                            />
                            <button 
                             type="button"
                             onClick={() => setIsYeniBirim(false)}
                             className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                            >
                             Vazgeç
                            </button>
                        </div>
                    )}
                  </div>
               </motion.div>
            )}

            {!isRegister && (
               <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Sicil Numarası</label>
                  <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-royal-blue transition-colors" />
                      <input 
                      type="text" 
                      required
                      value={sicil}
                      onChange={(e) => setSicil(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 focus:bg-white focus:border-royal-blue outline-none transition-all text-sm font-semibold"
                      placeholder="Sicil numaranızı girin"
                      />
                  </div>
               </div>
            )}

            <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Şifre</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-royal-blue transition-colors" />
                    <input 
                    type="password" 
                    required
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 focus:bg-white focus:border-royal-blue outline-none transition-all text-sm font-semibold"
                    placeholder="••••••••"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-200 text-royal-blue focus:ring-royal-blue cursor-pointer" 
                  />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Beni Hatırla</span>
              </label>
              {!isRegister && <button type="button" className="text-xs font-bold text-royal-blue hover:text-royal-blue-dark transition-colors">Şifremi Unuttum</button>}
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={yukleniyor}
                className="w-full py-4 bg-royal-blue hover:bg-royal-blue-dark text-white font-bold rounded-xl shadow-lg shadow-royal-blue/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
              >
                {yukleniyor ? "Lütfen Bekleyin..." : (isRegister ? "Hesap Oluştur" : "Oturum Aç")}
              </button>
            </div>

            <div className="text-center">
               <button 
                 type="button"
                 onClick={() => setIsRegister(!isRegister)}
                 className="text-xs font-bold text-slate-500 hover:text-royal-blue transition-all"
               >
                 {isRegister ? 'Zaten hesabınız var mı? Giriş Yap' : 'Henüz hesabınız yok mu? Şimdi Kayıt Ol'}
               </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
