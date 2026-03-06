import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Star, CheckCircle, ChevronLeft, Bot, User } from 'lucide-react';

const Feedback = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.MODE === 'development' ? 'http://localhost:5000' : ''}/api/interview/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterview(res.data.interview);
                setQuestions(res.data.questions);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchInterview();
    }, [id, currentUser]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading feedback...</div>;

    const maxScore = questions.length * 10;
    const percentage = Math.round((interview.totalScore / maxScore) * 100);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-medium transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-sm border border-gray-100 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[10rem] opacity-50 pointer-events-none"></div>

                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl mx-auto flex items-center justify-center mb-6 relative z-10 shadow-inner">
                    <Star className={`w-12 h-12 ${percentage >= 70 ? 'text-amber-400' : 'text-indigo-400'}`} fill="currentColor" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 relative z-10">Interview Completed!</h1>
                <p className="text-gray-500 text-lg mb-8 relative z-10 font-medium">Role: <span className="text-indigo-600">{interview.jobRole}</span></p>

                <div className="inline-flex flex-col mb-4 relative z-10 bg-indigo-50/50 px-10 py-6 rounded-3xl border border-indigo-100/50">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm">
                        {interview.totalScore} <span className="text-3xl text-gray-400">/ {maxScore}</span>
                    </span>
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-3">Overall Score</span>
                </div>
            </motion.div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 ml-2">Detailed Feedback</h2>
                {questions.map((q, index) => (
                    <motion.div
                        key={q._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-600 font-bold">
                                    Q{index + 1}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mt-1">{q.questionText}</h3>
                                </div>
                            </div>
                            <div className="text-indigo-600 bg-indigo-50 px-4 py-2 flex items-center rounded-xl font-bold text-lg whitespace-nowrap ml-4">
                                {q.score} / 10
                            </div>
                        </div>

                        <div className="pl-14 space-y-6 flex-1">
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative">
                                <div className="absolute -left-3 top-5 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-gray-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Your Answer</span>
                                <p className="text-gray-700 leading-relaxed text-[15px]">{q.userAnswer}</p>
                            </div>

                            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 relative">
                                <div className="absolute -left-3 top-5 w-6 h-6 bg-white border border-emerald-200 rounded-full flex items-center justify-center">
                                    <Bot className="w-3 h-3 text-emerald-500" />
                                </div>
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> AI Feedback
                                </span>
                                <p className="text-gray-800 leading-relaxed text-[15px] font-medium">{q.aiFeedback}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Feedback;
