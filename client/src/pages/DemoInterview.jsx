import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { HelpCircle, Sparkles, LogIn, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DemoInterview() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDemo = async () => {
            try {
                // Ensure correct API URL fallback if proxy routing differs
                const apiUrl = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api' : '/api';
                const { data } = await axios.get(`${apiUrl}/interview/demo`);
                setQuestions(data.questions);
            } catch (error) {
                console.error("Failed to load demo questions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDemo();
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                        AI Interview Demo
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        This is a quick preview of the types of tailored questions our AI generates based on candidate resumes and job roles.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-indigo-500" />
                        Sample Interview Packet
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-gray-100 border-l-4 border-l-indigo-500 dark:border-slate-600 dark:border-l-indigo-500 hover:shadow-md transition-all"
                                >
                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                                        {q.question}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 bg-indigo-600 dark:bg-indigo-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready for the real thing?</h3>
                    <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                        Sign up to upload your own resume, activate the live webcam room, use voice-to-text to answer questions, and get detailed AI feedback scorecards.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/signup')}
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-50 transition-colors"
                    >
                        Create Free Account
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
