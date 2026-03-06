import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Mic, FileText, Bot, Loader2, Clock, Volume2, VolumeX, Video, VideoOff } from 'lucide-react';

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
    const [feedback, setFeedback] = useState(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [recognition, setRecognition] = useState(null);

    // WebCam state
    const videoRef = useRef(null);
    const [cameraEnabled, setCameraEnabled] = useState(false);

    // Initialize WebCam
    useEffect(() => {
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraEnabled(true);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setCameraEnabled(false);
            }
        };
        startVideo();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

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
    }, [timeLeft, interview, submitting]);

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

                const firstUnanswered = res.data.questions.findIndex(q => !q.userAnswer);
                if (firstUnanswered !== -1) {
                    setCurrentQuestionIndex(firstUnanswered);
                } else {
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
                `${import.meta.env.VITE_API_URL}/api/interview/answer/${currentQ.id}`,
                { userAnswer: answer },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (recording && recognition) {
                recognition.stop();
                setRecording(false);
            }

            // Immediately show the feedback instead of moving on
            setFeedback({
                score: res.data.question.score,
                text: res.data.question.aiFeedback,
                isFinal: res.data.allAnswered
            });

        } catch (error) {
            console.error(error);
            alert("Error submitting answer.");
        } finally {
            setSubmitting(false);
        }
    };

    const proceedToNext = () => {
        if (feedback?.isFinal) {
            navigate(`/feedback/${id}`);
        } else {
            setFeedback(null);
            setAnswer('');
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-lg font-medium text-indigo-600 dark:text-indigo-400"
            >
                Loading interview room...
            </motion.p>
        </div>
    );

    const question = questions[currentQuestionIndex];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-indigo-600 pl-3">
                        {interview.jobRole} Interview
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm pl-4">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                </div>
                <div className="flex gap-1.5 overflow-x-auto max-w-xs sm:max-w-md pb-2">
                    {questions.map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-2 shrink-0 rounded-full transition-colors ${i < currentQuestionIndex ? 'bg-indigo-600' : i === currentQuestionIndex ? 'bg-indigo-400 animate-pulse shadow-sm shadow-indigo-400/50' : 'bg-gray-200 dark:bg-slate-700'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {interview?.difficulty && <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.difficulty}</span>}
                {interview?.focusArea && <span className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.focusArea}</span>}
                {interview?.interviewType && <span className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider">{interview.interviewType}</span>}
                {interview?.interviewMode?.includes('Timed Mode') && (
                    <span className="px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse border border-red-200 dark:border-red-500/20">
                        <Clock className="w-3 h-3" /> {formatTime(timeLeft)}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* Left Column: Webcam */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="bg-slate-900 rounded-[2rem] shadow-lg border border-slate-800 overflow-hidden relative aspect-video flex items-center justify-center group">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover transition-opacity duration-700 ${cameraEnabled ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transform: 'scaleX(-1)' }} // Mirror effect
                        />

                        {!cameraEnabled && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                                <VideoOff className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm font-medium">Camera access required</p>
                                <p className="text-xs opacity-70 text-center px-8">Please allow camera permissions in your browser to simulate a real interview environment.</p>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold tracking-wider flex items-center gap-2 border border-white/10">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            LIVE
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-white/10 flex items-center gap-2">
                                <Video className="w-4 h-4" /> You
                            </div>
                            <button
                                onClick={toggleRecording}
                                className={`p-3 rounded-full flex items-center gap-2 transition-all shadow-lg ${recording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20'}`}
                                title={recording ? "Stop Recording" : "Start Transcribing"}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Question & Answer */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* AI Question Section */}
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8 flex flex-col relative overflow-hidden transition-colors"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-bl-[4rem] flex items-start justify-end p-6">
                            <Target className="w-8 h-8 text-indigo-200 dark:text-indigo-400/50" />
                        </div>
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <motion.div
                                initial={{ rotate: -180, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                className="w-12 h-12 bg-indigo-100 dark:bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0"
                            >
                                <Bot className="w-6 h-6" />
                            </motion.div>
                            <div className="flex items-center gap-4 flex-1">
                                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">AI Interviewer</h2>
                                <button
                                    onClick={() => {
                                        setIsAudioEnabled(!isAudioEnabled);
                                        window.speechSynthesis.cancel();
                                        if (!isAudioEnabled) speakQuestion(question?.questionText);
                                    }}
                                    className="p-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-indigo-600 dark:text-indigo-400"
                                >
                                    {isAudioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
                                </button>
                            </div>
                        </div>
                        <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed relative z-10">
                            "{question?.questionText}"
                        </p>
                    </motion.div>

                    {/* User Answer Area */}
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col transition-colors flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Transcribed Answer
                            </h3>
                            {recording && (
                                <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Listening
                                </span>
                            )}
                        </div>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            disabled={submitting || feedback !== null}
                            placeholder={recording ? "Speak now, transcribing..." : "Type your answer or click the mic button on your video to start speaking..."}
                            className="flex-1 w-full bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-gray-200 dark:border-slate-600 focus:bg-white dark:focus:bg-slate-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-base leading-relaxed h-40 disabled:opacity-50"
                        />

                        {feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="px-3 py-1 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800 text-sm">
                                        Score: {feedback.score}/10
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">AI Real-Time Feedback</h4>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                    {feedback.text}
                                </p>
                            </motion.div>
                        )}

                        <div className="flex justify-end mt-4">
                            {!feedback ? (
                                <button
                                    onClick={handleNext}
                                    disabled={submitting || !answer.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-75 flex items-center justify-center gap-2 min-w-[160px]"
                                >
                                    {submitting ? (
                                        <motion.div
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Loader2 className="w-5 h-5 animate-spin" /> AI is evaluating...
                                        </motion.div>
                                    ) : 'Submit Answer'}
                                </button>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={proceedToNext}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98] min-w-[160px]"
                                >
                                    {feedback.isFinal ? 'See Final Interview Report' : 'Next Question'}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewRoom;
