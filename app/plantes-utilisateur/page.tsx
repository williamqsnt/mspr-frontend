"use client";
import { ChevronLeft, HomeIcon, Leaf, MessageCircle, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Plante {
  idPlante: number;
  nom: string;
  adresse: string;
  photoUrl: string;
}

const PlantesUtilisateur: React.FC = () => {
  const [plantes, setPlantes] = useState<Plante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const token = localStorage.getItem('token');

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    const fetchPlantes = async () => {
      try {
        const idUtilisateur = localStorage.getItem("idUtilisateur");
        if (!idUtilisateur) {
          throw new Error("ID utilisateur non trouvé dans le localStorage");
        }

        const response = await fetch(`http://localhost:3000/api/plante/afficherAllByUtilisateur?idUtilisateur=${idUtilisateur}`, { headers: headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erreur lors de la récupération des plantes");
        }

        setPlantes(data.plantes);
      } catch (error) {
        console.error("Erreur lors de la récupération des plantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantes();
  }, []);


  const handleCardClick = (id: number) => {
    router.push(`/plantes-utilisateur/${id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="container mx-auto p-4 h-full">
        <h1 className="text-2xl font-bold mb-4">Liste de vos plantes</h1>
        <ul className="grid grid-cols-2 gap-4">
          {plantes.map(plante => (
            <li key={plante.idPlante} className="bg-white shadow-md rounded-lg p-4" onClick={() => handleCardClick(plante.idPlante)}>
              <img src={plante.photoUrl} alt={plante.nom} className="w-full h-24 object-cover rounded-md mb-4" />
              <h2 className="text-xl font-semibold">{plante.nom}</h2>
              <p className="text-gray-600">{plante.adresse}</p>
            </li>
          ))}
        </ul>
      </div>
      <footer className="bg-white shadow-lg">

        <div className="flex">
          <div className="w-11/12"></div>
          <button className="w-full px-4 py-2 mb-4 mr-8 text-white bg-green-600 rounded-full focus:outline-none hover:bg-green-700 flex items-center justify-center" onClick={() => router.push('/deposer-plante')}><Plus />Ajouter plante</button>
        </div>
        <nav className="flex flex-col items-center w-full">
          <div className="w-full flex justify-center">
            <div className="w-full h-px bg-gray-600 my-2"> </div>
          </div>
          <div className="flex justify-around items-center py-3 w-full">
            <Link href="/" passHref>
              <p className="flex flex-col items-center">
                <HomeIcon size={25} />
                <span className="text-xs mt-1">Accueil</span>
              </p>
            </Link>
            <Link href="/plantes-utilisateur" passHref>
              <p className="flex flex-col items-center">
                <Leaf size={25} />
                <span className="text-xs mt-1">Plantes</span>
              </p>
            </Link>
            <Link href="/messages" passHref>
              <p className="flex flex-col items-center">
                <MessageCircle size={25} />
                <span className="text-xs mt-1">Messages</span>
              </p>
            </Link>
            <Link href="/profile" passHref>
              <p className="flex flex-col items-center">
                <User size={25} />
                <span className="text-xs mt-1">Profil</span>
              </p>
            </Link>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default PlantesUtilisateur;
