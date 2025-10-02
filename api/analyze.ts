// Vercel Serverless Function: api/analyze.ts
import { GoogleGenAI, Type } from "@google/genai";
// Import the JSON data directly. Vercel will include this in the function bundle.
import skinDiseaseList from '../skin_diseases.json';

// Define types locally for the serverless function environment
interface AnalysisResult {
  conditionName: string;
  confidenceScore: number;
  description: string;
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
        description: 'The name of the potential condition detected, chosen from the pre-approved list. Or "INVALID_IMAGE" if the image is not suitable.',
      },
      confidenceScore: {
        type: Type.INTEGER,
        description: 'A confidence score from 0 to 100. For INVALID_IMAGE, this must be 100.',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, neutral, one-sentence description of the visual signs, or the reason the image is invalid.',
      },
    },
    required: ['conditionName', 'confidenceScore', 'description'],
  },
};

const generateSystemInstruction = (): string => {
  const diseaseNames = skinDiseaseList.map(d => d.conditionName);
  
  return `You are an expert AI assistant specializing in identifying visual signs of dermatological conditions from images of human faces.
Your analysis must be strictly visual and objective. You must not provide any medical advice or diagnosis.
Your response MUST be in JSON format and conform to the provided schema.

**Analysis Steps:**
1.  **Image validation:** First, determine if the image is a clear photograph of a human face where skin is visible.
2.  **Action based on validation:**
    - **If the image IS NOT a valid human face** (e.g., it's a cartoon, an animal, an object, a landscape, or too blurry), you MUST return a single-element array with this exact structure: \`[{"conditionName": "INVALID_IMAGE", "confidenceScore": 100, "description": "The uploaded image does not appear to be a human face suitable for analysis."}]\`.
    - **If the image IS a valid human face**, proceed to the next step.
3.  **Condition analysis:** Analyze the face for potential conditions ONLY from this list: ${diseaseNames.join(', ')}.
    - For each potential condition you identify, provide its name, a confidence score (0-100), and a brief, one-sentence, neutral description of the visual signs.
    - **If you analyze the face and find no clear visual signs of any conditions from the list, you MUST return an empty array \`[]\`**.
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
        
        const systemInstruction = generateSystemInstruction();
        const promptText = "Analyze the face in this image for potential skin conditions from the list provided in your system instructions, following all rules.";
  
        const imagePart = {
            inlineData: { data: base64Image, mimeType: mimeType },
        };
        
        const textPart = { text: promptText };

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const jsonText = geminiResponse.text.trim();
        if (!jsonText) {
            console.warn("Gemini returned an empty text response, defaulting to empty array.");
            return res.status(200).json([]);
        }

        const parsedResult = JSON.parse(jsonText);
        
        if (!Array.isArray(parsedResult)) {
            console.error("Parsed result from Gemini is not an array:", parsedResult);
            // Return an empty array to the client to prevent an app crash
            return res.status(200).json([]);
        }

        return res.status(200).json(parsedResult as AnalysisResult[]);

    } catch (error: any) {
        console.error("--- Detailed Error in /api/analyze ---");
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        if (error.response) { 
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
        console.error("--- End of Detailed Error ---");
        return res.status(500).json({ error: error.message || "An internal server error occurred." });
    }
}