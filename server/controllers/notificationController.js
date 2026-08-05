import { dbService } from '../services/dbService.js';

export const getNotifications = async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (!req.user) {
      console.log('[GET /api/notifications] 401 Unauthorized - req.user is null');
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    console.log(`[GET /api/notifications] Request received for req.user.id=${req.user.id}, req.user.role=${req.user.role}`);

    const notifications = await dbService.getNotificationsForUser(req.user.id, req.user.role);

    console.log(`[GET /api/notifications] Returning ${notifications.length} notifications for user ${req.user.id} (${req.user.role})`);

    res.status(200).json({
      success: true,
      notifications,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { recipient_user_id, recipient_role, title, message, action_type, type } = req.body;
    const newNotif = await dbService.createNotification({
      user_id: recipient_user_id || req.user?.id,
      sender_id: req.user?.id || 'system',
      sender_name: req.user?.name || req.user?.email || 'System',
      sender_avatar: req.user?.photo || '',
      recipient_user_id: recipient_user_id || null,
      recipient_role: recipient_role || 'Admin',
      title: title || 'Notification',
      message: message || '',
      action_type: action_type || 'Notification',
      type: type || 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully.',
      notification: newNotif,
      data: newNotif
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to create notification.' });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.markNotificationRead(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read.' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    await dbService.markAllNotificationsRead(req.user.id, req.user.role);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read.' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const notifications = await dbService.getNotificationsForUser(req.user.id, req.user.role);
    const unreadCount = notifications.filter((n) => !n.is_read && !n.read).length;

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch unread count.' });
  }
};
