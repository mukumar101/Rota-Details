
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import StaffManagement from './components/StaffManagement.tsx';
import ScheduleGrid from './components/ScheduleGrid.tsx';
import TravelDetails from './components/TravelDetails.tsx';
import Login from './components/Login.tsx';
import { Staff, ViewType, ManualOverride, DutyStatus } from './types.ts';
import { getStatusForDate } from './utils/rotaUtils.ts';

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
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');
  const [isLoading, setIsLoading] = useState(true);

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [overrides, setOverrides] = useState<ManualOverride[]>([]);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());



  // 1. Initial Data Fetch
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/.netlify/functions/data');

        if (!response.ok) {
          console.error(`Cloud Sync: Server returned ${response.status}`);
          setSyncStatus('error');
          return;
        }

        const cloudData = await response.json();

        if (cloudData.staffList && Array.isArray(cloudData.staffList)) {
          setStaffList(cloudData.staffList);
          setOverrides(cloudData.overrides || []);
          setSyncStatus('synced');
        } else {
          // First-time setup: seed initial data to cloud
          console.info('Cloud Sync: No data in store. Seeding initial data...');
          setStaffList(INITIAL_STAFF);
          setOverrides([]);
          setSyncStatus('synced');
        }
      } catch (e) {
        console.error('Cloud Sync: Network or fetch error.', e);
        setSyncStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isAuthenticated]);

  // 2. Sync to Cloud
  useEffect(() => {
    if (isLoading || !isAuthenticated || staffList.length === 0) return;

    const syncTimer = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        const response = await fetch('/.netlify/functions/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staffList,
            overrides,
            lastUpdated: new Date().toISOString(),
            client: 'MedRota-Web-Client'
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSyncStatus('synced');
          } else {
            setSyncStatus('error');
          }
        } else {
          console.error(`Cloud Sync: POST failed with ${response.status}`);
          setSyncStatus('error');
        }
      } catch (e) {
        console.error('Cloud Sync: Network error on save.', e);
        setSyncStatus('error');
      }
    }, 2000);

    return () => clearTimeout(syncTimer);
  }, [staffList, overrides, isLoading, isAuthenticated]);

  const handleLogin = (username: string, password: string) => {
    if (username === 'Admin' && password === 'mk123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('medrota_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid username or password. Please contact the administrator.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing Hospital Records...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <div className="fixed top-4 right-24 z-50 flex items-center gap-2 pointer-events-none">
        {syncStatus === 'syncing' && (
          <div className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            Syncing...
          </div>
        )}
        {syncStatus === 'synced' && (
          <div className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-200 shadow-sm opacity-60">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Cloud Persistent
          </div>
        )}

        {syncStatus === 'error' && (
          <div className="bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span>⚠️ Sync Failure</span>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-8 z-50">
        <button
          onClick={handleLogout}
          className="bg-white border border-slate-200 text-slate-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all font-medium shadow-sm"
        >
          Logout
        </button>
      </div>

      {activeView === 'dashboard' && (
        <Dashboard
          staffList={staffList}
          todayStats={todayStats}
          overrides={overrides}
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
