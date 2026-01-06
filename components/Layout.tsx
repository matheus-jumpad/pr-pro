
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'all-prs' | 'my-prs';
  onTabChange: (tab: 'dashboard' | 'all-prs' | 'my-prs') => void;
  title: string;
  isConnected: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, title, isConnected }) => {
  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-white flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PR Pro
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              {isConnected ? 'GitHub Connected' : 'Simulation Mode'}
            </span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Repositories
          </button>
          <button 
            onClick={() => onTabChange('all-prs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'all-prs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            Feed
          </button>
          <button 
            onClick={() => onTabChange('my-prs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'my-prs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            My PRs
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <img src="https://picsum.photos/seed/user/40/40" className="w-10 h-10 rounded-full border-2 border-indigo-500" alt="Avatar" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">Developer Mode</p>
              <p className="text-xs text-slate-500">Settings</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-slate-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-indigo-400">PR Pro</h1>
        <div className="flex gap-4">
          <button onClick={() => onTabChange('dashboard')} className={activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <button onClick={() => onTabChange('all-prs')} className={activeTab === 'all-prs' ? 'text-indigo-400' : 'text-slate-400'}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
          </button>
          <button onClick={() => onTabChange('my-prs')} className={activeTab === 'my-prs' ? 'text-indigo-400' : 'text-slate-400'}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 md:static z-10 hidden md:block">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <div className="flex items-center gap-2">
               <span className="text-xs text-slate-400">Powered by Gemini AI</span>
               <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
