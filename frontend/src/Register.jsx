import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    // Navigation Step state: 'form' or 'otp'
    const [step, setStep] = useState('form');

    // Input Data States
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [otpCode, setOtpCode] = useState('');

    // Status feedback states
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Submit Registration details & Auto-trigger OTP send
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        console.log('hello')
        try {
            // 1. Submit Account creation data (Role defaults to student on backend structure)
            await api.post('/api/accounts/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: 'student' // hardcoded securely to guarantee student baseline
            });

            // 2. Fire the Trigger to generate and dispatch the initial OTP email
            await api.post('/api/accounts/send-otp/', { email: formData.email });

            setMessage('Account registered! Please check your mailbox for the validation code.');
            setStep('otp'); // Switch visual layout to screen step 2
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Registration layout error.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Validate the received input string block
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await api.post('/api/accounts/verify-otp/', {
                email: formData.email,
                otp: otpCode
            });
            setMessage(response.data.message || 'Verification success! You can now log in.');
            // Optional: route shift out to your '/login' page could happen here

    setTimeout(() => {
        navigate('/login'); 
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code verification entry.');
        } finally {
            setLoading(false);
        }
    }

    // Optional Action: Dispatch a fresh token string out to user mail channel
    const handleResendOTP = async () => {
        setError('');
        setMessage('');
        try {
            const response = await api.post('/api/accounts/resend-otp/', { email: formData.email });
            setMessage(response.data.message || 'A new code has been dispatched to your mailbox!');
        } catch (err) {
            setError(err.target?.data?.message || 'Failed to dispatch token refresh check configuration.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-white mb-2">LearnMate</h2>
                <p className="text-center text-slate-400 text-sm mb-6">
                    {step === 'form' ? 'Create your Student Account' : 'Verify your Email Address'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
                {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-4 text-center">{message}</div>}

                {step === 'form' ? (
                    /* REGISTRATION INPUT CARD VIEW */
                    <form onSubmit={handleRegisterSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                            <input
                                type="text" name="username" required value={formData.username} onChange={handleFormChange}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Choose a username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email" name="email" required value={formData.email} onChange={handleFormChange}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <input
                                type="password" name="password" required value={formData.password} onChange={handleFormChange}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Minimum 8 characters"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </button>
                    </form>
                ) : (
                    /* OTP SCREEN VERIFICATION INPUT INTERFACE */
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <p className="text-xs text-slate-400 text-center">
                            We sent a verification code to <span className="text-slate-200 font-medium">{formData.email}</span>. It expires in 5 minutes.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Verification Code</label>
                            <input
                                type="text" required maxLength="6" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                                className="w-full p-3 text-center tracking-widest text-xl font-bold rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="000000"
                            />
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Validating...' : 'Verify Email'}
                        </button>
                        <div className="text-center pt-2">
                            <button
                                type="button" onClick={handleResendOTP}
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition underline focus:outline-none"
                            >
                                Didn't receive a code? Resend OTP
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}