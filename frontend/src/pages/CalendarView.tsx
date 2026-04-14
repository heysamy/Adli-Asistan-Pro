import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const CalendarView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  // Mock events for intensity indicators and agenda
  const events = [
    { date: new Date(2024, 3, 15), title: 'Duruşma: 2024/452 Esas', time: '10:00', type: 'hearing', color: 'bg-red-500' },
    { date: new Date(2024, 3, 15), title: 'Bilirkişi Rapor Sükutu', time: '17:00', type: 'deadline', color: 'bg-gold' },
    { date: new Date(2024, 3, 18), title: 'Müzekkere Takibi', time: '09:30', type: 'task', color: 'bg-royal-blue' },
    { date: new Date(2024, 3, 22), title: 'Karar Tebliği', time: '14:00', type: 'task', color: 'bg-emerald-500' },
  ];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">İnteraktif Takvim</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-royal-blue/5 rounded-full border border-royal-blue/10">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs font-bold text-slate-600">Duruşma</span>
            <div className="w-2 h-2 bg-gold rounded-full ml-2"></div>
            <span className="text-xs font-bold text-slate-600">Sükut</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Calendar Card */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex justify-center">
          <style>{`
            .rdp {
              --rdp-cell-size: 50px;
              --rdp-accent-color: #002366;
              --rdp-background-color: #f1d279;
              margin: 0;
            }
            .rdp-day_selected {
              background-color: var(--rdp-accent-color) !important;
              color: white !important;
              border-radius: 1rem;
            }
            .rdp-day:hover {
              background-color: rgba(212, 175, 55, 0.1);
              border-radius: 1rem;
            }
            .rdp-button:focus-visible {
                background-color: rgba(212, 175, 55, 0.2);
                color: #002366;
            }
          `}</style>
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            locale={tr}
            modifiers={{
              hasEvent: (date) => getEventsForDay(date).length > 0
            }}
            modifiersStyles={{
              hasEvent: { 
                fontWeight: 'bold', 
                textDecoration: 'underline',
                textDecorationColor: '#D4AF37',
                textDecorationThickness: '3px'
              }
            }}
            className="border-none"
          />
        </div>

        {/* Agenda Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-royal-blue rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                   <CalendarIcon className="w-6 h-6 text-gold" />
                   <h2 className="text-xl font-bold">Günlük Ajanda</h2>
                </div>
                
                <p className="text-white/60 text-sm font-medium mb-8">
                  {selectedDay ? format(selectedDay, 'd MMMM yyyy, EEEE', { locale: tr }) : 'Gün Seçilmedi'}
                </p>

                <div className="space-y-4">
                   {selectedDay && getEventsForDay(selectedDay).length > 0 ? (
                     getEventsForDay(selectedDay).map((event, i) => (
                       <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group cursor-pointer hover:bg-white/20 transition-all">
                          <div className="flex items-start gap-3">
                             <div className={`w-2 h-10 rounded-full ${event.color} flex-shrink-0`}></div>
                             <div>
                                <p className="text-sm font-bold text-white mb-1">{event.title}</p>
                                <div className="flex items-center gap-4 text-white/50 text-xs">
                                   <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {event.time}
                                   </div>
                                   <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> Duruşma Salonu
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-12 text-center text-white/40">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium">Bu tarihte kayıtlı bir iş bulunmuyor.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>

          <button className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-gold hover:text-gold transition-all">
            + Yeni Etkinlik Ekle
          </button>
        </div>

      </div>
    </div>
  );
};

export default CalendarView;
