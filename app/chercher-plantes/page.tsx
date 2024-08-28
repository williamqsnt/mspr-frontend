"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ChercherPlantes = () => {
    const router = useRouter();

    interface Plante {
        idPlante: number;
        nom: string;
        photoUrl: string;
        adresse: string;
    }

    const [plantes, setPlantes] = useState<Plante[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Récupérer le token depuis localStorage après le montage du composant
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    useEffect(() => {
        // Appeler fetchPlantes uniquement après avoir récupéré le token
        if (token) {
            fetchPlantes();
        }
    }, [token]);

    const fetchPlantes = async () => {
        try {
            const headers = new Headers();
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            }

            const response = await fetch('http://localhost:3000/api/plante/recupererInfos', { headers: headers });
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
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (id: number) => {
        router.push(`/plante/${id}`);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="flex justify-center items-center h-screen">Chargement...</div>
        </div>
    );
}

export default ChercherPlantes;

/* // FILEPATH: /Users/williamquesnot/Desktop/MSPR/mspr-frontend/app/chercher-plantes/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import getCoordinatesFromAddress from '@/utils/getCoordinatesFromAddress';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Menu from '@/components/menu';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


interface Address {
  adresse: string;
  idPlante: string;
}

export default function ChercherPlantepage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [markerList, setMarkerList] = useState<JSX.Element[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedPseudo = localStorage.getItem('pseudo');
      setToken(storedToken);
      setPseudo(storedPseudo);
    }
  }, []);

  useEffect(() => {
    async function fetchAddresses() {
      if (!token) return;

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);

      try {
        const response = await fetch("http://localhost:3000/api/plante/recupererlocalisation", { headers });
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des adresses de plantes.");
        }
        const responseData = await response.json();
        const fetchedAddresses: Address[] = responseData.adresses;
        setAddresses(fetchedAddresses);

        const markers = await Promise.all(
          fetchedAddresses.map(async (addressObj) => {
            const coordinates = await getCoordinatesFromAddress(addressObj.adresse);
            if (coordinates) {
              return createMarker(coordinates, addressObj.adresse, addressObj.idPlante);
            }
            return null;
          })
        );
        setMarkerList(markers.filter((marker) => marker !== null) as JSX.Element[]);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    }
    fetchAddresses();
  }, [token]);

  async function getPlantDataFromAPI(idPlante: string) {
    if (!token) return null;

    try {
      const url = `http://localhost:3000/api/plante/afficher?idPlante=${idPlante}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching plant data:', error);
    }

    return null;
  }

  async function handleSavePlant(idPlante: string, idGardiennage: string, idUtilisateur: string) {
    if (!pseudo) {
      console.error('Pseudo is not available');
      return;
    }

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${token}`);

      const idResponse = await fetch(`http://localhost:3000/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers });
      if (!idResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'ID utilisateur.');
      }

      const idData = await idResponse.json();
      const idUtilisateur1 = idData.idUtilisateur;

      const ajoutResponse = await fetch(`http://localhost:3000/api/gardiennage/ajouterGardien?idGardiennage=${idGardiennage}&idUtilisateur=${idUtilisateur1}`, {
        method: 'PUT',
        headers,
      });

      if (!ajoutResponse.ok) {
        throw new Error('Erreur lors de l\'ajout du gardien au gardiennage.');
      }

      const conversationResponse = await fetch(`http://localhost:3000/api/conversation/ajouter?` + new URLSearchParams({
        idUtilisateur: idUtilisateur1,
        idUtilisateur_1: idUtilisateur,
        idGardiennage: idGardiennage
      }), {
        method: 'POST',
        headers,
      });

      if (!conversationResponse.ok) {
        throw new Error('Erreur lors de la création de la conversation.');
      }
      router.push('/');
      toast.success('Plante gardée avec succès.');
      console.log('Plante sauvegardée avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la plante:', error);
    }
  }

  function createMarker(latLng: LatLngExpression, address: string, idPlante: string): JSX.Element {
    return (
      <Marker key={address} position={latLng}>
        <Popup className="min-w-80 bg-none">
          <PlantDetails idPlante={idPlante} onSave={handleSavePlant} />
        </Popup>
      </Marker>
    );
  }

  function PlantDetails({ idPlante, onSave }: { idPlante: string; onSave: (idPlante: string, idGardiennage: string, idUtilisateur: string) => void; }) {
    const [plantDetails, setPlantDetails] = useState<any>(null);

    useEffect(() => {
      async function fetchPlantDetails() {
        const data = await getPlantDataFromAPI(idPlante);
        setPlantDetails(data);
      }

      fetchPlantDetails();
    }, [idPlante]);

    if (!plantDetails) {
      return <div>Chargement...</div>;
    }

    if (plantDetails && plantDetails.plante) {
      const plant = plantDetails.plante;
      return (
        <div className="p-4 bg-white rounded-lg max-w-xs">
          <h2 className="text-base font-bold mb-2 truncate">{plant.adresse}</h2>
          <img
            src={plant.photoUrl}
            alt={plant.nom}
            className="w-full h-32 object-cover rounded-md mb-4"
          />
          <p className="">
            <span className="font-semibold">Nom:</span> {plant.nom}
          </p>
          <p className="">
            <span className="font-semibold">Espèce:</span> {plant.espece}
          </p>
          <p className="">
            <span className="font-semibold">Description:</span> {plant.description}
          </p>
          <div>
            <h3 className="text-base font-semibold mb-2">Gardiennage(s):</h3>
            {plant.gardiennages.map((gardiennage: any, index: any) => (
              <div key={index} className="mb-4 p-2 border border-gray-200 rounded-md shadow-sm">
                <p className="mb-1">
                  <span className="font-semibold">Gardien:</span> {gardiennage.gardien}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Date de début:</span> {gardiennage.dateDebut}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Date de fin:</span> {gardiennage.dateFin}
                </p>
                <button
                  onClick={() => onSave(idPlante, gardiennage.idGardiennage, gardiennage.idUtilisateur)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md"
                >
                  Sauvegarder
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div>Aucune plante trouvée</div>;
  }

  return (
    <div>
      <main>
        <div style={{ height: "80vh", width: "100%" }}>
          <MapContainer center={[45.76, 4.83]} zoom={13} className="h-[91vh]">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markerList}
          </MapContainer>
        </div>
      </main>
      <div className="z-50">
        <Menu />
      </div>
    </div>
  );
} */
