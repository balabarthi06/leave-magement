import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { NotificationToastAnimation } from '../components/common/NotificationToastAnimation';
import { getApiUrl } from '../utils/api';
const NotificationContext = createContext(undefined);

const JWT_TOKEN_KEY = 'leavehub_token';
const SEEN_ANIMATIONS_KEY = 'leavehub_seen_notif_animations';

const filterNotificationsForUser = (currentUser, notifList = []) => {
  if (!currentUser) return [];
  return notifList
    .filter((n) => {
      if (currentUser.role === 'Admin') {
        return (
          n.recipient_role === 'Admin' ||
          n.recipient_user_id === currentUser.id ||
          n.receiver_id === currentUser.id ||
          n.recipient_role === 'all' ||
          n.user_id === currentUser.id ||
          !n.recipient_role
        );
      } else {
        return (
          n.recipient_user_id === currentUser.id ||
          n.receiver_id === currentUser.id ||
          n.user_id === currentUser.id ||
          (n.recipient_role === 'Employee' && (n.recipient_user_id === currentUser.id || n.receiver_id === currentUser.id || !n.recipient_user_id))
        );
      }
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeToastNotif, setActiveToastNotif] = useState(null);

  const getNotificationsForUser = useCallback(
    (currentUser, notifList) => {
      return filterNotificationsForUser(currentUser, notifList || notifications);
    },
    [notifications]
  );

  const checkForNewToastAnimations = useCallback(
    (notifList) => {
      if (!user || user.role === 'Admin') return;
      const userNotifs = filterNotificationsForUser(user, notifList);
      if (!userNotifs || userNotifs.length === 0) return;

      let seenIds = [];
      try {
        const stored = localStorage.getItem(SEEN_ANIMATIONS_KEY);
        if (stored) seenIds = JSON.parse(stored);
      } catch {
        seenIds = [];
      }

      // Look for approved or rejected notifications not yet seen
      const notifToAnimate = userNotifs.find((n) => {
        if (seenIds.includes(n.id)) return false;
        const actionType = (n.action_type || '').toLowerCase();
        const status = (n.status || '').toLowerCase();
        const msg = (n.message || '').toLowerCase();

        return (
          actionType.includes('approved') ||
          actionType.includes('rejected') ||
          status === 'approved' ||
          status === 'rejected' ||
          msg.includes('approved') ||
          msg.includes('rejected')
        );
      });

      if (notifToAnimate) {
        const actionType = (notifToAnimate.action_type || '').toLowerCase();
        const status = (notifToAnimate.status || '').toLowerCase();
        const msg = (notifToAnimate.message || '').toLowerCase();

        const isApproved = actionType.includes('approved') || status === 'approved' || msg.includes('approved');
        const isRejected = actionType.includes('rejected') || status === 'rejected' || msg.includes('rejected');

        // Save ID to seen list immediately so it will NOT play again on page refresh
        const updatedSeenIds = [...seenIds, notifToAnimate.id];
        try {
          localStorage.setItem(SEEN_ANIMATIONS_KEY, JSON.stringify(updatedSeenIds));
        } catch (err) {
          console.warn('LocalStorage error:', err);
        }

        if (isApproved) {
          setActiveToastNotif({
            id: notifToAnimate.id,
            type: 'approved',
            message: notifToAnimate.message || '🎉 Congratulations! Your leave request has been approved.'
          });
        } else if (isRejected) {
          setActiveToastNotif({
            id: notifToAnimate.id,
            type: 'rejected',
            message: notifToAnimate.message || '😢 Sorry! Your leave request has been rejected. Your leave balance has been restored.'
          });
        }
      }
    },
    [user?.id, user?.role]
  );

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      console.log(`[NotificationContext.fetchNotifications] Fetching notifications for user: ${user.name} (${user.role}, ID: ${user.id}). Token attached: ${Boolean(savedToken)}`);
      const res = await fetch(getApiUrl('/api/notifications'), {
        headers: {
          'Authorization': `Bearer ${savedToken || ''}`,
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`[NotificationContext.fetchNotifications] API Response Status: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        const rawList = data.notifications || data.data || [];
        console.log(`[NotificationContext.fetchNotifications] Received ${rawList.length} notifications from API:`, rawList);
        if (data.success && Array.isArray(rawList)) {
          setNotifications(rawList);
          checkForNewToastAnimations(rawList);
        }
      } else {
        console.warn(`[NotificationContext.fetchNotifications] Failed with HTTP status ${res.status}`);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications from API:', err);
    }
  }, [user?.id, user?.role, checkForNewToastAnimations]);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    // Poll for real-time notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  const addNotification = async (notifData) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(getApiUrl('/api/notifications'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken || ''}`
        },
        body: JSON.stringify(notifData)
      });

      if (res.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.warn('Add notification error:', err);
    }
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read: true } : n))
    );

    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      await fetch(getApiUrl(`/api/notifications/${id}/read`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${savedToken || ''}`
        }
      });
    } catch (err) {
      console.warn('Mark as read API error:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read: true }))
    );

    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      await fetch(getApiUrl('/api/notifications/read-all'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${savedToken || ''}`
        }
      });
    } catch (err) {
      console.warn('Mark all read API error:', err);
    }
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCountForUser = (currentUser) => {
    const list = getNotificationsForUser(currentUser);
    return list.filter((n) => !n.is_read && !n.read).length;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        fetchNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        getNotificationsForUser,
        getUnreadCountForUser,
      }}
    >
      {children}
      {activeToastNotif && (
        <NotificationToastAnimation
          notification={activeToastNotif}
          onClose={() => setActiveToastNotif(null)}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

