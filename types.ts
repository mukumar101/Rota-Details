
export type Designation = 'Doctor' | 'RN' | 'Consultant' | 'Technician' | 'Support' | 'Trauma Head' | 'Site Doctor';

export type DutyStatus = 'duty' | 'off' | 'leave';

export interface RotaPattern {
  dutyDays: number;
  offDays: number;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  rotaPattern: string; // e.g., "15/13"
  startDate: string;   // ISO format date
  active: boolean;
  avatar?: string;
}

export interface ManualOverride {
  staffId: string;
  date: string; // ISO string (YYYY-MM-DD)
  status: DutyStatus;
}

export type ViewType = 'dashboard' | 'staff' | 'schedule' | 'travel';

export interface DailyStats {
  date: string;
  totalDuty: number;
  doctorsOnDuty: number;
  nursesOnDuty: number;
}
