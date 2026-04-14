import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, CheckCircle2, AlertCircle, Clock, MoreVertical } from 'lucide-react';
import { taskApi } from '../services/api';
import toast from 'react-hot-toast';

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'mizde henüz tüm görevleri çeken bir uç yoksa stats'tan alabiliriz veya mocklayabiliriz
    // Şu an için stats'tan gelen veriyi veya genel bir fetch logic'ini simüle ediyorum
    // Gerçek bir uygulamada /tasks/all gibi bir endpoint olmalı
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Mocking for now as we don't have a /tasks/all endpoint in backend yet
      // but the UI is ready
      setLoading(true);
      // Simüle ediyoruz, normalde bir API çağırmalıyız
      setTimeout(() => {
          setTasks([
            { id: 1, file: '2024/452 Esas', action: 'Bilirkişi Raporu Bekleniyor', due_date: '2024-04-15', status: 'Gecikmiş', priority: 'Yüksek' },
            { id: 2, file: '2023/112 Esas', action: 'Müzekkere Takibi', due_date: '2024-04-16', status: 'Kritik', priority: 'Yüksek' },
            { id: 3, file: '2024/12 Esas', action: 'Karar Yazılacak', due_date: '2024-04-20', status: 'Bekliyor', priority: 'Orta' },
          ]);
          setLoading(false);
      }, 500);
    } catch (err) {
      toast.error("Görevler yüklenemedi.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Görev Takibi</h1>
          <p className="text-slate-500 font-medium">Tüm dosyalardaki aktif işlerin listesi</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
             <Filter className="w-4 h-4" /> Filtrele
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Görevlerde ara..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 outline-none transition-all text-sm font-medium"
                />
            </div>
            <div className="flex gap-2">
                {['Tümü', 'Gecikmiş', 'Bekliyor', 'Tamamlanan'].map((f) => (
                    <button key={f} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${f === 'Tümü' ? 'bg-royal-blue text-white shadow-lg shadow-royal-blue/20' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-5">Dosya Bilgisi</th>
                <th className="px-6 py-5">Yapılacak İşlem</th>
                <th className="px-6 py-5">Vade Tarihi</th>
                <th className="px-6 py-5">Öncelik</th>
                <th className="px-6 py-5">Durum</th>
                <th className="px-8 py-5 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="font-bold text-slate-900">{task.file}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${task.status === 'Gecikmiş' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                            {task.status === 'Gecikmiş' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-slate-700">{task.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-500">{task.due_date}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${task.priority === 'Yüksek' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${task.status === 'Gecikmiş' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-sm font-bold text-slate-700">{task.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;
