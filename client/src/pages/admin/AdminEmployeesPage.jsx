import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { useNotification } from '../../context/NotificationContext';
import { Pagination } from '../../components/common/Pagination';
import { getUserAvatar } from '../../utils/avatar';
import {
  Search,
  Users,
  Shield,
  Briefcase,
  Mail,
  Calendar,
  X,
  Sparkles,
  HeartPulse,
  Umbrella,
  Baby,
  Send,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

export const AdminEmployeesPage = () => {
  const { user, users } = useAuth();
  const { getEmployeeLeaves } = useLeave();
  const { addNotification } = useNotification();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [msgSentNotice, setMsgSentNotice] = useState('');

  // Filter employees
  const employees = users.filter((u) => u.role === 'Employee');

  const filteredEmployees = employees.filter((emp) => {
    const query = search.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.employee_id.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query);

    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!adminMessage.trim() || !selectedEmp || !user) return;

    addNotification({
      sender_id: user.id,
      sender_name: `${user.name} (Admin)`,
      sender_avatar: user.avatar,
      recipient_role: 'Employee',
      recipient_user_id: selectedEmp.id,
      action_type: 'Admin Message',
      message: `Admin (${user.name}): ${adminMessage}`,
    });

    setMsgSentNotice(`Message sent to ${selectedEmp.name}!`);
    setAdminMessage('');
    setTimeout(() => setMsgSentNotice(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-500">Manage organizational members, departments, and leave profiles</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee by name, email, ID or department..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Product">Product</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5">EMPLOYEE</th>
                <th className="py-4 px-5">EMAIL & ID</th>
                <th className="py-4 px-5">DEPARTMENT & ROLE</th>
                <th className="py-4 px-5">GENDER</th>
                <th className="py-4 px-5">LEAVE BALANCE</th>
                <th className="py-4 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedEmployees.map((emp) => {
                const totalRem =
                  emp.leave_balance.casual_leave +
                  emp.leave_balance.sick_leave +
                  emp.leave_balance.vacation_leave +
                  (emp.gender === 'Female' ? emp.leave_balance.maternity_leave : emp.leave_balance.paternity_leave);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 flex items-center gap-3">
                      <img
                        src={getUserAvatar(emp)}
                        alt={emp.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">Joined {emp.created_at}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <span className="block font-semibold text-slate-800">{emp.email}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{emp.employee_id}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 block">{emp.designation}</span>
                      <span className="text-[10px] text-emerald-800 font-semibold block">{emp.department}</span>
                    </td>

                    <td className="py-4 px-5 font-semibold text-slate-700">{emp.gender}</td>

                    <td className="py-4 px-5 font-bold text-emerald-800">{totalRem} Days Total</td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedEmp(emp)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition-colors text-[11px]"
                      >
                        Inspect Balances
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Inspect Employee Balance Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={getUserAvatar(selectedEmp)}
                  alt={selectedEmp.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedEmp.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedEmp.designation} • {selectedEmp.employee_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balances Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Remaining Leave Allowances
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Casual Leave</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {selectedEmp.leave_balance.casual_leave} Days
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sick Leave</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {selectedEmp.leave_balance.sick_leave} Days
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Vacation Leave</span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {selectedEmp.leave_balance.vacation_leave} Days
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block">
                    {selectedEmp.gender === 'Female' ? 'Maternity Leave' : 'Paternity Leave'}
                  </span>
                  <span className="text-xl font-extrabold text-indigo-900 mt-1 block">
                    {selectedEmp.gender === 'Female'
                      ? selectedEmp.leave_balance.maternity_leave
                      : selectedEmp.leave_balance.paternity_leave}{' '}
                    Days
                  </span>
                </div>
              </div>
            </div>

            {/* Leave History Summary */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Application History ({getEmployeeLeaves(selectedEmp.id).length} requests)
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {getEmployeeLeaves(selectedEmp.id).map((req) => (
                  <div key={req.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{req.leave_type}</span>
                      <span className="block text-[10px] text-slate-500">
                        {req.start_date} to {req.end_date} ({req.total_days} days)
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Direct Message / Notification */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Send Notification to {selectedEmp.name.split(' ')[0]}
                </span>
                {msgSentNotice && (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {msgSentNotice}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder={`Write notification or notice for ${selectedEmp.name}...`}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  disabled={!adminMessage.trim()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Send className="w-3 h-3" />
                  Send
                </button>
              </div>
            </form>

            <button
              onClick={() => {
                setSelectedEmp(null);
                setAdminMessage('');
                setMsgSentNotice('');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
