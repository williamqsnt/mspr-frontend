"use client";
import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";

interface Plante {
  idPlante: number;
  espece: string;
  description: string;
  nom: string;
  adresse: string;
  photoUrl: string;
  idUtilisateur: number;
}

export default function GardienPage() {
  const [plantes, setPlantes] = useState<Plante[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchPlantes();
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

  const handleClick = (idPlante: number) => {
    localStorage.setItem('idPlante', idPlante.toString());
    router.push('/donner-conseil');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div className="text-xl font-bold">Donner Conseil</div>
      </header>
      <main className="flex-1 p-4">
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plantes.map((plante) => (
            <div key={plante.idPlante} onClick={() => handleClick(plante.idPlante)}>
              <Card className="border-none shadow-none cursor-pointer">
                <CardContent className="flex flex-col h-52 w-full">
                  <img src={plante.photoUrl} alt={plante.nom} className="w-full h-auto object-cover" />
                  <h2 className="text-lg font-bold">{plante.nom}</h2>
                  <p className="text-sm text-gray-600">{plante.adresse}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
