import React, { useState, useEffect, useMemo } from 'react';
import { WorkSession, WorkStatus } from '../types';
import { getSessions } from '../services/mockBackend';
import { formatTime, calculateDuration, isSameDay, getDatesInRange } from '../utils';

interface HomeViewProps {
  onSessionClick: (id: string) => void;
  onImportClick: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onSessionClick, onImportClick }) => {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const calendarDays = useMemo(() => getDatesInRange(new Date(), 14), []);

  const daySessions = useMemo(() => {
    return sessions.filter(s => 
      isSameDay(new Date(s.startTime), selectedDate) && 
      s.status !== WorkStatus.CANCELLED
    ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [sessions, selectedDate]);

  return (
    <div className="flex flex-col min-h-full px-6 pt-safe">
      {/* Header */}
      <header className="flex justify-between items-end mb-6 mt-2">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Schedule</p>
          <h1 className="text-3xl font-serif text-slate-800 tracking-tight">
            Hi, 仙女 <span className="text-2xl">✨</span>
          </h1>
        </div>
        <button 
          onClick={onImportClick}
          className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-slate-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </header>

      {/* Calendar Strip */}
      <div className="mb-6 relative z-10">
        <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
          {calendarDays.map((date, idx) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center flex-shrink-0 transition-all duration-300 group ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <span className="text-[10px] font-bold text-slate-500 mb-2 uppercase">
                  {isToday ? 'Today' : date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                </span>
                <div className={`w-11 h-11 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isSelected 
                    ? 'bg-slate-800 text-white shadow-lg scale-100' 
                    : 'bg-white text-slate-600 border border-slate-100'
                }`}>
                  {date.getDate()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 space-y-4 pb-4">
        {daySessions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/50 rounded-3xl bg-white/30 backdrop-blur-sm">
            <div className="text-4xl mb-3 opacity-60">☕️</div>
            <p className="text-slate-400 font-medium text-sm">今日无通告，好好休息</p>
          </div>
        ) : (
          daySessions.map(session => (
            <div 
              key={session.id}
              onClick={() => onSessionClick(session.id)}
              className="bg-white/80 backdrop-blur-sm rounded-[1.5rem] p-5 shadow-soft border border-white hover-scale cursor-pointer relative overflow-hidden group"
            >
              <div className="pl-3 flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-100/50 text-orange-600 text-[10px] font-bold tracking-wide uppercase border border-orange-100">
                        {session.workName}
                      </span>
                   </div>
                   <h3 className="text-2xl font-semibold text-slate-800 tracking-tight leading-tight">
                     {formatTime(session.startTime)}
                     <span className="text-slate-300 mx-1.5 font-light">/</span>
                     {formatTime(session.endTime)}
                   </h3>
                   <div className="mt-2.5 flex items-center text-slate-500 text-xs font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1 text-slate-400">
                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      {session.location}
                   </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch">
                   <div className="w-10 h-10 bg-slate-100/50 rounded-xl flex items-center justify-center mb-1 group-hover:bg-slate-100 transition-colors">
                      <span className="text-sm font-bold text-slate-700">{calculateDuration(session.startTime, session.endTime)}h</span>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeView;