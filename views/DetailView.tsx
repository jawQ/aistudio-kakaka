import React, { useState, useEffect } from 'react';
import { WorkSession, WorkStatus } from '../types';
import { getSessionById, saveSession } from '../services/mockBackend';
import { formatDate, formatTime, calculateDuration, formatCurrency } from '../utils';

interface DetailViewProps {
  sessionId: string;
  onBack: () => void;
}

const DetailView: React.FC<DetailViewProps> = ({ sessionId, onBack }) => {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  useEffect(() => {
    const data = getSessionById(sessionId);
    if (data) {
      setSession(data);
      setNotes(data.notes);
      setStartTime(data.startTime.substring(0, 16));
      setEndTime(data.endTime.substring(0, 16));
    }
  }, [sessionId]);

  const handleSave = () => {
    if (!session) return;
    const updated: WorkSession = {
      ...session,
      notes,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };
    saveSession(updated);
    setSession(updated);
    setIsEditing(false);
  };

  const handleCancelSession = () => {
    if (!session || !confirm('确定要取消？')) return;
    const updated = { ...session, status: WorkStatus.CANCELLED };
    saveSession(updated);
    onBack();
  };

  if (!session) return <div className="p-8 text-center text-slate-300 pt-20">Loading...</div>;

  const duration = calculateDuration(isEditing ? new Date(startTime).toISOString() : session.startTime, isEditing ? new Date(endTime).toISOString() : session.endTime);
  const totalPay = duration * session.hourlyRate;

  return (
    <div className="flex flex-col h-full pt-safe">
      {/* Navbar */}
      <div className="px-6 py-4 flex items-center justify-between z-20">
        <button onClick={onBack} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border border-white shadow-sm flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Detail</span>
        {isEditing ? (
           <button onClick={handleSave} className="text-sm font-bold text-slate-800 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white">保存</button>
        ) : (
           <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-slate-800 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white">编辑</button>
        )}
      </div>

      <div className="px-6 flex-1 overflow-y-auto pb-safe">
        
        {/* Title Section */}
        <div className="mt-2 mb-6">
           <h1 className="text-3xl font-serif text-slate-800 mb-2">{session.workName}</h1>
           <p className="text-slate-500 font-medium flex items-center gap-2 text-sm">
             <span className={`w-2 h-2 rounded-full ${session.status === WorkStatus.UPCOMING ? 'bg-green-400' : 'bg-slate-300'}`}></span>
             {session.status === WorkStatus.UPCOMING ? 'Upcoming Session' : 'Completed / Archived'}
           </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-[1.5rem] shadow-soft border border-white">
               <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Duration</p>
               <p className="text-2xl font-semibold text-slate-800">{duration}<span className="text-sm text-slate-400 ml-1 font-normal">h</span></p>
            </div>
             <div className="bg-white/70 backdrop-blur-sm p-5 rounded-[1.5rem] shadow-soft border border-white">
               <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Earnings</p>
               <p className="text-2xl font-semibold text-slate-800">{formatCurrency(totalPay)}</p>
            </div>
        </div>

        {/* Time & Location */}
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-soft border border-white space-y-6 mb-4">
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Time</p>
                  {isEditing ? (
                    <div className="space-y-2">
                       <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-50 p-2 rounded-lg text-sm outline-none" />
                       <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-50 p-2 rounded-lg text-sm outline-none" />
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-800 font-medium">{formatDate(session.startTime)}</p>
                      <p className="text-slate-500 text-sm">{formatTime(session.startTime)} - {formatTime(session.endTime)}</p>
                    </>
                  )}
               </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                   </svg>
               </div>
               <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Location</p>
                  <p className="text-slate-800 font-medium">{session.location}</p>
               </div>
            </div>
        </div>

        {/* Notes */}
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[1.5rem] shadow-soft border border-white mb-6">
           <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Notes</p>
           {isEditing ? (
             <textarea 
               value={notes} 
               onChange={e => setNotes(e.target.value)} 
               className="w-full h-32 bg-slate-50 rounded-xl p-3 text-slate-700 text-sm outline-none resize-none"
               placeholder="Add notes..."
             />
           ) : (
             <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
               {session.notes || "No notes added."}
             </p>
           )}
        </div>

        {!isEditing && (
          <button onClick={handleCancelSession} className="w-full py-4 text-rose-400 text-sm font-bold bg-white/50 border border-rose-100 rounded-2xl mb-8">
            Cancel Shift
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailView;