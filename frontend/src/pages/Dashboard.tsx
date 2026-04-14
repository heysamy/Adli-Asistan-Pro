import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Search,
  MessageSquare,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { statsApi } from '../services/api';
import { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsApi.getSummary();
      setStatsData(response.data);
    } catch (err) {
      console.error("İstatistikler alınamadı:", err);
    } finally {
      setYukleniyor(false);
    }
  };

  const stats = [
    { label: 'Vadesi Geçen', value: statsData?.vadesi_gecen ?? '0', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Kritik (Yakın)', value: statsData?.kritik ?? '0', icon: Clock, color: 'text-gold', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Devam Eden', value: statsData?.devam_eden ?? '0', icon: ArrowUpRight, color: 'text-royal-blue', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Tamamlanan', value: statsData?.tamamlanan ?? '0', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ];

  const recentTasks = statsData?.recent_tasks ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Günlük Özet</h1>
          <p className="text-slate-500 mt-1 font-medium">Sistemde takip edilen toplam <span className="text-royal-blue font-bold">{statsData?.devam_eden ?? 0} aktif görev</span> var.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-royal-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Esas no veya taraf ismiyle hızlı ara..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {yukleniyor ? (
           Array(4).fill(0).map((_, i) => (
             <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-royal-blue/20" />
             </div>
           ))
        ) : (
          stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className={`${stat.bg} ${stat.border} border p-6 rounded-[2rem] shadow-sm relative overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className={`p-3 rounded-2xl bg-white w-fit shadow-sm mb-4 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-black ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <stat.icon className="w-24 h-24" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Task List Table */}
        <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Clock className="text-royal-blue w-6 h-6" /> 
                Geciken ve Yaklaşan İşler
            </h2>
            <button className="text-sm font-bold text-royal-blue hover:text-royal-blue-dark flex items-center gap-1">
                Tümünü Gör <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentTasks.length > 0 ? recentTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-royal-blue/20 hover:shadow-lg hover:shadow-slate-100 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs px-1 text-center
                    ${task.status === 'Gecikmiş' ? 'bg-red-100 text-red-600' : 
                      task.status === 'Kritik' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    {task.file.split(' ')[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{task.action}</h4>
                    <p className="text-sm text-slate-500 font-medium">{task.file}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${task.status === 'Gecikmiş' ? 'text-red-500' : 'text-slate-700'}`}>{task.due}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{task.status}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-slate-400 font-medium">
                 Henüz atanmış bir görev bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Mila AI Panel Preview */}
        <div className="bg-royal-blue rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-gold rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-royal-blue" />
               </div>
               <h2 className="text-xl font-bold">Mila AI <span className="text-gold">Asistan</span></h2>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-8 flex-grow">
               <p className="italic text-white/80 leading-relaxed font-medium">
                 {recentTasks.length > 0 
                    ? `"Merhaba, şu an ilgilenmen gereken ${statsData?.vadesi_gecen} gecikmiş işin var. En acil olan ${recentTasks[0].file} dosyasıyla ilgili işlemi başlatmamı ister misin?"`
                    : '"Merhaba, şu an tüm dosyaların güncel görünüyor. Yeni bir dosya kaydı veya şablon ataması yaparak yardımıma devam edebilirsin."'}
               </p>
            </div>

            <div className="space-y-3">
               <button className="w-full py-4 bg-gold text-royal-blue font-bold rounded-2xl hover:bg-gold-light transition-all shadow-lg shadow-gold/20">
                 İşlemi Başlat
               </button>
               <button className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                 Dosyayı Aç
               </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
