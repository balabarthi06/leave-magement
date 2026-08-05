import { supabase } from '../config/db.js';
import bcrypt from 'bcryptjs';

const DEFAULT_HASH = bcrypt.hashSync('12345678', 10);
const EMPLOYEE_HASH = bcrypt.hashSync('password123', 10);

let inMemoryUsers = [];

let inMemoryLeaveRequests = [
  {
    id: 'REQ-101',
    user_id: 'usr-emp-1',
    user_name: 'Barthi T',
    user_email: 'barthi@leaveflow.com',
    user_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    user_employee_id: 'EMP-102',
    user_department: 'Engineering',
    leave_type: 'Casual Leave',
    start_date: '2026-08-05',
    end_date: '2026-08-06',
    total_days: 1,
    reason: 'Personal errands and home maintenance',
    status: 'Pending',
    applied_date: '2026-07-28',
    created_at: new Date().toISOString()
  },
  {
    id: 'REQ-102',
    user_id: 'usr-emp-2',
    user_name: 'Arjun Sharma',
    user_email: 'arjun.sharma@leaveflow.com',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop',
    user_employee_id: 'EMP-103',
    user_department: 'Engineering',
    leave_type: 'Sick Leave',
    start_date: '2026-07-20',
    end_date: '2026-07-22',
    total_days: 2,
    reason: 'Severe viral flu & fever',
    status: 'Approved',
    applied_date: '2026-07-19',
    reviewed_at: '2026-07-19',
    reviewed_by: 'Barthi',
    created_at: new Date().toISOString()
  }
];

let inMemoryNotifications = [
  {
    id: 'notif_1',
    user_id: 'usr-admin-1',
    sender_id: 'usr-emp-1',
    sender_name: 'Barthi T',
    sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    recipient_role: 'Admin',
    recipient_user_id: null,
    action_type: 'Leave Request Submitted',
    title: 'New Leave Request',
    message: 'Barthi T submitted a Casual Leave request for 1 day.',
    time: '2 hours ago',
    read: false,
    is_read: false,
    type: 'leave',
    created_at: new Date().toISOString()
  }
];

let inMemoryHolidays = [
  { id: 'hol-1', holiday_name: "New Year's Day", holiday_date: '2026-01-01', description: 'National Holiday', created_at: '2026-01-01T00:00:00.000Z' },
  { id: 'hol-2', holiday_name: 'Republic Day', holiday_date: '2026-01-26', description: 'National Holiday', created_at: '2026-01-26T00:00:00.000Z' },
  { id: 'hol-3', holiday_name: 'Labor Day', holiday_date: '2026-05-01', description: "International Workers' Day", created_at: '2026-05-01T00:00:00.000Z' },
  { id: 'hol-4', holiday_name: 'Government Holiday', holiday_date: '2026-08-11', description: 'State Festival / Holiday', created_at: '2026-08-01T00:00:00.000Z' },
  { id: 'hol-5', holiday_name: 'Independence Day', holiday_date: '2026-08-15', description: 'National Holiday', created_at: '2026-08-15T00:00:00.000Z' },
  { id: 'hol-6', holiday_name: 'Government Holiday', holiday_date: '2026-09-03', description: 'Official Government Holiday', created_at: '2026-08-01T00:00:00.000Z' },
  { id: 'hol-7', holiday_name: 'Gandhi Jayanti', holiday_date: '2026-10-02', description: 'National Holiday', created_at: '2026-10-02T00:00:00.000Z' },
  { id: 'hol-8', holiday_name: 'Dussehra / Vijayadashami', holiday_date: '2026-10-20', description: 'Festival Holiday', created_at: '2026-10-20T00:00:00.000Z' },
  { id: 'hol-9', holiday_name: 'Diwali', holiday_date: '2026-11-08', description: 'Festival Holiday', created_at: '2026-11-08T00:00:00.000Z' },
  { id: 'hol-10', holiday_name: 'Christmas Day', holiday_date: '2026-12-25', description: 'National Holiday', created_at: '2026-12-25T00:00:00.000Z' },
  { id: 'hol-11', holiday_name: "New Year's Day", holiday_date: '2027-01-01', description: 'National Holiday', created_at: '2027-01-01T00:00:00.000Z' },
  { id: 'hol-12', holiday_name: 'Republic Day', holiday_date: '2027-01-26', description: 'National Holiday', created_at: '2027-01-26T00:00:00.000Z' }
];

