import React, { useEffect, useState } from 'react';
import { Search, Plus, FileText, Calendar, Users, ArrowUpDown, Loader2, Trash2, Edit2, AlertTriangle, Sparkles, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fileApi, taskApi } from '../services/api';
import AddTaskModal from '../components/AddTaskModal';
import toast from 'react-hot-toast';

interface FileManagementProps {
  onSelectFile: (fileId: number, fileNo: string) => void;
  onAddFile: () => void;
  onOpenMila: (fileNo: string) => void;
}

interface EditingFile {
  id: number;
  no: string;
  taraf_bilgileri: string;
  konu: string;
  durum: string;
}

const FileManagement: React.FC<FileManagementProps> = ({ onSelectFile, onAddFile, onOpenMila }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<number, { total: number; open: number }>>({});
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [targetFile, setTargetFile] = useState<{ id: number; no: string } | null>(null);

  // Edit modal
  const [editingFile, setEditingFile] = useState<EditingFile | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteNeden, setDeleteNeden] = useState('');

  const birimId = parseInt(localStorage.getItem('userBirimId') || '0');
  const userId = parseInt(localStorage.getItem('userId') || '0');
  const isManager = localStorage.getItem('userTitle') === 'Müdür';

  useEffect(() => { fetchFiles(); }, [birimId]);

  const fetchFiles = async () => {
    try {
      setYukleniyor(true);
      const [fileRes, taskRes] = await Promise.all([
        fileApi.list(birimId),
        taskApi.listUnit(birimId),
      ]);
      setFiles(fileRes.data);
      const counts: Record<number, { total: number; open: number }> = {};
      for (const task of taskRes.data) {
        if (!counts[task.dosya_id]) counts[task.dosya_id] = { total: 0, open: 0 };
        counts[task.dosya_id].total++;
        if (task.durum !== 'Tamamlandı') counts[task.dosya_id].open++;
      }
      setTaskCounts(counts);
    } catch (err) {
      toast.error('Dosya listesi alınamadı.');
    } finally {
      setYukleniyor(false);
    }
  };

  const handleDeleteAction = async (file: any) => {
    if (isManager) {
      try {
        await fileApi.deleteDirect(file.id);
        toast.success('Dosya silindi.');
        fetchFiles();
      } catch {
        toast.error('Silme başarısız.');
      }
    } else {
      setTargetFile({ id: file.id, no: `${file.yil}/${file.esas_no}` });
      setIsDeleteModalOpen(true);
    }
  };

  const handleDeleteRequest = async () => {
    if (!targetFile || !deleteNeden) return;
    try {
      await fileApi.requestDelete({ dosya_id: targetFile.id, talep_eden_id: userId, neden: deleteNeden });
      toast.success('Silme talebi müdüre iletildi.');
      setIsDeleteModalOpen(false);
      setDeleteNeden('');
    } catch {
      toast.error('Talep iletilemedi.');
    }
  };

  const handleEditSave = async () => {
    if (!editingFile) return;
    setSavingEdit(true);
    try {
      await fileApi.update(editingFile.id, {
        taraf_bilgileri: editingFile.taraf_bilgileri,
        konu: editingFile.konu,
        durum: editingFile.durum,
      });
      toast.success('Dosya bilgileri güncellendi.');
      setEditingFile(null);
      fetchFiles();
    } catch {
      toast.error('Güncelleme başarısız.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dosya Yönetimi</h1>
          <p className="text-slate-500 font-medium">Biriminize ait aktif ve arşivlenmiş dosyalar</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Yıl / Esas no veya taraf ara..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm" />
          </div>
          <button onClick={onAddFile} className="flex items-center gap-2 px-6 py-3 bg-royal-blue text-white rounded-xl font-bold hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20">
            <Plus className="w-5 h-5" /><span>Yeni Dosya</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Esas No <ArrowUpDown className="w-3 h-3 inline" /></th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Taraf Bilgileri</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Konu</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Durum</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Görevler</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {yukleniyor ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-royal-blue" />
                    <span className="text-sm font-medium">Dosyalar Yükleniyor...</span>
                  </div>
                </td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                  <span className="text-sm font-medium">Bu birimde henüz kayıtlı dosya bulunmuyor.</span>
                </td></tr>
              ) : files.map((file, i) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={file.id}
                  className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectFile(file.id, `${file.yil}/${file.esas_no}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-royal-blue group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{file.yil}/{file.esas_no}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{file.taraf_bilgileri}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-500 font-medium">{file.konu}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                      ${file.durum === 'Açık' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {file.durum}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {taskCounts[file.id] ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {taskCounts[file.id].open > 0 && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-50 text-amber-600 border border-amber-100">
                            {taskCounts[file.id].open} Bekliyor
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-slate-50 text-slate-500 border border-slate-100">
                          {taskCounts[file.id].total} Toplam
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 font-medium">—</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-start gap-1">
                      {/* Mila */}
                      <button onClick={(e) => { e.stopPropagation(); onOpenMila(`${file.yil}/${file.esas_no}`); }}
                        className="p-2 hover:bg-royal-blue/10 text-royal-blue/60 hover:text-royal-blue rounded-lg transition-all" title="Mila AI Asistan">
                        <Sparkles className="w-5 h-5" />
                      </button>
                      {/* Görev ekle */}
                      <button onClick={(e) => { e.stopPropagation(); setTargetFile({ id: file.id, no: `${file.yil}/${file.esas_no}` }); setIsAddTaskOpen(true); }}
                        className="p-2 hover:bg-royal-blue/10 text-royal-blue rounded-lg transition-all" title="Görev Ata">
                        <Calendar className="w-5 h-5" />
                      </button>
                      {/* Düzenle → modal */}
                      <button onClick={(e) => { e.stopPropagation(); setEditingFile({ id: file.id, no: `${file.yil}/${file.esas_no}`, taraf_bilgileri: file.taraf_bilgileri, konu: file.konu || '', durum: file.durum }); }}
                        className="p-2 hover:bg-royal-blue/10 text-slate-400 hover:text-royal-blue rounded-lg transition-all" title="Düzenle">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {/* Sil */}
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteAction(file); }}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all" title={isManager ? 'Dosyayı Sil' : 'Silme Talebi'}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} onSuccess={fetchFiles} selectedFileId={targetFile?.id ?? null} selectedFileNo={targetFile?.no ?? null} />

      {/* Edit File Modal */}
      <AnimatePresence>
        {editingFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-royal-blue p-7 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl"><Edit2 className="w-5 h-5" /></div>
                  <div>
                    <h3 className="text-xl font-black">Dosya Düzenle</h3>
                    <p className="text-white/60 text-sm font-medium">{editingFile.no} Esas</p>
                  </div>
                </div>
                <button onClick={() => setEditingFile(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>
              {/* Form */}
              <div className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Taraf Bilgileri</label>
                  <input type="text" value={editingFile.taraf_bilgileri}
                    onChange={e => setEditingFile({ ...editingFile, taraf_bilgileri: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dava Konusu</label>
                  <input type="text" value={editingFile.konu}
                    onChange={e => setEditingFile({ ...editingFile, konu: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium text-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Durum</label>
                  <select value={editingFile.durum} onChange={e => setEditingFile({ ...editingFile, durum: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium">
                    <option value="Açık">Açık</option>
                    <option value="Kapalı">Kapalı</option>
                    <option value="Arşiv">Arşiv</option>
                  </select>
                </div>
                <div className="pt-2 flex gap-3">
                  <button onClick={handleEditSave} disabled={savingEdit}
                    className="flex-grow py-3.5 bg-royal-blue text-white font-bold rounded-2xl hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> {savingEdit ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                  <button onClick={() => setEditingFile(null)}
                    className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                    Vazgeç
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Request Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8" /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Dosya Silme Talebi</h3>
                <p className="text-slate-500 text-sm font-medium"><span className="font-bold text-slate-900">{targetFile?.no}</span> numaralı dosyanın silinmesi için müdür onayı gereklidir.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Silme Sebebi</label>
                  <textarea value={deleteNeden} onChange={(e) => setDeleteNeden(e.target.value)} placeholder="Örn: Hatalı kayıt veya mükerrer dosya..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-royal-blue/5 outline-none transition-all text-sm font-medium h-32 resize-none" />
                </div>
                <div className="pt-2 flex gap-3">
                  <button onClick={handleDeleteRequest} disabled={!deleteNeden}
                    className="flex-grow py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">
                    Talebi Gönder
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">Vazgeç</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileManagement;
