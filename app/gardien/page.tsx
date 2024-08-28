'use client';

import Menu from '@/components/menu';
import { ChevronLeft, HomeIcon, Leaf, MapPin, MessageCircle, Plus, User } from 'lucide-react';
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
  const [token, setToken] = useState<string | null>(null); // État pour le token
  const router = useRouter();

  useEffect(() => {
    // Récupération du token côté client
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    const fetchPlantes = async () => {
      try {
        const headers = new Headers();
        if (storedToken) {
          headers.append('Authorization', `Bearer ${storedToken}`);
        }

        const response = await fetch(`http://localhost:3000/api/plante/afficherAll`, { headers });
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
  }, []); // Notez que vous pouvez également ajouter des dépendances ici si nécessaire

  const handleCardClick = (id: number) => {
    router.push(`/gardien/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16"> {/* Ajout de pb-16 pour l'espace au-dessus du footer */}
      <div className="container mx-auto p-4 flex-grow">

        <h1 className="text-lg font-bold mb-4">Liste de vos plantes</h1>
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
      <Menu />
    </div>
  );
};

export default PlantesUtilisateur;
