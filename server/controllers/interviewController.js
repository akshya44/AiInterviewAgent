import prisma from '../prisma/client.js';
import { generateInterviewQuestions, generateFeedback } from '../utils/gemini.js';

// Simple, reliable synchronous PDF text extraction — no external library needed
const extractPdfText = (buffer) => {
    try {
        const str = buffer.toString('latin1');
        // Extract text in PDF parentheses format e.g. (Hello World)
        const matches = str.match(/\(([^\)\\]{2,})\)/g) || [];
        const extracted = matches
            .map(m => m.slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, ''))
            .join(' ')
            .trim();
        if (extracted.length > 100) return extracted.substring(0, 8000);
        // Fallback: extract readable ASCII characters
        return str.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').substring(0, 8000);
    } catch {
        return 'Resume content could not be extracted. Please evaluate based on job role and description.';
    }
};

export const createInterview = async (req, res) => {
    try {
        const {
            jobRole, jobDescription,
            focusArea, difficulty, interviewType, questionStyle, interviewMode, companyType
        } = req.body;

        const userId = req.user.id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!req.file) return res.status(400).json({ message: 'Resume PDF is required' });

        // STEP 1: Parse PDF
        console.log('[1] Parsing PDF...');
        const resumeText = extractPdfText(req.file.buffer);
        console.log('[1] PDF parsed, chars:', resumeText.length);

        // STEP 2: Call Gemini
        console.log('[2] Calling Gemini API...');
        const generatedQuestions = await generateInterviewQuestions(
            jobRole, jobDescription, resumeText,
            { focusArea, difficulty, interviewType, questionStyle, companyType }
        );
        console.log('[2] Gemini returned', generatedQuestions?.length, 'questions');

        // STEP 3: Save Interview
        console.log('[3] Creating interview in DB...');
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
        console.log('[3] Interview saved, id:', interview.id);

        // STEP 4: Save questions individually (SQLite safe)
        console.log('[4] Saving questions...');
        for (const qText of generatedQuestions) {
            await prisma.question.create({
                data: {
                    interviewId: interview.id,
                    questionText: typeof qText === 'string' ? qText : JSON.stringify(qText)
                }
            });
        }
        console.log('[4] All questions saved');

        const questions = await prisma.question.findMany({
            where: { interviewId: interview.id },
            orderBy: { id: 'asc' }
        });

        res.status(201).json({ success: true, interview, questions });

    } catch (error) {
        console.error('❌ Create Interview Error:', error);
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
        console.error('Submit Answer Error:', error);
        res.status(500).json({ message: 'Server error submitting answer' });
    }
};
