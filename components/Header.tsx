
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          FaceHealth <span className="text-blue-600">AI</span>
        </h1>
      </div>
    </header>
  );
};
