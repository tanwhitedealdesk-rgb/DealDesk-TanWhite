
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, User, X, Info } from 'lucide-react';
import { api, supabase } from '../../services/api';
import { User as UserType } from '../../types';
import { generateId } from '../../services/utils';

interface LoginFormProps {
    onLogin: (user: UserType) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', inviteCode: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Cache state
    const [cachedUser, setCachedUser] = useState<{name: string, email: string} | null>(null);
    const [useCachedUser, setUseCachedUser] = useState(false);

    useEffect(() => {
        const savedLastUser = localStorage.getItem('azre-last-user');
        if (savedLastUser) {
            try {
                const parsed = JSON.parse(savedLastUser);
                if (parsed.email && parsed.name) {
                    setCachedUser(parsed);
                    setFormData(prev => ({ ...prev, email: parsed.email }));
                    setUseCachedUser(true);
                }
            } catch (e) {
                localStorage.removeItem('azre-last-user');
            }
        }
    }, []);

    // Handle Google OAuth Redirect / Session Check
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Check for active session from OAuth redirect
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                
                if (session?.user) {
                    setLoading(true);
                    const email = session.user.email;
                    
                    // Robust user loading with retries handled in api.load now
                    const users = await api.load('Users') as UserType[];
                    let user = users.find(u => u.email === email);

                    if (!user) {
                        // Create new user if not exists based on Google info
                        const newUserPartial = {
                            name: session.user.user_metadata.full_name || email?.split('@')[0] || 'Google User',
                            email: email || '',
                            photo: session.user.user_metadata.avatar_url,
                            position: 'Acquisitions',
                            createdAt: new Date().toISOString(),
                            loginStatus: 'Logged In' 
                        };
                        user = await api.save(newUserPartial, 'Users');
                    } else {
                        // Update existing user login status
                        const updatedUser = { 
                            ...user, 
                            loginStatus: 'Logged In',
                            photo: user.photo || session.user.user_metadata.avatar_url 
                        } as UserType;
                        user = await api.save(updatedUser, 'Users');
                    }
                    
                    if (user) {
                        localStorage.setItem('azre-last-user', JSON.stringify({ name: user.name, email: user.email }));
                        onLogin(user);
                    }
                }
            } catch (err: any) {
                console.error("Google Auth Sync Error:", err);
            } finally {
                setLoading(false);
            }
        };
        
        // Only run check if we aren't already manually loading
        if (!loading) checkSession();
    }, []);

    const handleSwitchAccount = () => {
        setUseCachedUser(false);
        setFormData(prev => ({ ...prev, email: '', password: '' }));
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Using standard redirect flow
            // CRITICAL FIX: We strip the query parameters (window.location.search) from the redirect URL.
            // In AI Studio/Preview environments, the URL often contains params like "?showAssistant=true".
            // When Supabase redirects back with its own params (#access_token=...), the combination causes a 
            // 403 Forbidden error on the Google host. Using origin + pathname ensures a clean callback URL.
            const redirectUrl = window.location.origin + window.location.pathname;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
            // Browser will redirect automatically
        } catch (err: any) {
            console.error("Google Login Error:", err);
            setError(err.message || "Failed to initiate Google Login.");
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const users = await api.load('Users') as UserType[];
            
            if (isSignup) {
                if (formData.inviteCode.toLowerCase() !== 'zakar') {
                    throw new Error("Invalid Invite Code");
                }
                
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                
                if (users.find(u => u.email === formData.email)) {
                    throw new Error("User already exists");
                }

                const newUserPartial = {
                    id: generateId(),
                    name: formData.name,
                    email: formData.email,
                    password: formData.password, 
                    position: 'Acquisitions',
                    createdAt: new Date().toISOString(),
                    loginStatus: 'Logged In' 
                };

                let savedUser = await api.save(newUserPartial, 'Users');
                
                if (!savedUser) {
                    // Supabase not configured yet. Store pending user.
                    savedUser = { ...newUserPartial } as UserType;
                    localStorage.setItem('azre-pending-user', JSON.stringify(savedUser));
                }

                localStorage.setItem('azre-last-user', JSON.stringify({ name: savedUser.name, email: savedUser.email }));
                onLogin(savedUser as UserType);
                
            } else {
                let user = users.find(u => u.email === formData.email && u.password === formData.password);
                
                if (!user) {
                     // Check local pending user
                     const pendingUserStr = localStorage.getItem('azre-pending-user');
                     if (pendingUserStr) {
                         const pendingUser = JSON.parse(pendingUserStr);
                         if (pendingUser.email === formData.email && pendingUser.password === formData.password) {
                             user = pendingUser;
                         }
                     }
                }

                if (user) {
                    const updatedUser = { ...user, loginStatus: 'Logged In' } as UserType;
                    await api.save(updatedUser, 'Users');
                    localStorage.setItem('azre-last-user', JSON.stringify({ name: user.name, email: user.email }));
                    onLogin(updatedUser);
                } else {
                    throw new Error("Invalid credentials");
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-4">
                        <h1 className="text-5xl font-light tracking-tight text-gray-900 dark:text-white mb-0">ASHARI</h1>
                        <h1 className="text-5xl font-light tracking-tight text-blue-600 dark:text-[#4ADE80] mb-1">ZAKAR</h1>
                        <div className="text-justify flex justify-between w-full text-gray-600 dark:text-white tracking-[0.35em] text-sm mt-2">
                            <span>R</span><span>E</span><span>A</span><span>L</span>
                            <span className="w-4"></span>
                            <span>E</span><span>S</span><span>T</span><span>A</span><span>T</span><span>E</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-2xl transition-all duration-300">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                        {isSignup ? 'Create Account' : (useCachedUser && cachedUser && !isSignup ? `Welcome Back, ${cachedUser.name.split(' ')[0]}` : 'Welcome Back')}
                    </h2>
                    
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded mb-4 text-sm flex items-center gap-2">
                            <AlertTriangle size={16}/> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignup && (
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Full Name</label>
                                <input required autoComplete="name" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded p-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-[#4ADE80] outline-none transition-colors" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                        )}
                        
                        {!isSignup && useCachedUser && cachedUser ? (
                            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-3 flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-200 dark:bg-gray-700 p-1.5 rounded-full"><User size={16} className="text-gray-500 dark:text-gray-400"/></div>
                                    <div>
                                        <div className="text-gray-900 dark:text-white text-sm font-medium">{cachedUser.name}</div>
                                        <div className="text-xs text-gray-500">{cachedUser.email}</div>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleSwitchAccount}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
                                >
                                    Change?
                                </button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Email Address</label>
                                <input required type="email" autoComplete="email" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded p-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-[#4ADE80] outline-none transition-colors" placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Password</label>
                            <input required type="password" autoComplete={isSignup ? "new-password" : "current-password"} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded p-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-[#4ADE80] outline-none transition-colors" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>

                        {isSignup && (
                             <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Confirm Password</label>
                                <input required type="password" autoComplete="new-password" className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded p-3 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-[#4ADE80] outline-none transition-colors" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
                            </div>
                        )}

                        {isSignup && (
                            <div>
                                <label className="block text-xs text-blue-600 dark:text-[#4ADE80] uppercase font-bold mb-1">Invite Code</label>
                                <input required className="w-full bg-gray-50 dark:bg-gray-900 border border-blue-500 dark:border-[#4ADE80] rounded p-3 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#4ADE80] outline-none transition-colors" placeholder="Enter code..." value={formData.inviteCode} onChange={e => setFormData({...formData, inviteCode: e.target.value})} />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 dark:bg-[#4ADE80] dark:hover:bg-[#3bc970] text-white dark:text-gray-900 font-bold py-3 rounded mt-4 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading && <Loader2 size={18} className="animate-spin"/>}
                            {isSignup ? 'Sign Up' : 'Log In'}
                        </button>
                    </form>

                    {!isSignup && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 font-bold py-3 rounded transition-all transform hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-600 flex justify-center items-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Google
                            </button>
                        </>
                    )}

                    <div className="mt-6 text-center space-y-2">
                        {!isSignup && useCachedUser && (
                             <div className="text-xs text-gray-500">
                                Not {cachedUser?.name}? <button onClick={handleSwitchAccount} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">Switch account</button>
                             </div>
                        )}
                        <button 
                            onClick={() => { setIsSignup(!isSignup); setError(''); setFormData({ name: '', email: '', password: '', confirmPassword: '', inviteCode: '' }); setUseCachedUser(false); }}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {isSignup ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
