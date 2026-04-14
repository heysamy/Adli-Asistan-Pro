import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, FileText, LayoutList, MessageCircle } from 'lucide-react';
import api, { taskApi } from '../services/api';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedFileId: number | null;
  selectedFileNo: string | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSuccess, selectedFileId, selectedFileNo }) => {
  const [sablonlar, setSablonlar] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    sablon_id: '',
    notlar: ''
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSablonlar();
    }
  }, [isOpen]);

  const fetchSablonlar = async () => {
    try {
      const response = await api.get('/templates/');
      setSablonlar(response.data);
    } catch (err) {
      console.error("Şablonlar yüklenemedi:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileId) return;

    setYukleniyor(true);
    try {
      await taskApi.create({
        dosya_id: selectedFileId,
        sablon_id: parseInt(formData.sablon_id),
        vade_tarihi: new Date().toISOString().split('T')[0], // Backend will auto-calc this anyway
        notlar: formData.notlar
      });
      onSuccess();
      onClose();
      setFormData({ sablon_id: '', notlar: '' });
    } catch (err) {
      console.error("Görev atanamadı:", err);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="bg-royal-blue p-8 text-white relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold rounded-2xl">
                        <Calendar className="w-6 h-6 text-royal-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Görev Ata</h2>
                        <p className="text-white/60 text-sm font-medium">{selectedFileNo} Esas Numaralı Dosya İçin</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Senaryo Seçin</label>
                  <div className="relative">
                    <LayoutList className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select 
                      required
                      value={formData.sablon_id}
                      onChange={(e) => setFormData({...formData, sablon_id: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="">Lütfen bir işlem seçin...</option>
                      {sablonlar.map(s => (
                        <option key={s.id} value={s.id}>{s.ad} ({s.varsayilan_sure_gun} Gün)</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Ek Notlar</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea 
                      placeholder="Dosya ile ilgili özel notlar..."
                      rows={4}
                      value={formData.notlar}
                      onChange={(e) => setFormData({...formData, notlar: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium resize-none"
                    ></textarea>
                  </div>
               </div>

               <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                  <FileText className="text-royal-blue w-5 h-5" />
                  <p className="text-xs text-blue-700 leading-relaxed font-medium">
                    Görev atandığında, sükut süresi şablona göre otomatik olarak hesaplanacak ve takviminize işlenecektir.
                  </p>
               </div>

               <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit" 
                    disabled={yukleniyor || !formData.sablon_id}
                    className="flex-[2] py-4 bg-royal-blue text-white font-bold rounded-2xl shadow-lg shadow-royal-blue/20 hover:bg-royal-blue-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {yukleniyor ? "Atanıyor..." : <><Save className="w-5 h-5 text-gold" /> Görevi Başlat</>}
                  </button>
               </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
