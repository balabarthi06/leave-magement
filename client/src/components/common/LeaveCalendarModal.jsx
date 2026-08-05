import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, CheckCircle, Clock } from 'lucide-react';

export const LeaveCalendarModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { user } = useAuth();
  const { holidays, leaveRequests } = useLeave();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  
  const [selectedDateLeaves, setSelectedDateLeaves] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Convert holiday list to quick lookup map
  const holidayMap = new Map();
  if (Array.isArray(holidays)) {
    holidays.forEach((h) => {
      if (h && h.holiday_date) {
        const cleanDate = typeof h.holiday_date === 'string' ? h.holiday_date.split('T')[0] : '';
        if (cleanDate) holidayMap.set(cleanDate, h);
      }
    });
  }

  // Filter leave requests based on role
  const isAdmin = user?.role === 'Admin';
  const relevantLeaves = (leaveRequests || []).filter((req) => {
    if (!req) return false;
    // Rejected leave requests should not be displayed on the calendar
    if (req.status === 'Rejected') return false;
    if (!isAdmin) {
      // Employee Dashboard: show only logged-in employee's leave events
      return String(req.user_id) === String(user?.id);
    }
    return true; // Admin: show leave events for all employees
  });

  // Helper to generate dates between start and end inclusive
  const getDatesInRange = (startDateStr, endDateStr) => {
    const dates = [];
    if (!startDateStr || !endDateStr) return dates;
    let curr = new Date(startDateStr);
    let end = new Date(endDateStr);
    if (isNaN(curr.getTime()) || isNaN(end.getTime())) return dates;
    curr.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    while (curr <= end) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  // Map dateStr -> Array of leave objects
  const leavesByDate = new Map();
  relevantLeaves.forEach((req) => {
    const range = getDatesInRange(req.start_date, req.end_date);
    range.forEach((dStr) => {
      if (!leavesByDate.has(dStr)) {
        leavesByDate.set(dStr, []);
      }
      leavesByDate.get(dStr).push(req);
    });
  });

  const today = new Date();
  const todayY = today.getFullYear();
  const todayM = String(today.getMonth() + 1).padStart(2, '0');
  const todayD = String(today.getDate()).padStart(2, '0');
  const todayStr = `${todayY}-${todayM}-${todayD}`;

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ type: 'empty', id: `empty-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    const dateObj = new Date(year, month, day);

    const isSunday = dateObj.getDay() === 0;
    const holiday = holidayMap.get(dateStr);
    const dayLeaves = leavesByDate.get(dateStr) || [];
    const isToday = dateStr === todayStr;

    calendarCells.push({
      type: 'day',
      id: dateStr,
      dayNumber: day,
      dateStr,
      isSunday,
      holiday,
      dayLeaves,
      isToday
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                {isAdmin ? 'Company Leave & Holiday Calendar' : 'My Leave & Holiday Calendar'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin ? 'Overview of all employee leave requests & public holidays.' : 'Overview of your approved and pending leave requests.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Nav */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-black text-sm text-slate-900 dark:text-white tracking-wide">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Approved Leave</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            <span>Pending Leave</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span>Govt Holiday</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
            <span>Sunday</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-center text-slate-500 dark:text-slate-400 py-2">
            <span className="text-red-500 font-extrabold">SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
            {calendarCells.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.id} className="h-20 bg-slate-50/40 dark:bg-slate-900/40"></div>;
              }

              let cellBg = 'bg-white dark:bg-slate-900';
              if (cell.isToday) {
                cellBg = 'bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-inset ring-emerald-500';
              } else if (cell.isSunday) {
                cellBg = 'bg-red-50/40 dark:bg-red-950/20';
              } else if (cell.holiday) {
                cellBg = 'bg-amber-50/70 dark:bg-amber-950/30';
              }

              return (
                <div
                  key={cell.id}
                  onClick={() => {
                    if (cell.dayLeaves.length > 0 || cell.holiday || cell.isSunday) {
                      setSelectedDateLeaves(cell);
                    }
                  }}
                  className={`h-20 p-1.5 flex flex-col justify-between transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${cellBg}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold leading-none ${cell.isSunday ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'} ${cell.isToday ? 'bg-emerald-600 text-white px-1.5 py-0.5 rounded-md' : ''}`}>
                      {cell.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-12">
                    {cell.holiday && (
                      <div className="text-[9px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold truncate">
                        {cell.holiday.holiday_name}
                      </div>
                    )}
                    {cell.dayLeaves.map((leave, idx) => {
                      const isAppr = leave.status === 'Approved';
                      const badgeBg = isAppr
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 border border-blue-300';
                      
                      const displayName = isAdmin ? (leave.user_name || leave.name || 'Employee') : leave.leave_type;
                      return (
                        <div
                          key={leave.id || idx}
                          className={`text-[9px] px-1 py-0.5 rounded font-bold truncate ${badgeBg}`}
                          title={`${displayName}: ${leave.leave_type} (${leave.status})`}
                        >
                          {isAdmin ? `${leave.user_name?.split(' ')[0] || 'Emp'}: ${leave.leave_type}` : leave.leave_type}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Details Modal / Popover */}
        {selectedDateLeaves && (
          <div className="fixed inset-0 z-65 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Details for {selectedDateLeaves.dateStr}
                </h4>
                <button
                  onClick={() => setSelectedDateLeaves(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedDateLeaves.isSunday && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-xs font-semibold">
                    Sunday (Weekly Off / Excluded)
                  </div>
                )}
                {selectedDateLeaves.holiday && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs">
                    <span className="font-bold">Government Holiday:</span> {selectedDateLeaves.holiday.holiday_name}
                  </div>
                )}
                {selectedDateLeaves.dayLeaves.length === 0 && !selectedDateLeaves.holiday && !selectedDateLeaves.isSunday && (
                  <p className="text-xs text-slate-500 py-3 text-center">No leaves or events on this date.</p>
                )}
                {selectedDateLeaves.dayLeaves.map((leave) => (
                  <div key={leave.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600 space-y-1.5 text-xs">
                    {isAdmin && (
                      <div className="font-bold text-slate-900 dark:text-white">
                        Employee: {leave.user_name || leave.name}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Leave Type:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{leave.leave_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.start_date} to {leave.end_date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Total Days:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.total_days} Day(s)</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-600">
                      <span className="text-slate-500">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
                        {leave.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedDateLeaves(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            Click any date with a leave tag to view full details.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
};
