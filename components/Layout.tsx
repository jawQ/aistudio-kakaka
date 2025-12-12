import React from 'react';
import { NavTab } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-full relative">
      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-safe-nav">
        {children}
      </main>

      {/* Floating Navigation Pill */}
      <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pb-safe pointer-events-none">
        <div className="mb-4 pointer-events-auto">
          <nav className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-full shadow-soft p-1.5 flex gap-2 items-center">
            <button 
              onClick={() => onTabChange('home')}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === 'home' 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === 'home' ? "currentColor" : "none"} strokeWidth={activeTab === 'home' ? 0 : 2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5h-13.5zm0 3.75h13.5h-13.5z" />
              </svg>
              {activeTab === 'home' && <span className="text-sm font-bold">日程</span>}
            </button>

            <button 
              onClick={() => onTabChange('mine')}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeTab === 'mine' 
                  ? 'bg-slate-800 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={activeTab === 'mine' ? "currentColor" : "none"} strokeWidth={activeTab === 'mine' ? 0 : 2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {activeTab === 'mine' && <span className="text-sm font-bold">我的</span>}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;