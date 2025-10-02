import React from 'react';
import type { AnalysisResult } from '../types';

interface ResultsDisplayProps {
  results: AnalysisResult[];
  imagePreviewUrl: string;
}

const getConfidenceColor = (score: number): string => {
  if (score > 75) return 'bg-red-500';
  if (score > 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const ResultCard: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="bg-white p-5 rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{result.conditionName}</h3>
        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
      </div>
      <span className="text-lg font-bold text-blue-600">{result.confidenceScore}%</span>
    </div>
    <div className="mt-3">
      <p className="text-xs text-gray-500 mb-1">Confidence</p>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${getConfidenceColor(result.confidenceScore)} h-2.5 rounded-full`} 
          style={{ width: `${result.confidenceScore}%` }}>
        </div>
      </div>
    </div>
    <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm p-3 rounded-md">
        <strong>Next Step:</strong> Always consult a qualified healthcare professional for a proper diagnosis.
    </div>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, imagePreviewUrl }) => {
  
  // Handle the case where the image is not a face or is unsuitable
  if (results.length === 1 && results[0].conditionName === 'INVALID_IMAGE') {
    return (
      <div className="mt-2">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Analysis Unsuccessful</h2>
        <div className="text-center bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-yellow-800">Image Not Suitable for Analysis</h3>
          <p className="text-yellow-700 mt-2">
            {results[0].description} Please try again with a clear photo of a face.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Analysis Results</h2>
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center md:sticky md:top-8">
            <img src={imagePreviewUrl} alt="Analyzed face" className="rounded-lg shadow-lg max-h-80 border-4 border-white"/>
            <p className="text-sm text-gray-500 mt-2">Analyzed Image</p>
        </div>
        
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((result, index) => (
              <ResultCard key={index} result={result} />
            ))
          ) : (
            <div className="text-center bg-green-50 border border-green-200 p-6 rounded-lg h-full flex flex-col justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-green-800">No Major Anomalies Detected</h3>
                <p className="text-green-700 mt-2">
                  Based on the analysis, no significant potential conditions were identified. Remember, this AI is not a substitute for a professional medical opinion.
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};