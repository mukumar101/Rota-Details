
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: '📊' },
    { id: 'staff' as ViewType, label: 'Staff Management', icon: '👥' },
    { id: 'schedule' as ViewType, label: 'Monthly Schedule', icon: '📅' },
    { id: 'travel' as ViewType, label: 'Travel Details', icon: '✈️' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-800 leading-tight">MedRota</h1>
              <p className="text-xs text-slate-500">Hospital Scheduler</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400 mb-1">Current Version</p>
            <p className="text-sm font-semibold">v2.4.0 (Pro)</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {activeView === 'schedule' ? 'Monthly Duty Schedule' : 
             activeView === 'travel' ? 'Staff Travel Details' : activeView}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Head of Operations</p>
            </div>
            <img
              src="https://picsum.photos/seed/admin/100"
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-slate-200"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
