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
import getPlantDataFromAPI from "@/utils/getPlantDataFromAPI";
import addGuardianToPlant from "@/utils/addGuardianToPlant";
import addConversation from "@/utils/addConversation";
import getId from "@/utils/getId";
import { ArrowLeft, ChevronLeft, X } from "lucide-react";

// Dynamic import of MapContainer to avoid SSR issues with leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
  }
);

interface TrouverPageProps {
  pseudo: string;
}

interface Address {
  address: string;
}

const TrouverPage: React.FC<TrouverPageProps> = ({ pseudo }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [markerList, setMarkerList] = useState<JSX.Element[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(false); // State to track selected plant data

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const response = await fetch(
          "http://localhost:3000/api/plante/recupererlocalisation"
        );
        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des adresses de plantes."
          );
        }
        const fetchedAddresses: Address[] = await response.json();
        console.log("Fetched addresses:", fetchedAddresses);
        setAddresses(fetchedAddresses);

        const markers = await Promise.all(
          fetchedAddresses.map(async (addressObj) => {
            const coordinates = await getCoordinatesFromAddress(
              addressObj.address
            );
            if (coordinates) {
              return createMarker(coordinates, addressObj.address);
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

  async function handlePlantDetails(address: string) {
    try {
      const plantData = await getPlantDataFromAPI(address);
      if (plantData) {
        setSelectedPlant(plantData); // Mettez à jour l'état selectedPlant avec les détails de la plante
        const id = await getId(pseudo);
        showDialog(plantData, id);
      } else {
        console.warn("Plant data not found for the address:", address);
      }
    } catch (error) {
      console.error("Error fetching plant data:", error);
    }
  }

  async function showDialog(plantData: any, userId: string) {
    try {
      const response = await addGuardianToPlant(
        plantData.id_plt.toString(),
        userId.toString()
      );
      if (response.status === 200 || response.status === 202) {
        console.log("Adding conversation...");
        await addConversation(
          plantData.id_plt.toString(),
          plantData.id_proprietaire.toString(),
          userId.toString()
        );
        console.log("Conversation added");
        setSelectedPlant(true); // Set selected plant data to display in the popup
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function createMarker(
    latLng: LatLngExpression,
    address: string
  ): JSX.Element {
    return (
      <Marker key={address} position={latLng}>
        <Popup>
          <div>
            <h2>{address}</h2>
            <p>Latitude: {latLng[0]}</p>
            <p>Longitude: {latLng[1]}</p>
            <button onClick={() => handlePlantDetails(address)}>
              Voir les détails de la plante
            </button>
          </div>
        </Popup>
      </Marker>
    );
  }

  function closePopup() {
    setSelectedPlant(false);
  }

  return (
    <div>
      <Head>
        <title>OpenStreetMap Map</title>
        <meta name="description" content="TrouverPage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className="bg-green-600 z-50 py-4 px-6 flex items-center">
          <button></button>
          <button onClick={() => window.history.back()} className="flex">
            <ChevronLeft className="text-white" />
          </button>
        </header>

        <div style={{ height: "80vh", width: "100%" }}>
          <MapContainer center={[45.76, 4.83]} zoom={13} className="h-screen">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markerList}
          </MapContainer>
        </div>

        {selectedPlant && (
          <div className="popup">
            <div className="popup-inner">
              <button className="close-button" onClick={closePopup}>
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-2">
                {selectedPlant.address}
              </h2>
              <p>
                <span className="font-bold">Nom:</span> {selectedPlant.nom}
              </p>
              <p>
                <span className="font-bold">Type:</span> {selectedPlant.type}
              </p>
              <p>
                <span className="font-bold">Description:</span>{" "}
                {selectedPlant.description}
              </p>
              <button
                className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
                onClick={() => console.log("Garder la plante")}
              >
                Garder la plante
              </button>
            </div>
          </div>
        )}
      </main>

      <footer>
        <button onClick={() => window.history.back()}>Retour</button>
      </footer>

      <style jsx>{`
        .popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: white;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .popup-inner {
          max-width: 400px;
          margin: auto;
        }

        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default TrouverPage;
