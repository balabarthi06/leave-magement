import React, { useState, useEffect } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { LeaveCalendarModal } from '../../components/common/LeaveCalendarModal';
import { ManageHolidaysModal } from '../../components/common/ManageHolidaysModal';
import { getUserAvatar } from '../../utils/avatar';
import {
  Search,
  CheckCircle,
  XCircle,
  MessageSquare,
  Filter,
  Check,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
  Flag,
  UserCheck
} from 'lucide-react';

export const AdminLeavesPage = () => {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest, fetchPaginatedLeaves } = useLeave();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHolidaysOpen, setIsHolidaysOpen] = useState(false);

  const [paginatedData, setPaginatedData] = useState({
    records: [],
    totalRecords: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });

  // Reject Modal state
  const [rejectReq, setRejectReq] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [notice, setNotice] = useState('');

  // Approve confirmation modal
  const [approveReq, setApproveReq] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchPaginatedLeaves({
      page: currentPage,
      limit: itemsPerPage,
      search,
      statusFilter,
      typeFilter,
    }).then((res) => {
      if (isMounted) {
        setPaginatedData(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentPage, search, statusFilter, typeFilter, fetchPaginatedLeaves]);

  const { records: paginatedRequests, totalRecords, totalPages } = paginatedData;

  const handleApproveConfirm = async () => {
    if (!approveReq || !user) return;
    const res = await approveLeaveRequest(approveReq.id, user.name);
    setApproveReq(null);
    setNotice(res.message);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReq || !user) return;
    if (!remarks.trim()) return;

    const res = await rejectLeaveRequest(rejectReq.id, remarks, user.name);
    setRejectReq(null);
    setRemarks('');
    setNotice(res.message);
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Requests</h1>
          <p className="text-xs text-slate-500">Review, approve, or reject employee leave applications</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHolidaysOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-colors flex items-center gap-2"
          >
            <Flag className="w-4 h-4 text-amber-600" />
            <span>Manage Holidays</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <span>Leave Calendar</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search Box */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Search Employee</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, ID or department..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* Leave Type Filter Dropdown */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Leave Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option>All Types</option>
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Vacation Leave</option>
              <option>Paternity Leave</option>
              <option>Maternity Leave</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="md:col-span-1">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('All Statuses');
                setTypeFilter('All Types');
                setCurrentPage(1);
              }}
              className="w-full py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors flex items-center justify-center gap-1"
              title="Apply & Reset Filters"
            >
              <Filter className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Leave Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {paginatedRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No leave requests match your filter criteria</p>
            <p className="text-xs text-slate-400">Try clearing search filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-5">EMPLOYEE</th>
                  <th className="py-4 px-5">LEAVE TYPE</th>
                  <th className="py-4 px-5">DURATION</th>
                  <th className="py-4 px-5">DAYS</th>
                  <th className="py-4 px-5">REASON</th>
                  <th className="py-4 px-5">STATUS</th>
                  <th className="py-4 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee info */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getUserAvatar({ gender: req.user_gender, profile_image: req.user_profile_image || req.user_avatar })}
                          alt={req.user_name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{req.user_name}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Emp ID: {req.user_employee_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-800">
                      <div>{req.leave_type}</div>
                      {(req.is_emergency || req.priority === 'High') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px] border border-red-300 mt-1 shadow-2xs">
                          🚨 High Priority Emergency
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="text-slate-800 font-medium">
                        {req.start_date} -
                        <br />
                        {req.end_date}
                      </div>
                    </td>

                    <td className="py-4 px-5 font-black text-emerald-800 text-sm">
                      {req.total_days} {req.total_days === 1 ? 'Day' : 'Days'}
                    </td>

                    <td className="py-4 px-5 max-w-xs text-slate-500 truncate" title={req.reason}>
                      {req.reason}
                    </td>

                    <td className="py-4 px-5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>

                    <td className="py-4 px-5 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setApproveReq(req)}
                            className="p-2 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors shadow-2xs"
                            title="Approve Request"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectReq(req);
                              setRemarks('');
                            }}
                            className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors shadow-2xs"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Reviewed</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalRecords}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Approve Confirmation Modal */}
      {approveReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Approve Leave Request?</h3>
            <p className="text-xs text-slate-500">
              Approve <span className="font-bold text-slate-900">{approveReq.user_name}</span>'s{' '}
              {approveReq.leave_type} ({approveReq.total_days} days). This will automatically deduct from their remaining leave balance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setApproveReq(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveConfirm}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Admin Remarks */}
      {rejectReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <h3 className="font-bold text-slate-900">Reject Request with Remarks</h3>
              </div>
              <button onClick={() => setRejectReq(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Please state reason / remarks for rejecting <span className="font-bold">{rejectReq.user_name}</span>'s request.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Admin Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Overlapping team leaves during sprint release."
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modals */}
      <LeaveCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <ManageHolidaysModal
        isOpen={isHolidaysOpen}
        onClose={() => setIsHolidaysOpen(false)}
      />
    </div>
  );
};
