import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onImageSelect: (file: File) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageSelect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setCapturedImage(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure you have a camera connected and have granted permission to use it.");
    }
  }, []);
  
  useEffect(() => {
    // This effect manages the camera stream's lifecycle.
    // It starts the camera only if there is no active stream and no error.
    // This prevents an infinite loop on component mount or on camera permission errors.
    if (!stream && !error) {
        startCamera();
    }

    // The cleanup function will be called when the component unmounts or when
    // the stream/error state changes. It ensures the camera track is stopped
    // to release the resource.
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [startCamera, stream, error]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  
  const handleRetake = () => {
      startCamera();
  };

  const handleUsePhoto = () => {
    if(canvasRef.current){
        canvasRef.current.toBlob((blob) => {
            if(blob){
                const file = new File([blob], "capture.jpg", { type: 'image/jpeg' });
                onImageSelect(file);
            }
        }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Camera Capture</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">Position your face in the frame and click "Capture Photo".</p>
      
      {!capturedImage ? (
        <>
            <div className="w-full max-w-md bg-gray-900 rounded-lg overflow-hidden shadow-lg mb-4 border-4 border-gray-200">
                 <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto transform scale-x-[-1]" />
            </div>
            {stream && <button onClick={handleCapture} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform transform hover:scale-105">
                Capture Photo
            </button>}
        </>
      ) : (
        <>
            <img src={capturedImage} alt="Captured" className="rounded-lg shadow-md max-h-80 border-4 border-white mb-6"/>
            <div className="flex justify-center space-x-4">
                 <button onClick={handleUsePhoto} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105">
                    Use This Photo
                </button>
                <button onClick={handleRetake} className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors">
                    Retake
                </button>
            </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
};