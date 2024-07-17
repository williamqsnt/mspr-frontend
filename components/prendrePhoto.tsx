import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { CameraIcon } from 'lucide-react';

const PrendrePhoto = () => {
    const webcamRef = useRef(null);
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
        setImageSrc(imageSrc);
        setShowPreview(true); // Afficher l'aperçu de l'image capturée
    };

    // Reprendre une nouvelle photo
    const retakePhoto = () => {
        setImageSrc(null); // Effacer l'image capturée
        setShowPreview(false); // Cacher l'aperçu
    };

    // Confirmer et envoyer l'image vers l'API
    const confirmPhoto = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/plante/ajouterPhoto', { image: imageSrc });
            console.log('Image uploaded successfully:', response.data);
            // Ici, vous pourriez ajouter d'autres actions après confirmation, par exemple rediriger l'utilisateur ou afficher un message de succès.
        } catch (error) {
            console.error('Error uploading image:', error);
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
                <button onClick={handleShowWebcam}><CameraIcon /></button>
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
