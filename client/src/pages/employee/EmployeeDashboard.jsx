import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  Umbrella,
  HeartPulse,
  Baby,
  MoreVertical,
  History,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Trash2,
  Edit2
} from 'lucide-react';

export const EmployeeDashboard = ({ onOpenCalendar }) => {
  const { user } = useAuth();
  const { getEmployeeLeaves, deleteLeaveRequest } = useLeave();
  const navigate = useNavigate();

  const [activeActionId, setActiveActionId] = useState(null);
  const [remarksModalReq, setRemarksModalReq] = useState(null);

  if (!user) return null;

  const myLeaves = getEmployeeLeaves(user.id);

  // Statistics
  const totalCount = myLeaves.length;
  const pendingCount = myLeaves.filter((l) => l.status === 'Pending').length;
  const approvedCount = myLeaves.filter((l) => l.status === 'Approved').length;
  const rejectedCount = myLeaves.filter((l) => l.status === 'Rejected').length;

  // Calculate total available remaining days
  const remainingDays =
    user.leave_balance.casual_leave +
    user.leave_balance.sick_leave +
    user.leave_balance.vacation_leave +
    (user.gender === 'Female' ? user.leave_balance.maternity_leave : user.leave_balance.paternity_leave);

  const recentLeaves = myLeaves.slice(0, 5);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this pending leave request?')) {
      deleteLeaveRequest(id);
      setActiveActionId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            Good Morning <span className="inline-block animate-bounce">👋</span> {user.name.split(' ')[0]}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base font-medium leading-relaxed">
            Ready to plan your next break? You have <span className="font-bold text-white underline decoration-emerald-400 decoration-2">{remainingDays} leave days</span> remaining this year.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/employee/apply-leave"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-700 stroke-[3]" />
              Apply New Leave
            </Link>
            <button
              onClick={onOpenCalendar}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800/80 border border-emerald-600/60 text-white font-semibold text-sm hover:bg-emerald-700/80 transition-all"
            >
              <CalendarIcon className="w-4 h-4 text-emerald-300" />
              View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{totalCount < 10 ? `0${totalCount}` : totalCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Annual Requested</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{pendingCount < 10 ? `0${pendingCount}` : pendingCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting Approval</p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{approvedCount < 10 ? `0${approvedCount}` : approvedCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Confirmed Absence</p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rejected</span>
            <div className="p-2 rounded-xl bg-red-100 text-red-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{rejectedCount < 10 ? `0${rejectedCount}` : rejectedCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Not Processed</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Leave Balances & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Leave Balances Grid */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Leave Balances</h2>
            <Link to="/employee/apply-leave" className="text-xs font-bold text-emerald-700 hover:underline">
              Apply Now
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Casual Leave Card */}
            {(() => {
              const total = 12;
              const balance = user.leave_balance?.casual_leave ?? 8;
              const used = Math.max(0, total - balance);
              return (
                <div className="bg-slate-300 text-slate-900 p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-slate-200 rounded-xl text-slate-700">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-200/80 px-2.5 py-1 rounded-full text-slate-700">
                      Casual
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black">
                      {balance < 10 && balance >= 0 ? `0${balance}` : balance}
                      <span className="text-xs font-semibold text-slate-600 ml-1.5">Remaining</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-400/30 grid grid-cols-3 gap-1 text-[11px] font-medium text-slate-800">
                      <div><span className="text-slate-600 block text-[9px] uppercase font-bold">Total</span>{total}</div>
                      <div><span className="text-slate-600 block text-[9px] uppercase font-bold">Used</span>{used}</div>
                      <div><span className="text-slate-600 block text-[9px] uppercase font-bold">Balance</span>{balance}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sick Leave Card */}
            {(() => {
              const total = 12;
              const balance = user.leave_balance?.sick_leave ?? 10;
              const used = Math.max(0, total - balance);
              return (
                <div className="bg-emerald-900 text-white p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-emerald-800/80 rounded-xl">
                      <HeartPulse className="w-5 h-5 text-emerald-300" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-800/80 px-2.5 py-1 rounded-full text-emerald-200">
                      Sick
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black">
                      {balance < 10 && balance >= 0 ? `0${balance}` : balance}
                      <span className="text-xs font-semibold text-emerald-200 ml-1.5">Remaining</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-emerald-800/60 grid grid-cols-3 gap-1 text-[11px] font-medium text-emerald-100">
                      <div><span className="text-emerald-300/80 block text-[9px] uppercase font-bold">Total</span>{total}</div>
                      <div><span className="text-emerald-300/80 block text-[9px] uppercase font-bold">Used</span>{used}</div>
                      <div><span className="text-emerald-300/80 block text-[9px] uppercase font-bold">Balance</span>{balance}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Earned / Vacation Leave Card */}
            {(() => {
              const total = 15;
              const balance = user.leave_balance?.earned_leave ?? user.leave_balance?.vacation_leave ?? 10;
              const used = Math.max(0, total - balance);
              return (
                <div className="bg-orange-500 text-white p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-orange-600/80 rounded-xl">
                      <Umbrella className="w-5 h-5 text-orange-100" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-orange-600/80 px-2.5 py-1 rounded-full text-orange-100">
                      Earned
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black">
                      {balance < 10 && balance >= 0 ? `0${balance}` : balance}
                      <span className="text-xs font-semibold text-orange-100 ml-1.5">Remaining</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-orange-400/50 grid grid-cols-3 gap-1 text-[11px] font-medium text-orange-50">
                      <div><span className="text-orange-100/80 block text-[9px] uppercase font-bold">Total</span>{total}</div>
                      <div><span className="text-orange-100/80 block text-[9px] uppercase font-bold">Used</span>{used}</div>
                      <div><span className="text-orange-100/80 block text-[9px] uppercase font-bold">Balance</span>{balance}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Gender Specific Card (Maternity or Paternity) */}
            {(() => {
              const isFemale = user.gender === 'Female';
              const leaveTitle = isFemale ? 'Maternity' : 'Paternity';
              const total = isFemale ? 180 : 15;
              const balance = isFemale
                ? (user.leave_balance?.maternity_leave ?? 180)
                : (user.leave_balance?.paternity_leave ?? 15);
              const used = Math.max(0, total - balance);

              return (
                <div className="bg-indigo-100 text-indigo-900 p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden shadow-2xs border border-indigo-200/60">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-indigo-200/80 rounded-xl text-indigo-800">
                      <Baby className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-200 px-2.5 py-1 rounded-full text-indigo-800">
                      {leaveTitle}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-3xl font-black">
                      {balance < 10 && balance >= 0 ? `0${balance}` : balance}
                      <span className="text-xs font-semibold text-indigo-700 ml-1.5">Remaining</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-indigo-200 grid grid-cols-3 gap-1 text-[11px] font-medium text-indigo-900">
                      <div><span className="text-indigo-600 block text-[9px] uppercase font-bold">Total</span>{total}</div>
                      <div><span className="text-indigo-600 block text-[9px] uppercase font-bold">Used</span>{used}</div>
                      <div><span className="text-indigo-600 block text-[9px] uppercase font-bold">Balance</span>{balance}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Recent Leave Requests Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Recent Leave Requests</h2>
            <Link to="/employee/my-leaves" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              View All History
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {recentLeaves.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No leave requests yet</p>
                <p className="text-xs text-slate-400">Apply for your first leave using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[500px] divide-y divide-slate-100">
                  <div className="grid grid-cols-12 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/60">
                    <div className="col-span-4">Leave Type</div>
                    <div className="col-span-4">Duration</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>

                  {recentLeaves.map((req) => (
                    <div key={req.id} className="grid grid-cols-12 px-5 py-3.5 items-center text-xs hover:bg-slate-50/80 transition-colors">
                      <div className="col-span-4 flex items-center gap-2.5 font-semibold text-slate-900">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 hidden sm:block">
                          {req.leave_type.includes('Sick') ? (
                            <HeartPulse className="w-4 h-4 text-emerald-600" />
                          ) : req.leave_type.includes('Vacation') ? (
                            <Umbrella className="w-4 h-4 text-orange-500" />
                          ) : (
                            <Briefcase className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <span>{req.leave_type}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{req.applied_date}</span>
                        </div>
                      </div>

                      <div className="col-span-4 text-slate-600 font-medium">
                        {req.start_date === req.end_date ? (
                          <span>{req.start_date} ({req.total_days} Day)</span>
                        ) : (
                          <span>
                            {req.start_date} - {req.end_date} ({req.total_days} Days)
                          </span>
                        )}
                      </div>

                      <div className="col-span-3">
                        <StatusBadge status={req.status} size="sm" />
                      </div>

                      <div className="col-span-1 text-right relative">
                        <button
                          onClick={() => setActiveActionId(activeActionId === req.id ? null : req.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeActionId === req.id && (
                          <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 text-left">
                            {req.admin_remarks && (
                              <button
                                onClick={() => {
                                  setRemarksModalReq(req);
                                  setActiveActionId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 font-medium"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                View Admin Remarks
                              </button>
                            )}

                            {req.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    navigate(`/employee/apply-leave?edit=${req.id}`);
                                    setActiveActionId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                  Edit Request
                                </button>
                                <button
                                  onClick={() => handleDelete(req.id)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  Delete Request
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setActiveActionId(null)}
                              className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 hover:bg-slate-50 border-t border-slate-100"
                            >
                              Close Menu
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Cards at Bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/employee/my-leaves"
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all flex items-center gap-4 group"
        >
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Leave History
            </h3>
            <p className="text-xs text-slate-500">View all past records, search, and monitor approval timeline</p>
          </div>
        </Link>

        <div
          onClick={onOpenCalendar}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all flex items-center gap-4 group cursor-pointer"
        >
          <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Leave Policy Rules
            </h3>
            <p className="text-xs text-slate-500">Read casual, sick, vacation, and gender leave guidelines</p>
          </div>
        </div>
      </div>

      {/* Admin Remarks Modal */}
      {remarksModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-700">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">Admin Rejection Remarks</h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200/60">
              <p className="font-semibold text-slate-800">
                {remarksModalReq.leave_type} ({remarksModalReq.start_date} to {remarksModalReq.end_date})
              </p>
              <p className="text-slate-500">Reason: {remarksModalReq.reason}</p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-200/80 space-y-1">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Admin Note</span>
              <p className="text-xs font-medium text-red-900 italic">"{remarksModalReq.admin_remarks}"</p>
            </div>

            <button
              onClick={() => setRemarksModalReq(null)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
