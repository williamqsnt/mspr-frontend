'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Trash, Edit, SeparatorHorizontal } from 'lucide-react';
import axios from 'axios';
import Menu from '@/components/menu';
import toast from 'react-hot-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PopoverClose } from '@radix-ui/react-popover';
import { Separator } from '@/components/ui/separator';

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
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editFields, setEditFields] = useState<Partial<Plante>>({});
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Récupération du token et de l'idUtilisateur depuis localStorage côté client
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);

        const fetchPlante = async () => {
            if (!id) {
                setError('ID invalide');
                setLoading(false);
                return;
            }

            if (!storedToken) {
                setError('Token non trouvé dans localStorage');
                setLoading(false);
                return;
            }

            const headers = new Headers();
            headers.append('Authorization', `Bearer ${storedToken}`);

            try {
                const response = await fetch(`http://15.237.67.223:3000/api/plante/afficher?idPlante=${id}`, { headers });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de la plante');
                }

                const data = await response.json();

                if (data && data.plante) {
                    setPlante(data.plante);
                    setEditFields({
                        nom: data.plante.nom,
                        espece: data.plante.espece,
                        description: data.plante.description,
                        adresse: data.plante.adresse,
                    });
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
    }, [id]); // Dépendance sur id pour recharger les détails si id change

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!dateDebut || !dateFin) {
            toast.error('Veuillez remplir les dates de début et de fin');
            return;
        }

        if (dateDebut > dateFin) {
            toast.error('La date de fin ne peut pas être antérieure à la date de début');
            return;
        }

        // Si l'écart entre la date de début et fin est supérieur à 1 an, ce n'est pas possible
        const diff = Math.abs(new Date(dateFin).getTime() - new Date(dateDebut).getTime());
        const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        if (diffDays > 365) {
            toast.error('La date de fin ne peut pas être supérieure à 1 an après la date de début');
            return;
        }
        if (new Date(dateDebut) < new Date()) {
            toast.error('La date de début ne peut pas être inférieure à la date actuelle');
            return;
        }

        try {
            if (!token) {
                toast.error('Token non trouvé');
                return;
            }

            const response = await axios.post('http://15.237.67.223:3000/api/gardiennage/ajouter', null, {
                params: {
                    dateDebut,
                    dateFin,
                    idPlante: id
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                toast.success('Demande de gardiennage envoyée avec succès');
                router.push('/plantes-utilisateur');
            } else {
                toast.error(response.data.message || 'Erreur lors de la demande de gardiennage');
                throw new Error(response.data.message || 'Erreur lors de la demande de gardiennage');
            }
        } catch (error) {
            toast.error('Erreur lors de la demande de gardiennage');
            console.error('Erreur lors de la demande de gardiennage:', error);
        }
    };

    const handleModify = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            if (!token) {
                toast.error('Token non trouvé');
                return;
            }

            const response = await axios.put('http://15.237.67.223:3000/api/plante/modifier', null, {
                params: {
                    idPlante: id,
                    ...editFields
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                toast.success('Plante modifiée avec succès');
                setPlante(response.data.plante);
                setIsEditing(false);
            } else {
                throw new Error(response.data.message || 'Erreur lors de la modification de la plante');
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la plante:', error);
            alert('Erreur lors de la modification de la plante');
        }
    };

    const handleDelete = async () => {
        try {
            if (!token) {
                toast.error('Token non trouvé');
                return;
            }

            const response = await axios.delete('http://15.237.67.223:3000/api/plante/supprimer', {
                params: { idPlante: id },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                toast.success('Plante supprimée avec succès');
                router.push('/');
            } else {
                toast.error('Erreur lors de la suppression de la plante');
                throw new Error(response.data.message || 'Erreur lors de la suppression de la plante');
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression, cette plante a des gardiennages en cours');
            console.error('Erreur lors de la suppression de la plante:', error);
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
        <div className="min-h-screen flex flex-col pb-24 overflow-y-auto">
            <div className="bg-[#1CD672] p-4">
                <button onClick={() => window.history.back()} className="flex items-center hover:underline">
                    <ChevronLeft />
                </button>
            </div>

            <Card className="border-none mx-auto max-w-lg overflow-y-auto">
                <CardContent className="flex flex-col items-center p-4">
                    <img src={plante.photoUrl} alt={plante.nom} className="w-full h-64 object-cover rounded-lg mb-4" />
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-black font-bold py-2 px-4 rounded flex"
                    >
                        <Edit className="inline-block mr-2" />
                        {isEditing ? 'Annuler' : 'Modifier'}
                    </button>
                    <div className={`w-full mt-8 mb-12 ${isEditing ? 'bg-white' : ''}`}>
                        <h1 className="text-base mb-2">Nom : {isEditing ? (
                            <input
                                type="text"
                                value={editFields.nom}
                                onChange={(e) => setEditFields({ ...editFields, nom: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        ) : plante.nom}</h1>
                        <p className="text-base mb-2">Espèce : {isEditing ? (
                            <input
                                type="text"
                                value={editFields.espece}
                                onChange={(e) => setEditFields({ ...editFields, espece: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        ) : plante.espece}</p>
                        <p className="text-base mb-4">Description : {isEditing ? (
                            <textarea
                                value={editFields.description}
                                onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        ) : plante.description}</p>
                        <p className="text-base mb-4">Adresse: {isEditing ? (
                            <input
                                type="text"
                                value={editFields.adresse}
                                onChange={(e) => setEditFields({ ...editFields, adresse: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        ) : plante.adresse}</p>

                        {isEditing && (
                            <button
                                onClick={handleModify}
                                className="bg-[#1CD672] text-white font-bold py-2 px-4 rounded mt-4"
                            >
                                Sauvegarder
                            </button>
                        )}
                    </div>
                    <Separator />
                    <form onSubmit={handleSubmit} className="w-full mt-12 bg-white rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Demander un gardiennage</h2>
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
                            className="bg-[#1CD672] hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                        >
                            Demander un gardiennage
                        </button>
                    </form>
                </CardContent>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button className="bg-white hover:bg-white text-red-500 mt-12 font-bold py-2 px-4 rounded flex items-center w-full">
                            Supprimer
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-4 bg-white shadow-lg rounded">
                        <p className="text-lg mb-4">Êtes-vous sûr de vouloir supprimer cette plante ?</p>
                        <div className="flex space-x-4">
                            <Button
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
                            >
                                Supprimer
                            </Button>
                            <PopoverClose asChild>
                                <Button className="bg-gray-500 hover:bg-gray-400 text-white font-bold py-2 px-4 rounded">
                                    Annuler
                                </Button>
                            </PopoverClose>

                        </div>
                    </PopoverContent>
                </Popover>
            </Card>
            <Menu />
        </div>
    );
};

export default PlantDetailPage;
