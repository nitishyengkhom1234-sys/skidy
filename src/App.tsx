import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { Footer } from './components/Footer';
import type { AnalysisResult } from './types';
import { analyzeFaceImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setResults(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyzeClick = async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const analysisResults = await analyzeFaceImage(base64Image, imageFile.type);
      setResults(analysisResults);
    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to analyze image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
          <div>
            {!imagePreview && (
               <ImageInput onImageSelect={handleImageSelect} />
            )}
           
            {imagePreview && (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700">Image Preview</h2>
                <div className="flex justify-center mb-6">
                  <img src={imagePreview} alt="Face preview" className="rounded-lg shadow-md max-h-80 border-4 border-white"/>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleAnalyzeClick}
                    disabled={isLoading}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                   <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors disabled:opacity-50"
                  >
                    Clear Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {isLoading && <Loader />}

          {error && (
            <div className="mt-8 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {results && imagePreview && (
            <ResultsDisplay results={results} imagePreviewUrl={imagePreview} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
