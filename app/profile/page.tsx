"use client";
import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, ChevronLeft, FlowerIcon, HomeIcon, Leaf, MailIcon, MessageCircle, User, UserIcon, MapPin } from 'lucide-react';
import Link from 'next/link';
import { decrypt } from "@/utils/cryptoUtils";
import Menu from "@/components/menu";
import ConfirmationPopup from "@/components/supprimer-compte";
import axios from "axios";
import toast from "react-hot-toast";
import { error } from "console";

export default function ProfilPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState({ nom: '', prenom: '' });
  const [plantes, setPlantes] = useState<{ nom: string }[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const pseudo = localStorage.getItem('pseudo');


  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
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
      const response = await axios.delete(`http://localhost:3000/api/utilisateur/supprimer?pseudo=${pseudo}`, {
        params: { pseudo: pseudo },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 200) {
        toast.success('Compte supprimé avec succès');
        router.push('/login');
      } else {
        toast.error(error);
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
        {erreur && <p className="text-red-500">{erreur}</p>}
        <div className="flex flex-col items-center mb-4">
          <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
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
