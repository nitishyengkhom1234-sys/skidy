
import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { CameraCapture } from './CameraCapture';

interface ImageInputProps {
    onImageSelect: (file: File) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect }) => {
    const [inputMode, setInputMode] = useState<'upload' | 'camera'>('upload');

    const activeTabClass = 'border-b-2 border-blue-600 text-blue-600 font-semibold';
    const inactiveTabClass = 'text-gray-500 hover:text-gray-700';

    return (
        <div>
            <div className="flex justify-center border-b mb-6">
                <button 
                    onClick={() => setInputMode('upload')} 
                    className={`px-6 py-3 text-lg transition-colors ${inputMode === 'upload' ? activeTabClass : inactiveTabClass}`}
                    aria-pressed={inputMode === 'upload'}
                >
                    Upload File
                </button>
                <button 
                    onClick={() => setInputMode('camera')} 
                    className={`px-6 py-3 text-lg transition-colors ${inputMode === 'camera' ? activeTabClass : inactiveTabClass}`}
                    aria-pressed={inputMode === 'camera'}
                >
                    Use Camera
                </button>
            </div>
            {inputMode === 'upload' && <ImageUploader onImageSelect={onImageSelect} />}
            {inputMode === 'camera' && <CameraCapture onImageSelect={onImageSelect} />}
        </div>
    );
}
