import React, { useState, useEffect } from 'react';
import { Library, Plus, Trash2, Edit, Save, X, Info } from 'lucide-react';
import { templateApi } from '../services/api';
import toast from 'react-hot-toast';

const ScenarioManagement: React.FC = () => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ ad: '', aciklama: '', varsayilan_sure_gun: 15 });

    useEffect(() => { fetchTemplates(); }, []);

    const fetchTemplates = async () => {
        try {
            const res = await templateApi.list();
            setTemplates(res.data);
        } catch (err) { toast.error("Şablonlar yüklenemedi"); }
    };

    const handleCreate = async () => {
        try {
            await templateApi.create(newTemplate);
            toast.success("Senaryo başarıyla eklendi");
            setIsAddMode(false);
            setNewTemplate({ ad: '', aciklama: '', varsayilan_sure_gun: 15 });
            fetchTemplates();
        } catch (err) { toast.error("Ekleme hatası"); }
    };

    const handleDelete = async (id: number) => {
        if(!confirm("Bu senaryoyu silmek istediğinize emin misiniz?")) return;
        try {
            await templateApi.delete(id);
            toast.success("Senaryo silindi");
            fetchTemplates();
        } catch (err) { toast.error("Silme hatası"); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Senaryo Yönetimi</h1>
                    <p className="text-slate-500 font-medium">Kalem iş akışları ve prosedür şablonları</p>
                </div>
                <button 
                    onClick={() => setIsAddMode(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-royal-blue text-white rounded-xl font-bold hover:bg-royal-blue-dark transition-all shadow-lg shadow-royal-blue/20"
                >
                    <Plus className="w-5 h-5" /> Yeni Senaryo Ekle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAddMode && (
                    <div className="bg-white border-2 border-dashed border-royal-blue/30 rounded-[2rem] p-8 space-y-4">
                        <h4 className="font-black text-royal-blue uppercase tracking-widest text-xs">Yeni Şablon</h4>
                        <input 
                            placeholder="Senaryo Adı (Örn: Keşif İşlemleri)"
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-royal-blue/20 text-sm font-bold"
                            value={newTemplate.ad}
                            onChange={e => setNewTemplate({...newTemplate, ad: e.target.value})}
                        />
                        <textarea 
                            placeholder="İşlem açıklaması..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-royal-blue/20 text-sm h-24"
                            value={newTemplate.aciklama}
                            onChange={e => setNewTemplate({...newTemplate, aciklama: e.target.value})}
                        />
                        <div>
                            <label className="text-xs font-bold text-slate-400">Varsayılan Süre (Gün)</label>
                            <input 
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-royal-blue/20 text-sm font-bold"
                                value={newTemplate.varsayilan_sure_gun}
                                onChange={e => setNewTemplate({...newTemplate, varsayilan_sure_gun: parseInt(e.target.value)})}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={handleCreate} className="flex-grow py-3 bg-royal-blue text-white rounded-xl font-bold">Kaydet</button>
                            <button onClick={() => setIsAddMode(false)} className="p-3 bg-slate-100 text-slate-500 rounded-xl"><X className="w-5 h-5"/></button>
                        </div>
                    </div>
                )}

                {templates.map(t => (
                    <div key={t.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-royal-blue/5 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-royal-blue/10 rounded-2xl flex items-center justify-center text-royal-blue mb-6 group-hover:bg-royal-blue group-hover:text-white transition-all">
                                <Library className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{t.ad}</h3>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">{t.aciklama}</p>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-xs font-black text-royal-blue bg-royal-blue/5 px-3 py-1.5 rounded-lg">
                                    {t.varsayilan_sure_gun} GÜN
                                </span>
                                <button 
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScenarioManagement;
