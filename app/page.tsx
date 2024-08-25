'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { MailIcon, UserIcon, SearchIcon, MapPin, CalendarIcon, User, HomeIcon, Leaf, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import MapComponent from '@/components/map';

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
  const token = localStorage.getItem('token');
  const [addresses, setAddresses] = useState<{ adresse: string; idPlante: string }[]>([]);

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    fetchPlantes();
    fetchIsBotanist();
  }, []);

  const fetchPlantes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/plante/recupererInfos', { headers: headers });
      if (response.ok) {
        const data = await response.json();
        setPlantes(data.plantes);
      } else {
        console.error('Erreur lors de la récupération des plantes');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des plantes:', error);
    }
  };

  const fetchIsBotanist = async () => {
    try {
      const pseudo = localStorage.getItem('pseudo');
      if (pseudo) {
        const userIdResponse = await fetch(`http://localhost:3000/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers: headers });
        if (userIdResponse.ok) {
          const userIdData = await userIdResponse.json();
          const userId = userIdData.idUtilisateur;

          if (userId) {
            const botanistResponse = await fetch(`http://localhost:3000/api/utilisateur/estBotaniste?idUtilisateur=${userId}`, { headers: headers });
            if (botanistResponse.ok) {
              const botanistData = await botanistResponse.json();
              setIsBotanist(botanistData.estBotaniste);
            } else {
              console.error('Erreur lors de la vérification du statut botaniste');
            }
          }
        } else {
          console.error('Erreur lors de la récupération de l\'ID utilisateur');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'ID utilisateur et la vérification du statut botaniste:', error);
    }
  };

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const headers = new Headers();
        if (token) {
          headers.append('Authorization', `Bearer ${token}`);
        }

        const response = await fetch("http://localhost:3000/api/plante/recupererlocalisation", { headers });
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des adresses de plantes.");
        }

        const responseData = await response.json();
        setAddresses(responseData.adresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    }
    fetchAddresses();
  }, []);

  async function handleSavePlant(idPlante: string, idGardiennage: string, idUtilisateur: string) {
    // votre logique ici
  }


  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleCardClick = (id: number) => {
    router.push(`/plante/${id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="text-xl font-bold">Arosaje</div>
      </header>
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Plantes en besoin d'urgence</h3>
          <Link href="/chercher-plantes" className="text-blue-600 hover:underline">
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
        <MapComponent addresses={addresses} height="25vh" onSave={handleSavePlant} />

      
        {isBotanist && (
          <button
            className="w-full px-4 py-2 mt-12 text-white bg-green-600 rounded-lg focus:outline-none hover:bg-green-700"
            onClick={() => handleNavigation('/gardien')}
          >
            Ajouter un conseil
          </button>
        )}
      </main>

      <footer className="bg-white shadow-lg">
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

export default HomePage;
