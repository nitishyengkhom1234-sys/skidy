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
      const errorData = await response.json().catch(() => ({ error: 'The server returned an unreadable error.' }));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const results: AnalysisResult[] = await response.json();
    return results;

  } catch (error) {
    console.error("Error calling analysis API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while communicating with the server.");
  }
};
