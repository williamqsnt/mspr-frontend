'use client';

import Menu from '@/components/menu';
import { ChevronLeft, HomeIcon, Leaf, MessageCircle, MapPin, Plus, User } from 'lucide-react';
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
  const [token, setToken] = useState<string | null>(null);
  const [idUtilisateur, setIdUtilisateur] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Récupération des valeurs de localStorage côté client
    const storedToken = localStorage.getItem('token');
    const storedIdUtilisateur = localStorage.getItem('idUtilisateur');

    setToken(storedToken);
    setIdUtilisateur(storedIdUtilisateur);

    const fetchPlantes = async () => {
      if (!storedToken || !storedIdUtilisateur) {
        console.error('Token ou ID utilisateur non trouvés dans le localStorage');
        setLoading(false);
        return;
      }

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${storedToken}`);

      try {
        const response = await fetch(`https://15.237.67.223:3000/api/plante/afficherAllByUtilisateur?idUtilisateur=${storedIdUtilisateur}`, { headers });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la récupération des plantes');
        }

        setPlantes(data.plantes);
      } catch (error) {
        console.error('Erreur lors de la récupération des plantes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantes();
  }, []); // Le tableau de dépendances est vide, donc ce useEffect s'exécute seulement après le premier rendu

  const handleGardiennagesClick = () => {
    router.push('/mes-gardiennages');
  };

  const handleCardClick = (id: number) => {
    router.push(`/plantes-utilisateur/${id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="container mx-auto p-4 h-full">
        <div className="flex mb-8">
          <button className="flex-1 px-4 text-sm font-semibold rounded-l-lg bg-[#1CD672]">
            Mes plantes
          </button>
          <button onClick={handleGardiennagesClick} className="flex-1 px-4 py-2 text-sm font-semibold rounded-r-lg bg-gray-200 text-gray-600">
            Mes gardiennages
          </button>
        </div>
        <div className="flex items-center mb-4">
          <h1 className="text-lg font-bold">Liste de vos plantes</h1>
          <p className="ml-2 rounded-full bg-[#1CD672] w-6 h-6 font-semibold flex items-center justify-center">{plantes.length}</p>
        </div>

        <ul className="grid grid-cols-2 gap-4 overflow-y-auto pb-40">
          {plantes.map(plante => (
            <li key={plante.idPlante} className="bg-white shadow-md border border-gray-200 rounded-lg p-4" onClick={() => handleCardClick(plante.idPlante)}>
              <img src={plante.photoUrl} alt={plante.nom} className="w-full h-24 object-cover rounded-md mb-4" />
              <h2 className="text-xl font-semibold">{plante.nom}</h2>
              <p className="text-gray-600 text-sm">{plante.adresse}</p>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/deposer-plante">
        <button className="fixed bottom-28 right-8 bg-[#1CD672] text-black p-4 rounded-full">
          <Plus size={24} />
        </button>
      </Link>
      <Menu />
    </div>
  );
};

export default PlantesUtilisateur;
