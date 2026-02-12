
import React from 'react';
import { Staff, ManualOverride, DutyStatus } from '../types.ts';
import { format } from 'date-fns';
import { getStatusForDate } from '../utils/rotaUtils.ts';

interface DashboardProps {
  staffList: Staff[];
  todayStats: {
    totalDuty: number;
    doctors: number;
    nurses: number;
  };
  overrides: ManualOverride[];
  onNavigate: (view: 'staff' | 'schedule') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ staffList, todayStats, overrides, onNavigate }) => {
  const totalActive = staffList.filter(s => s.active).length;
  const today = new Date();
  
  const stats = [
    { label: 'Total Active Staff', value: totalActive, icon: '👥', color: 'blue' },
    { label: 'On Duty Today', value: todayStats.totalDuty, icon: '🏥', color: 'emerald' },
    { label: 'Doctors Available', value: todayStats.doctors, icon: '🩺', color: 'purple' },
    { label: 'Nurses Available', value: todayStats.nurses, icon: '💉', color: 'orange' },
  ];

  const getStatusBadge = (status: DutyStatus) => {
    switch (status) {
      case 'duty':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            On Duty
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
            On Leave
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">
            Off
          </span>
        );
    }
  };

  // Sort staff to show On Duty first
  const sortedStaff = [...staffList]
    .filter(s => s.active)
    .sort((a, b) => {
      const statusA = getStatusForDate(a, today, overrides);
      const statusB = getStatusForDate(b, today, overrides);
      if (statusA === 'duty' && statusB !== 'duty') return -1;
      if (statusA !== 'duty' && statusB === 'duty') return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-slate-500">Real-time stats for {format(today, 'EEEE, MMMM do, yyyy')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('schedule')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            View Full Grid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 uppercase tracking-tight`}>
                Live
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800">Staff Status (Today)</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Personnel Only</p>
            </div>
            <button onClick={() => onNavigate('staff')} className="text-xs text-blue-600 font-bold hover:underline uppercase tracking-widest">Manage Staff</button>
          </div>
          <div className="overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {sortedStaff.map((staff) => {
              const status = getStatusForDate(staff, today, overrides);
              return (
                <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={staff.avatar || `https://picsum.photos/seed/${staff.id}/100`} 
                        className={`w-11 h-11 rounded-full border-2 ${status === 'duty' ? 'border-blue-500' : 'border-slate-100'}`} 
                        alt="" 
                      />
                      {status === 'duty' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{staff.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-tighter">
                        {staff.designation} • {staff.rotaPattern} Cycle
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(status)}
                  </div>
                </div>
              );
            })}
            {sortedStaff.length === 0 && (
              <div className="p-12 text-center text-slate-400 italic">
                No active staff found in the system.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4">Quick Navigation</h3>
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate('staff')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">Add New Staff</span>
              </div>
              <span className="text-slate-300 group-hover:text-blue-400">→</span>
            </button>
            <button 
              onClick={() => onNavigate('schedule')}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📅</span>
                <span className="font-bold text-slate-700 group-hover:text-blue-700 text-sm">Manage Rota</span>
              </div>
              <span className="text-slate-300 group-hover:text-blue-400">→</span>
            </button>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Health</p>
               <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>Data Synchronization</span>
                  <span className="text-emerald-500">Active</span>
               </div>
               <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-emerald-400"></div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
