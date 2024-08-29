'use client';

import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { decrypt } from "@/utils/cryptoUtils";
import Menu from "@/components/menu";

export default function ProfilPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState({ nom: '', prenom: '' });
  const [plantes, setPlantes] = useState<{ nom: string }[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

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
      if (!storedPseudo || !storedToken) {
        console.error('Pseudo ou token non trouvés dans le localStorage');
        setErreur('Pseudo ou token non trouvés dans le localStorage');
        return;
      }

      const headers = new Headers();
      if (storedToken) {
        headers.append('Authorization', `Bearer ${storedToken}`);
      }

      try {
        // Récupérer l'ID utilisateur à partir du pseudo
        const idResponse = await fetch(`https://15.237.67.223:3000/api/utilisateur/recupererId?pseudo=${storedPseudo}`, { headers });
        if (idResponse.ok) {
          const idData = await idResponse.json();
          const idUtilisateur = idData.idUtilisateur;

          if (idUtilisateur) {
            // Récupérer les informations du profil et les plantes
            const profilResponse = await fetch(`https://15.237.67.223:3000/api/utilisateur/infos?idUtilisateur=${idUtilisateur}`, { headers });
            if (profilResponse.ok) {
              const data = await profilResponse.json();
              const nomDecrypter = decrypt(data.utilisateur.nom);
              const prenomDecrypter = decrypt(data.utilisateur.prenom);
              setUtilisateur({ nom: nomDecrypter, prenom: prenomDecrypter });
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
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        setErreur('Erreur lors de la récupération du profil');
      }
    };

    fetchProfil();
  }, [pseudo, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pseudo');
    router.push('/login');
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
      <Menu />
    </div>
  );
}
