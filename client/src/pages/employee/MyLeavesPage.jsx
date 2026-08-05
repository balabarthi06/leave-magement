import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination } from '../../components/common/Pagination';
import { LeaveCalendarModal } from '../../components/common/LeaveCalendarModal';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';

export const MyLeavesPage = () => {
  const { user } = useAuth();
  const { leaveRequests, deleteLeaveRequest, fetchPaginatedLeaves } = useLeave();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [paginatedData, setPaginatedData] = useState({
    records: [],
    totalRecords: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [remarksModalReq, setRemarksModalReq] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      setIsLoading(true);
      setFetchError(null);
      fetchPaginatedLeaves({
        userId: user.id,
        page: currentPage,
        limit: itemsPerPage,
        search,
        statusFilter,
        typeFilter,
      })
        .then((res) => {
          if (isMounted) {
            if (res) {
              setPaginatedData(res);
            } else {
              setFetchError('Failed to fetch leave requests.');
            }
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('Error fetching my leaves:', err);
            setFetchError('Error loading leave requests. Please try again.');
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, currentPage, search, statusFilter, typeFilter, fetchPaginatedLeaves]);

  if (!user) return null;

  const { records: paginatedLeaves, totalRecords, totalPages } = paginatedData;

  const handleDeleteConfirm = () => {
    if (deleteModalId) {
      deleteLeaveRequest(deleteModalId);
      setDeleteModalId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Leave History</h1>
          <p className="text-xs text-slate-500">Track and manage all your submitted leave applications</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCalendarOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span>Leave Calendar</span>
          </button>

          <Link
            to="/employee/apply-leave"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md w-fit"
          >
            <Plus className="w-4 h-4" />
            Apply New Leave
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by leave type or reason..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full sm:w-auto"
          >
            <option value="All">All Leave Types</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Vacation Leave">Vacation Leave</option>
            <option value="Paternity Leave">Paternity Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
          </select>
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Loading leave requests from database...</p>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">{fetchError}</p>
            <button
              onClick={() => {
                setIsLoading(true);
                setFetchError(null);
                fetchPaginatedLeaves({
                  userId: user.id,
                  page: currentPage,
                  limit: itemsPerPage,
                  search,
                  statusFilter,
                  typeFilter,
                }).then((res) => {
                  if (res) setPaginatedData(res);
                  setIsLoading(false);
                });
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : paginatedLeaves.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No matching leave records found</p>
            <p className="text-xs text-slate-400">Try adjusting your search keywords or filter dropdowns.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Leave Type</th>
                  <th className="py-3.5 px-5">Duration</th>
                  <th className="py-3.5 px-5">Total Days</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">
                      <div>{req.leave_type}</div>
                      {(req.is_emergency || req.priority === 'High') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-extrabold text-[10px] border border-red-300 mt-1 shadow-2xs">
                          🚨 High Priority Emergency
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                        Applied on {req.applied_date}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.start_date} to {req.end_date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-800">
                      {req.total_days} {req.total_days === 1 ? 'Day' : 'Days'}
                    </td>
                    <td className="py-4 px-5 max-w-xs truncate text-slate-500" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {req.admin_remarks && (
                          <button
                            onClick={() => setRemarksModalReq(req)}
                            className="p-1.5 rounded-lg text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
                            title="View Admin Remarks"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}

                        {req.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => navigate(`/employee/apply-leave?edit=${req.id}`)}
                              className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                              title="Edit Pending Request"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModalId(req.id)}
                              className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                              title="Delete Pending Request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Finalized</span>
                        )}
                      </div>
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

      {/* Admin Remarks Modal */}
      {remarksModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900">Admin Remarks</h3>
              </div>
              <button
                onClick={() => setRemarksModalReq(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">{remarksModalReq.leave_type}</p>
              <p className="text-slate-500">
                Duration: {remarksModalReq.start_date} - {remarksModalReq.end_date}
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs italic">
              "{remarksModalReq.admin_remarks}"
            </div>

            <button
              onClick={() => setRemarksModalReq(null)}
              className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900">Delete Pending Leave?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel and delete this leave request? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Leave Calendar Modal */}
      <LeaveCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
};
