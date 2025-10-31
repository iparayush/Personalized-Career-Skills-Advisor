import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { User, CareerSuggestion, Milestone } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseCareerSuggestions = (text: string): CareerSuggestion[] => {
    try {
        const suggestions: CareerSuggestion[] = [];
        const careers = text.split('###').filter(c => c.trim() !== '');
        
        for (const career of careers) {
            const nameMatch = career.match(/\*\*Career:\*\*\s*(.*)/);
            const descMatch = career.match(/\*\*Description:\*\*\s*(.*)/);
            const skillsMatch = career.match(/\*\*Key Skills:\*\*\s*(.*)/);
            
            if (nameMatch && descMatch && skillsMatch) {
                suggestions.push({
                    name: nameMatch[1].trim(),
                    description: descMatch[1].trim(),
                    skills: skillsMatch[1].split(',').map(s => s.trim())
                });
            }
        }
        return suggestions;
    } catch (error) {
        console.error("Error parsing career suggestions:", error);
        return [];
    }
};


export const generateCareerSuggestions = async (profile: User): Promise<CareerSuggestion[]> => {
    const prompt = `
    Based on the following student profile, suggest 3 diverse and suitable career paths.
    For each career, provide a brief description and the key skills required.
    Format each suggestion exactly like this, separated by '###':

    ###
    **Career:** [Career Name]
    **Description:** [A brief description of the career]
    **Key Skills:** [skill1, skill2, skill3]
    ###

    Profile:
    ${JSON.stringify(profile, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text;
        return parseCareerSuggestions(text);
    } catch (error) {
        console.error('Error generating career suggestions:', error);
        return [];
    }
};

export const generateLearningRoadmap = async (profile: User, targetRole: string): Promise<Milestone[]> => {
    const prompt = `
    A student with the profile below wants to become a ${targetRole}.
    Create a detailed, personalized learning roadmap with 5-7 milestones.
    For each milestone, provide a title, type (course, project, certification, or task), a brief description, and one relevant online resource URL.

    Profile: ${JSON.stringify(profile, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['course', 'project', 'certification', 'task'] },
                            description: { type: Type.STRING },
                            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ['title', 'type', 'description', 'resources'],
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const milestonesData = JSON.parse(jsonStr);

        return milestonesData.map((milestone: any) => ({
            ...milestone,
            status: 'todo',
        }));

    } catch (error) {
        console.error('Error generating learning roadmap:', error);
        throw new Error("Failed to generate learning roadmap.");
    }
};

export const createMentorChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly and encouraging AI career mentor for students. Your goal is to provide guidance, answer questions about careers and skills, and help students stay motivated on their learning path. Keep your answers concise and actionable.',
        },
    });
};

export const getResumeFeedback = async (resumeText: string): Promise<string> => {
    const prompt = `
    Act as a professional career coach. Review the following resume text and provide constructive feedback.
    Focus on clarity, impact, and formatting. Provide the feedback in markdown format with headings for different sections like 'Overall Impression', 'Strengths', and 'Areas for Improvement'.

    Resume Text:
    ---
    ${resumeText}
    ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error getting resume feedback:', error);
        throw new Error("Failed to get resume feedback.");
    }
};

export const createInterviewChat = (targetRole: string): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an AI interviewer conducting a mock interview for a '${targetRole}' position. 
            Start with a common opening question. After the user answers, provide brief, constructive feedback on their response, and then ask the next relevant question.
            Keep the interview flowing. Ask a mix of behavioral, technical, and situational questions. Your feedback should be formatted using markdown.`,
        },
    });
};
