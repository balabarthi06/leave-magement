import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import { dbService } from './services/dbService.js';
import { hashPassword } from './utils/password.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Automatic Default Admin Creation on Server Startup
const ensureDefaultAdmin = async () => {
  try {
    const adminEmail = 'balabarthi06@gmail.com';
    const existingAdmin = await dbService.getUserByEmail(adminEmail);

    if (existingAdmin) {
      console.log('Default Admin already exists.');
    } else {
      const hashedPassword = await hashPassword('12345678');
      await dbService.createUser({
        name: 'Barthi',
        email: adminEmail,
        password_hash: hashedPassword,
        gender: 'Male',
        role: 'Admin',
        designation: 'System Administrator',
        department: 'Management'
      });
      console.log('Default Admin created successfully.');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// CORS Configuration
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://leave-magement.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LeaveFlow Backend API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/holidays', holidayRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await ensureDefaultAdmin();
});

export default app;
