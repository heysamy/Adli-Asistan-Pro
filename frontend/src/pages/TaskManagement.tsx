import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, CheckCircle2, Clock, User, ArrowRightLeft, Users, Edit2, Trash2, Save, X, AlertTriangle, Calendar } from 'lucide-react';
import { taskApi, authApi } from '../services/api';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EditingTask {
  id: number;
  notlar: string;
  vade_tarihi: string;
}

interface DeletingTask {
  id: number;
  notlar: string;
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'unit'>('personal');
  const [personel, setPersonel] = useState<any[]>([]);

  // Transfer
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [targetUserId, setTargetUserId] = useState<string>('');

  // Edit
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete
  const [deletingTask, setDeletingTask] = useState<DeletingTask | null>(null);
  const [deleting, setDeleting] = useState(false);

  const userId = parseInt(localStorage.getItem('userId') || '0');
  const birimId = parseInt(localStorage.getItem('userBirimId') || '0');

  useEffect(() => {
    fetchTasks();
    if (activeTab === 'unit') fetchPersonel();
  }, [activeTab]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = activeTab === 'personal'
        ? await taskApi.listPersonal(userId)
        : await taskApi.listUnit(birimId);
      // Tarihe göre sırala (yakın → uzak)
      const sorted = response.data.sort((a: any, b: any) => {
        if (!a.vade_tarihi) return 1;
        if (!b.vade_tarihi) return -1;
        return new Date(a.vade_tarihi).getTime() - new Date(b.vade_tarihi).getTime();
      });
      setTasks(sorted);
    } catch (err) {
      toast.error('Görevler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonel = async () => {
    try {
      const response = await authApi.getKalemPersonel(birimId);
      setPersonel(response.data.filter((p: any) => p.id !== userId));
    } catch (err) {
      console.error('Personel listesi alınamadı');
    }
  };

  const handleStatusUpdate = async (taskId: number, newStatus: string) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      toast.success('Görev durumu güncellendi');
      fetchTasks();
    } catch (err) {
      toast.error('Güncelleme hatası');
    }
  };

  const handleTransfer = async () => {
    if (!targetUserId) return;
    try {
      await taskApi.transfer(selectedTask.id, parseInt(targetUserId), userId);
      toast.success('İş başarıyla aktarıldı');
      setIsTransferModalOpen(false);
      fetchTasks();
    } catch (err) {
      toast.error('Aktarım başarısız');
    }
  };

  const handleEditSave = async () => {
    if (!editingTask) return;
    setSavingEdit(true);
    try {
      await taskApi.editTask(editingTask.id, editingTask.notlar, editingTask.vade_tarihi);
      toast.success('Görev güncellendi');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error('Güncelleme başarısız');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await taskApi.delete(deletingTask.id);
      toast.success('Görev silindi');
      setDeletingTask(null);
      fetchTasks();
    } catch (err) {
      toast.error('Silme başarısız');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-[2rem] border border-white/60 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Görev Takibi</h1>
          <p className="text-slate-500 font-medium">İş süreçleri ve sorumluluk yönetimi</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'personal' ? 'bg-white text-royal-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <User className="w-4 h-4" /> KİŞİSEL
          </button>
          <button onClick={() => setActiveTab('unit')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'unit' ? 'bg-white text-royal-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Users className="w-4 h-4" /> KALEM
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Görevlerde ara..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-royal-blue/10 outline-none transition-all text-sm font-medium" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Dosya / Birim</th>
                <th className="px-6 py-5">Yapılacak İşlem</th>
                <th className="px-6 py-5">Sorumlu</th>
                <th className="px-6 py-5">Vade Tarihi</th>
                <th className="px-6 py-5">Durum</th>
                <th className="px-8 py-5">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-bold">Veriler Yükleniyor...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-bold">Henüz görev bulunmuyor.</td></tr>
              ) : tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-900">
                      {task.dosya ? `${task.dosya.yil}/${task.dosya.esas_no}` : `Dosya #${task.dosya_id}`}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${task.durum === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                        {task.durum === 'Tamamlandı' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-slate-700">{task.notlar || 'İşlem Detayı Girilmedi'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {task.atanan_id === userId ? 'Ben' : `Sicil: ${task.atanan_id}`}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-500">{formatDate(task.vade_tarihi)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${task.durum === 'Bekliyor' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-sm font-bold text-slate-700">{task.durum}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1">
                      {task.durum !== 'Tamamlandı' && (
                        <>
                          <button onClick={() => handleStatusUpdate(task.id, 'Tamamlandı')} className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors" title="Tamamla">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedTask(task); setIsTransferModalOpen(true); }} className="p-2 hover:bg-royal-blue/10 text-slate-400 hover:text-royal-blue rounded-lg transition-colors" title="İşi Aktar">
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setEditingTask({ id: task.id, notlar: task.notlar || '', vade_tarihi: task.vade_tarihi || '' })} className="p-2 hover:bg-royal-blue/10 text-slate-400 hover:text-royal-blue rounded-lg transition-colors" title="Düzenle">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingTask({ id: task.id, notlar: task.notlar || 'Bu görev' })} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-900 mb-2">İş Aktarma</h3>
                <p className="text-slate-500 text-sm font-medium">Bu göreci başka bir personele devredin.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Devredilecek Personel</label>
                  <select value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 outline-none transition-all text-sm font-bold">
                    <option value="">Bir personel seçin...</option>
                    {personel.map(p => <option key={p.id} value={p.id}>{p.ad_soyad} ({p.unvan})</option>)}
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={handleTransfer} disabled={!targetUserId} className="flex-grow py-3 bg-royal-blue text-white font-bold rounded-xl hover:bg-royal-blue-dark transition-all disabled:opacity-50">Aktarımı Onayla</button>
                  <button onClick={() => setIsTransferModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-royal-blue/10 text-royal-blue rounded-2xl"><Edit2 className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900">Görevi Düzenle</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">İşlem / Not</label>
                  <textarea value={editingTask.notlar} onChange={e => setEditingTask({ ...editingTask, notlar: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm font-medium resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vade Tarihi</label>
                  <input type="date" value={editingTask.vade_tarihi} onChange={e => setEditingTask({ ...editingTask, vade_tarihi: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm font-medium" />
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={handleEditSave} disabled={savingEdit} className="flex-grow py-3 bg-royal-blue text-white font-bold rounded-xl hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button onClick={() => setEditingTask(null)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deletingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Görevi Sil</h3>
                <p className="text-slate-500 text-sm font-medium">
                  <span className="font-bold text-slate-900">"{deletingTask.notlar}"</span> görevi kalıcı olarak silinecek.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-grow py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                  {deleting ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
                <button onClick={() => setDeletingTask(null)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagement;
