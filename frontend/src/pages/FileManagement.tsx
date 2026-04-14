import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, MoreVertical, FileText, Calendar, Users, ArrowUpDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fileApi } from '../services/api';
import AddTaskModal from '../components/AddTaskModal';

interface FileManagementProps {
  onSelectFile: (fileNo: string) => void;
}

const FileManagement: React.FC<FileManagementProps> = ({ onSelectFile }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [targetFile, setTargetFile] = useState<{id: number, no: string} | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fileApi.list();
      setFiles(response.data);
    } catch (err) {
      console.error("Dosyalar yüklenemedi:", err);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dosya Yönetimi</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-grow md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Yıl / Esas no veya taraf ara..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all text-sm"
                />
             </div>
             <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
                <Filter className="w-5 h-5" />
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-royal-blue text-white rounded-xl font-bold hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20">
                <Plus className="w-5 h-5" />
                <span>Yeni Dosya</span>
             </button>
        </div>
      </div>

      {/* Table Structure */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">Esas No <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Taraf Bilgileri</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Konu</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Durum</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Görevler</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {yukleniyor ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                         <Loader2 className="w-8 h-8 animate-spin text-royal-blue" />
                         <span className="text-sm font-medium">Dosyalar Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              ) : files.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                     <span className="text-sm font-medium">Henüz kayıtlı dosya bulunmuyor.</span>
                   </td>
                </tr>
              ) : (
                files.map((file, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={file.id} 
                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                    onClick={() => onSelectFile(`${file.yil}/${file.esas_no}`)}
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
                      <div className="flex items-center justify-center gap-1">
                          <Calendar className="w-4 h-4 text-royal-blue/40" />
                          <span className="text-sm font-bold text-royal-blue">{file.gorevCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setTargetFile({id: file.id, no: `${file.yil}/${file.esas_no}`});
                                setIsAddTaskOpen(true);
                            }}
                            className="px-3 py-1.5 bg-royal-blue/10 text-royal-blue rounded-lg text-xs font-bold hover:bg-royal-blue hover:text-white transition-all"
                        >
                            Görev Ata
                        </button>
                        <button className="p-2 hover:bg-white rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                  </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTaskModal 
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSuccess={fetchFiles}
        selectedFileId={targetFile?.id ?? null}
        selectedFileNo={targetFile?.no ?? null}
      />
    </div>
  );
};

export default FileManagement;
