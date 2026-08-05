import { dbService } from '../services/dbService.js';
import { calculateWorkingDays } from '../utils/workingDays.js';

const getBalanceKey = (leaveType) => {
  if (!leaveType) return 'casual_leave';
  const norm = leaveType.toLowerCase().trim();
  if (norm.includes('casual')) return 'casual_leave';
  if (norm.includes('sick')) return 'sick_leave';
  if (norm.includes('vacation') || norm.includes('earned')) return 'vacation_leave';
  if (norm.includes('maternity')) return 'maternity_leave';
  if (norm.includes('paternity')) return 'paternity_leave';
  if (norm.includes('compensatory') || norm.includes('comp')) return 'compensatory_leave';
  if (norm.includes('loss') || norm.includes('lop')) return 'loss_of_pay';
  return norm.replace(/\s+/g, '_');
};

export const getMyLeaveRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userId = req.user.id;
    const { search, status, type, page = '1', limit = '10' } = req.query;

    console.log('[GET /my] Fetching leave requests for authenticated user:', userId);

    let requests = await dbService.getLeaveRequestsByUserId(userId);

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      requests = requests.filter(
        (r) =>
          (r.leave_type && r.leave_type.toLowerCase().includes(q)) ||
          (r.reason && r.reason.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All' && status !== 'All Statuses') {
      requests = requests.filter((r) => r.status === status);
    }

    if (type && type !== 'All' && type !== 'All Types') {
      requests = requests.filter((r) => r.leave_type === type);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const totalRecords = requests.length;
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const records = requests.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      leaves: requests,
      records,
      totalRecords,
      totalPages,
      page: pageNum,
      limit: limitNum,
      data: records
    });
  } catch (error) {
    console.error('Get my leave requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch my leave requests.' });
  }
};

