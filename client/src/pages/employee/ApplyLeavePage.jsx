import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { calculateWorkingDays } from '../../utils/workingDays';
import { LeaveCalendarModal } from '../../components/common/LeaveCalendarModal';
import { Calendar, PlusCircle, AlertCircle, ArrowLeft, Info, CheckCircle2, ShieldAlert, Sparkles, Siren, AlertTriangle } from 'lucide-react';

export const ApplyLeavePage = () => {
  const { user } = useAuth();
  const { applyLeave, updateLeaveRequest, leaveRequests, holidays, getEmployeeBalanceKey } = useLeave();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);

  // Real-time calculated working days breakdown
  const workingDaysInfo = calculateWorkingDays(startDate, endDate, holidays);
  const totalWorkingDays = workingDaysInfo.finalWorkingDays;

  // Gender based leave options
  const leaveOptions =
    user?.gender === 'Female'
      ? ['Casual Leave', 'Sick Leave', 'Vacation Leave', 'Maternity Leave']
      : ['Casual Leave', 'Sick Leave', 'Vacation Leave', 'Paternity Leave'];

  // Populate if editing
  useEffect(() => {
    if (editId) {
      const existing = leaveRequests.find((r) => r.id === editId);
      if (existing && existing.status === 'Pending') {
        setLeaveType(existing.leave_type);
        setStartDate(existing.start_date);
        setEndDate(existing.end_date);
        setReason(existing.reason);
      }
    }
  }, [editId, leaveRequests]);

  if (!user) return null;

  const currentBalanceKey = getEmployeeBalanceKey(leaveType);
  const availableBalance = user.leave_balance ? (user.leave_balance[currentBalanceKey] ?? 0) : 0;
  const remainingBalanceAfterRequest = availableBalance - totalWorkingDays;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (totalWorkingDays <= 0) {
      setError('Selected date range contains no working days (only Sundays or Government Holidays).');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for your leave request.');
      return;
    }

    if (totalWorkingDays > availableBalance && !editId) {
      setShowEmergencyModal(true);
      return;
    }

    if (editId) {
      const res = await updateLeaveRequest(editId, {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalWorkingDays,
        reason,
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => navigate('/employee/my-leaves'), 1200);
      } else {
        setError(res.message);
      }
    } else {
      const res = await applyLeave({
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalWorkingDays,
        reason,
      });
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => navigate('/employee/my-leaves'), 1200);
      } else {
        if (res.allowEmergency) {
          setShowEmergencyModal(true);
        } else {
          setError(res.message);
        }
      }
    }
  };

  const handleConfirmEmergencyLeave = async () => {
    setIsSubmittingEmergency(true);
    setError('');
    setSuccessMsg('');

    const res = await applyLeave({
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      total_days: totalWorkingDays,
      reason,
      is_emergency: true,
      priority: 'High'
    });

    setIsSubmittingEmergency(false);
    setShowEmergencyModal(false);

    if (res.success) {
      setSuccessMsg(res.message || 'High Priority Emergency Leave request submitted successfully.');
      setTimeout(() => navigate('/employee/my-leaves'), 1200);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {editId ? 'Edit Pending Leave Request' : 'Apply for Leave'}
            </h1>
            <p className="text-xs text-slate-500">
              Submit leave details for manager review according to company policy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCalendarOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>View Calendar</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Leave Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {leaveOptions.map((type) => {
                const balKey = getEmployeeBalanceKey(type);
                const balVal = user.leave_balance ? (user.leave_balance[balKey] ?? 0) : 0;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setLeaveType(type)}
                    className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                      leaveType === type
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block">{type}</span>
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                      Bal: {balVal} Days
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balance Callout Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Available {leaveType} Balance:</span>
            </div>
            <span className="font-extrabold text-sm text-slate-900">{availableBalance} Days</span>
          </div>

          {/* Date Picker Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                End Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Detailed Leave Request Working Days Breakdown Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 border border-emerald-200/80 space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Leave Calculation Breakdown</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Inspect Calendar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Calendar Days</span>
                <span className="text-sm font-black text-slate-800">{workingDaysInfo.totalCalendarDays} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-red-50/60 border border-red-200/60">
                <span className="block text-[10px] text-red-600 font-bold uppercase">Sundays Excluded</span>
                <span className="text-sm font-black text-red-700">-{workingDaysInfo.sundaysCount} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <span className="block text-[10px] text-amber-700 font-bold uppercase">Govt Holidays</span>
                <span className="text-sm font-black text-amber-800">-{workingDaysInfo.holidaysCount} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300">
                <span className="block text-[10px] text-emerald-800 font-bold uppercase">Final Working Leave</span>
                <span className="text-base font-black text-emerald-900">{totalWorkingDays} Working Day(s)</span>
              </div>
            </div>

            {/* Excluded detail badges */}
            {workingDaysInfo.excludedDetails.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                {workingDaysInfo.excludedDetails.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold border ${
                      item.reason === 'Sunday'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <span>{item.date}:</span>
                    <span className="font-bold">{item.reason}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs">
              <span className="text-slate-600 font-medium">Estimated Balance After Approval:</span>
              <span
                className={`font-black text-sm ${
                  remainingBalanceAfterRequest < 0 ? 'text-red-600' : 'text-slate-900'
                }`}
              >
                {remainingBalanceAfterRequest} Days
              </span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason for Leave
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain the reason for your absence..."
              required
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/employee/dashboard')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              {editId ? 'Update Leave Request' : 'Submit Leave Application'}
            </button>
          </div>
        </form>
      </div>

      {/* Leave Calendar Modal */}
      <LeaveCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedStartDate={startDate}
        selectedEndDate={endDate}
      />

      {/* Emergency Leave Confirmation Modal Dialog */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-100 text-red-600 shrink-0">
                <Siren className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider border border-red-200">
                    High Priority
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Emergency Leave Request
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Insufficient leave balance detected. You have <strong className="text-slate-900">{availableBalance} day(s)</strong> available for <strong className="text-slate-900">{leaveType}</strong>, but requested <strong className="text-slate-900">{totalWorkingDays} working day(s)</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Submit as High Priority Emergency Leave?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-normal">
                This will submit your request with a <strong>High Priority Emergency</strong> badge for administrator review and send an immediate high-priority notification to HR/Admin.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                disabled={isSubmittingEmergency}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEmergencyLeave}
                disabled={isSubmittingEmergency}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold text-xs transition-colors shadow-md flex items-center gap-2"
              >
                <Siren className="w-4 h-4" />
                {isSubmittingEmergency ? 'Submitting...' : 'Confirm Emergency Leave'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

