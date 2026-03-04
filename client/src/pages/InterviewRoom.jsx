import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Mic, FileText, Bot, Loader2, Clock, Volume2, VolumeX } from 'lucide-react';

const InterviewRoom = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [interview, setInterview] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [recording, setRecording] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [recognition, setRecognition] = useState(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = false;
            rec.onresult = (event) => {
                const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ');
                setAnswer(transcript);
            };
            setRecognition(rec);
        }
    }, []);

    const toggleRecording = () => {
        if (!recognition) return alert('Speech recognition is not supported in this browser. Please use Chrome.');
        if (recording) {
            recognition.stop();
            setRecording(false);
        } else {
            recognition.start();
            setRecording(true);
        }
    };

    const speakQuestion = (text) => {
        if ('speechSynthesis' in window && isAudioEnabled) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Auto-read question when it changes
    useEffect(() => {
        if (questions.length > 0 && questions[currentQuestionIndex]) {
            speakQuestion(questions[currentQuestionIndex].questionText);
        }
        return () => window.speechSynthesis && window.speechSynthesis.cancel();
    }, [currentQuestionIndex, questions, isAudioEnabled]);

    // Reset timer when a new question loads
    useEffect(() => {
        if (interview?.interviewMode?.includes('Timed Mode')) {
            setTimeLeft(120);
        }
    }, [currentQuestionIndex, interview]);

    // Timer countdown logic
    useEffect(() => {
        if (!interview?.interviewMode?.includes('Timed Mode')) return;
        if (timeLeft <= 0) {
            handleNext(); // Auto-submit when time is up
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, interview, submitting]); // include submitting to not auto submit twice

    const formatTime = (secs) => `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/interview/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterview(res.data.interview);
                setQuestions(res.data.questions);

                // Find first unanswered question
                const firstUnanswered = res.data.questions.findIndex(q => !q.userAnswer);
                if (firstUnanswered !== -1) {
                    setCurrentQuestionIndex(firstUnanswered);
                } else {
                    // All answered, redirect to feedback
                    navigate(`/feedback/${id}`);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchInterview();
    }, [id, currentUser, navigate]);

    const handleNext = async () => {
        if (!answer.trim()) return alert("Please provide an answer.");
        setSubmitting(true);
        const token = localStorage.getItem('token');
        const currentQ = questions[currentQuestionIndex];

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/interview/answer/${currentQ._id}`,
                { userAnswer: answer },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setAnswer('');

            if (res.data.allAnswered) {
                navigate(`/feedback/${id}`);
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting answer.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );

    const question = questions[currentQuestionIndex];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-indigo-600 pl-3">
                    {interview.jobRole} Interview
                </h1>
                <div className="flex gap-2">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`w-10 h-2 rounded-full transition-colors ${i < currentQuestionIndex ? 'bg-indigo-600' : i === currentQuestionIndex ? 'bg-indigo-400 animate-pulse' : 'bg-gray-200 dark:bg-slate-700'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Premium Settings Display Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
                {interview?.difficulty && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.difficulty}</span>}
                {interview?.focusArea && <span className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.focusArea}</span>}
                {interview?.interviewType && <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.interviewType}</span>}
                {interview?.companyType && <span className="px-3 py-1 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.companyType}</span>}
                {interview?.interviewMode?.includes('Timed Mode') && (
                    <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse border border-red-200 dark:border-red-500/20">
                        <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
                    </span>
                )}
            </div>

            {/* AI Question Section */}
            <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8 flex flex-col justify-center relative overflow-hidden transition-colors"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-bl-[4rem] flex items-start justify-end p-6">
                    <Target className="w-8 h-8 text-indigo-200 dark:text-indigo-400/50" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                    <motion.div
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-12 h-12 bg-indigo-100 dark:bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400"
                    >
                        <Bot className="w-6 h-6" />
                    </motion.div>
                    <div className="flex items-center gap-4 flex-1">
                        <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Question {currentQuestionIndex + 1}</h2>
                        <button
                            onClick={() => {
                                setIsAudioEnabled(!isAudioEnabled);
                                window.speechSynthesis.cancel();
                                if (!isAudioEnabled) speakQuestion(question?.questionText);
                            }}
                            className="p-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-indigo-600 dark:text-indigo-400"
                            title={isAudioEnabled ? "Mute AI Voice" : "Enable AI Voice"}
                        >
                            {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
                        </button>
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-snug"
                >
                    "{question?.questionText}"
                </motion.p>
            </motion.div>

            {/* User Answer Section */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-8 flex flex-col transition-colors mt-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="text-indigo-600 dark:text-indigo-400" /> Your Answer
                    </h3>
                    <button
                        onClick={toggleRecording}
                        className={`p-3 rounded-full flex items-center gap-2 transition-colors ${recording ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600'}`}
                        title={recording ? "Stop Recording" : "Start Speech-to-Text"}
                    >
                        <Mic className="w-5 h-5" />
                        {recording && <span className="text-sm font-bold">Listening...</span>}
                    </button>
                </div>
                <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 w-full bg-gray-50/50 dark:bg-slate-700 rounded-2xl p-6 border border-gray-100 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-lg leading-relaxed"
                />

                <button
                    onClick={handleNext}
                    disabled={submitting || !answer.trim()}
                    className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2"
                >
                    {submitting ? <><Loader2 className="w-6 h-6 animate-spin" /> Evaluating...</> : 'Submit Answer'}
                </button>
            </motion.div>
        </div>
    );
};

export default InterviewRoom;
