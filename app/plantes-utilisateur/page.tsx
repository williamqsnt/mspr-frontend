"use client";
import { ChevronLeft } from 'lucide-react';
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

  useEffect(() => {
    const fetchPlantes = async () => {
      try {
        const idUtilisateur = localStorage.getItem("idUtilisateur");
        if (!idUtilisateur) {
          throw new Error("ID utilisateur non trouvé dans le localStorage");
        }

        const response = await fetch(`http://localhost:3000/api/plante/afficherAllByUtilisateur?idUtilisateur=${idUtilisateur}`);
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

  if (loading) {
    return <p>Chargement...</p>;
  }

  const handleCardClick = (id: number) => {
    router.push(`/plantes-utilisateur/${id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <button onClick={() => window.history.back()} className="flex mb-4">
        <ChevronLeft className="text-black" />
      </button>
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
  );
};

export default PlantesUtilisateur;
