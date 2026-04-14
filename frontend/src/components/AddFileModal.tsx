import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FilePlus, User, BookOpen, Hash } from 'lucide-react';
import { fileApi } from '../services/api';
import toast from 'react-hot-toast';

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddFileModal: React.FC<AddFileModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    yil: new Date().getFullYear(),
    esas_no: '',
    taraf_bilgileri: '',
    konu: '',
    durum: 'Açık'
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);
    try {
      await fileApi.create({
        ...formData,
        esas_no: parseInt(formData.esas_no)
      });
      toast.success("Dosya başarıyla kaydedildi.");
      onSuccess();
      onClose();
      setFormData({
        yil: new Date().getFullYear(),
        esas_no: '',
        taraf_bilgileri: '',
        konu: '',
        durum: 'Açık'
      });
    } catch (err) {
      console.error("Dosya kaydedilemedi:", err);
      toast.error("Hata: Dosya kaydedilemedi. Bilgileri kontrol edin.");
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
                        <FilePlus className="w-6 h-6 text-royal-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Yeni Dosya Kaydı</h2>
                        <p className="text-white/60 text-sm font-medium">Sisteme yeni bir esas dosyası ekleyin</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Esas Yılı</label>
                    <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          value={formData.yil}
                          onChange={(e) => setFormData({...formData, yil: parseInt(e.target.value)})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-bold text-slate-900"
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Esas No</label>
                    <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="number" 
                          required
                          placeholder="Örn: 452"
                          value={formData.esas_no}
                          onChange={(e) => setFormData({...formData, esas_no: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-bold text-slate-900"
                        />
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Taraf Bilgileri</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="Davacı vs. Davalı"
                      value={formData.taraf_bilgileri}
                      onChange={(e) => setFormData({...formData, taraf_bilgileri: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium"
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Dava Konusu</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Örn: İşçilik Alacağı"
                      value={formData.konu}
                      onChange={(e) => setFormData({...formData, konu: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all font-medium"
                    />
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit" 
                    disabled={yukleniyor}
                    className="flex-[2] py-4 bg-royal-blue text-white font-bold rounded-2xl shadow-lg shadow-royal-blue/20 hover:bg-royal-blue-dark transition-all flex items-center justify-center gap-2"
                  >
                    {yukleniyor ? "Kaydediliyor..." : <><Save className="w-5 h-5 text-gold" /> Dosyayı Kaydet</>}
                  </button>
               </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddFileModal;
