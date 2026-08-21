import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    // Steps tracker: 'email_step' (requesting OTP) or 'reset_step' (providing OTP and New Password)
    const [step, setStep] = useState('email_step');
    
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Phase 1: Request Password Reset OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/accounts/forgot-password/', { email });
            setMessage(response.data.message || 'Reset OTP sent successfully to your email inbox.');
            setStep('reset_step');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit recovery request. Make sure email is valid.');
        } finally {
            setLoading(false);
        }
    };

    // Phase 2: Validate OTP & Save New Password configuration parameters
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/accounts/reset-password/', {
                email: email,
                otp: otp,
                new_password: newPassword
            });

            setMessage(response.data.message || 'Password reset successful! Redirecting to login page...');
            
            // Safe transition timeout back into your core login route
            setTimeout(() => {
                navigate('/login');
            }, 2500);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid OTP token value. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 px-4 relative">
            {/* Top Right Theme Toggle Button */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shadow-sm"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md transition-colors duration-200">
                <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-2">LearnMate</h2>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                    {step === 'email_step' ? 'Recover Account Access' : 'Set New Account Password'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 text-center font-medium">{error}</div>}
                {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm mb-4 text-center font-medium">{message}</div>}

                {step === 'email_step' ? (
                    /* STEP 1: COLLECT EMAIL */
                    <form onSubmit={handleRequestOTP} className="space-y-5">
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            Provide your account verification email. We will send you a One-Time Password sequence to authenticate ownership.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="name@example.com" required
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3 rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Sending OTP...' : 'Send Recovery OTP'}
                        </button>

                        <div className="text-center">
                            <span onClick={() => navigate('/login')} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">
                                Back to Sign In
                            </span>
                        </div>
                    </form>
                ) : (
                    /* STEP 2: VERIFY OTP AND SAVE NEW PASSWORD */
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Enter OTP Code</label>
                            <input
                                type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 text-center tracking-widest text-xl font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Secure Password</label>
                            <input
                                type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3 rounded-xl transition disabled:opacity-50 shadow-lg cursor-pointer"
                        >
                            {loading ? 'Updating Password...' : 'Reset Password'}
                        </button>

                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => setStep('email_step')}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition underline focus:outline-none cursor-pointer"
                            >
                                Re-enter email address
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}