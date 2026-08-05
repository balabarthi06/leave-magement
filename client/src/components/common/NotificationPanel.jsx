import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getUserAvatar } from '../../utils/avatar';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  HelpCircle,
  Clock,
  Inbox
} from 'lucide-react';

export const formatNotificationTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) return 'Just now';
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    getNotificationsForUser,
    getUnreadCountForUser,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotification();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const panelRef = useRef(null);

  const userNotifications = getNotificationsForUser(user);
  const unreadCount = getUnreadCountForUser(user);

  const filteredNotifications =
    activeTab === 'unread'
      ? userNotifications.filter((n) => !n.is_read && !n.read)
      : userNotifications;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getActionBadgeStyle = (actionType) => {
    const type = (actionType || '').toLowerCase();
    if (type.includes('approved')) {
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
      };
    }
    if (type.includes('rejected') || type.includes('cancelled')) {
      return {
        bg: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
      };
    }
    if (type.includes('query')) {
      return {
        bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: <HelpCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />,
      };
    }
    if (type.includes('message')) {
      return {
        bg: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />,
      };
    }
    return {
      bg: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />,
    };
  };

  return (
    <div
      ref={panelRef}
      className="absolute -right-2 sm:right-0 top-full mt-2 w-[calc(100vw-1.5rem)] max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Activity updates & notifications</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs & Mark All as Read */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({userNotifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'unread'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead(user)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">No notifications found</p>
            <p className="text-[11px] text-slate-400">
              {activeTab === 'unread'
                ? 'You have caught up with all notifications!'
                : 'New updates will appear here in real time.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getActionBadgeStyle(notif.action_type);

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer group relative flex items-start gap-3 ${
                  !notif.is_read ? 'bg-emerald-50/30' : ''
                }`}
              >
                {/* Sender Avatar */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={getUserAvatar({ name: notif.sender_name, avatar: notif.sender_avatar })}
                    alt={notif.sender_name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200/80"
                  />
                  {!notif.is_read && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {notif.sender_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatNotificationTime(notif.created_at)}
                    </span>
                  </div>

                  {/* Action Type Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${badge.bg}`}
                    >
                      {badge.icon}
                      {notif.action_type}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs text-slate-600 leading-snug font-medium line-clamp-3">
                    {notif.message}
                  </p>
                </div>

                {/* Actions (Delete button) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all shrink-0"
                  title="Remove notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {userNotifications.length > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{userNotifications.length} total item(s)</span>
          <button
            onClick={() => clearAllNotifications(user)}
            className="text-rose-600 hover:text-rose-700 hover:underline text-[11px] font-bold"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
