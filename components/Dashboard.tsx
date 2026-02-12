
import React from 'react';
import { Staff, DailyStats } from '../types.ts';
import { format } from 'date-fns';

interface DashboardProps {
  staffList: Staff[];
  todayStats: {
    totalDuty: number;
    doctors: number;
    nurses: number;
  };
  onNavigate: (view: 'staff' | 'schedule') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ staffList, todayStats, onNavigate }) => {
  const totalActive = staffList.filter(s => s.active).length;
  
  const stats = [
    { label: 'Total Active Staff', value: totalActive, icon: '👥', color: 'blue' },
    { label: 'On Duty Today', value: todayStats.totalDuty, icon: '🏥', color: 'emerald' },
    { label: 'Doctors Available', value: todayStats.doctors, icon: '🩺', color: 'purple' },
    { label: 'Nurses Available', value: todayStats.nurses, icon: '💉', color: 'orange' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-slate-500">Real-time stats for {format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
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
              <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-50 text-${stat.color}-700`}>
                Live Data
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Staff</h3>
            <button onClick={() => onNavigate('staff')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {staffList.slice(0, 5).map((staff) => (
              <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <img src={staff.avatar || `https://picsum.photos/seed/${staff.id}/100`} className="w-10 h-10 rounded-full" alt="" />
                  <div>
                    <p className="font-semibold text-slate-800">{staff.name}</p>
                    <p className="text-xs text-slate-500">{staff.designation} • {staff.rotaPattern} Pattern</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${staff.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {staff.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">Quick Navigation</h3>
          <div className="space-y-4">
            <button 
              onClick={() => onNavigate('staff')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">➕</span>
                <span className="font-medium text-slate-700 group-hover:text-blue-700">Add New Staff</span>
              </div>
              <span className="text-slate-400 group-hover:text-blue-400">→</span>
            </button>
            <button 
              onClick={() => onNavigate('schedule')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📜</span>
                <span className="font-medium text-slate-700 group-hover:text-blue-700">Export Rota</span>
              </div>
              <span className="text-slate-400 group-hover:text-blue-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
