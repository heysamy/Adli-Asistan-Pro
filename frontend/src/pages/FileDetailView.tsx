import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, FileText, Users, Tag, CheckCircle2, Clock,
  Edit2, Save, X, Plus, ClipboardList, Sparkles, Calendar, Trash2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileApi, taskApi } from '../services/api';
import { formatDate } from '../utils/formatters';
import AddTaskModal from '../components/AddTaskModal';
import toast from 'react-hot-toast';

interface FileDetailViewProps {
  fileId: number;
  fileNo: string;
  onBack: () => void;
  onOpenMila: (fileNo: string) => void;
  initialEditing?: boolean;
}

type FilterType = 'all' | 'open' | 'done';

interface EditingTask {
  id: number;
  notlar: string;
  vade_tarihi: string; // YYYY-MM-DD
}

interface DeletingTask {
  id: number;
  notlar: string;
}

const StatusBadge: React.FC<{ durum: string }> = ({ durum }) => {
  const cls = durum === 'Açık'
    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border ${cls}`}>
      {durum}
    </span>
  );
};

const TaskStatusBadge: React.FC<{ durum: string }> = ({ durum }) => {
  if (durum === 'Tamamlandı')
    return <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">Tamamlandı</span>;
  return <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">Bekliyor</span>;
};

const FileDetailView: React.FC<FileDetailViewProps> = ({ fileId, fileNo, onBack, onOpenMila, initialEditing = false }) => {
  const [file, setFile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(initialEditing);
  const [editData, setEditData] = useState({ taraf_bilgileri: '', konu: '', durum: 'Açık' });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Task inline edit state
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  // Task delete modal state
  const [deletingTask, setDeletingTask] = useState<DeletingTask | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const birimId = parseInt(localStorage.getItem('userBirimId') || '0');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fileRes, taskRes] = await Promise.all([
        fileApi.get(fileId),
        taskApi.listUnit(birimId)
      ]);
      setFile(fileRes.data);
      setEditData({
        taraf_bilgileri: fileRes.data.taraf_bilgileri,
        konu: fileRes.data.konu,
        durum: fileRes.data.durum,
      });
      const fileTasks = taskRes.data
        .filter((t: any) => t.dosya_id === fileId)
        .sort((a: any, b: any) => {
          if (!a.vade_tarihi) return 1;
          if (!b.vade_tarihi) return -1;
          return new Date(a.vade_tarihi).getTime() - new Date(b.vade_tarihi).getTime();
        });
      setTasks(fileTasks);
    } catch (err) {
      toast.error('Dosya bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFileEdit = async () => {
    try {
      await fileApi.update(fileId, editData);
      toast.success('Dosya bilgileri güncellendi.');
      setIsEditing(false);
      fetchData();
    } catch (err) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleTaskComplete = async (taskId: number) => {
    try {
      await taskApi.updateStatus(taskId, 'Tamamlandı');
      toast.success('Görev tamamlandı.');
      fetchData();
    } catch (err) {
      toast.error('Hata oluştu.');
    }
  };

  const handleTaskEditSave = async () => {
    if (!editingTask) return;
    setSavingEdit(true);
    try {
      await taskApi.editTask(editingTask.id, editingTask.notlar, editingTask.vade_tarihi);
      toast.success('Görev güncellendi.');
      setEditingTask(null);
      fetchData();
    } catch (err) {
      toast.error('Güncelleme başarısız.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTaskDeleteConfirm = async () => {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await taskApi.delete(deletingTask.id);
      toast.success('Görev silindi.');
      setDeletingTask(null);
      fetchData();
    } catch (err) {
      toast.error('Silme başarısız.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-royal-blue/20 border-t-royal-blue rounded-full animate-spin" />
          <span className="text-slate-500 font-medium text-sm">Dosya yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!file) return null;

  const totalCount = tasks.length;
  const openCount = tasks.filter(t => t.durum !== 'Tamamlandı').length;
  const doneCount = tasks.filter(t => t.durum === 'Tamamlandı').length;

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'open') return t.durum !== 'Tamamlandı';
    if (activeFilter === 'done') return t.durum === 'Tamamlandı';
    return true;
  });

  const statCards = [
    { key: 'all' as FilterType, label: 'Toplam Görev', value: totalCount, icon: ClipboardList, activeClass: 'bg-royal-blue border-royal-blue shadow-royal-blue/20', inactiveClass: 'bg-slate-50 border-slate-100 hover:border-royal-blue/30', iconActive: 'text-white', iconInactive: 'text-royal-blue', numActive: 'text-white', labelActive: 'text-white/80' },
    { key: 'open' as FilterType, label: 'Bekleyen', value: openCount, icon: Clock, activeClass: 'bg-amber-500 border-amber-500 shadow-amber-500/20', inactiveClass: 'bg-amber-50 border-amber-100 hover:border-amber-300', iconActive: 'text-white', iconInactive: 'text-amber-600', numActive: 'text-white', labelActive: 'text-white/80' },
    { key: 'done' as FilterType, label: 'Tamamlanan', value: doneCount, icon: CheckCircle2, activeClass: 'bg-emerald-500 border-emerald-500 shadow-emerald-500/20', inactiveClass: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300', iconActive: 'text-white', iconInactive: 'text-emerald-600', numActive: 'text-white', labelActive: 'text-white/80' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-royal-blue font-bold transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Dosya Listesi
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => onOpenMila(fileNo)} className="flex items-center gap-2 px-5 py-2.5 bg-royal-blue/10 text-royal-blue border border-royal-blue/20 rounded-xl font-bold hover:bg-royal-blue hover:text-white transition-all text-sm">
            <Sparkles className="w-4 h-4" /> Mila AI Asistan
          </button>
          <button onClick={() => setIsAddTaskOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gold/10 text-amber-700 border border-gold/20 rounded-xl font-bold hover:bg-gold hover:text-royal-blue transition-all text-sm">
            <Plus className="w-4 h-4" /> Görev Ekle
          </button>
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={handleSaveFileEdit} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all text-sm shadow-lg shadow-emerald-500/20">
                <Save className="w-4 h-4" /> Kaydet
              </button>
              <button onClick={() => { setIsEditing(false); setEditData({ taraf_bilgileri: file.taraf_bilgileri, konu: file.konu, durum: file.durum }); }} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:border-royal-blue hover:text-royal-blue transition-all text-sm shadow-sm">
              <Edit2 className="w-4 h-4" /> Düzenle
            </button>
          )}
        </div>
      </div>

      {/* File Info Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-royal-blue via-royal-blue/80 to-gold" />
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-royal-blue rounded-2xl flex items-center justify-center shadow-lg shadow-royal-blue/20">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{file.yil}/{file.esas_no} Esas</h1>
                <p className="text-slate-400 text-sm font-medium mt-1">Dosya No</p>
              </div>
            </div>
            <StatusBadge durum={file.durum} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest"><Users className="w-3.5 h-3.5" /> Taraf Bilgileri</label>
              {isEditing ? <input type="text" value={editData.taraf_bilgileri} onChange={e => setEditData({ ...editData, taraf_bilgileri: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900" /> : <p className="text-slate-700 font-bold px-1">{file.taraf_bilgileri}</p>}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest"><Tag className="w-3.5 h-3.5" /> Dava Konusu</label>
              {isEditing ? <input type="text" value={editData.konu} onChange={e => setEditData({ ...editData, konu: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900" /> : <p className="text-slate-700 font-bold px-1">{file.konu}</p>}
            </div>
            {isEditing && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Durum</label>
                <select value={editData.durum} onChange={e => setEditData({ ...editData, durum: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium">
                  <option value="Açık">Açık</option>
                  <option value="Kapalı">Kapalı</option>
                  <option value="Arşiv">Arşiv</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s, i) => {
          const isActive = activeFilter === s.key;
          return (
            <motion.button key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setActiveFilter(s.key)}
              className={`border p-5 rounded-2xl flex items-center gap-4 transition-all cursor-pointer text-left w-full shadow-lg
                ${isActive ? s.activeClass + ' text-white' : s.inactiveClass + ' text-slate-900'}`}>
              <div className={`p-3 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                <s.icon className={`w-5 h-5 ${isActive ? s.iconActive : s.iconInactive}`} />
              </div>
              <div>
                <p className={`text-2xl font-black ${isActive ? s.numActive : 'text-slate-900'}`}>{s.value}</p>
                <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? s.labelActive : 'text-slate-500'}`}>{s.label}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-royal-blue" />
            <h2 className="text-lg font-black text-slate-900">Atanan Görevler</h2>
            <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-royal-blue/10 text-royal-blue">{filteredTasks.length} kayıt</span>
          </div>
          <p className="text-xs font-medium text-slate-400">Vadeye göre sıralı</p>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-bold text-sm">Görüntülenecek görev bulunamadı.</p>
            <button onClick={() => setIsAddTaskOpen(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-royal-blue/10 text-royal-blue rounded-xl font-bold text-sm hover:bg-royal-blue hover:text-white transition-all">
              <Plus className="w-4 h-4" /> Görev Ekle
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredTasks.map((task, i) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-8 py-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${task.durum === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-royal-blue'}`}>
                      {task.durum === 'Tamamlandı' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{task.notlar || 'İşlem Detayı Girilmedi'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <TaskStatusBadge durum={task.durum} />
                        {task.vade_tarihi && (
                          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Calendar className="w-3 h-3" /> Vade: {formatDate(task.vade_tarihi)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {task.durum !== 'Tamamlandı' && (
                      <button onClick={() => handleTaskComplete(task.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl font-bold text-xs transition-all">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tamamla
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask({ id: task.id, notlar: task.notlar || '', vade_tarihi: task.vade_tarihi || '' })}
                      className="p-2 hover:bg-royal-blue/10 text-slate-400 hover:text-royal-blue rounded-lg transition-all" title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTask({ id: task.id, notlar: task.notlar || 'Bu görev' })}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all" title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} onSuccess={fetchData} selectedFileId={fileId} selectedFileNo={fileNo} />

      {/* Task Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-royal-blue/10 text-royal-blue rounded-2xl"><Edit2 className="w-5 h-5" /></div>
                <h3 className="text-xl font-black text-slate-900">Görevi Düzenle</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">İşlem / Not</label>
                  <textarea
                    value={editingTask.notlar}
                    onChange={e => setEditingTask({ ...editingTask, notlar: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm font-medium resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vade Tarihi</label>
                  <input
                    type="date"
                    value={editingTask.vade_tarihi}
                    onChange={e => setEditingTask({ ...editingTask, vade_tarihi: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button onClick={handleTaskEditSave} disabled={savingEdit} className="flex-grow py-3 bg-royal-blue text-white font-bold rounded-xl hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> {savingEdit ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button onClick={() => setEditingTask(null)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task Delete Confirm Modal */}
      <AnimatePresence>
        {deletingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Görevi Sil</h3>
                <p className="text-slate-500 text-sm font-medium">
                  <span className="font-bold text-slate-900">"{deletingTask.notlar}"</span> görevi kalıcı olarak silinecek. Bu işlem geri alınamaz.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleTaskDeleteConfirm} disabled={deleting} className="flex-grow py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
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

export default FileDetailView;
