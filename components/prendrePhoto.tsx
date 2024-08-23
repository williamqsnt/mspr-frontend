import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { CameraIcon } from 'lucide-react';

type PrendrePhotoProps = {
    onPhotoConfirmed: (imageSrc: string) => void;
};

const PrendrePhoto = ({ onPhotoConfirmed }: PrendrePhotoProps) => {
    const webcamRef = useRef<Webcam>(null);
    const [imageSrc, setImageSrc] = useState(null); // Pour stocker l'image capturée
    const [showWebcam, setShowWebcam] = useState(false); // Pour afficher ou cacher la webcam
    const [showPreview, setShowPreview] = useState(false); // Pour afficher l'aperçu de l'image

    // Afficher la webcam
    const handleShowWebcam = () => {
        setShowWebcam(true);
    };

    // Capturer une photo depuis la webcam
    const capture = () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImageSrc(imageSrc);
            setShowPreview(true); // Show the preview of the captured image
        }
    };

    // Reprendre une nouvelle photo
    const retakePhoto = () => {
        setImageSrc(null); // Effacer l'image capturée
        setShowPreview(false); // Cacher l'aperçu
    };

    // Confirmer et envoyer l'image vers le parent
    const confirmPhoto = async (e:any) => {
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
                <button onClick={handleShowWebcam}>{imageSrc ? <img src={imageSrc} alt="Captured" className="h-12 object-cover" /> : <CameraIcon />}</button>
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
                    <div className="absolute bottom-4 flex space-x-4">
                        <button onClick={capture} className="bg-white text-black py-2 px-4 rounded">Prendre une photo</button>
                    </div>
                </div>
            )}

            {showPreview && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
                    <img src={imageSrc} alt="Captured" className="w-full h-full object-cover" />
                    <button onClick={handleCloseWebcam} className="absolute top-4 right-4 text-white bg-black rounded-full h-8 w-8">✕</button>
                    <div className="absolute bottom-4 flex space-x-4">
                        <button onClick={retakePhoto} className="bg-white text-black py-2 px-4 rounded">Reprendre une photo</button>
                        <button onClick={confirmPhoto} className="bg-white text-black py-2 px-4 rounded">Confirmer</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrendrePhoto;
