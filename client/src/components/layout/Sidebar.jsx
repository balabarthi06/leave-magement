import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserAvatar } from '../../utils/avatar';
import {
  LayoutDashboard,
  PlusCircle,
  Calendar,
  User as UserIcon,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  HelpCircle as QuestionIcon,
  X
} from 'lucide-react';

export const Sidebar = ({ onOpenQueryModal, isOpenOnMobile, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const employeeNav = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'Apply Leave', path: '/employee/apply-leave', icon: PlusCircle },
    { name: 'My Leaves', path: '/employee/my-leaves', icon: Calendar },
    { name: 'Profile', path: '/employee/profile', icon: UserIcon },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Leave Requests', path: '/admin/leaves', icon: FileText },
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Profile', path: '/admin/profile', icon: UserIcon },
  ];

  const navItems = user?.role === 'Admin' ? adminNav : employeeNav;

  const content = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between md:hidden pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-emerald-950">
              LEAVE<span className="text-emerald-600">Hub</span>
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Pill */}
        {user && (
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <img
              src={getUserAvatar(user)}
              alt={user.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-xs text-slate-900 truncate">{user.name}</h4>
              <p className="text-[11px] text-slate-500 truncate">{user.designation}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-100/80 text-emerald-900 border-r-4 border-emerald-600 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200/60">
        {/* Support Card */}
        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/80 text-center space-y-2">
          <p className="text-[11px] font-medium text-slate-600">Need assistance with the portal?</p>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenQueryModal();
            }}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <QuestionIcon className="w-3.5 h-3.5" />
            Raise Internal Query
          </button>
        </div>

        {/* System Settings & Help Links */}
        <div className="space-y-1 text-xs">
          <button
            onClick={() => {
              handleNavClick();
              navigate(user?.role === 'Admin' ? '/admin/profile' : '/employee/profile');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenQueryModal();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help Center</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-50/70 border-r border-slate-200/80 p-4 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenOnMobile && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className="relative w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-50 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

