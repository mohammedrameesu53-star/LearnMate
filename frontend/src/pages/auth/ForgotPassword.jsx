import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();

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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-white mb-2">LearnMate</h2>
                <p className="text-center text-slate-400 text-sm mb-6">
                    {step === 'email_step' ? 'Recover Account Access' : 'Set New Account Password'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
                {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-4 text-center">{message}</div>}

                {step === 'email_step' ? (
                    /* STEP 1: COLLECT EMAIL */
                    <form onSubmit={handleRequestOTP} className="space-y-5">
                        <p className="text-xs text-slate-400 text-center">
                            Provide your account verification email. We will send you a One-Time Password sequence to authenticate ownership.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="name@example.com" required
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3 rounded-xl transition shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Sending OTP...' : 'Send Recovery OTP'}
                        </button>

                        <div className="text-center">
                            <span onClick={() => navigate('/login')} className="text-xs text-indigo-400 hover:underline cursor-pointer">
                                Back to Sign In
                            </span>
                        </div>
                    </form>
                ) : (
                    /* STEP 2: VERIFY OTP AND SAVE NEW PASSWORD */
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Enter OTP Code</label>
                            <input
                                type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 text-center tracking-widest text-xl font-bold rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="000000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">New Secure Password</label>
                            <input
                                type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3 rounded-xl transition disabled:opacity-50 shadow-lg"
                        >
                            {loading ? 'Updating Password...' : 'Reset Password'}
                        </button>

                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => setStep('email_step')}
                                className="text-xs text-slate-400 hover:text-white transition underline focus:outline-none"
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