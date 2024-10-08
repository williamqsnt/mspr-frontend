'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Menu from '@/components/menu';

interface Plante {
  idPlante: number;
  espece: string;
  description: string;
  nom: string;
  adresse: string;
  photoUrl: string;
  idUtilisateur: number;
}

export default function PlanteDetailsPage() {
  const router = useRouter();
  const [plante, setPlante] = useState<Plante | null>(null);
  const [conseil, setConseil] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedIdPlante = localStorage.getItem('idPlante');
    const pseudo = localStorage.getItem('pseudo');

    setToken(storedToken);

    if (storedIdPlante) {
      fetchPlanteDetails(storedIdPlante);
    } else {
      console.error('ID de la plante non trouvé dans le localStorage');
    }

    const fetchUserId = async () => {
      try {
        if (pseudo) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/utilisateur/recupererId?pseudo=${pseudo}`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUserId(data.idUtilisateur);
          } else {
            console.error('Erreur lors de la récupération de l\'ID utilisateur');
          }
        } else {
          console.error('Pseudo non trouvé dans le localStorage');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
      }
    };

    fetchUserId();
  }, []);

  const fetchPlanteDetails = async (id: string) => {
    try {
      console.log(`Fetching details for plante ID: ${id}`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/plante/afficher?idPlante=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Plante details fetched successfully:', data);

        if (data.plantes && data.plantes.length > 0) {
          setPlante(data.plantes[0]);
        } else {
          console.error('Aucune plante trouvée dans la réponse de l\'API');
        }
      } else {
        console.error('Erreur lors de la récupération des détails de la plante');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la plante:', error);
    }
  };

  const handleConseilSubmit = async () => {
    if (!userId) {
      console.error('ID utilisateur non disponible');
      return;
    }

    try {
      const idPlante = localStorage.getItem('idPlante');
      if (!idPlante) {
        console.error('ID de la plante non trouvé dans le localStorage');
        return;
      }

      const url = new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/conseil/ajouter`);
      url.searchParams.append('description', conseil);
      url.searchParams.append('idPlante', idPlante);
      url.searchParams.append('idUtilisateur', userId.toString());

      console.log('Submitting conseil to URL:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Conseil ajouté avec succès');
        setConseil('');
      } else {
        console.error('Erreur lors de l\'ajout du conseil');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du conseil:', error);
    }
  };

  if (!plante) {
    console.log('Plante is still loading...');
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="text-xl font-bold">Détails de la Plante</div>
        <div className="flex items-center gap-4">
          <button className="focus:outline-none" onClick={() => router.back()}>
            <span className="text-sm text-blue-600">Retour</span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="flex flex-col items-center">
          <img src={plante.photoUrl} alt={plante.nom} className="w-52 h-52 object-cover" />
          <h2 className="text-2xl font-bold mt-4">{plante.nom}</h2>
          <p className="text-sm text-gray-600">{plante.description}</p>
          <p className="text-sm text-gray-600">{plante.adresse}</p>
          <div className="mt-4 w-full">
            <textarea
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
              placeholder="Ajouter un conseil"
              value={conseil}
              onChange={(e) => setConseil(e.target.value)}
            />
            <button
              className="w-full px-4 py-2 mt-2 text-white bg-green-600 rounded-lg focus:outline-none hover:bg-green-700"
              onClick={handleConseilSubmit}
            >
              Ajouter le conseil
            </button>
          </div>
        </div>
      </main>
      <Menu />
    </div>
  );
}
