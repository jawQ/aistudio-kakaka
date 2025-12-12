import React, { useState, useRef } from 'react';
import { analyzeScheduleImage, OCRSessionData } from '../services/ocrService';
import { WorkSession, WorkStatus } from '../types';
import { saveSession } from '../services/mockBackend';

interface ImportViewProps {
  onBack: () => void;
  onImportSuccess: () => void;
}

const ImportView: React.FC<ImportViewProps> = ({ onBack, onImportSuccess }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'preview'>('upload');
  const [parsedData, setParsedData] = useState<OCRSessionData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStep('analyzing');
    try {
      const data = await analyzeScheduleImage(file);
      // Sort by date
      const sortedData = data.sort((a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime());
      setParsedData(sortedData);
      setStep('preview');
    } catch (error) {
      alert('无法识别图片，请重试');
      setStep('upload');
    }
  };

  const handleUpdateItem = (index: number, field: keyof OCRSessionData, value: string) => {
    const newData = [...parsedData];
    newData[index] = { ...newData[index], [field]: value };
    setParsedData(newData);
  };

  const handleDeleteItem = (index: number) => {
    const newData = parsedData.filter((_, i) => i !== index);
    setParsedData(newData);
    if (newData.length === 0) {
      setStep('upload');
    }
  };

  const handleConfirmImport = () => {
    parsedData.forEach(item => {
      let startIso = `${item.dateStr}T${item.startTime}:00`;
      let endIso = `${item.dateStr}T${item.endTime}:00`;
      
      // Handle midnight crossing or pure '24:00'
      if (item.endTime === '24:00' || item.endTime === '00:00') {
         const d = new Date(item.dateStr);
         d.setDate(d.getDate() + 1);
         const nextDay = d.toISOString().split('T')[0];
         endIso = `${nextDay}T00:00:00`;
      } else if (parseInt(item.endTime.split(':')[0]) < parseInt(item.startTime.split(':')[0])) {
         // Assume next day if end hour < start hour
         const d = new Date(item.dateStr);
         d.setDate(d.getDate() + 1);
         const nextDay = d.toISOString().split('T')[0];
         endIso = `${nextDay}T${item.endTime}:00`;
      }

      saveSession({
        id: crypto.randomUUID(),
        workName: item.workName || 'Live',
        location: 'Studio',
        hourlyRate: 0, // Default rate
        startTime: new Date(startIso).toISOString(),
        endTime: new Date(endIso).toISOString(),
        status: WorkStatus.UPCOMING,
        notes: item.notes || 'Imported from schedule'
      });
    });
    onImportSuccess();
  };

  return (
    <div className="flex flex-col h-full pt-safe">
       {/* Nav */}
      <div className="px-6 py-4 flex justify-between items-center relative z-20">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-white flex items-center justify-center text-slate-600">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Smart Import</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 px-6 pb-safe flex flex-col overflow-y-auto">
        {step === 'upload' && (
          <div className="flex-1 flex flex-col justify-center items-center pb-20">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="w-full aspect-[3/4] max-w-xs bg-white/60 backdrop-blur-sm rounded-[2.5rem] shadow-soft border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 hover:bg-white/80 transition-all group"
             >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-slate-400 shadow-sm group-hover:scale-110 transition-transform">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-slate-800 font-bold text-lg">Upload Schedule</p>
                <p className="text-slate-400 text-xs mt-2 px-8 text-center leading-relaxed">Select a screenshot of your monthly schedule note</p>
             </div>
             <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {step === 'analyzing' && (
           <div className="flex-1 flex flex-col justify-center items-center pb-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
              </div>
              <p className="text-slate-800 font-bold mt-6">Analyzing...</p>
           </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 pb-28 pt-4">
             <div className="flex justify-between items-end px-2">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Found {parsedData.length} Shifts</p>
                <p className="text-slate-300 text-[10px]">Tap to edit</p>
             </div>
             
             {parsedData.map((item, i) => (
               <div key={i} className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-sm border border-white relative group">
                  {/* Header: Date & Delete */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                       <input 
                          type="date" 
                          value={item.dateStr}
                          onChange={(e) => handleUpdateItem(i, 'dateStr', e.target.value)}
                          className="bg-transparent text-sm font-bold text-slate-500 uppercase outline-none"
                       />
                    </div>
                    <button 
                      onClick={() => handleDeleteItem(i)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Body: Time & Name Inputs */}
                  <div className="flex gap-3">
                     <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">Time</label>
                        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-2 py-1.5 border border-slate-100">
                           <input 
                              type="time" 
                              value={item.startTime}
                              onChange={(e) => handleUpdateItem(i, 'startTime', e.target.value)}
                              className="bg-transparent text-sm font-bold text-slate-800 outline-none w-full"
                           />
                           <span className="text-slate-300">-</span>
                           <input 
                              type="time" 
                              value={item.endTime === '24:00' ? '00:00' : item.endTime}
                              onChange={(e) => handleUpdateItem(i, 'endTime', e.target.value)}
                              className="bg-transparent text-sm font-bold text-slate-800 outline-none w-full"
                           />
                        </div>
                     </div>
                     <div className="flex-[1.5] space-y-2">
                        <label className="text-[10px] font-bold text-slate-300 uppercase block">Project</label>
                        <input 
                           type="text" 
                           value={item.workName}
                           onChange={(e) => handleUpdateItem(i, 'workName', e.target.value)}
                           className="w-full bg-slate-50 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 outline-none border border-slate-100 focus:bg-white focus:border-slate-300 transition-colors"
                        />
                     </div>
                  </div>
               </div>
             ))}
             
             {/* Add Row Button (Optional, but nice to have space) */}
             <div className="h-8"></div>
          </div>
        )}
      </div>

      {step === 'preview' && (
         <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/95 to-transparent z-30">
            <button onClick={handleConfirmImport} className="w-full py-4 bg-slate-800 text-white font-bold rounded-[1.5rem] shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
               <span>Import {parsedData.length} Shifts</span>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
               </svg>
            </button>
         </div>
      )}
    </div>
  );
};

export default ImportView;