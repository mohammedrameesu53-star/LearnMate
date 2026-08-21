import React, { useState, useEffect } from 'react';
import api from '../../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

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
                    {loginStep === 'credentials' ? 'Welcome back! Sign in to continue.' : 'Two-Factor Authentication Check'}
                </p>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 text-center font-medium">{error}</div>}
                {message && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm mb-4 text-center font-medium">{message}</div>}

                {loginStep === 'credentials' ? (
                    /* VIEW A: EMAIL & PASSWORD INPUTS */
                    <form onSubmit={handleLoginCredentials} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="Enter your email" required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                <span
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer focus:outline-none font-semibold"
                                >
                                    Forgot Password?
                                </span>
                            </div>
                            <input
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                placeholder="••••••••" required
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold p-3 rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Connecting...' : 'Sign In'}
                        </button>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
                            New user? <span onClick={() => navigate('/register')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Create an Account</span>
                        </p>
                    </form>
                ) : (
                    /* VIEW B: ACTIVE MFA SECURITY TOKEN INJECTION */
                    <form onSubmit={handleVerifyMFAChallenge} className="space-y-5">
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            Open your smartphone's Authenticator application and capture the active 6-digit rolling code generated for your account.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">MFA Verification Code</label>
                            <input
                                type="text" required maxLength="6" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)}
                                className="w-full p-3 text-center tracking-widest text-xl font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold p-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Validating Token...' : 'Verify & Log In'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setLoginStep('credentials')}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition underline focus:outline-none cursor-pointer"
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