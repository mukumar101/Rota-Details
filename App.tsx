import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StaffManagement from './components/StaffManagement';
import ScheduleGrid from './components/ScheduleGrid';
import TravelDetails from './components/TravelDetails';
import Login from './components/Login';
import { Staff, ViewType, ManualOverride, DutyStatus } from './types';
import { getStatusForDate } from './utils/rotaUtils';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('medrota_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('schedule');
  const [isSyncing, setIsSyncing] = useState(false);

  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('medrota_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [overrides, setOverrides] = useState<ManualOverride[]>(() => {
    const saved = localStorage.getItem('medrota_overrides');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentMonth, setCurrentMonth] = useState(1); // February
  const [currentYear, setCurrentYear] = useState(2026);

  // Sync Logic
  const syncWithCloud = async () => {
    if (!isAuthenticated) return;
    setIsSyncing(true);
    try {
      // Call Netlify Function
      await fetch('/.netlify/functions/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffList, overrides })
      });
      console.log('Cloud Sync Successful');
    } catch (e) {
      console.error('Cloud Sync Failed', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    localStorage.setItem('medrota_staff', JSON.stringify(staffList));
    localStorage.setItem('medrota_overrides', JSON.stringify(overrides));
    syncWithCloud();
  }, [staffList, overrides]);

  const handleLogin = (password: string) => {
    if (password === 'admin') { // Simple password for demo
      setIsAuthenticated(true);
      sessionStorage.setItem('medrota_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Access Key. Please contact the administrator.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('medrota_auth');
  };

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={authError} />;
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <div className="fixed top-4 right-20 z-50 flex items-center gap-2 pointer-events-none">
        {isSyncing && (
          <div className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 animate-fade-in shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            Syncing...
          </div>
        )}
      </div>

      <div className="absolute top-4 right-8 z-50">
        <button 
          onClick={handleLogout}
          className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          Logout
        </button>
      </div>

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