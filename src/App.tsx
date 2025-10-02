import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageInput } from './components/ImageInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { Footer } from './components/Footer';
import type { AnalysisResult } from './types';
import { analyzeFaceImage } from './services/geminiService';
import { resizeImage } from './utils/fileUtils';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback(async (file: File) => {
    setResults(null);
    setError(null);
    setIsLoading(true);
    try {
      const resizedFile = await resizeImage(file, 1024, 1024);
      setImageFile(resizedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsLoading(false);
      };
      reader.readAsDataURL(resizedFile);
    } catch (e) {
        console.error("Image processing failed:", e);
        setError("Could not process the selected image. It might be corrupted or in an unsupported format.");
        setIsLoading(false);
    }
  }, []);

  const handleAnalyzeClick = async () => {
    if (!imageFile || !imagePreview) {
      setError("Please select an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const base64Image = imagePreview.split(',')[1];
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

  const handleImageCaptureAndAnalyze = useCallback(async (file: File) => {
    setIsLoading(true);
    setResults(null);
    setError(null);
    setImagePreview(null);
    setImageFile(null);

    try {
        const resizedFile = await resizeImage(file, 1024, 1024);
        
        const base64WithPrefix = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(resizedFile);
        });
        
        setImageFile(resizedFile);
        setImagePreview(base64WithPrefix);
        
        const base64Image = base64WithPrefix.split(',')[1];
        const analysisResults = await analyzeFaceImage(base64Image, resizedFile.type);
        setResults(analysisResults);
    } catch (err) {
        console.error("Analysis failed:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to analyze image: ${errorMessage}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
    setIsLoading(false);
  }

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return (
        <div className="text-center">
          <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={handleReset}
            className="mt-6 px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    if (results && imagePreview) {
      return (
        <div>
          <ResultsDisplay results={results} imagePreviewUrl={imagePreview} />
          <div className="text-center mt-8">
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
              Analyze Another Image
            </button>
          </div>
        </div>
      );
    }
    if (imagePreview) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Image Preview</h2>
          <div className="flex justify-center mb-6">
            <img src={imagePreview} alt="Face preview" className="rounded-lg shadow-md max-h-80 border-4 border-white"/>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleAnalyzeClick}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
              Analyze Image
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
            >
              Clear Image
            </button>
          </div>
        </div>
      );
    }
    return (
      <ImageInput 
        onImageSelect={handleImageSelect}
        onImageCaptureAndAnalyze={handleImageCaptureAndAnalyze}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;