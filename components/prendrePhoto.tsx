import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, Check, RotateCcw } from 'lucide-react';

type PrendrePhotoProps = {
    onPhotoConfirmed: (imageSrc: string) => void;
};

const PrendrePhoto = ({ onPhotoConfirmed }: PrendrePhotoProps) => {
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null); 
    const [showWebcam, setShowWebcam] = useState<boolean>(false); // Pour afficher ou cacher la webcam
    const [showPreview, setShowPreview] = useState<boolean>(false); // Pour afficher l'aperçu de l'image

    // Afficher la webcam
    const handleShowWebcam = () => {
        setShowWebcam(true);
    };

    // Capturer une photo depuis la webcam
    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImageSrc(imageSrc);
            setShowPreview(true); 
        }
    };

    // Reprendre une nouvelle photo
    const retakePhoto = () => {
        setImageSrc(null); // Effacer l'image capturée
        setShowPreview(false); // Cacher l'aperçu
    };

    // Confirmer et envoyer l'image vers le parent
    const confirmPhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!imageSrc) {
                throw new Error("Aucune photo capturée.");
            }

            await onPhotoConfirmed(imageSrc);
            setShowWebcam(false);
            setShowPreview(false);
        } catch (error) {
            console.error('Error confirming photo:', error);
        }
    };

    // Fermer la webcam
    const handleCloseWebcam = () => {
        setShowWebcam(false);
        setImageSrc(null); // Effacer l'image capturée si la webcam est fermée
        setShowPreview(false); // Cacher l'aperçu
    };

    return (
        <div className="relative">
            {!showWebcam && !showPreview && (
                <button onClick={handleShowWebcam}>
                    {imageSrc ? (
                        <img src={imageSrc} alt="Captured" className="h-12 object-cover" />
                    ) : (
                        <CameraIcon />
                    )}
                </button>
            )}

            {showWebcam && !showPreview && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover"
                    />
                    <button onClick={handleCloseWebcam} className="absolute top-4 right-4 text-white bg-black rounded-full h-8 w-8">✕</button>
                    <div className="absolute bottom-12 flex space-x-4">
                        <button onClick={capture} className="bg-white text-black py-4 px-4 rounded-full"><CameraIcon size={45} /></button>
                    </div>
                </div>
            )}

            {showPreview && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
                    <img src={imageSrc || ''} alt="Captured" className="w-full h-full object-cover" />
                    <button onClick={handleCloseWebcam} className="absolute top-4 right-4 text-white bg-black rounded-full h-8 w-8">✕</button>
                    <div className="absolute bottom-12 flex space-x-4">
                        <button onClick={retakePhoto} className="bg-white text-black py-4 px-4 rounded-full"><RotateCcw size={45} /></button>
                        <button onClick={confirmPhoto} className="bg-white text-black py-4 px-4 rounded-full"><Check size={45} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrendrePhoto;
