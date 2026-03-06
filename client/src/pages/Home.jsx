import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, FileText, Target, Play } from 'lucide-react';

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleStart = () => {
        if (currentUser) {
            navigate('/dashboard');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl text-center space-y-8"
            >
                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight transition-colors">
                    Master Your Next <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                        Interview with AI
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
                    Upload your resume, get tailored technical and HR questions, practice in a simulated environment, and receive intelligent feedback to land your dream job.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
                    >
                        {currentUser ? 'Go to Dashboard' : 'Get Started for Free'}
                        <Play className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/demo-interview')}
                        className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-slate-700 px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:border-indigo-200 dark:hover:border-slate-600 transition-colors"
                    >
                        Try Demo Interview
                    </motion.button>
                </div>
            </motion.div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
                {[
                    { icon: FileText, title: 'Upload Resume', desc: 'Our AI analyzes your PDF resume to understand your background and skills.' },
                    { icon: Bot, title: 'Tailored Questions', desc: 'Get highly relevant Technical & HR questions based on the exact job role you want.' },
                    { icon: Target, title: 'Actionable Feedback', desc: 'Practice your answers and receive score-based feedback on how to improve.' },
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-6 rounded-[2rem] shadow-sm dark:shadow-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all"
                    >
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 transition-colors">
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 transition-colors">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
            <div className="mt-16 text-center max-w-4xl mx-auto w-full px-4 border-t border-gray-200 dark:border-slate-800 pt-16">
                <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                    {['⚡ AI Interview Questions', '🎤 Voice Answer Support', '📄 Resume Parsing', '📊 Performance Feedback'].map((metric, i) => (
                        <span key={i} className="px-5 py-3 bg-indigo-50 dark:bg-slate-800/80 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm md:text-base font-semibold border border-indigo-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                            {metric}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
