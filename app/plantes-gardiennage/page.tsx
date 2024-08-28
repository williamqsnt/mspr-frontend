'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import Menu from '@/components/menu';

interface Plante {
    idPlante: number;
    nom: string;
    photoUrl: string;
    adresse: string;
}

const ChercherPlantes: React.FC = () => {
    const router = useRouter();
    const [plantes, setPlantes] = useState<Plante[]>([]);
    const token = localStorage.getItem('token');

    const headers = new Headers();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    useEffect(() => {
        fetchPlantes();
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

    const handleCardClick = (id: number) => {
        router.push(`/plante/${id}`);
    };

    return (
        <div>
            <header className="bg-green-600 p-4 w-full flex items-center fixed">
                <button onClick={() => window.history.back()} className="flex">
                    <ChevronLeft className="text-white" />
                </button>
                <h1 className="text-white text-2xl font-bold ml-4">
                    Toutes les plantes
                </h1>
            </header>
            <div className="flex flex-col items-center min-h-screen bg-background p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-24">
                    {plantes.map((plante) => (
                        <Card key={plante.idPlante} className="cursor-pointer" onClick={() => handleCardClick(plante.idPlante)}>
                            <CardContent className="flex flex-col items-center">
                                <img src={plante.photoUrl} alt={plante.nom} className="w-full h-48 object-cover rounded" />
                                <h2 className="text-lg font-bold mt-4">{plante.nom}</h2>
                                <p className="text-sm text-gray-600">{plante.adresse}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div> 
            <Menu />
            </div>
    );
};

export default ChercherPlantes;
