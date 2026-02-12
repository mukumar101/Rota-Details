
import { differenceInDays, parseISO, startOfDay, format, addDays } from 'date-fns';
import { Staff, DutyStatus, ManualOverride } from '../types.ts';

/**
 * The core Rota Algorithm
 * Determines if a staff member is on duty for a specific date based on their cycle.
 */
export const getStatusForDate = (
  staff: Staff,
  targetDate: Date,
  overrides: ManualOverride[]
): DutyStatus => {
  // 1. Check for manual overrides first (Overrides take precedence)
  const dateStr = format(targetDate, 'yyyy-MM-dd');
  const override = overrides.find(o => o.staffId === staff.id && o.date === dateStr);
  if (override) return override.status;

  if (!staff.active) return 'off';

  // 2. Parse rota pattern (e.g., "15/13")
  const [dutyDays, offDays] = staff.rotaPattern.split('/').map(Number);
  if (!dutyDays || !offDays) return 'off';

  const cycleLength = dutyDays + offDays;
  const start = startOfDay(parseISO(staff.startDate));
  const target = startOfDay(targetDate);

  // 3. Calculate days elapsed since start
  const daysDiff = differenceInDays(target, start);

  // If before start date, assume off
  if (daysDiff < 0) return 'off';

  // 4. Calculate position in the repeating cycle
  const positionInCycle = daysDiff % cycleLength;

  // If position is within the duty segment, return duty
  return positionInCycle < dutyDays ? 'duty' : 'off';
};

export const parsePattern = (pattern: string): { duty: number; off: number } => {
  const [duty, off] = pattern.split('/').map(Number);
  return { duty: duty || 0, off: off || 0 };
};

export const getDaysInMonth = (year: number, month: number): Date[] => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};
