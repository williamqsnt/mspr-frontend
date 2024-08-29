// pages/login.js
"use client";
import { useState } from 'react';
import axios from 'axios';
import { encrypt } from "@/utils/cryptoUtils";
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();

    const [pseudo, setPseudo] = useState('');
    const [motDePasse, setMotDePasse] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const encryptedMotDePasse = encrypt(motDePasse);
            const response = await axios.post(`${process.env.API_ENDPOINT}/api/utilisateur/verifier`, {
                pseudo: pseudo,
                motDePasse: encryptedMotDePasse,
            });

            const responseData = response.data;

            if (responseData.token) {
                console.log('Utilisateur trouvé');

                // Sauvegarder le pseudo et le token JWT dans localStorage
                localStorage.setItem('pseudo', pseudo);
                localStorage.setItem('token', responseData.token);
                localStorage.setItem('idUtilisateur', responseData.idUtilisateur);

                router.push('/');
            } else {
                console.log('Utilisateur non trouvé');
                setError('Utilisateur non trouvé.');
            }
        } catch (error: any) {
            console.error('Erreur de connexion:', error.message);
            setError('Erreur de connexion.');
        }
    };

    const navigateToSignUp = () => {
        router.push('/inscription');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md h-[100vh]">
                <div className="flex justify-center mb-8">
                    <img src="/logo_acc.png" alt="Logo" className="w-32 h-32 bg-white" />
                </div>
                <h2 className="text-3xl font-bold text-center mb-8">S&apos;identifier</h2>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Utilisateur"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mb-4">
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    Connexion
                </button>
                <p className="mt-4 text-center">
    Vous n&apos;avez pas encore de compte ?
    <span className="mx-1"> {/* Ajoute un espace entre le texte et le lien */}
        <a
            href="#"
            onClick={navigateToSignUp}
            className="text-green-500 hover:text-green-600 font-medium"
        >
            Créez en un ici
        </a>
    </span>
</p>


            </div>
        </div>
    );
}
