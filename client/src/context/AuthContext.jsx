import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
const AuthContext = createContext(undefined);

const CURRENT_USER_STORAGE_KEY = 'leaveflow_current_user_v1';
const JWT_TOKEN_KEY = 'leavehub_token';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(JWT_TOKEN_KEY) || null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved current user', e);
      }
    }
    return null;
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch /api/auth/me on boot if token exists
  useEffect(() => {
    const fetchMe = async () => {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(getApiUrl('/api/auth/me'), {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data.user));
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem(JWT_TOKEN_KEY);
            localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem(JWT_TOKEN_KEY);
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        }
      } catch (err) {
        console.warn('Failed to verify session token via API:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Fetch users list from backend API
  const refreshUsers = async () => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${savedToken || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users || data.data)) {
          const userList = data.users || data.data;
          setUsers(userList);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh users via API:', err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(JWT_TOKEN_KEY, data.token);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data.user));
        await refreshUsers();
        return { success: true, user: data.user, token: data.token };
      } else {
        return { success: false, message: data.message || 'Invalid email or password.' };
      }
    } catch (err) {
      console.error('Login API error:', err);
      return { success: false, message: 'Server communication error. Please try again.' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Do NOT log user in automatically after registration
        return {
          success: true,
          message: data.message || 'Registration successful. Please login to continue.',
          user: data.user
        };
      } else {
        return { success: false, message: data.message || 'Registration failed.' };
      }
    } catch (err) {
      console.error('Register API error:', err);
      return { success: false, message: 'Server communication error during registration.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    localStorage.removeItem(JWT_TOKEN_KEY);
  };

  const refreshCurrentUser = async () => {
    const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
    if (!savedToken) return null;

    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${savedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (err) {
      console.warn('Failed to refresh current user session:', err);
    }
    return null;
  };

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(getApiUrl('/api/users/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message || 'Password updated successfully!' };
      } else {
        return { success: false, message: data.message || 'Failed to update password.' };
      }
    } catch (err) {
      console.error('Change password API error:', err);
      return { success: false, message: 'Network error updating password.' };
    }
  };

  const updateProfile = async (updatedData) => {
    if (!user) return { success: false, message: 'Not logged in.' };

    try {
      const savedToken = localStorage.getItem(JWT_TOKEN_KEY);
      const res = await fetch(getApiUrl('/api/users/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(updatedData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(data.user));
        await refreshUsers();
        return { success: true, message: data.message || 'Profile updated successfully!', user: data.user };
      } else {
        return { success: false, message: data.message || 'Failed to update profile.' };
      }
    } catch (err) {
      console.error('Update profile API error:', err);
      return { success: false, message: 'Network error updating profile.' };
    }
  };

  const switchUser = async (userId) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(target));
      try {
        const res = await fetch(getApiUrl('/api/auth/demo-token'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: target.id })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.token) {
            setToken(data.token);
            localStorage.setItem(JWT_TOKEN_KEY, data.token);
          }
        }
      } catch (err) {
        console.warn('Failed to switch demo token:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        token,
        loading,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        changePassword,
        refreshCurrentUser,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
