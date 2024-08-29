"use client";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Link from 'next/link';
import Menu from '@/components/menu';

interface Plante {
  idPlante: number;
  nom: string;
  photoUrl: string;
  adresse: string;
}

const HomePage: React.FC = () => {
  const router = useRouter();
  const [isBotanist, setIsBotanist] = useState<boolean>(false);
  const [plantes, setPlantes] = useState<Plante[]>([]);
  const [addresses, setAddresses] = useState<{ adresse: string; idPlante: string }[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedPseudo = localStorage.getItem('pseudo');
    setToken(storedToken);
    setPseudo(storedPseudo);

    if (!storedToken) {
      router.push('/login');
      return;
    }

    // Vérifier la validité du token
    validateToken(storedToken)
      .then(isValid => {
        if (!isValid) {
          router.push('/login');
        } else {
          fetchPlantes();
          fetchIsBotanist();
          fetchAddresses();
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      const response = await fetch(`${process.env.API_ENDPOINT}/api/utilisateur/validerToken`, { headers });

      if (response.ok) {
        const data = await response.json();
        return data.valide; 
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  };

  const fetchPlantes = async () => {
    if (!token) return;

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      const response = await fetch(`${process.env.API_ENDPOINT}/api/plante/recupererInfos`, { headers });
      if (response.ok) {
        const data = await response.json();
        setPlantes(data.plantes);
      } else {
        console.error('Erreur lors de la récupération des plantes');
        setError('Erreur lors de la récupération des plantes');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des plantes:', error);
      setError('Erreur lors de la récupération des plantes');
    }
  };

  const fetchIsBotanist = async () => {
    if (!token || !pseudo) return;

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      const userIdResponse = await fetch(`${process.env.API_ENDPOINT}/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers });
      if (userIdResponse.ok) {
        const userIdData = await userIdResponse.json();
        const userId = userIdData.idUtilisateur;
        if (userId) {
          const botanistResponse = await fetch(`${process.env.API_ENDPOINT}/api/utilisateur/estBotaniste?idUtilisateur=${userId}`, { headers });
          if (botanistResponse.ok) {
            const botanistData = await botanistResponse.json();
            setIsBotanist(botanistData.estBotaniste);
          } else {
            console.error('Erreur lors de la vérification du statut botaniste');
            setError('Erreur lors de la vérification du statut botaniste');
          }
        }
      } else {
        console.error('Erreur lors de la récupération de l\'ID utilisateur');
        setError('Erreur lors de la récupération de l\'ID utilisateur');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur et la vérification du statut botaniste:', error);
      setError('Erreur lors de la récupération de l\'ID utilisateur et la vérification du statut botaniste');
    }
  };

  const fetchAddresses = async () => {
    if (!token) return;

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);
      const response = await fetch(`${process.env.API_ENDPOINT}/api/plante/recupererlocalisation`, { headers });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des adresses de plantes.');
      }
      const responseData = await response.json();
      setAddresses(responseData.adresses);
    } catch (error) {
      console.error('Erreur lors de la récupération des adresses:', error);
      setError('Erreur lors de la récupération des adresses');
    }
  };

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleCardClick = (id: number) => {
    router.push(`/plante/${id}`);
  };

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="text-xl font-bold">Arosaje</div>
      </header>
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Plantes en besoin d&apos;urgence</h3>
          <Link href="/plantes-gardiennage" className="text-blue-600 hover:underline">
            Voir plus
          </Link>
        </div>
        <div className="mt-8">
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent className="flex ">
              {plantes.map((plante) => (
                <CarouselItem key={plante.idPlante} className="basis-1/2">
                  <div>
                    <Card className="border-none shadow-none" onClick={() => handleCardClick(plante.idPlante)}>
                      <CardContent className="flex flex-col h-52 w-52">
                        <img src={plante.photoUrl} alt={plante.nom} className="w-full h-48 object-cover" />
                        <h2 className="text-lg font-bold">{plante.nom}</h2>
                        <p className="text-sm text-gray-600">{plante.adresse}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {isBotanist && (
          <button
            className="w-full px-4 py-2 mt-12 text-white bg-green-600 rounded-lg focus:outline-none hover:bg-green-700"
            onClick={() => handleNavigation('/gardien')}
          >
            Ajouter un conseil
          </button>
        )}
      </main>

      <Menu />
    </div>
  );
};

export default HomePage;
