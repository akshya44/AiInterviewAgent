import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, Loader2, Info } from 'lucide-react';

const SetupInterview = () => {
    const { currentUser, mongoUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        jobRole: '',
        jobDescription: '',
        focusArea: 'Core Concepts',
        difficulty: 'Intermediate',
        interviewType: 'Mixed (Technical + HR)',
        questionStyle: 'Conceptual',
        interviewMode: 'Practice Mode (No time limit)',
        companyType: 'Product-Based',
        resume: null
    });

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resume: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.resume) return alert('Please upload your resume PDF');
        setLoading(true);
        const data = new FormData();
        data.append('jobRole', formData.jobRole);
        data.append('jobDescription', formData.jobDescription);
        data.append('focusArea', formData.focusArea);
        data.append('difficulty', formData.difficulty);
        data.append('interviewType', formData.interviewType);
        data.append('questionStyle', formData.questionStyle);
        data.append('interviewMode', formData.interviewMode);
        data.append('companyType', formData.companyType);
        data.append('resume', formData.resume);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/interview/create`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            navigate(`/interview/${res.data.interview.id}`);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Error occurred';
            alert('Failed: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-700 p-8 md:p-12 transition-colors"
            >
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Create New Interview</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Job Role / Job Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Full Stack Developer"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                            onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Job Description (Tech Stack, Requirements)</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Paste the job description or enter key requirements..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow resize-none"
                            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                        />
                    </div>

                    {/* Premium Settings Border Section */}
                    <div className="pt-6 pb-2 border-t border-gray-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Choose Interview Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Difficulty Level</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none font-medium"
                                    value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                >
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                    <option>Company-Level (FAANG Style)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Focus Area</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none font-medium"
                                    value={formData.focusArea} onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                                >
                                    <option>Core Concepts</option>
                                    <option>Real-World Scenarios</option>
                                    <option>Debugging & Problem Solving</option>
                                    <option>Performance Optimization</option>
                                    <option>System Design Basics</option>
                                    <option>Project-Based Questions</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Interview Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none font-medium"
                                    value={formData.interviewType} onChange={(e) => setFormData({ ...formData, interviewType: e.target.value })}
                                >
                                    <option>Technical Only</option>
                                    <option>HR Only</option>
                                    <option>Mixed (Technical + HR)</option>
                                    <option>Rapid Fire Round</option>
                                    <option>Case Study Round</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Question Style</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none font-medium"
                                    value={formData.questionStyle} onChange={(e) => setFormData({ ...formData, questionStyle: e.target.value })}
                                >
                                    <option>Conceptual</option>
                                    <option>Practical Implementation</option>
                                    <option>Code Explanation</option>
                                    <option>Debug This Code</option>
                                    <option>Architecture Design</option>
                                    <option>Behavioral Scenario</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Interview Mode</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none font-medium"
                                    value={formData.interviewMode} onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                                >
                                    <option>Practice Mode (No time limit)</option>
                                    <option>Timed Mode (2 min per question)</option>
                                    <option>Strict Mode (No skipping)</option>
                                    <option>Adaptive Mode (Difficulty increases)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Target Company Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 hover:bg-white dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors cursor-pointer appearance-none font-medium"
                                    value={formData.companyType} onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                                >
                                    <option>Product-Based</option>
                                    <option>Startup</option>
                                    <option>MNC</option>
                                    <option>Service-Based</option>
                                    <option>FAANG-Level</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Upload Resume (PDF only)</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-center cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                {formData.resume ? (
                                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{formData.resume.name}</p>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400">Click or drag and drop your PDF here</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-3 disabled:opacity-70 mt-8 transition-colors"
                    >
                        {loading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> Generating Questions...</>
                        ) : (
                            'Generate Interview'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default SetupInterview;
