"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';

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
    const [dateDebut, setDateDebut] = useState<string>('');
    const [dateFin, setDateFin] = useState<string>('');
    const router = useRouter();
    const token = localStorage.getItem('token');

    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }


    useEffect(() => {
        const fetchPlante = async () => {
            try {
                if (!id) throw new Error('ID invalide');
                const response = await fetch(`http://localhost:3000/api/plante/afficher?idPlante=${id}`, {headers: headers});

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de la plante');
                }

                const data = await response.json();

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

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!dateDebut || !dateFin) {
            alert('Veuillez remplir toutes les dates.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/gardiennage/ajouter', null, {
                params: {
                    dateDebut,
                    dateFin,
                    idPlante: id
                },        headers: {
                    'Authorization': `Bearer ${token}` // Inclure le token dans l'en-tête Authorization
                  }
            });

            if (response.status === 200) {
                alert('Gardiennage demandé avec succès');
                router.push('/'); // Redirection vers la liste des plantes
            } else {
                throw new Error(response.data.message || 'Erreur lors de la demande de gardiennage');
            }
        } catch (error) {
            console.error('Erreur lors de la demande de gardiennage:', error);
            alert('Erreur lors de la demande de gardiennage');
        }
    };

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
                    <form onSubmit={handleSubmit} className="w-full mt-6 bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-2xl font-bold mb-4">Demander un gardiennage</h2>
                        <div className="mb-4">
                            <label htmlFor="dateDebut" className="block text-gray-700 font-bold mb-2">Date de début</label>
                            <input
                                type="date"
                                id="dateDebut"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="dateFin" className="block text-gray-700 font-bold mb-2">Date de fin</label>
                            <input
                                type="date"
                                id="dateFin"
                                value={dateFin}
                                onChange={(e) => setDateFin(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                        >
                            Demander un gardiennage
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlantDetailPage;
