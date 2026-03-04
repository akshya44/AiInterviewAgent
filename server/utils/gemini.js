import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateInterviewQuestions = async (jobRole, jobDescription, resumeText, options = {}) => {
    const {
        focusArea = 'Core Concepts',
        difficulty = 'Intermediate',
        interviewType = 'Technical Only',
        questionStyle = 'Conceptual',
        companyType = 'Product-Based'
    } = options;

    const prompt = `You are an expert ${interviewType} Interviewer. 
Your goal is to generate exactly 5 highly specific and challenging interview questions for a candidate applying for the role of ${jobRole} at a ${companyType} company.

**CRITICAL INSTRUCTIONS FOR QUESTION GENERATION:**
1. **Question 1 MUST always be a foundational introductory question** (e.g., "Tell me about yourself and your experience with [Key Technology]...", or "Walk me through your background and projects...").
2. The remaining 4 questions must be tailored to the exact difficulty level: **${difficulty}**, the focus area: **${focusArea}**, and the style: **${questionStyle}**.
3. For Technical Roles, you MUST include questions covering:
   - Data Structures and Algorithms (DS/Algo) appropriate for the role.
   - Object-Oriented Programming (OOPs) concepts or system design.
   - Specific programming language mechanics, syntax, or code output based on their resume.
4. Ensure the questions are realistic, professional, and directly test what they claim to know.

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Return exactly 5 questions as a JSON array of strings.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let rawText = response.text || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(rawText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error('Failed to generate interview questions');
    }
};

export const generateFeedback = async (questionText, userAnswer) => {
    const prompt = `You are an expert Technical Interviewer evaluating a candidate's response.

Question Asked: "${questionText}"
Candidate's Answer: "${userAnswer}"

Please evaluate this answer critically.
1. Rate the answer on a scale of 1 to 10 based on technical accuracy, clarity, and completeness.
2. Provide constructive feedback (3-4 sentences). Highlight what they did well, point out any technical inaccuracies or missing context, and suggest exactly how they could improve this answer in a real interview (e.g., mentioning specific edge cases, using the STAR method, or referencing architectural patterns).

Return the evaluation as a JSON object with two fields:
- "score": A number between 1 and 10.
- "feedback": Your detailed feedback string.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let rawText = response.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(rawText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error('Failed to generate feedback');
    }
};
