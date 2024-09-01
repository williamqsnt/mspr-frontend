'use client';

import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { decrypt } from "@/utils/cryptoUtils";
import Menu from "@/components/menu";
import axios from "axios";
import toast from "react-hot-toast";
import { error } from "console";
import ConfirmationPopup from "@/components/supprimer-compte";

export default function ProfilPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState({ nom: '', prenom: '' });
  const [plantes, setPlantes] = useState<{ nom: string }[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);


  // États pour gérer le token et les headers
  const [token, setToken] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState<string | null>(null);

  useEffect(() => {
    // Récupération des valeurs de localStorage côté client
    const storedToken = localStorage.getItem('token');
    const storedPseudo = localStorage.getItem('pseudo');

    setToken(storedToken);
    setPseudo(storedPseudo);

    const fetchProfil = async () => {
      try {
        const pseudo = localStorage.getItem('pseudo');
        if (pseudo) {
          // Récupérer l'ID utilisateur à partir du pseudo
          const idResponse = await fetch(`http://localhost:3000/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers: headers });
          if (idResponse.ok) {
            const idData = await idResponse.json();
            const idUtilisateur = idData.idUtilisateur;

            if (idUtilisateur) {
              // Récupérer les informations du profil et les plantes
              const profilResponse = await fetch(`http://localhost:3000/api/utilisateur/infos?idUtilisateur=${idUtilisateur}`, { headers: headers });
              if (profilResponse.ok) {
                const data = await profilResponse.json();
                const nomdecrypter = decrypt(data.utilisateur.nom);
                const prenomdecrypter = decrypt(data.utilisateur.prenom);
                setUtilisateur({ nom: nomdecrypter, prenom: prenomdecrypter });
                setPlantes(data.plantes);
              } else {
                console.error('Erreur lors de la récupération du profil');
                setErreur('Erreur lors de la récupération du profil');
              }
            } else {
              console.error('ID utilisateur non trouvé pour le pseudo');
              setErreur('ID utilisateur non trouvé pour le pseudo');
            }
          } else {
            console.error('Erreur lors de la récupération de l\'ID utilisateur');
            setErreur('Erreur lors de la récupération de l\'ID utilisateur');
          }
        } else {
          console.error('Pseudo non trouvé dans le localStorage');
          setErreur('Pseudo non trouvé dans le localStorage');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        setErreur('Erreur lors de la récupération du profil');
      }
    };

    fetchProfil();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pseudo');
    router.push('/login');
  };

  const handleCancel = () => {
    setIsPopupOpen(false);
  };
  const handleConfirm = async () => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/utilisateur/supprimer?pseudo=${pseudo}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
      if (response.status === 200) {
        toast.success('Compte supprimé avec succès');
        router.push('/login');
      } else {
        toast.error(error.toString());
        throw new Error(response.data.message || 'Erreur lors de la suppression du compte');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte');
      console.error('Erreur lors de la suppression du compte:', error);
    }

    setIsPopupOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
          <button className="focus:outline-none" onClick={handleLogout}>
            Déconnexion
          </button>
      </header>

      <main className="flex-1 p-4">
      <br></br>
      {erreur && <p className="text-red-500">{erreur}</p>}
      <div className="flex flex-col items-center mb-4">
        <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src="/pp.jpg"
            alt="Profil"
            className="object-cover w-full h-full"
          />
        </div>
        <br></br>
        <h2 className="text-2xl font-bold">{utilisateur.prenom} {utilisateur.nom}</h2>
      </div>

    </main>
      <button
        onClick={() => setIsPopupOpen(true)}
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 mb-16 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Supprimer mon compte
      </button>
      <ConfirmationPopup
        isOpen={isPopupOpen}
        onCancel={handleCancel}
        handleConfirm={handleConfirm}
      />
     <Menu />
    </div>
  );
}