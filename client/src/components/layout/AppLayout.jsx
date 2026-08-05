import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useLeave } from '../../context/LeaveContext';
import { useNotification } from '../../context/NotificationContext';
import { LeaveCalendarModal } from '../common/LeaveCalendarModal';
import { X, Calendar as CalendarIcon, Send, HelpCircle, CheckCircle2 } from 'lucide-react';

export const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const { leaveRequests } = useLeave();
  const { addNotification } = useNotification();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState(false);

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!querySubject.trim() || !queryMessage.trim()) return;

    await addNotification({
      sender_name: user?.name || 'User',
      sender_avatar: user?.profile_image || null,
      recipient_role: 'Admin',
      action_type: 'Internal Query',
      message: `[Query: ${querySubject}] ${queryMessage}`,
    });

    setQuerySubmitted(true);
    setTimeout(() => {
      setQuerySubmitted(false);
      setQuerySubject('');
      setQueryMessage('');
      setIsQueryModalOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        onOpenCalendar={() => setIsCalendarOpen(true)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          onOpenQueryModal={() => setIsQueryModalOpen(true)}
          isOpenOnMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {React.isValidElement(children)
            ? React.cloneElement(children, { onOpenCalendar: () => setIsCalendarOpen(true) })
            : children}
        </main>
      </div>

      {/* Leave Calendar Modal */}
      <LeaveCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* Internal Query Modal */}
      {isQueryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Raise Internal Query</h3>
                  <p className="text-xs text-slate-500">Send a question directly to HR & Management</p>
                </div>
              </div>
              <button
                onClick={() => setIsQueryModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {querySubmitted ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-emerald-900 text-sm">Query Submitted!</h4>
                <p className="text-xs text-emerald-700 font-medium">Your ticket has been sent to management. Check your notifications for replies.</p>
              </div>
            ) : (
              <form onSubmit={handleSendQuery} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Query Subject</label>
                  <input
                    type="text"
                    value={querySubject}
                    onChange={(e) => setQuerySubject(e.target.value)}
                    placeholder="e.g. Question about Maternity/Paternity policy"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message</label>
                  <textarea
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    rows={4}
                    placeholder="Provide details about your query..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQueryModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Query
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
