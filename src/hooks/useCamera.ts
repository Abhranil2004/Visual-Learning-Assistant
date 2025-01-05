import { useState, useEffect } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCamera() {
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function initializeCamera() {
      try {
        // First request permission
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);

        // Then enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 4)}`
          }));

        setDevices(videoDevices);

        // Select the first available device or environment-facing camera if available
        const envCamera = videoDevices.find(device => device.label.toLowerCase().includes('back'));
        setSelectedDevice(envCamera?.deviceId || videoDevices[0]?.deviceId || '');
      } catch (err) {
        console.error('Camera initialization error:', err);
        setError('Failed to initialize camera. Please check permissions and try again.');
        setHasPermission(false);
      }
    }

    initializeCamera();

    // Re-enumerate devices when they change
    navigator.mediaDevices.addEventListener('devicechange', initializeCamera);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', initializeCamera);
    };
  }, []);

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    hasPermission,
    error,
    setError
  };
}