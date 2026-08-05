import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationPanel } from '../common/NotificationPanel';
import { Bell, Shield, User as UserIcon, LogOut, ChevronDown, Check, Sparkles, Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserAvatar } from '../../utils/avatar';

export const Header = ({ onOpenCalendar, isMobileSidebarOpen, onToggleMobileSidebar }) => {
  const { user, users, switchUser, logout } = useAuth();
  const { getUnreadCountForUser } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const unreadCount = getUnreadCountForUser(user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      {/* Demo Switcher Quick Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-3 sm:px-4 flex items-center justify-between border-b border-emerald-900 gap-2">
        <div className="flex items-center gap-2 font-medium overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
          <span className="truncate text-[11px] sm:text-xs">
            <span className="hidden sm:inline">Interactive Preview Mode: </span>Switch accounts instantly
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-300 font-semibold hidden md:inline">Active Role:</span>
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 px-2 py-1 rounded-md text-[11px] sm:text-xs font-semibold border border-emerald-700/60 transition-colors"
            >
              <span className="max-w-[120px] sm:max-w-none truncate">{user?.name} ({user?.role})</span>
              <ChevronDown className="w-3 h-3 text-emerald-400 shrink-0" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 font-bold text-slate-400 tracking-wider uppercase text-[10px] border-b border-slate-100">
                  Switch Test Account
                </div>
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowRoleSwitcher(false);
                      if (u.role === 'Admin') navigate('/admin/dashboard');
                      else navigate('/employee/dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 transition-colors ${
                      user?.id === u.id ? 'bg-emerald-50/80 text-emerald-800 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={getUserAvatar(u)} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.role} ({u.gender})</div>
                      </div>
                    </div>
                    {user?.id === u.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Mobile Menu Hamburger Button & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
            title="Toggle Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to={user?.role === 'Admin' ? '/admin/dashboard' : '/employee/dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-sm font-bold text-base sm:text-lg">
              🌿
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-emerald-950">
                LEAVE<span className="text-emerald-600">Hub</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase text-slate-400 font-medium -mt-1">
                Leave Management
              </span>
            </div>
          </Link>

          {/* Top Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 ml-4">
            <Link
              to={user?.role === 'Admin' ? '/admin/dashboard' : '/employee/dashboard'}
              className="text-emerald-700 font-semibold hover:text-emerald-800 transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={onOpenCalendar}
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              Calendar
            </button>
            <Link
              to={user?.role === 'Admin' ? '/admin/employees' : '/employee/my-leaves'}
              className="hover:text-slate-900 transition-colors"
            >
              {user?.role === 'Admin' ? 'Directory' : 'My Leaves'}
            </Link>
          </nav>
        </div>

        {/* Top Right User Profile Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Theme Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100/80 transition-all flex items-center justify-center relative"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-transform active:scale-90" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 hover:text-emerald-700 transition-transform active:scale-90" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              title="Notifications"
              className={`p-2 rounded-xl transition-all relative ${
                showNotifPanel
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100/80'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] text-[10px] font-black rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300"></span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <NotificationPanel
              isOpen={showNotifPanel}
              onClose={() => setShowNotifPanel(false)}
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 sm:pr-3 rounded-full border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <img
                src={getUserAvatar(user)}
                alt={user?.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
              />
              <div className="text-left hidden md:block">
                <span className="block text-xs font-semibold text-slate-900 leading-tight">{user?.name}</span>
                <span className="block text-[10px] text-slate-500 leading-tight">{user?.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {user?.designation}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to={user?.role === 'Admin' ? '/admin/profile' : '/employee/profile'}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  {user?.role === 'Admin' && (
                    <Link
                      to="/admin/leaves"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      All Leave Requests
                    </Link>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

