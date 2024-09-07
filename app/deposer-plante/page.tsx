"use client";
import React, { useState, useEffect, ReactNode } from "react";
import Head from "next/head";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import PrendrePhoto from "@/components/prendrePhoto";
import Menu from "@/components/menu";
import { useRouter } from "next/navigation";

const PlantePage = () => {
  const [especes, setEspeces] = useState<Array<{
    libelle: ReactNode;
    idEspece: string | number | readonly string[] | undefined;
    id: number;
    nom: string;
  }>>([]);
  const [selectedEspeceId, setSelectedEspeceId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");
  const [nom, setNom] = useState<string>("");
  const [adresse, setAdresse] = useState<string>("");
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [idUtilisateur, setIdUtilisateur] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEspeces = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/espece/afficher");
        setEspeces(response.data.especes);
      } catch (error) {
        console.error("Erreur lors de la récupération des espèces :", error);
      }
    };

    fetchEspeces();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedIdUtilisateur = localStorage.getItem('idUtilisateur');
    setToken(storedToken);
    setIdUtilisateur(storedIdUtilisateur);
  }, []);

  const ajouterPlante = async () => {
    if (!description) {
      setErrorMessage("Veuillez ajouter une description de la plante.");
      return;
    }

    if (!nom) {
      setErrorMessage("Veuillez ajouter un nom de la plante.");
      return;
    }

    if (!adresse) {
      setErrorMessage("Veuillez ajouter une adresse.");
      return;
    }

    if (!photos) {
      setErrorMessage('Veuillez ajouter une photo de la plante.');
      return;
    }

    try {
      if (!token || !idUtilisateur) {
        throw new Error("Token ou idUtilisateur manquant.");
      }

      const responsePhoto = await ajouterPhotos(photos);

      const params = new URLSearchParams({
        idEspece: selectedEspeceId ? selectedEspeceId.toString() : "",
        description,
        nom,
        adresse,
        idUtilisateur: idUtilisateur ?? "",
        photoUrl: responsePhoto
      });

      const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/plante/ajouter?${params.toString()}`;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        url,
        {},
        { headers }
      );

      if (response.status === 200) {
        setSuccessDialogOpen(true);
      } else {
        throw new Error("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (error) {
      console.error("Error adding plant:", error);
      setErrorDialogOpen(true);
    }
  };

  const ajouterPhotos = async (photo: any) => {
    try {
      if (!token) {
        throw new Error("Token manquant.");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/plante/ajouterPhoto`,
        { image: photo },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    window.history.back();
  };

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
  };
  return (
    <div className="h-screen">
      <Head>
        <title>Ajouter une nouvelle plante</title>
      </Head>

      <header className="bg-[#1CD672] py-4 px-6 flex items-center">
        <button onClick={() => window.history.back()} className="flex">
          <ChevronLeft className="text-black" />
        </button>
      </header>
      <main className="h-[82vh] container mx-auto px-4 py-6">
        <form>
          <h1 className="text-black text-2xl font-semibold my-4">
            Ajouter une plante
          </h1>
          <div className="flex items-center w-full">
            <div className="mb-4 w-full">
              <Label htmlFor="name">Nom de la plante</Label>
              <Input
                id="name"
                placeholder="Rose..."
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>
            <div className="mt-4 mx-2">
              <PrendrePhoto onPhotoConfirmed={setPhotos} />
            </div>
          </div>

          <div className="mb-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Plante de couleur rose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <select
            id="species"
            value={selectedEspeceId ?? ""}
            onChange={(e) => setSelectedEspeceId(parseInt(e.target.value))}
            className="border p-2 rounded w-full max-h-48 overflow-y-auto"
          >
            <option value="">Sélectionner une espèce...</option>
            {Array.isArray(especes) && especes.map((espece) => (
              <option key={String(espece.idEspece)} value={espece.idEspece}>
                {espece.libelle}
              </option>
            ))}
          </select>


          <div className="mb-4">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              placeholder=""
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-center mt-12">
            <button
              type="button"
              onClick={ajouterPlante}
              className="bg-[#1CD672] text-white font-semibold py-2 px-4 rounded-full"
            >
              Ajouter
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 text-red-500">
              {errorMessage}
            </div>
          )}
        </form>

        {successDialogOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-green-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900">
                        Succès
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          La demande a été ajoutée avec succès.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleCloseSuccessDialog}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorDialogOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900">
                        Erreur
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Une erreur s&apos;est produite. Veuillez réessayer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleCloseErrorDialog}
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Menu />
    </div>
  );
};

export default PlantePage;
