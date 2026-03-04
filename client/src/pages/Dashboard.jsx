import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Clock, CheckCircle, ChevronRight, LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
    const { currentUser, mongoUser } = useAuth();
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterviews(res.data.interviews);
            } catch (error) {
                console.error("Error fetching interviews:", error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchInterviews();
    }, [currentUser]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="text-indigo-600" />
                        Your Dashboard
                    </h1>
                    <p className="text-gray-500 mt-2">Manage your interviews and track progress</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/setup')}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Interview
                </motion.button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 rounded-2xl w-full"></div>
                    ))}
                </div>
            ) : interviews.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No interviews yet</h3>
                    <p className="text-gray-500 mb-6">Create your first AI interview to start practicing.</p>
                    <button onClick={() => navigate('/setup')} className="text-indigo-600 font-medium hover:underline">
                        Start Now &rarr;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {interviews.map((interview, index) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            key={interview._id}
                            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${interview.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {interview.status}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(interview.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{interview.jobRole}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{interview.jobDescription}</p>

                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-900">
                                    Total Score: <span className={interview.totalScore > 0 ? "text-indigo-600" : "text-gray-400"}>{interview.totalScore || '--'}</span>
                                </div>
                                {interview.status === 'Completed' ? (
                                    <Link to={`/feedback/${interview._id}`} className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700">
                                        View Results <ChevronRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <Link to={`/interview/${interview._id}`} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
                                        Continue <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </motion.div >
                    ))}
                </div >
            )}
        </div >
    );
};

export default Dashboard;
