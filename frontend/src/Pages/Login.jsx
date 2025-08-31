import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      toast.success('OTP sent to your email.');
      setStep('reset');
    } catch (err) {
      toast.error('Email not found or server error.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    const otpString = otp.join('');
    if (otpString.length < 6) {
      toast.error('Please enter all 6 digits of the OTP.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp: otpString,
        password: newPassword,
      });
      toast.success('Password reset successful!');
      setStep('login');
    } catch (err) {
      toast.error('Invalid OTP or server error.');
    }
  };

  const handleOTPChange = (e, index) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;
      if (!credential) return toast.error('No Google credential received');

      const decoded = jwtDecode(credential);
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      toast.success('Google login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Google login failed');
    }
  };

  return (
    <div className="body flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10 transition transform hover:shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-800">
            {step === 'login' ? 'Welcome Back' : step === 'forgot' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="text-gray-500 text-sm">
            {step === 'login'
              ? 'Login to your Excel Analytics account'
              : step === 'forgot'
                ? 'Enter your email to receive OTP'
                : 'Enter OTP & set new password'}
          </p>
        </div>

        {/* Login Form */}
        {step === 'login' && (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                name="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                name="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <p className="text-blue-600 text-sm text-right cursor-pointer hover:underline" onClick={() => setStep('forgot')}>
              Forgot Password?
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:text-blue-500">
                Sign up
              </Link>
            </div>
          </form>
        )}

        {/* Forgot Password */}
        {step === 'forgot' && (
          <form onSubmit={handleSendOTP} className="mt-6 space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg">
              Send OTP
            </button>
            <p className="text-center text-blue-600 cursor-pointer hover:underline" onClick={() => setStep('login')}>
              Back to Login
            </p>
          </form>
        )}

        {/* Reset Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-5">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  className="w-10 h-10 border rounded text-center text-lg focus:ring-2 focus:ring-blue-500"
                  value={digit}
                  onChange={(e) => handleOTPChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>
            <input
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg">
              Reset Password
            </button>
            <p className="text-center text-blue-600 cursor-pointer hover:underline" onClick={() => setStep('login')}>
              Back to Login
            </p>
          </form>
        )}

        {/* Google Login */}
        {step === 'login' && (
          <>
            <div className="mt-6 flex items-center justify-center">
              <span className="text-gray-400 text-sm">or</span>
            </div>
            <div className="flex justify-center mt-4">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google login failed')} useOneTap />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
