"use client";
import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, FlowerIcon, MailIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState({ nom: '', prenom: '' });
  const [plantes, setPlantes] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const pseudo = localStorage.getItem('pseudo');
        if (pseudo) {
          // Récupérer l'ID utilisateur à partir du pseudo
          const idResponse = await fetch(`http://localhost:3000/api/utilisateur/recupererId?pseudo=${pseudo}`);
          if (idResponse.ok) {
            const idData = await idResponse.json();
            const idUtilisateur = idData.idUtilisateur;

            if (idUtilisateur) {
              // Récupérer les informations du profil et les plantes
              const profilResponse = await fetch(`http://localhost:3000/api/utilisateur/infos?idUtilisateur=${idUtilisateur}`);
              if (profilResponse.ok) {
                const data = await profilResponse.json();
                setUtilisateur({ nom: data.utilisateur.nom, prenom: data.utilisateur.prenom });
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
    localStorage.removeItem('idUtilisateur'); // Supprimer l'ID utilisateur du localStorage
    router.push('/');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="text-xl font-bold">Profil</div>
        <div className="flex items-center gap-4">
          <button className="focus:outline-none" onClick={handleLogout}>
            Déconnexion
          </button>
          <button className="focus:outline-none" onClick={() => router.push('/messages')}>
            <MailIcon className="w-6 h-6" />
            <span className="sr-only">Messages</span>
          </button>
          <button className="focus:outline-none" onClick={() => router.push('/profile')}>
            <UserIcon className="w-6 h-6" />
            <span className="sr-only">Profile</span>
          </button>
        </div>
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

        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4">Mes plantes :</h3>
          <div className="bg-white rounded-lg shadow-md">
            <div className="flex overflow-x-auto space-x-4 p-4">
              {plantes.map((plante, index) => (
                <Card key={index} className="border-none shadow-none w-52">
                  <CardContent className="flex flex-col items-center">
                    <h2 className="text-lg font-bold">{plante.nom}</h2>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex justify-around py-4 bg-white border-t">
        <button className="focus:outline-none" onClick={() => router.push('/requests')}>
          <CalendarIcon className="w-6 h-6" />
          <span className="block text-xs">Requests</span>
        </button>
        <button className="focus:outline-none" onClick={() => router.push('/chercher-plantes')}>
          <FlowerIcon className="w-6 h-6" />
          <span className="block text-xs">Find Plants</span>
        </button>
        <button className="focus:outline-none" onClick={() => router.push('/messages')}>
          <MailIcon className="w-6 h-6" />
          <span className="block text-xs">Messages</span>
        </button>
      </footer>
    </div>
  );
}
