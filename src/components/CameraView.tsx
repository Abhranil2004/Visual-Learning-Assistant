import React from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, Loader2 } from 'lucide-react';
import type { WebcamProps } from 'react-webcam';

interface CameraViewProps {
  webcamRef: React.RefObject<Webcam>;
  deviceId: string;
  isAnalyzing: boolean;
  onCapture: () => void;
  onError: (error: string) => void;
}

const WEBCAM_CONFIG: WebcamProps['videoConstraints'] = {
  width: 1280,
  height: 720,
  facingMode: "environment",
  screenshotQuality: 0.92,
};

export function CameraView({ webcamRef, deviceId, isAnalyzing, onCapture, onError }: CameraViewProps) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
        videoConstraints={{
          ...WEBCAM_CONFIG,
          deviceId
        }}
        onUserMediaError={(err) => {
          console.error('Webcam error:', err);
          onError('Failed to access camera. Please check your camera permissions and refresh the page.');
        }}
      />
      <button
        onClick={onCapture}
        disabled={isAnalyzing}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <CameraIcon className="w-5 h-5" />
            <span>Capture & Analyze</span>
          </>
        )}
      </button>
    </div>
  );
}