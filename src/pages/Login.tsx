import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALLOWED_EMAILS = [
    'adrian@adgs.se',
    'dejan@adgs.se'
];

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    // Load remembered email
    useEffect(() => {
        const savedEmail = localStorage.getItem('crm_remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const normalizedEmail = email.toLowerCase().trim();

        // Security check: Only allow hardcoded emails
        if (!ALLOWED_EMAILS.includes(normalizedEmail)) {
            setError('Denna e-postadress har inte tillgång till systemet. Vänligen kontakta administratören.');
            setLoading(false);
            return;
        }

        // Basic email validation for special characters in domain
        const emailParts = normalizedEmail.split('@');
        if (emailParts.length === 2) {
            const domain = emailParts[1];
            if (/[^\x00-\x7F]/.test(domain)) {
                setError('E-postdomäner med specialtecken stöds inte.');
                setLoading(false);
                return;
            }
        }

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password,
            });

            if (signInError) {
                throw signInError;
            }

            // If successful, handle email persistence
            if (rememberMe) {
                localStorage.setItem('crm_remembered_email', normalizedEmail);
            } else {
                localStorage.removeItem('crm_remembered_email');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            // Improve error message for invalid credentials
            const message = err.status === 400 || err.message?.includes('Invalid login credentials')
                ? 'Fel lösenord eller e-postadress. Försök igen.'
                : err.message || 'Ett fel uppstod vid inloggning.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="flex justify-center">
                        <img
                            src="/adgs-logo.png"
                            alt="ADGS Logotyp"
                            className="w-20 h-20 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 object-cover"
                        />
                    </div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Välkommen tillbaka
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Logga in för att komma åt din delade arbetsyta
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-3 rounded-xl flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                                E-post
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="namn@företag.se"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                                Lösenord
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                Kom ihåg mig
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg shadow-primary-200 dark:shadow-none disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Logga in'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
