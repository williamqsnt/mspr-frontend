"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

interface Plante {
  idPlante: number;
  espece: string;
  description: string;
  nom: string;
  adresse: string;
  photoUrl: string;
  idUtilisateur: number;
}

const PlantDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;
  const [plante, setPlante] = useState<Plante | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlante = async () => {
      try {
        if (!id) throw new Error('ID invalide');
        const response = await fetch(`http://localhost:3000/api/plante/afficher?idPlante=${id}`);

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de la plante');
        }

        const data = await response.json();
        console.log('Données reçues:', data);

        // Trouver la plante correspondant à l'ID
        const planteTrouvee = data.plantes.find((p: Plante) => p.idPlante === parseInt(id));

        if (planteTrouvee) {
          setPlante(planteTrouvee);
        } else {
          setError('Plante non trouvée');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de la récupération des détails de la plante');
      } finally {
        setLoading(false);
      }
    };

    fetchPlante();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!plante) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Plante non trouvée</div>;
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 bg-gray-50 min-h-screen flex flex-col">
      <button onClick={() => window.history.back()} className="flex items-center mb-6 text-blue-600 hover:underline">
        <ChevronLeft className="mr-2" />
        Retour
      </button>
      <Card className="border-none shadow-lg mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center p-4">
          <img src={plante.photoUrl} alt={plante.nom} className="w-full h-64 object-cover rounded-lg mb-4" />
          <h1 className="text-3xl font-bold mb-2">{plante.nom}</h1>
          <p className="text-xl text-gray-700 mb-2">{plante.espece}</p>
          <p className="text-base text-gray-600 mb-4">{plante.description}</p>
          <p className="text-sm text-gray-500">Adresse: {plante.adresse}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantDetailPage;
