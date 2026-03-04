import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const criteria = [
        { label: '9-16 characters', met: password.length >= 9 && password.length <= 16 },
        { label: 'Upper & Lowercase', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
        { label: 'Number', met: /\d/.test(password) },
        { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) }
    ];
    const strengthScore = criteria.filter(c => c.met).length;
    const isPasswordStrong = strengthScore === criteria.length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!isPasswordStrong) {
            setError("Please fulfill all password strength requirements.");
            return;
        }
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Create Account</h2>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {password && (
                            <div className="mt-3 space-y-2">
                                <div className="flex gap-1 h-1.5 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`h-full flex-1 transition-colors duration-300 ${i < strengthScore ? (strengthScore <= 2 ? 'bg-red-500' : strengthScore === 3 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-transparent'}`} />
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    {criteria.map((c, i) => (
                                        <div key={i} className={`flex items-center gap-1 ${c.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {c.met ? <Check size={14} /> : <X size={14} />}
                                            {c.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button type="submit" className={`w-full py-2 rounded-lg font-medium shadow-md transition-all mt-6 ${isPasswordStrong ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-400 cursor-not-allowed text-white/80'}`}>Sign Up</button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};
export default Signup;
