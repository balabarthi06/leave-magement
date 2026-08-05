import { dbService } from '../services/dbService.js';
import { comparePassword, hashPassword } from '../utils/password.js';

export const changePassword = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      return;
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
      return;
    }

    const user = await dbService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const newHashed = await hashPassword(newPassword);
    await dbService.updateUser(user.id, { password_hash: newHashed });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully!'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { name, nickname, gender, role } = req.body;

    const updatedUser = await dbService.updateUser(req.user.id, {
      ...(name !== undefined && { name }),
      ...(nickname !== undefined && { nickname }),
      ...(gender !== undefined && { gender }),
      ...(role !== undefined && { role })
    });

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    const sanitizedUsers = users.map(({ password_hash, ...u }) => u);

    res.status(200).json({
      success: true,
      users: sanitizedUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbService.getUserById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { password_hash, ...sanitized } = user;
    res.status(200).json({
      success: true,
      user: sanitized
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};
