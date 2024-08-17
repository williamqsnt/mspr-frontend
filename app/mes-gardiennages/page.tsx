"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function GardiennagePage() {
  const router = useRouter();

  const [plantes, setPlantes] = useState([]);
  const [selectedPlante, setSelectedPlante] = useState(null);
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
      const response = await fetch(
        `http://localhost:3000/api/plante/afficherGardees?psd_utl=proprietaire`, {headers: headers}
      );
      if (response.ok) {
        const data = await response.json();
        setPlantes(data);
      } else {
        throw new Error("Failed to fetch plantes");
      }
    } catch (error) {
      console.error("Error fetching plantes:", error);
    }
  };

  const formatDateTime = (dateString: any) => {
    const options: any = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  const showPlanteDetails = (plante: any) => {
    setSelectedPlante(plante);
  };

  const closePlanteDetails = () => {
    setSelectedPlante(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Mes gardiennages</title>
        <meta name="description" content="Liste des gardiennages de plantes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-green-600 py-4 px-6 flex items-center">
        <button onClick={() => window.history.back()} className="flex">
          <ChevronLeft className="text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold ml-4">
          Mes Gardiennages
        </h1>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {plantes.map((plante) => (
            <div
              key={plante.id}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
              onClick={() => showPlanteDetails(plante)}
            >
              <h2 className="text-xl font-bold">{plante.nom_plt}</h2>
              <p className="text-gray-600">{plante.adr_plt}</p>
            </div>
          ))}
        </div>
      </main>

      {selectedPlante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedPlante.nom_plt}</h2>
              <button
                onClick={closePlanteDetails}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                Fermer
              </button>
            </div>
            <p>
              <strong>Espèce:</strong> {selectedPlante.esp_plt}
            </p>
            <p>
              <strong>Description:</strong> {selectedPlante.dsc_plt}
            </p>
            <p>
              <strong>Adresse:</strong> {selectedPlante.adr_plt}
            </p>
            <p>
              <strong>Date de début:</strong>{" "}
              {formatDateTime(selectedPlante.dat_deb_plt)}
            </p>
            <p>
              <strong>Date de fin:</strong>{" "}
              {formatDateTime(selectedPlante.dat_fin_plt)}
            </p>
            {/* Ajouter ici la logique pour afficher l'image */}
            <button className="bg-green-500 text-white px-4 py-2 mt-4 rounded-lg hover:bg-green-600 focus:outline-none">
              Prendre une photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
