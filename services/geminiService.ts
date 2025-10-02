import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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

interface SkinDisease {
  conditionName: string;
  descriptionForAI: string;
  commonLocations: string[];
  keyFeatures: string[];
  textureAndAppearance: string;
  differentialDiagnosis: string;
}

let skinDiseaseList: SkinDisease[] | null = null;

const getSkinDiseases = async (): Promise<SkinDisease[]> => {
    if (skinDiseaseList) {
        return skinDiseaseList;
    }
    try {
        const response = await fetch('/skin_diseases.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        skinDiseaseList = data;
        return data;
    } catch (error) {
        console.error("Could not fetch or parse skin_diseases.json:", error);
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


export const analyzeFaceImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult[]> => {
  const prompt = await generatePrompt();
  
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  
  const textPart = {
    text: prompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const parsedResult = JSON.parse(jsonText);
    
    if (Array.isArray(parsedResult)) {
        return parsedResult as AnalysisResult[];
    } else {
        console.error("Parsed result is not an array:", parsedResult);
        return [];
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};