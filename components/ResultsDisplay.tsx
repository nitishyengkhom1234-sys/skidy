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
  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Analysis Results</h2>
      
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
        </div>
      ) : (
         <div className="text-center bg-green-50 border border-green-200 p-6 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-green-800">No Major Anomalies Detected</h3>
            <p className="text-green-700 mt-2">
              Based on the analysis, no significant potential conditions were identified from the provided list. Remember, this AI is not a substitute for a professional medical opinion.
            </p>
        </div>
      )}
    </div>
  );
};