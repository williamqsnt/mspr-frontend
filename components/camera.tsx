import { useState, useRef } from 'react';

const CameraCapture = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const photoURL = canvas.toDataURL('image/png');
      setPhotoURL(photoURL);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setPhotoURL(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {!photoURL ? (
        <div>
          <button className="bg-green-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mb-4" onClick={startCamera}>
            Start Camera
          </button>
          <video ref={videoRef} className="mb-4" autoPlay></video>
          <button className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md" onClick={capturePhoto}>
            Capture Photo
          </button>
        </div>
      ) : (
        <div>
          <img src={photoURL} className="mb-4 rounded-md" alt="Captured" />
          <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md" onClick={stopCamera}>
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
