'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Plante {
  idPlante: number;
  espece: string;
  description: string;
  nom: string;
  adresse: string;
  photoUrl: string;
  idUtilisateur: number;
  gardiennages: {
    idGardiennage: string;
    dateDebut: string;
    dateFin: string;
  }[];
}

const PlantDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { id } = params;
  const [plante, setPlante] = useState<Plante | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = localStorage.getItem('token');
  const pseudo = localStorage.getItem('pseudo');

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    const fetchPlante = async () => {
      try {
        if (!id) throw new Error('ID invalide');

        const response = await fetch(`${process.env.API_ENDPOINT}/api/plante/afficher?idPlante=${id}`, { headers });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de la plante');
        }

        const data = await response.json();

        if (data && data.plante) {
          setPlante(data.plante);
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

  const handleSavePlant = async (idGardiennage: string) => {
    if (!pseudo) {
      console.error('Pseudo non disponible');
      return;
    }

    try {
      const idResponse = await fetch(`${process.env.API_ENDPOINT}/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers });
      if (!idResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'ID utilisateur.');
      }

      const idData = await idResponse.json();
      const idUtilisateur = idData.idUtilisateur;

      const ajoutResponse = await fetch(`${process.env.API_ENDPOINT}/api/gardiennage/ajouterGardien?idGardiennage=${idGardiennage}&idUtilisateur=${idUtilisateur}`, {
        method: 'PUT',
        headers: headers,
      });

      if (!ajoutResponse.ok) {
        throw new Error('Erreur lors de l\'ajout du gardien au gardiennage.');
      }

      const conversationResponse = await fetch(`${process.env.API_ENDPOINT}/api/conversation/ajouter?`
        + new URLSearchParams({
          idUtilisateur: idUtilisateur,
          idUtilisateur_1: plante!.idUtilisateur.toString(), 
          idGardiennage: idGardiennage
        }), {
        method: 'POST',
        headers: headers,
      });

      if (!conversationResponse.ok) {
        throw new Error('Erreur lors de la création de la conversation.');
      }

      console.log('Gardiennage pris en charge avec succès.');
      toast.success('Plante prise en charge avec succès');
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error('Erreur lors de la prise en charge du gardiennage:', error);
      toast.error('Erreur lors de la prise en charge du gardiennage');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-600">Chargement...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!plante) {
    return <div className="flex justify-center items-center h-screen text-gray-500">Plante non trouvée</div>;
  }

  return (
    <div className="p-4 bg-white min-h-screen flex flex-col">
      <header className="flex items-center mb-6">
        <button onClick={() => window.history.back()} className="text-blue-600 hover:underline flex items-center">
          <ChevronLeft className="mr-2" />
          Retour
        </button>
      </header>

      <Card className="border-none shadow-md mx-auto w-full max-w-md bg-gray-100 rounded-lg">
        <CardContent className="flex flex-col items-start p-4">
          <img src={plante.photoUrl} alt={plante.nom} className="w-full h-48 object-cover rounded-lg mb-4" />

          <div className="w-full space-y-3">
            <p className="text-lg text-gray-700"><strong>Nom:</strong> {plante.nom}</p>
            <p className="text-lg text-gray-700"><strong>Espèce:</strong> {plante.espece}</p>
            <p className="text-lg text-gray-700"><strong>Description:</strong> {plante.description}</p>
            <p className="text-lg text-gray-700"><strong>Adresse:</strong> {plante.adresse}</p>
          </div>

          <div className="w-full mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Gardiennage(s):</h3>
            {plante.gardiennages.map((gardiennage) => (
              <div key={gardiennage.idGardiennage} className="mb-4 bg-white p-8 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Début:</span> {new Date(gardiennage.dateDebut).toLocaleDateString()}{" "}
                  <span className="font-medium">Fin:</span> {new Date(gardiennage.dateFin).toLocaleDateString()}
                </p>
                <button
                  className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
                  onClick={() => handleSavePlant(gardiennage.idGardiennage)}
                >
                  Prendre en gardiennage
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlantDetailPage;
