
import React from 'react';
import { Staff, ManualOverride, DutyStatus } from '../types.ts';
import { getDaysInMonth, getStatusForDate } from '../utils/rotaUtils.ts';
import { format, isWeekend } from 'date-fns';

interface ScheduleGridProps {
  staffList: Staff[];
  month: number;
  year: number;
  overrides: ManualOverride[];
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onOverride: (staffId: string, date: string, status: DutyStatus) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  staffList, month, year, overrides, onMonthChange, onYearChange, onOverride 
}) => {
  const days = getDaysInMonth(year, month);
  const activeStaff = staffList.filter(s => s.active);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 1);

  const handleCellClick = (staffId: string, date: Date, currentStatus: DutyStatus) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const nextStatus: Record<DutyStatus, DutyStatus> = {
      'duty': 'off',
      'off': 'leave',
      'leave': 'duty'
    };
    onOverride(staffId, dateStr, nextStatus[currentStatus]);
  };

  const getStatusStyle = (status: DutyStatus) => {
    switch (status) {
      case 'duty': return 'text-[#2563EB] font-black bg-[#EFF6FF]';
      case 'off': return 'text-[#94A3B8] font-medium bg-white';
      case 'leave': return 'text-[#D97706] font-black bg-[#FFFBEB]';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-4">
          <select 
            value={month} 
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-slate-700"
          >
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            value={year} 
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-slate-700"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm font-semibold"
          >
            🖨️ Print Grid
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col print:border-slate-300 print:shadow-none">
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-200">
                <th className="sticky left-0 z-20 bg-[#F8FAFC] w-72 px-6 py-5 text-left border-r border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Staff Member
                </th>
                {days.map(day => (
                  <th 
                    key={day.toISOString()} 
                    className={`px-1 py-4 text-center border-r border-slate-100 min-w-[42px] ${isWeekend(day) ? 'bg-[#F1F5F9]' : ''}`}
                  >
                    <div className="text-[9px] uppercase font-black text-slate-400 mb-0.5">{format(day, 'EEE')}</div>
                    <div className="text-[13px] font-black text-slate-900">{format(day, 'dd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStaff.map(staff => (
                <tr key={staff.id} className="group hover:bg-slate-50/50 transition">
                  <td className="sticky left-0 z-10 bg-white px-6 py-4 border-r border-slate-200 group-hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-900 leading-tight">{staff.name}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter mt-0.5">{staff.designation}</p>
                      </div>
                    </div>
                  </td>
                  {days.map(day => {
                    const status = getStatusForDate(staff, day, overrides);
                    return (
                      <td 
                        key={day.toISOString()} 
                        onClick={() => handleCellClick(staff.id, day, status)}
                        className={`p-1 border-r border-slate-100 cursor-pointer transition-colors ${isWeekend(day) ? 'bg-[#F8FAFC]/50' : ''}`}
                      >
                        <div className={`w-full h-10 flex items-center justify-center rounded-lg text-[10px] uppercase tracking-tighter border border-transparent hover:border-slate-300 transition-all ${getStatusStyle(status)}`}>
                          {status}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-slate-50/95 font-black border-t-2 border-slate-200">
                <td className="sticky left-0 z-10 bg-slate-50 px-6 py-5 border-r border-slate-200 text-[11px] text-slate-500 uppercase tracking-widest">
                  Total Staff On Duty
                </td>
                {days.map(day => {
                  const count = activeStaff.filter(s => getStatusForDate(s, day, overrides) === 'duty').length;
                  return (
                    <td key={day.toISOString()} className="px-1 py-5 text-center text-[15px] text-blue-700 border-r border-slate-100">
                      {count}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
