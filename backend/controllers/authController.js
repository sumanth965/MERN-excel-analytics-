import bcrypt from 'bcrypt';
import User from '../models/User.js';
import createTransporter from '../utils/createTransporter.js';

// Generate OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user.resetPasswordOTPHash = otpHash;
    user.resetPasswordOTPExpiresAt = expiresAt;
    await user.save();

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `<p>Here is your OTP: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Email not found' });

    if (!user.resetPasswordOTPHash || !user.resetPasswordOTPExpiresAt) {
      return res.status(400).json({ message: 'OTP not requested' });
    }

    if (new Date() > user.resetPasswordOTPExpiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOTPHash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP' });

    user.password = password;
    user.resetPasswordOTPHash = undefined;
    user.resetPasswordOTPExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
