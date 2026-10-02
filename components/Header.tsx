import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onHome: () => void;
  onAdminToggle?: () => void;
  onProfileToggle?: () => void;
  isAdminMode?: boolean;
  isProfileMode?: boolean;
  activeAssessmentName?: string | null;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  onHome, 
  onAdminToggle, 
  onProfileToggle, 
  isAdminMode, 
  isProfileMode,
  activeAssessmentName
}) => {
  if (!user) return null;

  const isDashboard = !isAdminMode && !isProfileMode && !activeAssessmentName;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-[60] no-print h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          className="flex items-center gap-4 cursor-pointer group"
          onClick={onHome}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-200 transition-all group-hover:rotate-6 group-hover:scale-105">
              T
            </div>
            {activeAssessmentName && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight uppercase">THINCS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Operational Marker System</p>
          </div>
        </div>

        {/* Dynamic Context Area (Center) */}
        {activeAssessmentName && (
          <div className="hidden lg:flex items-center gap-3 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-xl shadow-slate-200 animate-in slide-in-from-top-4 duration-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Recording:</span>
            <span className="text-sm font-bold truncate max-w-[200px]">{activeAssessmentName}</span>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          
          {/* Dashboard/Home Button */}
          <button 
            onClick={onHome}
            className={`flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-2xl transition-all ${
              isDashboard 
                ? 'bg-slate-100 text-slate-900 shadow-inner ring-1 ring-slate-200' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-house text-lg md:text-base"></i>
            <span className="hidden md:block text-[9px] font-black uppercase mt-1 tracking-widest">Dash</span>
          </button>

          {/* Admin Toggle */}
          {user.role === 'admin' && (
            <button 
              onClick={onAdminToggle}
              className={`flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-2xl transition-all ${
                isAdminMode 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-100 ring-2 ring-red-100' 
                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <i className="fa-solid fa-user-shield text-lg md:text-base"></i>
              <span className="hidden md:block text-[9px] font-black uppercase mt-1 tracking-widest">Admin</span>
            </button>
          )}

          {/* Profile Toggle */}
          <button 
            onClick={onProfileToggle}
            className={`flex flex-col items-center justify-center w-12 h-12 md:w-auto md:h-auto md:px-5 md:py-2.5 rounded-2xl transition-all ${
              isProfileMode 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-id-badge text-lg md:text-base"></i>
            <span className="hidden md:block text-[9px] font-black uppercase mt-1 tracking-widest">Profile</span>
          </button>

          <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

          {/* User & Logout */}
          <div className="flex items-center gap-2 ml-2">
            <div className="hidden xl:flex flex-col items-end mr-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{user.name}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">{user.role}</span>
            </div>
            <button 
              onClick={onLogout}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
              title="End Session"
            >
              <i className="fa-solid fa-power-off text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;