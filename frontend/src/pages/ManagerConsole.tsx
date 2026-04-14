import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Trash2, Check, X, AlertCircle, UserMinus, Edit2, Save, AlertTriangle } from 'lucide-react';
import { authApi, fileApi } from '../services/api';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EditingPersonel {
  id: number;
  sicil_no: string;
  ad_soyad: string;
  unvan: string;
}

interface DeletingPersonel {
  id: number;
  sicil_no: string;
  ad_soyad: string;
}

const ManagerConsole: React.FC = () => {
  const [personel, setPersonel] = useState<any[]>([]);
  const [silmeTalepleri, setSilmeTalepleri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personel' | 'talepler'>('personel');

  const [editingPersonel, setEditingPersonel] = useState<EditingPersonel | null>(null);
  const [deletingPersonel, setDeletingPersonel] = useState<DeletingPersonel | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const birimId = parseInt(localStorage.getItem('userBirimId') || '0');
  const userId = parseInt(localStorage.getItem('userId') || '0');

  useEffect(() => {
    if (birimId) fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'personel') {
        const res = await authApi.getKalemPersonel(birimId);
        setPersonel(res.data);
      } else {
        const res = await fileApi.getDeleteRequests(birimId);
        setSilmeTalepleri(res.data);
      }
    } catch (err) {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDelete = async (talepId: number) => {
    try {
      await fileApi.approveDelete(talepId, userId);
      toast.success('Dosya başarıyla silindi');
      fetchData();
    } catch (err) {
      toast.error('Onaylama hatası');
    }
  };

  const handleRejectDelete = async (talepId: number) => {
    try {
      await fileApi.rejectDelete(talepId);
      toast.success('Talep reddedildi');
      fetchData();
    } catch (err) {
      toast.error('Reddetme hatası');
    }
  };

  const handlePersonelEditSave = async () => {
    if (!editingPersonel) return;
    setSaving(true);
    try {
      await authApi.updatePersonel(editingPersonel.sicil_no, {
        ad_soyad: editingPersonel.ad_soyad,
        unvan: editingPersonel.unvan,
      });
      toast.success('Personel bilgileri güncellendi');
      setEditingPersonel(null);
      fetchData();
    } catch (err) {
      toast.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handlePersonelDeleteConfirm = async () => {
    if (!deletingPersonel) return;
    setDeleting(true);
    try {
      await authApi.deletePersonel(deletingPersonel.sicil_no);
      toast.success('Personel silindi');
      setDeletingPersonel(null);
      fetchData();
    } catch (err) {
      toast.error('Silme başarısız');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-royal-blue p-8 rounded-[2.5rem] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-8 h-8 text-gold" />
            <h1 className="text-3xl font-black tracking-tight">Müdür Konsolu</h1>
          </div>
          <p className="text-white/60 font-medium">Birim personeli ve kritik dosya işlemlerini yönetin</p>
        </div>
        <div className="flex bg-white/10 p-1 rounded-2xl relative z-10">
          <button onClick={() => setActiveTab('personel')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'personel' ? 'bg-white text-royal-blue shadow-lg' : 'text-white/70 hover:text-white'}`}>
            <Users className="w-4 h-4" /> Personel Listesi
          </button>
          <button onClick={() => setActiveTab('talepler')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'talepler' ? 'bg-white text-royal-blue shadow-lg' : 'text-white/70 hover:text-white'}`}>
            <Trash2 className="w-4 h-4" /> Silme Talepleri
            {silmeTalepleri.length > 0 && <span className="bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">{silmeTalepleri.length}</span>}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {activeTab === 'personel' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-10 py-5">Personel Bilgisi</th>
                  <th className="px-6 py-5">Sicil No</th>
                  <th className="px-6 py-5">Unvan</th>
                  <th className="px-6 py-5">Durum</th>
                  <th className="px-10 py-5">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 font-bold">Yükleniyor...</td></tr>
                ) : personel.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 font-bold">Kayıtlı personel bulunamadı.</td></tr>
                ) : personel.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-royal-blue/10 rounded-xl flex items-center justify-center font-bold text-royal-blue">{p.ad_soyad[0]}</div>
                        <span className="font-bold text-slate-900">{p.ad_soyad}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-500">{p.sicil_no}</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{p.unvan}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-bold text-slate-700">Aktif</span>
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingPersonel({ id: p.id, sicil_no: p.sicil_no, ad_soyad: p.ad_soyad, unvan: p.unvan })}
                          className="p-2 hover:bg-royal-blue/10 text-slate-400 hover:text-royal-blue rounded-lg transition-colors" title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingPersonel({ id: p.id, sicil_no: p.sicil_no, ad_soyad: p.ad_soyad })}
                          className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            {loading ? (
              <div className="text-center py-12 text-slate-400 font-bold">Yükleniyor...</div>
            ) : silmeTalepleri.length === 0 ? (
              <div className="text-center py-20 text-slate-300">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">Bekleyen silme talebi bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {silmeTalepleri.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white rounded-2xl shadow-sm"><Trash2 className="w-6 h-6 text-red-500" /></div>
                      <div>
                        <h4 className="font-black text-slate-900">Dosya #{t.dosya_id} Silme Talebi</h4>
                        <p className="text-sm text-slate-500 font-medium">
                          {t.talep_tarihi && <span>Tarih: <span className="text-slate-900">{formatDate(t.talep_tarihi)}</span> • </span>}
                          Talep Eden: <span className="text-slate-900">Sicil {t.talep_eden_id}</span> • Neden: <span className="italic">"{t.neden}"</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApproveDelete(t.id)} className="px-6 py-2 bg-royal-blue text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-royal-blue/20 hover:bg-royal-blue-dark transition-all">
                        <Check className="w-4 h-4" /> Onayla ve Sil
                      </button>
                      <button onClick={() => handleRejectDelete(t.id)} className="px-6 py-2 bg-white text-slate-600 rounded-xl font-bold border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center gap-2">
                        <X className="w-4 h-4" /> Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personel Edit Modal */}
      <AnimatePresence>
        {editingPersonel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-royal-blue/10 text-royal-blue rounded-2xl"><Edit2 className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900">Personel Düzenle</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ad Soyad</label>
                  <input type="text" value={editingPersonel.ad_soyad} onChange={e => setEditingPersonel({ ...editingPersonel, ad_soyad: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Unvan</label>
                  <select value={editingPersonel.unvan} onChange={e => setEditingPersonel({ ...editingPersonel, unvan: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm font-medium">
                    <option value="Katip">Katip</option>
                    <option value="Müdür">Müdür</option>
                    <option value="Hakim">Hakim</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={handlePersonelEditSave} disabled={saving} className="flex-grow py-3 bg-royal-blue text-white font-bold rounded-xl hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button onClick={() => setEditingPersonel(null)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Personel Delete Modal */}
      <AnimatePresence>
        {deletingPersonel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Personeli Sil</h3>
                <p className="text-slate-500 text-sm font-medium">
                  <span className="font-bold text-slate-900">{deletingPersonel.ad_soyad}</span> isimli personel sistemden kalıcı olarak silinecek.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handlePersonelDeleteConfirm} disabled={deleting} className="flex-grow py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                  {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
                <button onClick={() => setDeletingPersonel(null)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerConsole;
