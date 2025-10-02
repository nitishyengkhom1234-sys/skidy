
import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      // Validation
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError("Invalid file type. Please upload a JPEG or PNG image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError("File is too large. Please upload an image smaller than 5MB.");
        return;
      }
      setError(null);
      onImageSelect(file);
    }
  };
  
  const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  }
  
  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      handleFileChange(e.dataTransfer.files);
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     handleFileChange(e.target.files);
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Upload Your Image</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">For the best results, use a clear, well-lit, forward-facing photo of your face.</p>
      
      <label 
        htmlFor="file-upload" 
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
        >
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="mt-2 block text-sm font-medium text-gray-900">
          Drop your image here, or <span className="text-blue-600">click to browse</span>
        </span>
        <span className="mt-1 block text-xs text-gray-500">PNG, JPG up to 5MB</span>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/jpeg, image/png" onChange={onInputChange} />
      </label>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
};
