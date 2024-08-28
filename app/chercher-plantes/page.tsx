"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import getCoordinatesFromAddress from "@/utils/getCoordinatesFromAddress";
import { CalendarIcon, ChevronLeft, FlowerIcon, HomeIcon, Leaf, MailIcon, MessageCircle, User, UserIcon, MapPin, Link } from 'lucide-react';
import axios from "axios";
import { useRouter } from 'next/navigation';
import Menu from "@/components/menu";
import toast from "react-hot-toast";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
  }
);

interface Address {
  adresse: string;
  idPlante: string;
}

export default function ChercherPlantepage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [markerList, setMarkerList] = useState<JSX.Element[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(null); // State to track selected plant data
  const token = localStorage.getItem('token');
  const pseudo = localStorage.getItem('pseudo'); // Assurez-vous que le pseudo est stocké dans le localStorage
  const router = useRouter();

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/plante/recupererlocalisation", { headers: headers }
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des adresses de plantes."
          );
        }
        const responseData = await response.json();

        const fetchedAddresses: Address[] = responseData.adresses;

        setAddresses(fetchedAddresses);

        const markers = await Promise.all(
          fetchedAddresses.map(async (addressObj) => {
            const coordinates = await getCoordinatesFromAddress(
              addressObj.adresse
            );
            if (coordinates) {
              return createMarker(coordinates, addressObj.adresse, addressObj.idPlante);
            }
            return null;
          })
        );
        setMarkerList(
          markers.filter((marker) => marker !== null) as JSX.Element[]
        );
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    }
    fetchAddresses();
  }, []);

  // Fonction pour récupérer les données de la plante à partir de l'API
  async function getPlantDataFromAPI(idPlante: string) {
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

  // Méthode pour gérer l'enregistrement de la plante
  async function handleSavePlant(idPlante: string, idGardiennage: string, idUtilisateur: string) {
    if (!pseudo) {
      console.error('Pseudo is not available');
      return;
    }

    try {
      // Étape 1: Récupérer l'ID de l'utilisateur
      const idResponse = await fetch(`http://localhost:3000/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers: headers });
      if (!idResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'ID utilisateur.');
      }

      const idData = await idResponse.json();
      const idUtilisateur1 = idData.idUtilisateur;


      // Etape 2: Ajouter le gardien au gardiennage
      const ajoutResponse = await fetch(`http://localhost:3000/api/gardiennage/ajouterGardien?idGardiennage=${idGardiennage}&idUtilisateur=${idUtilisateur1}`, {
        method: 'PUT',
        headers: headers,
      });

      if (!ajoutResponse.ok) {
        throw new Error('Erreur lors de l\'ajout du gardien au gardiennage.');
      }

      // Etape 3 : créer conversation entre les deux utilisateurs
      const conversationResponse = await fetch(`http://localhost:3000/api/conversation/ajouter?`
        + new URLSearchParams({
          idUtilisateur: idUtilisateur1,
          idUtilisateur_1: idUtilisateur,  // Utiliser idUtilisateur pour le second utilisateur
          idGardiennage: idGardiennage
        }), {
        method: 'POST',
        headers: headers,
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

  function createMarker(
    latLng: LatLngExpression,
    address: string,
    idPlante: string
  ): JSX.Element {
    return (
      <Marker key={address} position={latLng}>
        <Popup className=" min-w-80 bg-none" >
          <PlantDetails idPlante={idPlante} onSave={handleSavePlant} />
        </Popup>
      </Marker>
    );
  }

  function PlantDetails({
    idPlante,
    onSave
  }: {
    idPlante: string;
    onSave: (idPlante: string, idGardiennage: string, idUtilisateur: string) => void; // Mettre à jour ici pour accepter deux arguments
  }) {
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
        <div className="p-4 bg-white  rounded-lg max-w-xs">
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
                  <span className="font-semibold">Début:</span> {new Date(gardiennage.dateDebut).toLocaleDateString()}{" "}
                  <span className="font-semibold">Fin:</span> {new Date(gardiennage.dateFin).toLocaleDateString()}
                </p>
                <button
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300 "
                  onClick={() => {
                    console.log('ID Plante:', plant.idPlante);
                    console.log('ID Gardiennage:', gardiennage.idGardiennage);
                    onSave(plant.idPlante, gardiennage.idGardiennage, plant.idUtilisateur);
                  }}
                >
                  Garder ce gardiennage
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }



    return <div>Aucune donnée disponible pour cette plante.</div>;
  }

  return (
    <div>
      <Head>
        <title>OpenStreetMap Map</title>
        <meta name="description" content="TrouverPage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
}
