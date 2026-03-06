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
Your goal is to conduct a highly realistic, full-length interview. You must generate exactly 10 interview questions for a candidate applying for the role of ${jobRole} at a ${companyType} company.

**CRITICAL INSTRUCTIONS FOR QUESTION GENERATION:**
You MUST generate exactly 10 questions following this strict structure:
1. **Question 1:** Foundational introductory question (e.g., "Tell me about yourself and your experience with...").
2. **Questions 2 & 3:** Behavioral or Cultural Fit questions (e.g., Conflict resolution, teamwork, or describing a past challenge).
3. **Questions 4, 5, 6, 7:** Hard Technical questions tailored to the exact difficulty level: **${difficulty}**, focus area: **${focusArea}**, and style: **${questionStyle}**. Base these on their resume skills.
4. **Questions 8 & 9:** Scenario-based or Problem-solving questions (e.g., "How would you design X?" or "A production bug occurs in Y, what do you do?").
5. **Question 10:** Wrap-up/Closing question (e.g., "Where do you see yourself in 3 years?" or a final overarching architectural question).

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Return exactly 10 questions as a JSON array of strings.`;

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
