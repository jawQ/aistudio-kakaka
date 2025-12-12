import React, { useState, useEffect, useMemo } from 'react';
import { User, WorkSession, WorkStatus } from '../types';
import { getUser, loginUser, logoutUser, getSessions } from '../services/mockBackend';
import { formatCurrency } from '../utils';

const ProfileView: React.FC = () => {
  const [user, setUser] = useState<User>({ id: 'guest', phone: '', isLoggedIn: false });
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    setUser(getUser());
    setSessions(getSessions());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length !== 11) return alert('Check phone number');
    setUser(loginUser(phoneInput));
  };

  const stats = useMemo(() => {
    const now = new Date();
    const valid = sessions.filter(s => s.status !== WorkStatus.CANCELLED);
    
    const calc = (list: WorkSession[]) => {
      const h = list.reduce((acc, s) => acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 36e5, 0);
      const m = list.reduce((acc, s) => acc + ((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 36e5) * s.hourlyRate, 0);
      return { totalHours: Number(h.toFixed(1)), totalEarnings: m };
    };

    return {
      month: calc(valid.filter(s => new Date(s.startTime).getMonth() === now.getMonth())),
      year: calc(valid.filter(s => new Date(s.startTime).getFullYear() === now.getFullYear()))
    };
  }, [sessions]);

  if (!user.isLoggedIn) {
    return (
      <div className="h-full flex flex-col justify-center items-center px-8 relative">
        <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl rotate-3 transform hover:rotate-6 transition-transform duration-500">
          <span className="text-5xl text-white">✦</span>
        </div>
        <h1 className="text-3xl font-serif text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-slate-400 text-sm mb-10">Sign in to manage your shifts</p>
        
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
           <input 
             type="tel" 
             value={phoneInput} 
             onChange={e => setPhoneInput(e.target.value)}
             className="w-full p-4 bg-white/80 backdrop-blur-sm rounded-2xl text-center text-lg font-bold text-slate-800 shadow-soft outline-none placeholder:text-slate-300 border border-white focus:border-slate-300 transition-colors"
             placeholder="Phone Number"
           />
           <button type="submit" className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-full px-6 pt-safe pb-4">
      {/* Header Space */}
      <div className="h-4"></div>

      {/* Profile Card */}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-20 h-20 rounded-full p-1 bg-white shadow-soft">
           <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" />
        </div>
        <div>
           <h2 className="text-2xl font-serif text-slate-800">{user.nickname}</h2>
           <button onClick={logoutUser} className="text-xs font-bold text-slate-400 mt-1 hover:text-rose-400 transition-colors">Sign out</button>
        </div>
      </div>

      {/* Stats Section */}
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">This Month</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-soft border border-white flex flex-col justify-between h-40">
           <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div>
              <p className="text-3xl font-medium text-slate-800 tracking-tight">{stats.month.totalHours}<span className="text-sm text-slate-400 ml-1">h</span></p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Hours</p>
           </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-soft border border-white flex flex-col justify-between h-40">
           <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </div>
           <div>
              <p className="text-3xl font-medium text-slate-800 tracking-tight">{(stats.month.totalEarnings / 1000).toFixed(1)}<span className="text-sm text-slate-400 ml-1">k</span></p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Earned</p>
           </div>
        </div>
      </div>

      {/* Annual Summary Large Card */}
      <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer">
         {/* Decorative Blurs */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
               <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide">Year 2024</span>
               <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                 </svg>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Total Hours</p>
                  <p className="text-3xl font-serif">{stats.year.totalHours}</p>
               </div>
               <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Total Income</p>
                  <p className="text-3xl font-serif">{formatCurrency(stats.year.totalEarnings)}</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProfileView;