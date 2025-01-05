import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Loader2 } from 'lucide-react';
import { analyzeImage } from '../lib/gemini';
import { useCamera } from '../hooks/useCamera';
import { CameraView } from './CameraView';

export function Camera() {
  const webcamRef = useRef<Webcam>(null);
  const [solution, setSolution] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { hasPermission, selectedDevice, devices, error, setError } = useCamera();

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakSolution = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      stopSpeaking();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError('Failed to speak the solution');
      };
      speechSynthesis.speak(utterance);
    }
  }, [stopSpeaking, setError]);

  const captureImage = useCallback(async () => {
    setError('');
    const imageSrc = webcamRef.current?.getScreenshot();
    
    if (!imageSrc) {
      setError('Failed to capture image. Please make sure your camera is working.');
      return;
    }

    setIsAnalyzing(true);
    setSolution('');
    stopSpeaking();

    try {
      const result = await analyzeImage(imageSrc);
      setSolution(result);
      speakSolution(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(message);
      console.error('Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [speakSolution, stopSpeaking, setError]);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">Camera access is required for this app to work. Please allow camera access and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-4 space-y-6">
      {devices.length > 0 && selectedDevice ? (
        <CameraView
          webcamRef={webcamRef}
          deviceId={selectedDevice}
          isAnalyzing={isAnalyzing}
          onCapture={captureImage}
          onError={setError}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">No camera devices found. Please connect a camera and refresh the page.</p>
        </div>
      )}

      {error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {solution && (
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Solution</h2>
            {isSpeaking && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm">Speaking...</span>
              </div>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{solution}</p>
        </div>
      )}
    </div>
  );
}