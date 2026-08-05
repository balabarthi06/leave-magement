import { dbService } from '../services/dbService.js';

export const getDashboardStats = async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    const leaveRequests = await dbService.getAllLeaveRequests();

    const totalEmployees = users.filter((u) => u.role === 'Employee').length;
    const totalRequests = leaveRequests.length;
    const pendingCount = leaveRequests.filter((r) => r.status === 'Pending').length;
    const approvedCount = leaveRequests.filter((r) => r.status === 'Approved').length;
    const rejectedCount = leaveRequests.filter((r) => r.status === 'Rejected').length;

    // Aggregated monthly statistics
    const defaultMonths = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthMap = {};

    defaultMonths.forEach((m) => {
      monthMap[m] = { month: m, Requests: 0, Approved: 0 };
    });

    leaveRequests.forEach((req) => {
      const dateStr = req.applied_date || req.start_date || req.applied_on;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const monthName = d.toLocaleString('en-US', { month: 'short' });
          if (!monthMap[monthName]) {
            monthMap[monthName] = { month: monthName, Requests: 0, Approved: 0 };
          }
          monthMap[monthName].Requests += 1;
          if (req.status === 'Approved') {
            monthMap[monthName].Approved += 1;
          }
        }
      }
    });

    const recentRequests = leaveRequests.slice(0, 5);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        totalRequests,
        pendingCount,
        approvedCount,
        rejectedCount,
        monthlyTrends: Object.values(monthMap),
        recentRequests
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
};
