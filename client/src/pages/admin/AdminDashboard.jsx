import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { getUserAvatar } from '../../utils/avatar';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Check,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';

export const AdminDashboard = ({ onOpenCalendar }) => {
  const { user, users } = useAuth();
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useLeave();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all'
  const [reviewerName] = useState(user?.name || 'Admin');

  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Pending');
  const approvedLeaves = leaveRequests.filter((r) => r.status === 'Approved');
  const rejectedLeaves = leaveRequests.filter((r) => r.status === 'Rejected');

  const handleApprove = async (id) => {
    await approveLeaveRequest(id, reviewerName);
  };

  const handleReject = async (id) => {
    const remarks = window.prompt('Please provide a reason for rejecting this leave request:');
    if (remarks !== null) {
      await rejectLeaveRequest(id, remarks, reviewerName);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Administrator Portal Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            System overview, leave approvals & employee management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCalendar}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs transition-colors shadow-xs flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            View Calendar
          </button>
          <Link
            to="/admin/leaves"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Manage All Requests
          </Link>
          <Link
            to="/admin/employees"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Employee Directory
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{users.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">Active employees in system</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Action</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-900">{pendingLeaves.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting admin review</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved Leaves</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-900">{approvedLeaves.length}</p>
          <p className="text-[11px] text-emerald-700 font-medium">Granted this period</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Rejected Leaves</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-900">{rejectedLeaves.length}</p>
          <p className="text-[11px] text-rose-700 font-medium">Declined requests</p>
        </div>
      </div>

      {/* Main Leave Approval Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Pending Approval Queue
            </h3>
            <p className="text-xs text-slate-500">Review leave requests submitted by staff members</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingLeaves.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Recent ({leaveRequests.length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates / Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(activeTab === 'pending' ? pendingLeaves : leaveRequests.slice(0, 8)).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No pending leave requests found. Everything is up to date!
                  </td>
                </tr>
              ) : (
                (activeTab === 'pending' ? pendingLeaves : leaveRequests.slice(0, 8)).map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <img
                        src={getUserAvatar({ name: req.user_name, gender: req.gender })}
                        alt={req.user_name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200/80"
                      />
                      <div>
                        <div className="text-slate-900">{req.user_name || req.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{req.department || 'Staff'}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div>{req.leave_type}</div>
                      {(req.is_emergency || req.priority === 'High') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px] border border-red-300 mt-0.5 shadow-2xs">
                          🚨 High Priority Emergency
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">{req.total_days} Day(s)</span>
                      <div className="text-[10px] text-slate-400">{req.start_date} to {req.end_date}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">{req.reason}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                            title="Approve request"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1"
                            title="Reject request"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
