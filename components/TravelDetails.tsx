
import React from 'react';
import { Staff, ManualOverride } from '../types.ts';
import { getDaysInMonth, getStatusForDate } from '../utils/rotaUtils.ts';
import { format, addDays } from 'date-fns';

interface TravelDetailsProps {
  staffList: Staff[];
  month: number;
  year: number;
  overrides: ManualOverride[];
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

const TravelDetails: React.FC<TravelDetailsProps> = ({ 
  staffList, month, year, overrides, onMonthChange, onYearChange 
}) => {
  const days = getDaysInMonth(year, month);
  const activeStaff = staffList.filter(s => s.active);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 1);

  const getTravelDates = (staff: Staff) => {
    const returnDates: string[] = [];
    const leavingDates: string[] = [];

    days.forEach((day) => {
      const currentStatus = getStatusForDate(staff, day, overrides);
      // Use addDays(date, -1) instead of subDays(date, 1) to resolve import error
      const prevDay = addDays(day, -1);
      const nextDay = addDays(day, 1);
      
      const prevStatus = getStatusForDate(staff, prevDay, overrides);
      const nextStatus = getStatusForDate(staff, nextDay, overrides);

      if (currentStatus === 'duty' && prevStatus !== 'duty') {
        returnDates.push(format(day, 'dd-MM-yyyy'));
      }
      if (currentStatus === 'duty' && nextStatus !== 'duty') {
        leavingDates.push(format(day, 'dd-MM-yyyy'));
      }
    });

    return {
      returns: returnDates.length > 0 ? returnDates.join(', ') : '—',
      leaves: leavingDates.length > 0 ? leavingDates.join(', ') : '—'
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-4">
          <select value={month} onChange={(e) => onMonthChange(parseInt(e.target.value))} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-700">
            {fullMonths.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => onYearChange(parseInt(e.target.value))} className="px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-700">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={() => window.print()} className="px-6 py-2 bg-slate-800 text-white rounded-xl font-semibold">🖨️ Print Report</button>
      </div>

      <div className="bg-white border-2 border-slate-800 shadow-xl overflow-hidden print:shadow-none print:border-slate-300">
        <div className="p-6 bg-[#D1D5DB] border-b-2 border-slate-800 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black uppercase">DRs & RN Rota Travelling Details for {months[month]} {year}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#E5E7EB] border-b-2 border-slate-800">
                <th className="px-3 py-3 border-r-2 border-slate-800 font-black text-black">Sr.#</th>
                <th className="px-6 py-3 text-left border-r-2 border-slate-800 font-black text-black">Name</th>
                <th className="px-6 py-3 text-left border-r-2 border-slate-800 font-black text-black">Designation</th>
                <th className="px-4 py-3 border-r-2 border-slate-800 font-black text-black">Rota Type</th>
                <th className="px-6 py-3 border-r-2 border-slate-800 font-black text-black">Date of Return to Site</th>
                <th className="px-6 py-3 font-black text-black">Date of Leaving Site</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-800">
              {activeStaff.map((staff, idx) => {
                const travel = getTravelDates(staff);
                return (
                  <tr key={staff.id} className="hover:bg-slate-50 border-b-2 border-slate-800 last:border-b-0">
                    <td className="px-3 py-4 text-center border-r-2 border-slate-800">{idx + 1}</td>
                    <td className="px-6 py-4 border-r-2 border-slate-800 font-bold text-lg">{staff.name}</td>
                    <td className="px-6 py-4 border-r-2 border-slate-800">{staff.designation}</td>
                    <td className="px-4 py-4 text-center border-r-2 border-slate-800">{staff.rotaPattern}</td>
                    <td className="px-6 py-4 text-center border-r-2 border-slate-800 font-bold">{travel.returns}</td>
                    <td className="px-6 py-4 text-center font-bold">{travel.leaves}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TravelDetails;
