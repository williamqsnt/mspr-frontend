"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import getCoordinatesFromAddress from "@/utils/getCoordinatesFromAddress";

const MapContainerNoSSR = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

interface Address {
  adresse: string;
  idPlante: string;
}

interface MapComponentProps {
  addresses: Address[];
  onSave: (idPlante: string, idGardiennage: string, idUtilisateur: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ addresses, onSave }) => {
  const [markerList, setMarkerList] = useState<JSX.Element[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    async function fetchMarkers() {
      try {
        const markers = await Promise.all(
          addresses.map(async (addressObj) => {
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
    fetchMarkers();
  }, [addresses]);

  function createMarker(
    latLng: LatLngExpression,
    address: string,
    idPlante: string
  ): JSX.Element {
    return (
      <Marker key={address} position={latLng}>
        <Popup className="min-w-80 bg-none">
          <PlantDetails idPlante={idPlante} onSave={onSave} headers={headers} />
        </Popup>
      </Marker>
    );
  }

  function PlantDetails({
    idPlante,
    onSave,
    headers
  }: {
    idPlante: string;
    onSave: (idPlante: string, idGardiennage: string, idUtilisateur: string) => void;
    headers: Headers;
  }) {
    const [plantDetails, setPlantDetails] = useState<any>(null);

    useEffect(() => {
      async function fetchPlantDetails() {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/plante/afficher?idPlante=${idPlante}`, { headers: headers });
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des détails de la plante.');
          }
          const data = await response.json();
          setPlantDetails(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des détails de la plante:', error);
        }
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
          <p><span className="font-semibold">Nom:</span> {plant.nom}</p>
          <p><span className="font-semibold">Espèce:</span> {plant.espece.libelle}</p>
          <p><span className="font-semibold">Description:</span> {plant.description}</p>
          <div>
            <h3 className="text-base font-semibold mb-2">Gardiennage(s):</h3>
            {plant.gardiennages.map((gardiennage: any, index: any) => (
              <div key={index} className="mb-4 p-2 border border-gray-200 rounded-md shadow-sm">
                <p className="mb-1">
                  <span className="font-semibold">Début:</span> {new Date(gardiennage.dateDebut).toLocaleDateString()}{" "}
                  <span className="font-semibold">Fin:</span> {new Date(gardiennage.dateFin).toLocaleDateString()}
                </p>
                <button
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-300"
                  onClick={() => onSave(plant.idPlante, gardiennage.idGardiennage, plant.idUtilisateur)}
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
    <div style={{ height: "80vh", width: "100%" }}>
      <MapContainerNoSSR center={[45.76, 4.83]} zoom={13} className="h-[91vh]">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markerList}
      </MapContainerNoSSR>
    </div>
  );
};

export default MapComponent;
