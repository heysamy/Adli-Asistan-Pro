import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MessageSquare, ShieldAlert, FileText } from 'lucide-react';

interface MilaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFile?: string;
}

const MilaPanel: React.FC<MilaPanelProps> = ({ isOpen, onClose, selectedFile }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="bg-royal-blue p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold rounded-xl">
                        <Sparkles className="w-5 h-5 text-royal-blue" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Mila AI <span className="text-gold">Asistan</span></h2>
                        <p className="text-xs text-white/60 font-medium">Akıllı Dosya Analiz Servisi</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Chat/Analysis Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
               {selectedFile ? (
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
                    <FileText className="text-royal-blue w-5 h-5" />
                    <span className="text-sm font-bold text-royal-blue">{selectedFile} numaralı dosya inceleniyor</span>
                 </div>
               ) : (
                 <div className="text-center py-10">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                        <MessageSquare className="w-8 h-8 text-gold" />
                    </div>
                    <p className="text-slate-500 font-medium">Lütfen analiz etmek için bir dosya seçin veya soru sorun.</p>
                 </div>
               )}

               {/* Mock Messages */}
               <div className="space-y-4">
                  <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gold flex-shrink-0 flex items-center justify-center text-royal-blue font-bold text-xs">M</div>
                     <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-sm text-slate-700 leading-relaxed">
                        Merhaba Semih, bu dosya için **Bilirkişi Raporu** henüz sisteme düşmemiş görünüyor. Karşı tarafın itiraz süresinin dolmasına **3 gün** kaldı. Müzekkere yazılmasını önerir misin?
                     </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                     <div className="bg-royal-blue text-white p-4 rounded-2xl rounded-tr-none shadow-sm text-sm leading-relaxed">
                        Karşı tarafa süre uzatımı verildi mi kontrol et.
                     </div>
                     <div className="w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-xs">SÇ</div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
                     <ShieldAlert className="text-amber-500 w-6 h-6 flex-shrink-0" />
                     <div>
                        <p className="text-sm font-bold text-amber-900 mb-1">Kritik Uyarı</p>
                        <p className="text-xs text-amber-800 leading-relaxed">
                           Davacı vekilinin sunduğu son dilekçede eksik harç tespit edildi. Karar öncesi tamamlattırılması gerekiyor.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
               <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Mila'ya bir soru sor veya komut ver..."
                    className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-royal-blue/10 focus:border-royal-blue outline-none transition-all placeholder:text-slate-400 text-sm"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-royal-blue text-white rounded-xl hover:bg-royal-blue-dark transition-colors shadow-lg shadow-royal-blue/20">
                    <Send className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MilaPanel;