export const dbService = {
  // --- USERS ---
  async getUserByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (error) {
          console.error('Supabase getUserByEmail error:', error);
          return null;
        }

        if (data) {
          const gender = data.gender || 'Male';
          const defaultBal = gender === 'Female'
            ? { casual_leave: 12, sick_leave: 12, vacation_leave: 15, maternity_leave: 180, paternity_leave: 0 }
            : { casual_leave: 12, sick_leave: 12, vacation_leave: 15, paternity_leave: 15, maternity_leave: 0 };

          let fetchedBal = null;
          try {
            const { data: balRow } = await supabase
              .from('leave_balances')
              .select('*')
              .eq('user_id', data.id)
              .maybeSingle();
            if (balRow) {
              fetchedBal = {
                casual_leave: balRow.casual_leave,
                sick_leave: balRow.sick_leave,
                vacation_leave: balRow.vacation_leave,
                maternity_leave: balRow.maternity_leave,
                paternity_leave: balRow.paternity_leave
              };
            }
          } catch (e) {
            console.warn('leave_balances table select notice:', e);
          }

          const userBal = fetchedBal || (typeof data.leave_balances === 'object' && data.leave_balances ? { ...defaultBal, ...data.leave_balances } : defaultBal);

          return {
            ...data,
            password_hash: data.password_hash || data.password,
            photo: data.photo || data.avatar,
            leave_balance: userBal
          };
        }

        return null;
      } catch (err) {
        console.error('Supabase query error:', err);
        return null;
      }
    }

    const found = inMemoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    return found || null;
  },

  async getUserById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();

        if (error) {
          console.error('Supabase getUserById error:', error);
          return null;
        }

        if (data) {
          const gender = data.gender || 'Male';
          const defaultBal = gender === 'Female'
            ? { casual_leave: 12, sick_leave: 12, vacation_leave: 15, maternity_leave: 180, paternity_leave: 0 }
            : { casual_leave: 12, sick_leave: 12, vacation_leave: 15, paternity_leave: 15, maternity_leave: 0 };

          let fetchedBal = null;
          try {
            const { data: balRow } = await supabase
              .from('leave_balances')
              .select('*')
              .eq('user_id', data.id)
              .maybeSingle();
            if (balRow) {
              fetchedBal = {
                casual_leave: balRow.casual_leave,
                sick_leave: balRow.sick_leave,
                vacation_leave: balRow.vacation_leave,
                maternity_leave: balRow.maternity_leave,
                paternity_leave: balRow.paternity_leave
              };
            }
          } catch (e) {
            console.warn('leave_balances table select notice:', e);
          }

          const userBal = fetchedBal || (typeof data.leave_balances === 'object' && data.leave_balances ? { ...defaultBal, ...data.leave_balances } : defaultBal);

          return {
            ...data,
            password_hash: data.password_hash || data.password,
            photo: data.photo || data.avatar,
            leave_balance: userBal
          };
        }

        return null;
      } catch (err) {
        console.error('Supabase query error:', err);
        return null;
      }
    }

    const found = inMemoryUsers.find((u) => u.id === id);
    return found || null;
  },

  async createUser(userData) {
    const gender = userData.gender || 'Male';
    const defaultLeaves = gender === 'Female'
      ? { casual_leave: 12, sick_leave: 12, vacation_leave: 15, maternity_leave: 180, paternity_leave: 0 }
      : { casual_leave: 12, sick_leave: 12, vacation_leave: 15, paternity_leave: 15, maternity_leave: 0 };

    const newUser = {
      id: userData.id || `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: userData.name || 'User',
      nickname: userData.nickname || '',
      email: userData.email || '',
      password_hash: userData.password_hash,
      role: userData.role || 'Employee',
      gender,
      profile_image: userData.profile_image || null,
      photo: userData.photo || null,
      designation: userData.designation || 'Software Associate',
      department: userData.department || 'Engineering',
      employee_id: userData.employee_id || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      joined_date: userData.joined_date || new Date().toISOString().split('T')[0],
      leave_balance: userData.leave_balance || defaultLeaves,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([{
            id: newUser.id,
            name: newUser.name,
            nickname: newUser.nickname,
            email: newUser.email,
            password_hash: newUser.password_hash,
            role: newUser.role,
            gender: newUser.gender,
            photo: newUser.photo,
            designation: newUser.designation,
            department: newUser.department,
            employee_id: newUser.employee_id,
            joined_date: newUser.joined_date,
            leave_balances: newUser.leave_balance
          }])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert user error:', error);
          throw new Error('Database insert error: ' + error.message);
        }

        // Also insert into leave_balances table
        try {
          await supabase.from('leave_balances').upsert({
            user_id: newUser.id,
            casual_leave: newUser.leave_balance.casual_leave ?? 12,
            sick_leave: newUser.leave_balance.sick_leave ?? 12,
            vacation_leave: newUser.leave_balance.vacation_leave ?? 15,
            maternity_leave: newUser.leave_balance.maternity_leave ?? (gender === 'Female' ? 180 : 0),
            paternity_leave: newUser.leave_balance.paternity_leave ?? (gender === 'Male' ? 15 : 0)
          }, { onConflict: 'user_id' });
        } catch (balErr) {
          console.warn('Supabase insert leave_balances error:', balErr);
        }

        if (data) {
          inMemoryUsers.push(newUser);
          return {
            ...newUser,
            ...data,
            password_hash: data.password_hash || newUser.password_hash,
            leave_balance: typeof data.leave_balances === 'object' && data.leave_balances ? data.leave_balances : newUser.leave_balance
          };
        }
      } catch (err) {
        console.error('Supabase createUser exception:', err);
        throw err;
      }
    }

    inMemoryUsers.push(newUser);
    return newUser;
  },

  async updateUser(id, updates) {
    let target = await this.getUserById(id);
    if (!target) return null;

    const updatedUser = {
      ...target,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase
          .from('users')
          .update({
            name: updatedUser.name,
            nickname: updatedUser.nickname,
            gender: updatedUser.gender,
            role: updatedUser.role,
            designation: updatedUser.designation,
            leave_balances: updatedUser.leave_balance
          })
          .eq('id', id);

        if (updatedUser.leave_balance) {
          const bal = updatedUser.leave_balance;
          await supabase.from('leave_balances').upsert({
            user_id: id,
            casual_leave: bal.casual_leave ?? 12,
            sick_leave: bal.sick_leave ?? 12,
            vacation_leave: bal.vacation_leave ?? 15,
            maternity_leave: bal.maternity_leave ?? (updatedUser.gender === 'Female' ? 180 : 0),
            paternity_leave: bal.paternity_leave ?? (updatedUser.gender === 'Male' ? 15 : 0),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      } catch (err) {
        console.warn('Supabase update user/leave_balances error:', err);
      }
    }

    const idx = inMemoryUsers.findIndex((u) => u.id === id);
    if (idx !== -1) {
      inMemoryUsers[idx] = updatedUser;
    }

    return updatedUser;
  },

  async getAllUsers() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('Supabase getAllUsers error:', error);
          return [];
        }
        if (data) {
          let balMap = new Map();
          try {
            const { data: allBals } = await supabase.from('leave_balances').select('*');
            if (allBals) {
              allBals.forEach((b) => balMap.set(b.user_id, b));
            }
          } catch (e) {
            console.warn('leave_balances fetch all notice:', e);
          }

          return data.map((u) => {
            const gender = u.gender || 'Male';
            const defaultBal = gender === 'Female'
              ? { casual_leave: 12, sick_leave: 12, vacation_leave: 15, maternity_leave: 180, paternity_leave: 0 }
              : { casual_leave: 12, sick_leave: 12, vacation_leave: 15, paternity_leave: 15, maternity_leave: 0 };

            const balRow = balMap.get(u.id);
            const userBal = balRow
              ? {
                  casual_leave: balRow.casual_leave,
                  sick_leave: balRow.sick_leave,
                  vacation_leave: balRow.vacation_leave,
                  maternity_leave: balRow.maternity_leave,
                  paternity_leave: balRow.paternity_leave
                }
              : (typeof u.leave_balances === 'object' && u.leave_balances ? { ...defaultBal, ...u.leave_balances } : defaultBal);

            return {
              ...u,
              password_hash: u.password_hash || u.password,
              photo: u.photo || u.avatar,
              leave_balance: userBal
            };
          });
        }
      } catch (err) {
        console.error('Supabase getAllUsers exception:', err);
        return [];
      }
    }
    return inMemoryUsers;
  },

  // --- LEAVE REQUESTS ---
  async getAllLeaveRequests() {
    let requests = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          requests = data;
        } else {
          requests = inMemoryLeaveRequests;
        }
      } catch (err) {
        console.warn('Supabase getAllLeaveRequests error:', err);
        requests = inMemoryLeaveRequests;
      }
    } else {
      requests = inMemoryLeaveRequests;
    }

    // Enrich requests with user details via users.id -> leave_requests.user_id relationship
    if (requests.length > 0) {
      const allUsers = await this.getAllUsers();
      const userMap = new Map(allUsers.map((u) => [u.id, u]));

      return requests.map((lr) => {
        const u = userMap.get(lr.user_id) || {};
        return {
          ...lr,
          user_name: lr.user_name || u.name || 'Employee',
          user_email: lr.user_email || u.email || '',
          user_photo: lr.user_photo || lr.user_avatar || u.photo || u.profile_image || null,
          user_avatar: lr.user_avatar || lr.user_photo || u.photo || u.profile_image || null,
          user_department: lr.user_department || u.department || '',
          designation: lr.designation || u.designation || '',
          applied_date: lr.applied_date || lr.applied_on || lr.start_date || lr.created_at
        };
      });
    }

    return requests;
  },

  async getLeaveRequestsByUserId(userId) {
    let requests = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          requests = data;
        } else {
          requests = inMemoryLeaveRequests.filter((r) => r.user_id === userId);
        }
      } catch (err) {
        console.warn('Supabase getLeaveRequestsByUserId error:', err);
        requests = inMemoryLeaveRequests.filter((r) => r.user_id === userId);
      }
    } else {
      requests = inMemoryLeaveRequests.filter((r) => r.user_id === userId);
    }

    if (requests.length > 0) {
      const allUsers = await this.getAllUsers();
      const userMap = new Map(allUsers.map((u) => [u.id, u]));

      return requests.map((lr) => {
        const u = userMap.get(lr.user_id) || {};
        return {
          ...lr,
          user_name: lr.user_name || u.name || 'Employee',
          user_email: lr.user_email || u.email || '',
          user_photo: lr.user_photo || lr.user_avatar || u.photo || u.profile_image || null,
          user_avatar: lr.user_avatar || lr.user_photo || u.photo || u.profile_image || null,
          user_department: lr.user_department || u.department || '',
          designation: lr.designation || u.designation || '',
          applied_date: lr.applied_date || lr.applied_on || lr.start_date || lr.created_at
        };
      });
    }

    return requests;
  },

  async getLeaveRequestById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('leave_requests').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          const allUsers = await this.getAllUsers();
          const u = allUsers.find((user) => user.id === data.user_id) || {};
          return {
            ...data,
            user_name: data.user_name || u.name || 'Employee',
            user_email: data.user_email || u.email || '',
            user_photo: data.user_photo || data.user_avatar || u.photo || u.profile_image || null,
            user_avatar: data.user_avatar || data.user_photo || u.photo || u.profile_image || null,
            user_department: data.user_department || u.department || '',
            designation: data.designation || u.designation || '',
            applied_date: data.applied_date || data.applied_on || data.start_date
          };
        }
      } catch (err) {
        console.warn('Supabase getLeaveRequestById error:', err);
      }
    }
    return inMemoryLeaveRequests.find((r) => r.id === id) || null;
  },

  async createLeaveRequest(requestData) {
    const newReq = {
      id: requestData.id || `REQ-${Math.floor(100 + Math.random() * 900)}`,
      user_id: requestData.user_id || '',
      user_name: requestData.user_name || '',
      user_photo: requestData.user_photo || requestData.user_avatar || '',
      user_avatar: requestData.user_avatar || requestData.user_photo || '',
      user_email: requestData.user_email || '',
      user_employee_id: requestData.user_employee_id || '',
      user_department: requestData.user_department || '',
      designation: requestData.designation || 'Engineer',
      leave_type: requestData.leave_type || 'Casual Leave',
      start_date: requestData.start_date || new Date().toISOString().split('T')[0],
      end_date: requestData.end_date || new Date().toISOString().split('T')[0],
      total_days: requestData.total_days || 1,
      reason: requestData.reason || '',
      status: requestData.status || 'Pending',
      is_emergency: Boolean(requestData.is_emergency || requestData.priority === 'High'),
      priority: requestData.priority || (requestData.is_emergency ? 'High' : 'Normal'),
      applied_on: new Date().toISOString().split('T')[0],
      applied_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const insertPayload = {
          id: newReq.id,
          user_id: newReq.user_id,
          user_name: newReq.user_name,
          user_photo: newReq.user_photo,
          designation: newReq.designation,
          leave_type: newReq.leave_type,
          start_date: newReq.start_date,
          end_date: newReq.end_date,
          total_days: newReq.total_days,
          reason: newReq.reason,
          status: newReq.status,
          is_emergency: newReq.is_emergency,
          priority: newReq.priority,
          applied_on: newReq.applied_on
        };

        console.log('[dbService.createLeaveRequest] Insert query payload:', insertPayload);

        const { data, error } = await supabase.from('leave_requests').insert([insertPayload]).select().maybeSingle();

        console.log('[dbService.createLeaveRequest] Supabase response:', { data, error });

        if (error) {
          console.error('Supabase createLeaveRequest error:', error);
          throw new Error(error.message || 'Database insert failed');
        }

        if (data) {
          const created = { ...newReq, ...data };
          inMemoryLeaveRequests.unshift(created);
          return created;
        }
      } catch (err) {
        console.error('Supabase createLeaveRequest exception:', err);
        throw err;
      }
    }

    inMemoryLeaveRequests.unshift(newReq);
    return newReq;
  },

  async updateLeaveRequest(id, updates) {
    let target = inMemoryLeaveRequests.find((r) => r.id === id);
    if (!target) {
      target = await this.getLeaveRequestById(id);
    }
    if (!target) return null;

    const updated = { ...target, ...updates, updated_at: new Date().toISOString() };

    if (supabase) {
      try {
        await supabase.from('leave_requests').update({
          status: updated.status,
          remarks: updated.remarks || updated.admin_remarks,
          start_date: updated.start_date,
          end_date: updated.end_date,
          total_days: updated.total_days,
          reason: updated.reason,
          reviewed_at: updated.reviewed_at,
          reviewed_by: updated.reviewed_by
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateLeaveRequest error:', err);
      }
    }

    const idx = inMemoryLeaveRequests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      inMemoryLeaveRequests[idx] = updated;
    } else {
      inMemoryLeaveRequests.unshift(updated);
    }

    return updated;
  },

  async deleteLeaveRequest(id) {
    if (supabase) {
      try {
        await supabase.from('leave_requests').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteLeaveRequest error:', err);
      }
    }

    inMemoryLeaveRequests = inMemoryLeaveRequests.filter((r) => r.id !== id);
    return true;
  },

  // --- NOTIFICATIONS ---
  async getNotificationsForUser(userId, role) {
    let list = [];
    if (supabase) {
      try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          list = data;
        } else {
          list = inMemoryNotifications;
        }
      } catch (err) {
        console.warn('Supabase notifications fetch error:', err);
        list = inMemoryNotifications;
      }
    } else {
      list = inMemoryNotifications;
    }

    const allUsers = await this.getAllUsers();
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    console.log(`[dbService.getNotificationsForUser] DB list size: ${list.length}, filtering for userId: ${userId}, role: ${role}`);

    const filtered = list.filter((n) => {
      const recId = n.receiver_id || n.recipient_user_id || n.user_id;

      if (role === 'Admin') {
        return (
          n.recipient_role === 'Admin' ||
          recId === userId ||
          n.recipient_role === 'all' ||
          !n.recipient_role
        );
      } else {
        return (
          recId === userId ||
          (n.recipient_role === 'Employee' && (!recId || recId === userId))
        );
      }
    });

    console.log(`[dbService.getNotificationsForUser] Found ${filtered.length} matching notifications for userId: ${userId} (${role})`);

    return filtered.map((n) => {
      const sender = userMap.get(n.sender_id) || {};
      const senderName = n.sender_name || sender.name || n.employee_name || 'System';
      const senderPhoto = n.sender_avatar || sender.photo || sender.profile_image || n.employee_photo || null;
      const senderEmail = n.sender_email || sender.email || n.employee_email || '';

      return {
        ...n,
        sender_id: n.sender_id || sender.id || null,
        receiver_id: n.receiver_id || n.recipient_user_id || n.user_id || null,
        sender_name: senderName,
        sender_avatar: senderPhoto,
        sender_email: senderEmail,
        employee_name: n.employee_name || senderName,
        employee_email: n.employee_email || senderEmail,
        employee_photo: n.employee_photo || senderPhoto,
        is_read: n.is_read || n.read || false,
        read: n.read || n.is_read || false,
        created_at: n.created_at || new Date().toISOString()
      };
    });
  },

  async createNotification(notif) {
    const newNotif = {
      id: notif.id || `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: notif.user_id || notif.receiver_id || notif.recipient_user_id || 'system',
      sender_id: notif.sender_id || 'system',
      receiver_id: notif.receiver_id || notif.recipient_user_id || notif.user_id || null,
      recipient_user_id: notif.recipient_user_id || notif.receiver_id || notif.user_id || null,
      sender_name: notif.sender_name || 'System',
      sender_email: notif.sender_email || notif.employee_email || '',
      sender_avatar: notif.sender_avatar || notif.employee_photo || '',
      recipient_role: notif.recipient_role || 'Admin',
      action_type: notif.action_type || 'Notification',
      title: notif.title || 'Notification',
      message: notif.message || '',
      leave_type: notif.leave_type || '',
      start_date: notif.start_date || '',
      end_date: notif.end_date || '',
      total_days: notif.total_days || null,
      status: notif.status || 'Pending',
      applied_date: notif.applied_date || new Date().toISOString().split('T')[0],
      employee_name: notif.employee_name || notif.sender_name || '',
      employee_email: notif.employee_email || notif.sender_email || '',
      employee_photo: notif.employee_photo || notif.sender_avatar || '',
      time: 'Just now',
      read: false,
      is_read: false,
      type: notif.type || 'info',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const payload = {
          id: newNotif.id,
          user_id: newNotif.user_id,
          sender_id: newNotif.sender_id,
          receiver_id: newNotif.receiver_id,
          recipient_user_id: newNotif.recipient_user_id,
          recipient_role: newNotif.recipient_role,
          title: newNotif.title,
          message: newNotif.message,
          action_type: newNotif.action_type,
          sender_name: newNotif.sender_name,
          sender_avatar: newNotif.sender_avatar,
          read: false,
          type: newNotif.type
        };

        const { data, error } = await supabase.from('notifications').insert([payload]).select().maybeSingle();
        if (error) {
          // If schema doesn't have all columns, try simpler payload
          await supabase.from('notifications').insert([{
            id: newNotif.id,
            user_id: newNotif.user_id,
            title: newNotif.title,
            message: newNotif.message,
            read: false
          }]);
        }
      } catch (err) {
        console.warn('Supabase createNotification exception:', err);
      }
    }

    inMemoryNotifications.unshift(newNotif);
    return newNotif;
  },

  async markNotificationRead(id) {
    const notif = inMemoryNotifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      notif.is_read = true;
    }
    if (supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      } catch (err) {
        console.warn('Supabase markNotificationRead error:', err);
      }
    }
    return true;
  },

  async markAllNotificationsRead(userId, role) {
    inMemoryNotifications.forEach((n) => {
      n.read = true;
      n.is_read = true;
    });
    if (supabase) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase markAllNotificationsRead error:', err);
      }
    }
    return true;
  },

  // --- HOLIDAYS ---
  async getAllHolidays() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('holidays').select('*').order('holiday_date', { ascending: true });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getAllHolidays error:', err);
      }
    }
    return [...inMemoryHolidays].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));
  },

  async getHolidayById(id) {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('holidays').select('*').eq('id', id).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getHolidayById error:', err);
      }
    }
    return inMemoryHolidays.find((h) => h.id === id) || null;
  },

  async createHoliday(holiday) {
    const newHoliday = {
      id: holiday.id || `hol_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      holiday_name: holiday.holiday_name,
      holiday_date: holiday.holiday_date,
      description: holiday.description || '',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase.from('holidays').insert([newHoliday]).select().maybeSingle();
        if (!error && data) {
          inMemoryHolidays.push(data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase createHoliday error:', err);
      }
    }

    inMemoryHolidays.push(newHoliday);
    return newHoliday;
  },

  async updateHoliday(id, holidayData) {
    const target = inMemoryHolidays.find((h) => h.id === id);
    const updated = {
      ...(target || {}),
      ...holidayData,
      id
    };

    if (supabase) {
      try {
        await supabase.from('holidays').update({
          holiday_name: holidayData.holiday_name,
          holiday_date: holidayData.holiday_date,
          description: holidayData.description
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateHoliday error:', err);
      }
    }

    const idx = inMemoryHolidays.findIndex((h) => h.id === id);
    if (idx !== -1) {
      inMemoryHolidays[idx] = updated;
    } else {
      inMemoryHolidays.push(updated);
    }
    return updated;
  },

  async deleteHoliday(id) {
    if (supabase) {
      try {
        await supabase.from('holidays').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteHoliday error:', err);
      }
    }
    inMemoryHolidays = inMemoryHolidays.filter((h) => h.id !== id);
    return true;
  }
};
