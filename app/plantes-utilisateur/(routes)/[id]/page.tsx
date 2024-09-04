"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Trash, Edit } from 'lucide-react';
import axios from 'axios';
import Menu from '@/components/menu';
import toast from 'react-hot-toast';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PopoverClose } from '@radix-ui/react-popover';
import { Separator } from '@/components/ui/separator';

interface Plante {
    idPlante: number;
    description: string;
    nom: string;
    adresse: string;
    photoUrl: string;
    idUtilisateur: number;
    idEspece: number;
    gardiennages: any[];
    espece: {
        libelle: string;
    };
}

interface Espece {
    idEspece: number;
    libelle: string;
}

const PlantDetailPage: React.FC<{ params: { id: string } }> = ({ params }) => {
    const { id } = params;
    const [plante, setPlante] = useState<Plante | null>(null);
    const [especes, setEspeces] = useState<Espece[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [dateDebut, setDateDebut] = useState<string>('');
    const [dateFin, setDateFin] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editFields, setEditFields] = useState<Partial<Plante>>({});
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
                const response = await fetch(`http://localhost:3000/api/plante/afficher?idPlante=${id}`, { headers });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des détails de la plante');
                }

                const data = await response.json();

                if (data && data.plante) {
                    setPlante(data.plante);
                    setEditFields({
                        nom: data.plante.nom,
                        idEspece: data.plante.idEspece,
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

        const fetchEspeces = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/espece/afficher');
                setEspeces(response.data.especes);
            } catch (error) {
                console.error('Erreur lors de la récupération des espèces :', error);
            }
        };

        fetchPlante();
        fetchEspeces();

    }, [id]);

    const handleModify = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await axios.put('http://localhost:3000/api/plante/modifier', null, {
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
                router.push(`/`);
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
            const response = await axios.delete('http://localhost:3000/api/plante/supprimer', {
                params: { idPlante: id },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                toast.success('Plante supprimée avec succès');
                router.push('/');
            } else {
                toast.error(error);
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
                    <div className={`w-full mt-8 mb-12 ${isEditing ? ' bg-white' : ''}`}>
                        <h1 className="text-base mb-2">Nom : {isEditing ? (
                            <input
                                type="text"
                                value={editFields.nom}
                                onChange={(e) => setEditFields({ ...editFields, nom: e.target.value })}
                                className="border p-2 rounded w-full"
                            />
                        ) : plante.nom}</h1>

                        <p className="text-base mb-2">Espèce : {isEditing ? (
                            <select
                                value={editFields.idEspece ?? ''}
                                onChange={(e) => setEditFields({ ...editFields, idEspece: parseInt(e.target.value) })}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">Sélectionner une espèce...</option>
                                {especes.map((espece) => (
                                    <option key={espece.idEspece} value={espece.idEspece}>
                                        {espece.libelle}
                                    </option>
                                ))}
                            </select>
                        ) : plante.espece ? plante.espece.libelle : 'Espèce non définie'}</p>

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
                    <form onSubmit={handleModify} className="w-full mt-12 bg-white rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Demander un gardiennage</h2>
                        <div className="mb-4">
                            <label htmlFor="dateDebut" className="block text-gray-700 font-bold mb-2">Date de début</label>
                            <input
                                type="date"
                                id="dateDebut"
                                value={dateDebut}
                                onChange={(e) => setDateDebut(e.target.value)}
                                className="border rounded-lg p-2 w-full"
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
                                className="border rounded-lg p-2 w-full"
                                required
                            />
                        </div>
                        <Button className="bg-[#1CD672] text-white font-bold py-2 px-4 rounded" type="submit">
                            Envoyer
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Popover>
                <PopoverTrigger asChild>
                    <Button className="bg-[#1CD672] text-white font-bold py-2 px-4 rounded flex items-center mx-auto mt-4">
                        <Trash className="mr-2" /> Supprimer la plante
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold mb-4">Êtes-vous sûr de vouloir supprimer cette plante ?</h2>
                    <p className="text-gray-600 mb-4">Cette action est irréversible.</p>
                    <PopoverClose asChild>
                        <Button className="bg-red-500 text-white font-bold py-2 px-4 rounded" onClick={handleDelete}>
                            Supprimer
                        </Button>
                    </PopoverClose>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default PlantDetailPage;
