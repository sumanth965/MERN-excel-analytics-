import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { sendOtp, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ message: 'User created successfully', token, user });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(400).json({ message: 'Account is deactivated' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password
router.post('/send-otp', sendOtp);
router.post('/reset-password', resetPassword);

// Get current user
router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);

      user = new User({
        name,
        email,
        picture,
        password: randomPassword,
        googleAuth: true
      });

      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(500).json({ message: 'Google login failed' });
  }
});

export default router;
