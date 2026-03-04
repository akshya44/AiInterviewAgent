import Interview from '../models/Interview.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { PDFParse } from 'pdf-parse';
import { generateInterviewQuestions, generateFeedback } from '../utils/gemini.js';
export const createInterview = async (req, res) => {
    try {
        const {
            jobRole, jobDescription,
            focusArea, difficulty, interviewType, questionStyle, interviewMode, companyType
        } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!req.file) return res.status(400).json({ message: 'Resume PDF is required' });

        const parser = new PDFParse({ data: req.file.buffer });
        const textResult = await parser.getText();
        const resumeText = textResult.text;

        // Generate questions
        const generatedQuestions = await generateInterviewQuestions(
            jobRole,
            jobDescription,
            resumeText,
            { focusArea, difficulty, interviewType, questionStyle, companyType }
        );

        const interview = new Interview({
            userId: user._id,
            jobRole,
            jobDescription,
            focusArea,
            difficulty,
            interviewType,
            questionStyle,
            interviewMode,
            companyType,
            resumeText,
            status: 'Pending'
        });
        await interview.save();

        const questionsInsertPayload = generatedQuestions.map(qText => ({
            interviewId: interview._id,
            questionText: qText
        }));

        await Question.insertMany(questionsInsertPayload);

        const questions = await Question.find({ interviewId: interview._id });

        res.status(201).json({
            success: true,
            interview,
            questions
        });

    } catch (error) {
        console.error("Create Interview Error:", error);
        res.status(500).json({ message: 'Server error creating interview', error: error.message, stack: error.stack });
    }
};

export const getInterviews = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const interviews = await Interview.find({ userId: user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching interviews' });
    }
};

export const getInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        const questions = await Question.find({ interviewId: id });
        res.status(200).json({ success: true, interview, questions });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching interview details' });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { userAnswer } = req.body;

        const question = await Question.findById(questionId);
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const { feedback, score } = await generateFeedback(question.questionText, userAnswer);

        question.userAnswer = userAnswer;
        question.aiFeedback = feedback;
        question.score = score;
        await question.save();

        // Calculate total score if all answers are provided
        const allQuestions = await Question.find({ interviewId: question.interviewId });
        const allAnswered = allQuestions.every(q => q.userAnswer !== '');

        if (allAnswered) {
            const totalScore = allQuestions.reduce((acc, curr) => acc + curr.score, 0);
            await Interview.findByIdAndUpdate(question.interviewId, {
                status: 'Completed',
                totalScore,
            });
        }

        res.status(200).json({ success: true, question, allAnswered });
    } catch (error) {
        console.error("Submit Answer Error:", error);
        res.status(500).json({ message: 'Server error submitting answer' });
    }
};
