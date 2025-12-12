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
      setParsedData(data);
      setStep('preview');
    } catch (error) {
      alert('Error analyzing image. Please try again.');
      setStep('upload');
    }
  };

  const handleConfirmImport = () => {
    parsedData.forEach(item => {
      let startIso = `${item.dateStr}T${item.startTime}:00`;
      let endIso = `${item.dateStr}T${item.endTime}:00`;
      if (item.endTime === '24:00') {
         const d = new Date(item.dateStr);
         d.setDate(d.getDate() + 1);
         const nextDay = d.toISOString().split('T')[0];
         endIso = `${nextDay}T00:00:00`;
      }
      saveSession({
        id: crypto.randomUUID(),
        workName: item.workName || 'Live',
        location: 'Studio',
        hourlyRate: 0,
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
              <p className="text-slate-800 font-bold mt-6">Analyzing Schedule...</p>
              <p className="text-slate-400 text-sm mt-1">This might take a few seconds</p>
           </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 pb-24 pt-4">
             <p className="text-center text-slate-400 text-xs uppercase font-bold tracking-widest mb-2">Found {parsedData.length} Shifts</p>
             {parsedData.map((item, i) => (
               <div key={i} className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-sm border border-white flex items-center gap-4">
                  <div className="bg-slate-50 w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-slate-100">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(item.dateStr).toLocaleString('en-US', {month: 'short'})}</span>
                     <span className="text-lg font-bold text-slate-800 leading-none">{new Date(item.dateStr).getDate()}</span>
                  </div>
                  <div className="flex-1">
                     <p className="font-bold text-slate-800">{item.workName}</p>
                     <p className="text-xs text-slate-500 font-medium">{item.startTime} - {item.endTime}</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {step === 'preview' && (
         <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-white via-white/90 to-transparent z-30">
            <button onClick={handleConfirmImport} className="w-full py-4 bg-slate-800 text-white font-bold rounded-[1.5rem] shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
               <span>Confirm Import</span>
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