export const getLeaveRequests = async (req, res) => {
  try {
    const { userId, search, status, type, page = '1', limit = '10' } = req.query;

    let filterUserId = null;
    if (req.user) {
      if (req.user.role === 'Admin') {
        filterUserId = userId || null;
      } else {
        filterUserId = req.user.id;
      }
    } else if (userId) {
      filterUserId = userId;
    }

    let requests = filterUserId
      ? await dbService.getLeaveRequestsByUserId(filterUserId)
      : await dbService.getAllLeaveRequests();

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      requests = requests.filter(
        (r) =>
          (r.leave_type && r.leave_type.toLowerCase().includes(q)) ||
          (r.reason && r.reason.toLowerCase().includes(q)) ||
          (r.user_name && r.user_name.toLowerCase().includes(q)) ||
          (r.user_department && r.user_department.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All' && status !== 'All Statuses') {
      requests = requests.filter((r) => r.status === status);
    }

    if (type && type !== 'All' && type !== 'All Types') {
      requests = requests.filter((r) => r.leave_type === type);
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const totalRecords = requests.length;
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const records = requests.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      leaves: requests,
      records,
      totalRecords,
      totalPages,
      page: pageNum,
      limit: limitNum,
      data: records
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests.' });
  }
};

export const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await dbService.getLeaveRequestById(id);
    if (!request) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Leave request fetched successfully.',
      leaveRequest: request,
      data: request
    });
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave request.' });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    console.log('[POST /api/leaves] Request body:', req.body);
    console.log('[POST /api/leaves] JWT user:', req.user);

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userId = req.user.id;

    const user = await dbService.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { leave_type, start_date, end_date, reason, is_emergency, is_priority, priority } = req.body;

    if (!leave_type || !start_date || !end_date) {
      res.status(400).json({ success: false, message: 'Leave type, start date, and end date are required.' });
      return;
    }

    // 1. Overlapping Leave Validation
    const allRequests = await dbService.getAllLeaveRequests();
    const existingUserRequests = allRequests.filter(
      (r) => r.user_id === user.id && (r.status === 'Pending' || r.status === 'Approved')
    );

    const newStart = new Date(start_date);
    const newEnd = new Date(end_date);

    const overlapping = existingUserRequests.find((r) => {
      const exStart = new Date(r.start_date);
      const exEnd = new Date(r.end_date);
      return newStart <= exEnd && newEnd >= exStart;
    });

    if (overlapping) {
      res.status(400).json({
        success: false,
        isOverlapping: true,
        message: `Overlapping Leave Validation Error: You already have an active (${overlapping.status}) leave request from ${overlapping.start_date} to ${overlapping.end_date}. Leave cannot overlap with existing requests.`,
        overlappingRequest: overlapping
      });
      return;
    }

    // 2. Working Days Calculation
    const holidays = await dbService.getAllHolidays();
    const workingDaysInfo = calculateWorkingDays(start_date, end_date, holidays);
    const reqDays = workingDaysInfo.finalWorkingDays;

    if (reqDays <= 0) {
      res.status(400).json({
        success: false,
        message: 'Selected date range contains no working days (only Sundays or Government Holidays).',
        workingDaysBreakdown: workingDaysInfo
      });
      return;
    }

    const balanceKey = getBalanceKey(leave_type);

    const defaultBalances = {
      casual_leave: 12,
      sick_leave: 12,
      vacation_leave: 15,
      earned_leave: 15,
      maternity_leave: 180,
      paternity_leave: 15,
      compensatory_leave: 10,
      loss_of_pay: 30
    };

    const currentBalances = {
      ...defaultBalances,
      ...(user.leave_balance || {})
    };

    const available = currentBalances[balanceKey] !== undefined ? currentBalances[balanceKey] : 0;

    // 3. Emergency Leave Workflow Check
    const isEmergencyReq = Boolean(is_emergency || is_priority || priority === 'High');

    if (reqDays > available && !isEmergencyReq) {
      res.status(400).json({
        success: false,
        isBalanceInsufficient: true,
        allowEmergency: true,
        availableBalance: available,
        requestedDays: reqDays,
        message: `Insufficient leave balance (${available} day(s) available for ${reqDays} requested day(s)). You can submit this as a High Priority Emergency Leave Request.`,
        workingDaysBreakdown: workingDaysInfo
      });
      return;
    }

    const finalPriority = isEmergencyReq ? 'High' : (priority || 'Normal');

    // Deduct leave days from balance
    const updatedBalances = {
      ...currentBalances,
      [balanceKey]: Math.max(0, available - reqDays)
    };

    // Update user leave balance in DB
    const updatedUser = await dbService.updateUser(user.id, { leave_balance: updatedBalances });

    // Save leave request in DB with status 'Pending'
    const newRequest = await dbService.createLeaveRequest({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      user_photo: user.photo || user.profile_image || null,
      user_avatar: user.photo || user.profile_image || null,
      user_employee_id: user.employee_id || '',
      user_department: user.department || '',
      designation: user.designation || '',
      leave_type,
      start_date,
      end_date,
      total_days: reqDays,
      calendar_days: workingDaysInfo.totalCalendarDays,
      sundays_count: workingDaysInfo.sundaysCount,
      holidays_count: workingDaysInfo.holidaysCount,
      reason: reason || '',
      status: 'Pending',
      is_emergency: isEmergencyReq,
      priority: finalPriority
    });

    // Notify Admin when a new leave request is submitted
    const employeeName = user.name || 'Employee';
    const employeeId = user.employee_id || user.id || '';
    const appliedDate = new Date().toISOString().split('T')[0];
    const notificationMessage = `${employeeName} has applied for ${leave_type} leave.`;

    await dbService.createNotification({
      sender_id: user.id,
      receiver_id: null,
      recipient_role: 'Admin',
      recipient_user_id: null,
      user_id: user.id,
      sender_name: employeeName,
      sender_email: user.email,
      sender_avatar: user.photo || user.profile_image || null,
      employee_name: employeeName,
      employee_id: employeeId,
      employee_email: user.email,
      employee_photo: user.photo || user.profile_image || null,
      leave_type,
      start_date,
      end_date,
      total_days: reqDays,
      status: 'Unread',
      is_emergency: isEmergencyReq,
      priority: finalPriority,
      applied_date: appliedDate,
      action_type: isEmergencyReq ? 'Emergency Leave Submitted' : 'Leave Request Submitted',
      title: isEmergencyReq ? '🚨 High Priority Emergency Leave' : 'New Leave Request',
      message: notificationMessage,
      read: false,
      is_read: false
    });

    const { password_hash, ...sanitizedUser } = updatedUser || user;

    res.status(201).json({
      success: true,
      message: isEmergencyReq
        ? 'High Priority Emergency Leave request submitted successfully for Admin review.'
        : 'Leave request submitted successfully. Your leave request is pending admin approval.',
      leave: newRequest,
      leaveRequest: newRequest,
      workingDaysBreakdown: workingDaysInfo,
      updatedBalance: updatedBalances,
      user: {
        ...sanitizedUser,
        leave_balance: updatedBalances
      }
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to submit leave request.' });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getLeaveRequestById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }

    if (existing.status !== 'Pending' && req.body.status !== 'Cancelled') {
      res.status(400).json({ success: false, message: 'Only Pending leave requests can be updated.' });
      return;
    }

    // If setting status to Cancelled
    if (req.body.status === 'Cancelled' && existing.status !== 'Cancelled') {
      if (existing.status === 'Pending' || existing.status === 'Approved') {
        const applicant = await dbService.getUserById(existing.user_id);
        if (applicant) {
          const balanceKey = getBalanceKey(existing.leave_type);
          const currentBal = applicant.leave_balance ? (applicant.leave_balance[balanceKey] !== undefined ? applicant.leave_balance[balanceKey] : 12) : 12;
          const updatedBalances = {
            ...(applicant.leave_balance || {}),
            [balanceKey]: currentBal + Number(existing.total_days || 0)
          };
          await dbService.updateUser(applicant.id, { leave_balance: updatedBalances });
        }
      }

      // Notify employee
      await dbService.createNotification({
        user_id: existing.user_id,
        receiver_id: existing.user_id,
        recipient_user_id: existing.user_id,
        recipient_role: 'Employee',
        sender_id: req.user?.id || existing.user_id,
        sender_name: req.user?.name || 'System',
        action_type: 'Leave Request Cancelled',
        title: 'Leave Cancelled',
        message: 'Your leave request has been cancelled.',
        leave_type: existing.leave_type,
        status: 'Cancelled'
      });
    }

    const updated = await dbService.updateLeaveRequest(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Leave request updated successfully!',
      leaveRequest: updated
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave request.' });
  }
};

export const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getLeaveRequestById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }

    // Restore deducted leave balance IF request was Pending or Approved
    if (existing.status === 'Pending' || existing.status === 'Approved') {
      const applicant = await dbService.getUserById(existing.user_id);
      if (applicant) {
        const balanceKey = getBalanceKey(existing.leave_type);
        const currentBal = applicant.leave_balance ? (applicant.leave_balance[balanceKey] !== undefined ? applicant.leave_balance[balanceKey] : 12) : 12;
        const updatedBalances = {
          ...(applicant.leave_balance || {}),
          [balanceKey]: currentBal + Number(existing.total_days || 0)
        };
        await dbService.updateUser(applicant.id, { leave_balance: updatedBalances });
      }
    }

    // Set status to Cancelled or delete
    await dbService.updateLeaveRequest(id, { status: 'Cancelled' });
    await dbService.deleteLeaveRequest(id);

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled and removed successfully. Deducted leave balance restored.'
    });
  } catch (error) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete leave request.' });
  }
};

