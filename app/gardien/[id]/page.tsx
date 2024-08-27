"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, HomeIcon, Leaf, MessageCircle, User } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

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
    const [conseil, setconseil] = useState<string>('');

    const router = useRouter();
    const token = localStorage.getItem('token');
    const idUtilisateur = localStorage.getItem('idUtilisateur');

    const headers = new Headers();
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }


    useEffect(() => {
        const fetchPlante = async () => {
            try {
                if (!id) throw new Error('ID invalide');
                const response = await fetch(`http://localhost:3000/api/plante/afficher?idPlante=${id}`, { headers: headers });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de la plante');
                }

                const data = await response.json();

                const planteTrouvee = data;
                
                if (planteTrouvee) {
                    setPlante(planteTrouvee);
                    console.log(plante);
                } else {
                    setError('Plante non trouvée');
                }
            } catch (error) {
                console.error('Erreur:', error);
                setError('Erreur lors de la récupération des détails de la plante' + error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlante();
    }, [id]);



    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();


        try {
            const response = await axios.post('http://localhost:3000/api/conseil/ajouter', null, {
                params: {
                    description: conseil,
                    idPlante: id,
                    idUtilisateur: idUtilisateur
                }, headers: {
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
                    <form onSubmit={handleSubmit} className="w-full mt-6 bg-white shadow-md rounded-lg p-4">
                        <h2 className="text-2xl font-bold mb-4">Ajouter un conseil</h2>
                        <div className="mb-4">
                            <label htmlFor="conseil" className="block text-gray-700 font-bold mb-2">Texte à entrer</label>
                            <textarea
                                id="conseil"
                                value={conseil}
                                onChange={(e) => setconseil(e.target.value)}
                                className="shadow appearance-none border rounded w-full h-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
                                rows={5}
                                required
                            />
                            </div>


                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                        >
                            Ajouter un conseil
                        </button>
                    </form>
                </CardContent>
            </Card>
            <br></br>
            <footer className="bg-white shadow-lg mt-auto">

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

export default PlantDetailPage;
