"use client";
import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CalendarIcon, FlowerIcon, MailIcon, PlusIcon, UserIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [isBotanist, setIsBotanist] = useState(false);
  const [plantes, setPlantes] = useState([]);

  useEffect(() => {
    fetchPlantes();
    fetchIsBotanist();
  }, []);

  const fetchPlantes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/plante/afficherAll');
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
        const userIdResponse = await fetch(`http://localhost:3000/api/utilisateur/recupererId?pseudo=${pseudo}`);
        if (userIdResponse.ok) {
          const userIdData = await userIdResponse.json();
          const userId = userIdData.idUtilisateur;

          if (userId) {
            const botanistResponse = await fetch(`http://localhost:3000/api/utilisateur/estBotaniste?idUtilisateur=${userId}`);
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

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="text-xl font-bold">Arosaje</div>
        <div className="flex items-center gap-4">
          <SearchIcon className="w-6 h-6" />
          <button className="focus:outline-none" onClick={() => handleNavigation('/messages')}>
            <MailIcon className="w-6 h-6" />
            <span className="sr-only">Messages</span>
          </button>
          <button className="focus:outline-none" onClick={() => handleNavigation('/profile')}>
            <UserIcon className="w-6 h-6" />
            <span className="sr-only">Profile</span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none"
            placeholder="Trouvez une plante proche de chez vous"
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Plantes à garder</h3>
          <Link href="/chercher-plantes" className="text-blue-600 hover:underline">
            Voir plus
          </Link>
        </div>
        <div className="mt-8">
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent className="flex ">
              {plantes.map((plante, index) => (
                <CarouselItem key={index} className="basis-1/2">
                  <div>
                    <Card className="border-none shadow-none">
                      <CardContent className="flex flex-col  h-52 w-52">
                        <img src={plante.photoUrl} alt={plante.nom} className="w-full h-auto object-cover" />
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
        <button
          className="w-full px-4 py-2 mt-12 text-white bg-green-600 rounded-lg focus:outline-none hover:bg-green-700"
          onClick={() => handleNavigation('/demande-gardiennage')}
        >
          Déposer une plante
        </button>
        {isBotanist && (
        <button
          className="w-full px-4 py-2 mt-12 text-white bg-green-600 rounded-lg focus:outline-none hover:bg-green-700"
          onClick={() => handleNavigation('/ajouter-conseil')}
        >
          Ajouter un conseil
        </button>
      )}
      </main>
      <footer className="flex justify-around py-4 bg-white border-t">
        <button className="focus:outline-none" onClick={() => handleNavigation('/requests')}>
          <CalendarIcon className="w-6 h-6" />
          <span className="block text-xs">Requests</span>
        </button>
        <button className="focus:outline-none" onClick={() => handleNavigation('/chercher-plantes')}>
          <FlowerIcon className="w-6 h-6" />
          <span className="block text-xs">Find Plants</span>
        </button>
        <button className="focus:outline-none" onClick={() => handleNavigation('/messages')}>
          <MailIcon className="w-6 h-6" />
          <span className="block text-xs">Messages</span>
        </button>
      </footer>
    </div>
  );
}
