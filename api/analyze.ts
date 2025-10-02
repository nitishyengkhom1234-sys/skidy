// Vercel Serverless Function: api/analyze.ts
import { GoogleGenAI, Type } from "@google/genai";
import { promises as fs } from 'fs';
import path from 'path';

// This function runs on the server, not in the browser.

// Define types locally for the serverless function environment
interface AnalysisResult {
  conditionName: string;
  confidenceScore: number;
  description: string;
}

interface SkinDisease {
  conditionName: string;
  descriptionForAI: string;
  commonLocations: string[];
  keyFeatures: string[];
  textureAndAppearance: string;
  differentialDiagnosis: string;
}

// Ensure the API key is available in the server environment
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      conditionName: {
        type: Type.STRING,
        description: 'The name of the potential condition detected, such as "Acne" or "Rosacea".',
      },
      confidenceScore: {
        type: Type.INTEGER,
        description: 'A confidence score from 0 to 100 for how certain the model is about the detection.',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, neutral, one-sentence description of the potential condition.',
      },
    },
    required: ['conditionName', 'confidenceScore', 'description'],
  },
};

let skinDiseaseList: SkinDisease[] | null = null;

const getSkinDiseases = async (): Promise<SkinDisease[]> => {
    if (skinDiseaseList) {
        return skinDiseaseList;
    }
    try {
        // In Vercel, serverless functions run from the project root directory
        const filePath = path.join(process.cwd(), 'skin_diseases.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        skinDiseaseList = data;
        return data;
    } catch (error) {
        console.error("Could not read or parse skin_diseases.json on server:", error);
        throw new Error("Failed to load the list of skin conditions.");
    }
}

const generatePrompt = async (): Promise<string> => {
  const diseases = await getSkinDiseases();
  const diseaseListText = diseases.map(disease => `
- Condition: ${disease.conditionName}
  - Description: ${disease.descriptionForAI}
  - Common Locations: ${disease.commonLocations.join(', ')}
  - Key Features to Look For: ${disease.keyFeatures.join(', ')}
  - Texture/Appearance: ${disease.textureAndAppearance}
  - Differentiators (how to distinguish it): ${disease.differentialDiagnosis}`
  ).join('');

  return `
    Analyze the provided image of a human face. Your task is to act as an AI assistant identifying potential dermatological conditions or facial anomalies with professional-level detail.
    Your analysis must be strictly visual. Do not provide medical advice or diagnoses.
    
    Identify potential signs of the following facial skin conditions using the detailed criteria provided. For each one you identify, provide its name, a confidence score (0-100), and a brief, neutral, one-sentence description of what you are seeing.

${diseaseListText}
    
    If no potential conditions from this list are detected, return an empty array.
    Your response must be in JSON format conforming to the provided schema.
  `;
};


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { base64Image, mimeType } = req.body;

        if (!base64Image || !mimeType) {
            return res.status(400).json({ error: 'Missing base64Image or mimeType in request body' });
        }
        
        const prompt = await generatePrompt();
  
        const imagePart = {
            inlineData: { data: base64Image, mimeType: mimeType },
        };
        
        const textPart = { text: prompt };

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = geminiResponse.text.trim();
        const parsedResult = JSON.parse(jsonText);
        
        if (!Array.isArray(parsedResult)) {
            console.error("Parsed result from Gemini is not an array:", parsedResult);
            return res.status(200).json([]);
        }

        return res.status(200).json(parsedResult as AnalysisResult[]);

    } catch (error: any) {
        console.error("Error in /api/analyze:", error);
        return res.status(500).json({ error: error.message || "An internal server error occurred." });
    }
}
