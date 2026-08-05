import React, { useState } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { Plus, Trash2, Edit2, X, Calendar, Flag, CheckCircle2, AlertCircle } from 'lucide-react';

export const ManageHolidaysModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { holidays, addHoliday, updateHoliday, deleteHoliday } = useLeave();

  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (!holidayName.trim() || !holidayDate) {
      setError('Holiday name and date are required.');
      return;
    }

    if (editingId) {
      const res = await updateHoliday(editingId, {
        holiday_name: holidayName,
        holiday_date: holidayDate,
        description
      });
      if (res.success) {
        setMsg('Holiday updated successfully!');
        resetForm();
      } else {
        setError(res.message);
      }
    } else {
      const res = await addHoliday({
        holiday_name: holidayName,
        holiday_date: holidayDate,
        description
      });
      if (res.success) {
        setMsg('Government Holiday added!');
        resetForm();
      } else {
        setError(res.message);
      }
    }
  };

  const handleEdit = (h) => {
    setEditingId(h.id);
    setHolidayName(h.holiday_name);
    const cleanDate = typeof h.holiday_date === 'string' ? h.holiday_date.split('T')[0] : '';
    setHolidayDate(cleanDate);
    setDescription(h.description || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Government Holiday?')) return;
    const res = await deleteHoliday(id);
    if (res.success) {
      setMsg('Holiday deleted successfully.');
    } else {
      setError(res.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setHolidayName('');
    setHolidayDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setTimeout(() => {
      setMsg('');
      setError('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Manage Government Holidays</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure national & state holidays. Leave requests in these dates are not deducted from employee balances.
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

        {/* Notices */}
        {msg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form to add or edit */}
        <form onSubmit={handleSave} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {editingId ? 'Edit Government Holiday' : 'Add New Government Holiday'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Holiday Name</label>
              <input
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                placeholder="e.g. Independence Day, Labor Day"
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Holiday Date</label>
              <input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Official Gazette Holiday"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'Update Holiday' : 'Save Holiday'}
            </button>
          </div>
        </form>

        {/* Existing Holidays List Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Current Government Holidays ({holidays.length})
          </h4>

          {holidays.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No government holidays registered yet.</p>
          ) : (
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">HOLIDAY NAME</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {holidays.map((h) => {
                    const cleanDate = typeof h.holiday_date === 'string' ? h.holiday_date.split('T')[0] : h.holiday_date;
                    return (
                      <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {cleanDate}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {h.holiday_name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {h.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(h)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              title="Edit Holiday"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(h.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
