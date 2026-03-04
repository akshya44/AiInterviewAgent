import prisma from '../prisma/client.js';
import { PDFParse } from 'pdf-parse';
import { generateInterviewQuestions, generateFeedback } from '../utils/gemini.js';

export const createInterview = async (req, res) => {
    try {
        const {
            jobRole, jobDescription,
            focusArea, difficulty, interviewType, questionStyle, interviewMode, companyType
        } = req.body;

        const userId = req.user.id; // integer from JWT now

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!req.file) return res.status(400).json({ message: 'Resume PDF is required' });

        const parser = new PDFParse({ data: req.file.buffer });
        const textResult = await parser.getText();
        const resumeText = textResult.text;

        const generatedQuestions = await generateInterviewQuestions(
            jobRole, jobDescription, resumeText,
            { focusArea, difficulty, interviewType, questionStyle, companyType }
        );

        const interview = await prisma.interview.create({
            data: {
                userId,
                jobRole,
                jobDescription,
                resumeText,
                focusArea: focusArea || 'Core Concepts',
                difficulty: difficulty || 'Intermediate',
                interviewType: interviewType || 'Technical Only',
                questionStyle: questionStyle || 'Conceptual',
                interviewMode: interviewMode || 'Practice Mode',
                companyType: companyType || 'Product-Based',
                status: 'Pending',
            }
        });

        await prisma.question.createMany({
            data: generatedQuestions.map(qText => ({
                interviewId: interview.id,
                questionText: qText,
            }))
        });

        const questions = await prisma.question.findMany({
            where: { interviewId: interview.id },
            orderBy: { id: 'asc' }
        });

        res.status(201).json({ success: true, interview, questions });

    } catch (error) {
        console.error("Create Interview Error:", error);
        res.status(500).json({ message: 'Server error creating interview', error: error.message });
    }
};

export const getInterviews = async (req, res) => {
    try {
        const interviews = await prisma.interview.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching interviews' });
    }
};

export const getInterview = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const interview = await prisma.interview.findUnique({ where: { id } });
        if (!interview) return res.status(404).json({ message: 'Interview not found' });

        const questions = await prisma.question.findMany({
            where: { interviewId: id },
            orderBy: { id: 'asc' }
        });
        res.status(200).json({ success: true, interview, questions });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching interview details' });
    }
};

export const submitAnswer = async (req, res) => {
    try {
        const questionId = parseInt(req.params.questionId);
        const { userAnswer } = req.body;

        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const { feedback, score } = await generateFeedback(question.questionText, userAnswer);

        const updatedQuestion = await prisma.question.update({
            where: { id: questionId },
            data: { userAnswer, aiFeedback: feedback, score }
        });

        // Check if all questions answered
        const allQuestions = await prisma.question.findMany({
            where: { interviewId: question.interviewId }
        });
        const allAnswered = allQuestions.every(q => q.userAnswer !== '');

        if (allAnswered) {
            const totalScore = allQuestions.reduce((acc, curr) => acc + curr.score, 0);
            await prisma.interview.update({
                where: { id: question.interviewId },
                data: { status: 'Completed', totalScore }
            });
        }

        res.status(200).json({ success: true, question: updatedQuestion, allAnswered });
    } catch (error) {
        console.error("Submit Answer Error:", error);
        res.status(500).json({ message: 'Server error submitting answer' });
    }
};
