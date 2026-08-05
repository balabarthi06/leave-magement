import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const LeaveContext = createContext(undefined);

const JWT_TOKEN_KEY = 'leavehub_token';

export const LeaveProvider = ({ children }) => {
  const { user, refreshUsers, refreshCurrentUser } = useAuth();
  const { fetchNotifications } = useNotification();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const fetchHolidays = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch('/api/holidays', {
        headers: {
          'Authorization': `Bearer ${savedToken || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setHolidays(data.data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch holidays:', err);
    }
  }, []);

  const addHoliday = async (holidayData) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(holidayData)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchHolidays();
        return { success: true, message: result.message || 'Government Holiday added!' };
      } else {
        return { success: false, message: result.message || 'Failed to add holiday.' };
      }
    } catch (err) {
      console.error('addHoliday error:', err);
      return { success: false, message: 'Network error adding holiday.' };
    }
  };

  const updateHoliday = async (id, holidayData) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/holidays/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(holidayData)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchHolidays();
        return { success: true, message: result.message || 'Holiday updated!' };
      } else {
        return { success: false, message: result.message || 'Failed to update holiday.' };
      }
    } catch (err) {
      console.error('updateHoliday error:', err);
      return { success: false, message: 'Network error updating holiday.' };
    }
  };

  const deleteHoliday = async (id) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchHolidays();
        return { success: true, message: result.message || 'Holiday deleted!' };
      } else {
        return { success: false, message: result.message || 'Failed to delete holiday.' };
      }
    } catch (err) {
      console.error('deleteHoliday error:', err);
      return { success: false, message: 'Network error deleting holiday.' };
    }
  };

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch('/api/leaves', {
        headers: {
          'Authorization': `Bearer ${savedToken || ''}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const records = data.leaves || data.records || data.data;
        if (data.success && Array.isArray(records)) {
          setLeaveRequests(records);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch leave requests from API:', err);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchLeaveRequests();
    fetchHolidays();
  }, [user?.id, fetchLeaveRequests, fetchHolidays]);

  const getEmployeeBalanceKey = (leaveType) => {
    switch (leaveType) {
      case 'Casual Leave':
        return 'casual_leave';
      case 'Sick Leave':
        return 'sick_leave';
      case 'Vacation Leave':
        return 'vacation_leave';
      case 'Paternity Leave':
        return 'paternity_leave';
      case 'Maternity Leave':
        return 'maternity_leave';
      default:
        return 'casual_leave';
    }
  };

  const applyLeave = async (data) => {
    if (!user) {
      return { success: false, message: 'You must be logged in to apply for leave.' };
    }

    console.log('[ApplyLeave] Request payload:', data);

    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchLeaveRequests();
        await refreshCurrentUser();
        await refreshUsers();
        if (fetchNotifications) await fetchNotifications();
        return { success: true, message: result.message || 'Leave applied successfully.' };
      } else {
        return { success: false, message: result.message || 'Failed to submit leave request.' };
      }
    } catch (err) {
      console.error('Apply leave API error:', err);
      return { success: false, message: 'Server error submitting leave request.' };
    }
  };

  const updateLeaveRequest = async (id, data) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchLeaveRequests();
        return { success: true, message: result.message || 'Leave request updated successfully!' };
      } else {
        return { success: false, message: result.message || 'Failed to update leave request.' };
      }
    } catch (err) {
      console.error('Update leave request error:', err);
      return { success: false, message: 'Network error updating leave request.' };
    }
  };

  const deleteLeaveRequest = async (id) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchLeaveRequests();
        await refreshCurrentUser();
        await refreshUsers();
        if (fetchNotifications) await fetchNotifications();
        return { success: true, message: result.message || 'Leave request deleted.' };
      } else {
        return { success: false, message: result.message || 'Failed to delete leave request.' };
      }
    } catch (err) {
      console.error('Delete leave request error:', err);
      return { success: false, message: 'Network error deleting leave request.' };
    }
  };

  const cancelLeaveRequest = async (id) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/leaves/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchLeaveRequests();
        await refreshCurrentUser();
        await refreshUsers();
        if (fetchNotifications) await fetchNotifications();
        return { success: true, message: result.message || 'Leave request cancelled.' };
      } else {
        return { success: false, message: result.message || 'Failed to cancel leave request.' };
      }
    } catch (err) {
      console.error('Cancel leave request error:', err);
      return { success: false, message: 'Network error cancelling leave request.' };
    }
  };

  const approveLeaveRequest = async (id, reviewerName) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/leaves/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ reviewerName })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchLeaveRequests();
        await refreshCurrentUser();
        await refreshUsers();
        if (fetchNotifications) await fetchNotifications();
        return { success: true, message: result.message || 'Leave request approved!' };
      } else {
        return { success: false, message: result.message || 'Failed to approve request.' };
      }
    } catch (err) {
      console.error('Approve leave API error:', err);
      return { success: false, message: 'Network error approving leave request.' };
    }
  };

  const rejectLeaveRequest = async (id, remarks, reviewerName) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(`/api/leaves/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ remarks, reviewerName })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchLeaveRequests();
        await refreshCurrentUser();
        await refreshUsers();
        if (fetchNotifications) await fetchNotifications();
        return { success: true, message: result.message || 'Leave request rejected.' };
      } else {
        return { success: false, message: result.message || 'Failed to reject request.' };
      }
    } catch (err) {
      console.error('Reject leave API error:', err);
      return { success: false, message: 'Network error rejecting leave request.' };
    }
  };

  const getEmployeeLeaves = (userId) => {
    return leaveRequests.filter((r) => r.user_id === userId);
  };

  const fetchPaginatedLeaves = useCallback(
    async ({
      userId = null,
      page = 1,
      limit = 10,
      search = '',
      statusFilter = 'All',
      typeFilter = 'All',
    }) => {
      try {
        const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
        const queryParams = new URLSearchParams({
          ...(userId && { userId }),
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
          ...(statusFilter && statusFilter !== 'All' && { status: statusFilter }),
          ...(typeFilter && typeFilter !== 'All' && { type: typeFilter })
        });

        const endpoint = user?.role === 'Admin'
          ? `/api/leaves?${queryParams.toString()}`
          : `/api/leaves/my?${queryParams.toString()}`;

        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${savedToken || ''}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const records = data.records || data.leaves || data.data || [];
            return {
              records,
              totalRecords: data.totalRecords ?? records.length,
              totalPages: data.totalPages ?? 1,
              page: data.page ?? page,
              limit: data.limit ?? limit
            };
          }
        }
      } catch (err) {
        console.warn('fetchPaginatedLeaves API error, fallback to local filtering:', err);
      }

      // Fallback local calculation
      let source = leaveRequests;
      if (userId) {
        source = source.filter((r) => r.user_id === userId);
      }

      const query = search.trim().toLowerCase();
      const filtered = source.filter((req) => {
        const matchesSearch =
          !query ||
          (req.leave_type && req.leave_type.toLowerCase().includes(query)) ||
          (req.reason && req.reason.toLowerCase().includes(query)) ||
          (req.user_name && req.user_name.toLowerCase().includes(query));

        const matchesStatus =
          statusFilter === 'All' || statusFilter === 'All Statuses' || req.status === statusFilter;
        const matchesType =
          typeFilter === 'All' || typeFilter === 'All Types' || req.leave_type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      });

      const totalRecords = filtered.length;
      const totalPages = Math.ceil(totalRecords / limit) || 1;
      const validPage = Math.max(1, Math.min(page, totalPages));
      const startIndex = (validPage - 1) * limit;

      return {
        records: filtered.slice(startIndex, startIndex + limit),
        totalRecords,
        totalPages,
        page: validPage,
        limit
      };
    },
    [user?.role, leaveRequests]
  );

  return (
    <LeaveContext.Provider
      value={{
        leaveRequests,
        fetchLeaveRequests,
        holidays,
        fetchHolidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        applyLeave,
        updateLeaveRequest,
        deleteLeaveRequest,
        cancelLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        getEmployeeLeaves,
        getEmployeeBalanceKey,
        fetchPaginatedLeaves,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
