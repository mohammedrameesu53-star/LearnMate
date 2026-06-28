import React, { useState } from 'react';
import api from '../../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('user_role');
        if (token && role) {
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'mentor') {
                navigate('/mentor/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        }
    }, [navigate]);

    // Step views tracker: 'credentials' or 'mfa_challenge'
    const [loginStep, setLoginStep] = useState('credentials');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Submit email & password parameters
    const handleLoginCredentials = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/accounts/login/', { email, password });

            // If the backend states that MFA is mandatory, push to stage 2
            if (response.data.mfa_required) {
                setMessage('Credentials verified! Please provide your MFA device code.');
                setLoginStep('mfa_challenge');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid login email or password configuration.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Challenge validation of dynamic time-based token value
    const handleVerifyMFAChallenge = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);


        try {
            const response = await axios.post('http://127.0.0.1:8000/api/accounts/verify-mfa/', {
                email: email,
                code: mfaCode
            });

            // Save details and initialize profile load
            await login(response.data.access, response.data.refresh, response.data.role, email);

            setMessage('Authentication cleared! Welcome to LearnMate.');

            const userRole = response.data.role;

            setTimeout(() => {
                // Dynamic redirection based on role
                if (userRole === 'admin') {
                    navigate('/admin/dashboard');
                } else if (userRole === 'mentor') {
                    navigate('/mentor/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            }, 1500);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid authentication code sequence.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-extrabold text-center text-white mb-2">LearnMate</h2>
                <p className="text-center text-slate-400 text-sm mb-6">
                    {loginStep === 'credentials' ? 'Welcome back! Sign in to continue.' : 'Two-Factor Authentication Check'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}
                {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm mb-4 text-center">{message}</div>}

                {loginStep === 'credentials' ? (
                    /* VIEW A: EMAIL & PASSWORD INPUTS */
                    <form onSubmit={handleLoginCredentials} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="Enter your email" required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-300">Password</label>
                                {/* Added Forgot Password Link right here */}
                                <span
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-xs text-indigo-400 hover:underline cursor-pointer focus:outline-none"
                                >
                                    Forgot Password?
                                </span>
                            </div>
                            <input
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="••••••••" required
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3 rounded-xl transition shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Connecting...' : 'Sign In'}
                        </button>

                        <p className="text-center text-sm text-slate-400 mt-4">
                            New user? <span onClick={() => navigate('/register')} className="text-indigo-400 hover:underline cursor-pointer">Create an Account</span>
                        </p>
                    </form>
                ) : (
                    /* VIEW B: ACTIVE MFA SECURITY TOKEN INJECTION */
                    <form onSubmit={handleVerifyMFAChallenge} className="space-y-5">
                        <p className="text-xs text-slate-400 text-center">
                            Open your smartphone's Authenticator application and capture the active 6-digit rolling code generated for your account.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">MFA Verification Code</label>
                            <input
                                type="text" required maxLength="6" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                                className="w-full p-3 text-center tracking-widest text-xl font-bold rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Validating Token...' : 'Verify & Log In'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setLoginStep('credentials')}
                                className="text-xs text-slate-400 hover:text-white transition underline focus:outline-none"
                            >
                                Back to Log In details
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}