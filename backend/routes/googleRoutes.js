import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Adjust the path if needed

const router = express.Router();

router.post('/google', async (req, res) => {
  try {
    const { name, email, picture } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      // Set a random or placeholder password (since it's required by schema)
      const randomPassword = Math.random().toString(36).slice(-8); // e.g., "x3lp9k2a"

      user = new User({
        name,
        email,
        picture,
        password: randomPassword,
        googleAuth: true // Mark as Google-authenticated
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
