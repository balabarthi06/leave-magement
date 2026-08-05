import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserAvatar } from '../../utils/avatar';
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkles,
  Upload
} from 'lucide-react';

export const EmployeeProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [role, setRole] = useState(user?.role || 'Employee');
  const [profileImage, setProfileImage] = useState(user?.profile_image || null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNickname(user.nickname || '');
      setGender(user.gender || 'Male');
      setRole(user.role || 'Employee');
      setProfileImage(user.profile_image || null);
    }
  }, [user]);

  if (!user) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await updateProfile({ name, nickname, gender, role, profile_image: profileImage });
    if (res.success) {
      setSuccessMsg(res.message || 'Profile updated successfully!');
      setShowEditProfile(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    const res = await changePassword({ currentPassword, newPassword, confirmPassword });
    if (res.success) {
      setSuccessMsg(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(res.message || 'Failed to update password.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Profile & Account</h1>
        <p className="text-xs text-slate-500">Manage your profile information and account security</p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold shadow-2xs">
          <Lock className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 flex flex-col sm:flex-row items-center gap-6">
        <img
          src={getUserAvatar(user)}
          alt={user.name}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            {user.nickname && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                "{user.nickname}"
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase">
              {user.role}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {user.designation} • {user.department}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-400" /> Employee ID: {user.employee_id}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Gender: {user.gender}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditProfile(!showEditProfile);
                setErrorMsg('');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              {showEditProfile ? 'Hide Edit Profile' : 'Edit Profile'}
            </button>

            <button
              onClick={() => {
                setShowChangePassword(!showChangePassword);
                setErrorMsg('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              {showChangePassword ? 'Hide Change Password' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>

      {/* Leave Allocations Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Active Leave Allocations Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Casual Leave</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{user.leave_balance?.casual_leave ?? 8} Days</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Sick Leave</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{user.leave_balance?.sick_leave ?? 10} Days</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Vacation Leave</span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">{user.leave_balance?.vacation_leave ?? 10} Days</span>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
              {user.gender === 'Female' ? 'Maternity Leave' : 'Paternity Leave'}
            </span>
            <span className="text-2xl font-black text-indigo-900 mt-1 block">
              {user.gender === 'Female' ? (user.leave_balance?.maternity_leave ?? 180) : (user.leave_balance?.paternity_leave ?? 15)} Days
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Container - Hidden by default */}
      {showEditProfile && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-600" />
              Edit Profile Details
            </h3>
            <button
              onClick={() => setShowEditProfile(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="Employee">Employee</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Software Architect">Software Architect</option>
                  <option value="Marketing Executive">Marketing Executive</option>
                  <option value="Graphic Designer">Graphic Designer</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Custom Profile Picture (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Choose Image File...</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => setProfileImage(null)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      Remove Custom Picture (Use Default)
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Container - Hidden by default */}
      {showChangePassword && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              Change Password
            </h3>
            <button
              onClick={() => setShowChangePassword(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
