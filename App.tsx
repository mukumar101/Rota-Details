
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StaffManagement from './components/StaffManagement';
import ScheduleGrid from './components/ScheduleGrid';
import TravelDetails from './components/TravelDetails';
import { Staff, ViewType, ManualOverride, DutyStatus } from './types';
import { getStatusForDate } from './utils/rotaUtils';

/**
 * Seed data calculated to match the provided Travel Details table for Feb 2026.
 * Cycle: 15 days DUTY / 13 days OFF (28-day cycle)
 * Return to Site = Day 1 of Duty
 * Leaving Site = Day 15 of Duty
 */
const INITIAL_STAFF: Staff[] = [
  { id: '1', name: 'Dr Inamullah', designation: 'Trauma Head', rotaPattern: '15/13', startDate: '2026-01-31', active: true },
  { id: '2', name: 'Dr Ghulam Ali', designation: 'Site Doctor', rotaPattern: '15/13', startDate: '2026-01-16', active: true },
  { id: '3', name: 'Dr Jawaid', designation: 'Site Doctor', rotaPattern: '15/13', startDate: '2026-01-12', active: true },
  { id: '4', name: 'Dr Simran', designation: 'Site Doctor', rotaPattern: '15/13', startDate: '2026-01-26', active: true },
  { id: '5', name: 'Arfa Manzoor', designation: 'RN', rotaPattern: '15/13', startDate: '2026-01-28', active: true },
  { id: '6', name: 'Zuhra Baloch', designation: 'RN', rotaPattern: '15/13', startDate: '2026-01-16', active: true },
  { id: '7', name: 'Mukesh Kumar', designation: 'RN', rotaPattern: '15/13', startDate: '2026-01-06', active: true },
  { id: '8', name: 'Saqib Ali', designation: 'RN', rotaPattern: '15/13', startDate: '2026-01-20', active: true },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('schedule');
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('medrota_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });
  const [overrides, setOverrides] = useState<ManualOverride[]>(() => {
    const saved = localStorage.getItem('medrota_overrides');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentMonth, setCurrentMonth] = useState(1); // February (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  // Persistence
  useEffect(() => {
    localStorage.setItem('medrota_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('medrota_overrides', JSON.stringify(overrides));
  }, [overrides]);

  // Initial setup for the requested Feb 2026 view
  useEffect(() => {
    if (!localStorage.getItem('medrota_initialized_v2')) {
      setCurrentMonth(1); 
      setCurrentYear(2026);
      localStorage.setItem('medrota_initialized_v2', 'true');
    }
  }, []);

  const todayStats = useMemo(() => {
    const today = new Date();
    const dutyToday = staffList.filter(s => getStatusForDate(s, today, overrides) === 'duty');
    return {
      totalDuty: dutyToday.length,
      doctors: dutyToday.filter(s => s.designation.includes('Doctor') || s.designation.includes('Trauma')).length,
      nurses: dutyToday.filter(s => s.designation === 'RN').length
    };
  }, [staffList, overrides]);

  const handleAddStaff = (newStaff: Omit<Staff, 'id'>) => {
    const staff: Staff = {
      ...newStaff,
      id: Math.random().toString(36).substr(2, 9),
      avatar: `https://picsum.photos/seed/${Math.random()}/100`
    };
    setStaffList([...staffList, staff]);
  };

  const handleUpdateStaff = (updated: Staff) => {
    setStaffList(staffList.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== id));
      setOverrides(overrides.filter(o => o.staffId !== id));
    }
  };

  const handleOverride = (staffId: string, date: string, status: DutyStatus) => {
    const existingIdx = overrides.findIndex(o => o.staffId === staffId && o.date === date);
    if (existingIdx > -1) {
      const newOverrides = [...overrides];
      newOverrides[existingIdx].status = status;
      setOverrides(newOverrides);
    } else {
      setOverrides([...overrides, { staffId, date, status }]);
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'dashboard' && (
        <Dashboard 
          staffList={staffList} 
          todayStats={todayStats} 
          onNavigate={setActiveView} 
        />
      )}
      {activeView === 'staff' && (
        <StaffManagement 
          staffList={staffList} 
          onAdd={handleAddStaff}
          onUpdate={handleUpdateStaff}
          onDelete={handleDeleteStaff}
        />
      )}
      {activeView === 'schedule' && (
        <ScheduleGrid 
          staffList={staffList}
          month={currentMonth}
          year={currentYear}
          overrides={overrides}
          onMonthChange={setCurrentMonth}
          onYearChange={setCurrentYear}
          onOverride={handleOverride}
        />
      )}
      {activeView === 'travel' && (
        <TravelDetails 
          staffList={staffList}
          month={currentMonth}
          year={currentYear}
          overrides={overrides}
          onMonthChange={setCurrentMonth}
          onYearChange={setCurrentYear}
        />
      )}
    </Layout>
  );
};

export default App;
