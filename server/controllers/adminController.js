import { dbService } from '../services/dbService.js';
import { getLeaveRequests, updateLeaveRequest, approveLeaveRequest, rejectLeaveRequest } from './leaveController.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    const leaveRequests = await dbService.getAllLeaveRequests();

    const totalEmployees = users.filter((u) => u.role === 'Employee').length;
    const totalRequests = leaveRequests.length;
    const pendingCount = leaveRequests.filter((r) => r.status === 'Pending').length;
    const approvedCount = leaveRequests.filter((r) => r.status === 'Approved').length;
    const rejectedCount = leaveRequests.filter((r) => r.status === 'Rejected').length;

    const defaultMonths = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthMap = {};
    defaultMonths.forEach((m) => {
      monthMap[m] = { month: m, Requests: 0, Approved: 0 };
    });

    leaveRequests.forEach((reqItem) => {
      const dateStr = reqItem.applied_date || reqItem.start_date || reqItem.applied_on;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const monthName = d.toLocaleString('en-US', { month: 'short' });
          if (!monthMap[monthName]) {
            monthMap[monthName] = { month: monthName, Requests: 0, Approved: 0 };
          }
          monthMap[monthName].Requests += 1;
          if (reqItem.status === 'Approved') {
            monthMap[monthName].Approved += 1;
          }
        }
      }
    });

    const recentRequests = leaveRequests.slice(0, 5);

    const statsData = {
      totalEmployees,
      totalRequests,
      pendingCount,
      approvedCount,
      rejectedCount,
      monthlyTrends: Object.values(monthMap),
      recentRequests
    };

    res.status(200).json({
      success: true,
      message: 'Admin dashboard stats fetched successfully.',
      stats: statsData,
      data: statsData
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard stats.' });
  }
};

export const updateAdminLeaveRequest = async (req, res) => {
  const { status, remarks, admin_remarks } = req.body;
  if (status === 'Approved') {
    return approveLeaveRequest(req, res);
  } else if (status === 'Rejected') {
    req.body.remarks = remarks || admin_remarks || '';
    return rejectLeaveRequest(req, res);
  } else {
    return updateLeaveRequest(req, res);
  }
};
