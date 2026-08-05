import { dbService } from '../services/dbService.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email.' });
      return;
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error during login.' });
  }
};

export const getDemoToken = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ success: false, message: 'userId is required.' });
      return;
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('getDemoToken error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate token.' });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, gender, designation, department } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = role || 'Employee';

    const newUser = await dbService.createUser({
      name,
      email,
      password_hash: hashedPassword,
      role: assignedRole,
      gender: gender || 'Male',
      designation: designation || 'Software Engineer',
      department: department || 'Engineering'
    });

    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login using your registered email and password.',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error during registration.' });
  }
};

export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await dbService.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

