
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-10">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} FaceHealth AI. All Rights Reserved.</p>
      </div>
    </footer>
  );
};