export const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getLeaveRequestById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }

    if (existing.status === 'Cancelled') {
      res.status(400).json({ success: false, message: 'Leave request is already cancelled.' });
      return;
    }

    // Restore deducted leave balance if Pending or Approved
    if (existing.status === 'Pending' || existing.status === 'Approved') {
      const applicant = await dbService.getUserById(existing.user_id);
      if (applicant) {
        const balanceKey = getBalanceKey(existing.leave_type);
        const currentBal = applicant.leave_balance ? (applicant.leave_balance[balanceKey] !== undefined ? applicant.leave_balance[balanceKey] : 12) : 12;
        const updatedBalances = {
          ...(applicant.leave_balance || {}),
          [balanceKey]: currentBal + Number(existing.total_days || 0)
        };
        await dbService.updateUser(applicant.id, { leave_balance: updatedBalances });
      }
    }

    const updated = await dbService.updateLeaveRequest(id, { status: 'Cancelled' });

    // Send notification to employee
    await dbService.createNotification({
      user_id: existing.user_id,
      receiver_id: existing.user_id,
      recipient_user_id: existing.user_id,
      recipient_role: 'Employee',
      sender_id: req.user?.id || existing.user_id,
      sender_name: req.user?.name || 'System',
      action_type: 'Leave Request Cancelled',
      title: 'Leave Cancelled',
      message: 'Your leave request has been cancelled.',
      leave_type: existing.leave_type,
      status: 'Cancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully. Deducted leave balance restored.',
      leaveRequest: updated
    });
  } catch (error) {
    console.error('Cancel leave request error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel leave request.' });
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await dbService.getLeaveRequestById(id);

    if (!target) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }

    if (target.status === 'Approved') {
      res.status(400).json({ success: false, message: 'Leave request is already approved.' });
      return;
    }

    // Status changed to "Approved". Balance is NOT deducted again (was deducted when submitted).
    const reviewerName = req.user?.email || 'Admin';
    const updated = await dbService.updateLeaveRequest(id, {
      status: 'Approved',
      reviewed_at: new Date().toISOString().split('T')[0],
      reviewed_by: reviewerName
    });

    // Send notification to employee
    await dbService.createNotification({
      user_id: target.user_id,
      receiver_id: target.user_id,
      recipient_user_id: target.user_id,
      recipient_role: 'Employee',
      sender_id: req.user?.id || 'admin',
      sender_name: 'Admin',
      action_type: 'Leave Request Approved',
      title: 'Leave Approved',
      message: `Your ${target.leave_type} request has been Approved.`,
      leave_type: target.leave_type,
      status: 'Approved',
      type: 'approved',
      read: false,
      is_read: false
    });

    res.status(200).json({
      success: true,
      message: '🎉 Congratulations! Your leave request has been approved.',
      leaveRequest: updated
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve leave request.' });
  }
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const target = await dbService.getLeaveRequestById(id);

    if (!target) {
      res.status(404).json({ success: false, message: 'Leave request not found.' });
      return;
    }

    if (target.status === 'Rejected') {
      res.status(400).json({ success: false, message: 'Leave request is already rejected.' });
      return;
    }

    // Restore the deducted leave days back to the employee's leave balance
    const applicant = await dbService.getUserById(target.user_id);
    let updatedBalances = null;
    if (applicant) {
      const balanceKey = getBalanceKey(target.leave_type);
      const currentBal = applicant.leave_balance ? (applicant.leave_balance[balanceKey] !== undefined ? applicant.leave_balance[balanceKey] : 12) : 12;
      const restoredBal = currentBal + Number(target.total_days || 0);
      updatedBalances = {
        ...(applicant.leave_balance || {}),
        [balanceKey]: restoredBal
      };
      await dbService.updateUser(applicant.id, { leave_balance: updatedBalances });
    }

    const reviewerName = req.user?.email || 'Admin';
    const updated = await dbService.updateLeaveRequest(id, {
      status: 'Rejected',
      admin_remarks: remarks || '',
      remarks: remarks || '',
      reviewed_at: new Date().toISOString().split('T')[0],
      reviewed_by: reviewerName
    });

    // Send notification to employee
    await dbService.createNotification({
      user_id: target.user_id,
      receiver_id: target.user_id,
      recipient_user_id: target.user_id,
      recipient_role: 'Employee',
      sender_id: req.user?.id || 'admin',
      sender_name: 'Admin',
      action_type: 'Leave Request Rejected',
      title: 'Leave Rejected',
      message: `Your ${target.leave_type} request has been Rejected.`,
      leave_type: target.leave_type,
      status: 'Rejected',
      type: 'rejected',
      read: false,
      is_read: false
    });

    res.status(200).json({
      success: true,
      message: '😢 Sorry! Your leave request has been rejected. Your leave balance has been restored.',
      leaveRequest: updated,
      updatedBalance: updatedBalances
    });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject leave request.' });
  }
};
