import type { AnalysisResult } from '../types';

export const analyzeFaceImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult[]> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image, mimeType }),
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        const textError = await response.text();
        errorMessage = textError || 'The server returned an unreadable error.';
      }
      throw new Error(errorMessage);
    }

    const results: AnalysisResult[] = await response.json();
    return results;

  } catch (error) {
    console.error("Error calling analysis API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error(String(error) || "An unknown error occurred while communicating with the server.");
  }
};
