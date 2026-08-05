export const calculateWorkingDays = (startDateStr, endDateStr, holidaysList = []) => {
  if (!startDateStr || !endDateStr) {
    return {
      totalCalendarDays: 0,
      sundaysCount: 0,
      holidaysCount: 0,
      finalWorkingDays: 0,
      excludedDetails: []
    };
  }

  // Helper to parse YYYY-MM-DD or ISO string to Date at 00:00:00 local time
  const parseLocalDate = (str) => {
    if (typeof str !== 'string') return new Date(str);
    const dateOnly = str.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(str);
  };

  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return {
      totalCalendarDays: 0,
      sundaysCount: 0,
      holidaysCount: 0,
      finalWorkingDays: 0,
      excludedDetails: []
    };
  }

  // Create holiday map: YYYY-MM-DD -> Holiday Object
  const holidayMap = new Map();
  if (Array.isArray(holidaysList)) {
    holidaysList.forEach((h) => {
      if (h && h.holiday_date) {
        const cleanDate = typeof h.holiday_date === 'string' ? h.holiday_date.split('T')[0] : '';
        if (cleanDate) {
          holidayMap.set(cleanDate, h);
        }
      }
    });
  }

  let totalCalendarDays = 0;
  let sundaysCount = 0;
  let holidaysCount = 0;
  let finalWorkingDays = 0;
  const excludedDetails = [];

  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  while (current <= endDate) {
    totalCalendarDays++;
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const isSunday = current.getDay() === 0;
    const holiday = holidayMap.get(dateStr);

    if (isSunday) {
      sundaysCount++;
      excludedDetails.push({ date: dateStr, reason: 'Sunday' });
    } else if (holiday) {
      holidaysCount++;
      excludedDetails.push({ date: dateStr, reason: holiday.holiday_name || 'Government Holiday' });
    } else {
      finalWorkingDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    totalCalendarDays,
    sundaysCount,
    holidaysCount,
    finalWorkingDays,
    excludedDetails
  };
};
