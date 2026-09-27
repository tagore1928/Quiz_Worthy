/**
 * Utility functions for Indian Standard Time (IST - UTC+05:30) date key generation and Heatmap rendering.
 */

// Returns YYYY-MM-DD string in IST timezone
export const getISTDateKey = (d: Date = new Date()): string => {
  // Convert UTC time to IST (UTC + 5 hours 30 mins)
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 3600000;
  const istDate = new Date(utcTime + istOffset);

  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

// Returns current year in IST
export const getISTYear = (d: Date = new Date()): number => {
  const utcTime = d.getTime() + d.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 3600000;
  const istDate = new Date(utcTime + istOffset);
  return istDate.getFullYear();
};

export interface HeatmapDay {
  dateKey: string;
  displayDate: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  monthName: string;
}

// Generate last 365 days ending today in IST
export const getHeatmapDaysForPastYear = (): HeatmapDay[] => {
  const days: HeatmapDay[] = [];
  const today = new Date();

  // Go back 364 days to today (365 total)
  for (let i = 364; i >= 0; i--) {
    const target = new Date(today);
    target.setDate(today.getDate() - i);

    const dateKey = getISTDateKey(target);
    const monthName = target.toLocaleString('default', { month: 'short' });
    const displayDate = target.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    days.push({
      dateKey,
      displayDate,
      dayOfWeek: target.getDay(),
      monthName,
    });
  }

  return days;
};
