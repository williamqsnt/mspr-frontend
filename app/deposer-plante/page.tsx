"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import PrendrePhoto from "@/components/prendrePhoto";
import Menu from "@/components/menu";

const PlantePage = () => {
  const [espece, setEspece] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [nom, setNom] = useState<string>("");
  const [adresse, setAdresse] = useState<string>("");
  const [debut, setDebut] = useState<string>("");
  const [fin, setFin] = useState<string>("");
  const [dateDebutSelected, setDateDebutSelected] = useState<boolean>(false);
  const [dateFinSelected, setDateFinSelected] = useState<boolean>(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string | null>(null); // Pour stocker l'URL de la photo
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null); // Déplacez le token dans l'état
  const [idUtilisateur, setIdUtilisateur] = useState<string | null>(null); // Déplacez l'idUtilisateur dans l'état

  useEffect(() => {
    // Récupérez le token et l'idUtilisateur uniquement côté client
    const storedToken = localStorage.getItem('token');
    const storedIdUtilisateur = localStorage.getItem('idUtilisateur');
    setToken(storedToken);
    setIdUtilisateur(storedIdUtilisateur);
  }, []);

  const handleDebutDateChange = (date: Date | Date[]) => {
    const formattedDate = formatDate(date);
    setDebut(formattedDate);
    setDateDebutSelected(true);
  };

  const handleFinDateChange = (date: Date | Date[]) => {
    const formattedDate = formatDate(date);
    setFin(formattedDate);
    setDateFinSelected(true);
  };

  const formatDate = (date: Date | Date[]): string => {
    const dateToFormat = Array.isArray(date) ? date[0] : date;

    if (!(dateToFormat instanceof Date)) {
      throw new Error('L\'argument doit être un objet Date ou un tableau d\'objets Date.');
    }

    const formattedDate = new Date(dateToFormat);
    const year = formattedDate.getFullYear();
    let month = formattedDate.getMonth() + 1;
    let day = formattedDate.getDate();

    const monthString = month < 10 ? `0${month}` : `${month}`;
    const dayString = day < 10 ? `0${day}` : `${day}`;

    return `${monthString}/${dayString}/${year}`;
  };

  const ajouterPlante = async () => {
    if (!photos) {
      setErrorMessage('Veuillez ajouter une photo de la plante.');
      return;
    }

    try {
      if (!token || !idUtilisateur) {
        throw new Error("Token ou idUtilisateur manquant.");
      }

      // Attendre que les photos soient ajoutées
      const responsePhoto = await ajouterPhotos(photos);

      // Construire les paramètres de la requête
      const params = new URLSearchParams({
        espece: espece,
        description: description,
        nom: nom,
        adresse: adresse,
        idUtilisateur: idUtilisateur ?? "", // Use nullish coalescing operator to provide a default value
        photoUrl: responsePhoto
      });

      // Construire l'URL avec les paramètres
      const url = `http://localhost:3000/api/plante/ajouter?${params.toString()}`;

      const headers = {
        'Authorization': `Bearer ${token}`, // Inclure le token JWT dans l'en-tête Authorization
        'Content-Type': 'application/json' // Spécifier le type de contenu si nécessaire
      };

      // Envoyer la requête POST
      const response = await axios.post(
        url, // URL avec les paramètres inclus
        {}, // Corps de la requête, vide dans ce cas
        { headers } // Inclure les en-têtes dans la requête
      );

      // Vérifier la réponse
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
        'http://localhost:3000/api/plante/ajouterPhoto',
        { image: photo },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Inclure le token dans l'en-tête Authorization
            'Content-Type': 'application/json' // Spécifier le type de contenu
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

          <div className="mb-4">
            <Label htmlFor="species">Espèce de la plante</Label>
            <Input
              id="species"
              placeholder="famille des Rosaceae..."
              value={espece}
              onChange={(e) => setEspece(e.target.value)}
            />
          </div>

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

          {/* Affichage du message d'erreur si nécessaire */}
          {errorMessage && (
            <div className="mt-4 text-red-500">
              {errorMessage}
            </div>
          )}
        </form>

        {/* Dialogue de succès */}
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

        {/* Dialogue d'erreur */}
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
