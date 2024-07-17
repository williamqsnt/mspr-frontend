// pages/plante/[pseudo].js
"use client";
// pages/plante/[pseudo].tsx

import React, { useState } from "react";
import Head from "next/head";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDaysIcon, ChevronLeft } from "lucide-react";

interface PlantePageProps {
  pseudo: string;
}

const PlantePage: React.FC<PlantePageProps> = ({ pseudo }) => {
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

  const formatDate = (date: Date | Date[]) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    let month = formattedDate.getMonth() + 1;
    let day = formattedDate.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return `${month}/${day}/${year}`;
  };

  const ajouterPlante = async () => {
    try {
      if (!espece || !description || !nom || !adresse || !debut || !fin) {
        throw new Error("Veuillez remplir tous les champs.");
      }
      const storedPseudo = localStorage.getItem("pseudo");
      if (!storedPseudo) {
        throw new Error("Pseudo non trouvé dans le stockage local.");
      }
      const id = await getId(storedPseudo);

      const url =
        `http://localhost:3000/api/plante/ajouter?` +
        `esp_plt=${encodeURIComponent(espece)}&` +
        `des_plt=${encodeURIComponent(description)}&` +
        `nom_plt=${encodeURIComponent(nom)}&` +
        `adr_plt=${encodeURIComponent(adresse)}&` +
        `dat_deb_plt=${encodeURIComponent(debut)}&` +
        `dat_fin_plt=${encodeURIComponent(fin)}&` +
        `id_proprietaire=${encodeURIComponent(id)}`;

      const response = await axios.post(url);
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

  const getId = async (pseudo: string) => {
    try {
      const response = await axios.get<{ utilisateur: string }>(
        `http://localhost:3000/api/utilisateurs/id?psd_utl=${pseudo}`
      );
      return response.data.utilisateur.toString();
    } catch (error) {
      throw new Error("Failed to load user ID");
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
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Ajouter une nouvelle plante</title>
      </Head>

      <header className="bg-green-600 py-4 px-6 flex items-center">
        <button></button>
        <button onClick={() => window.history.back()} className="flex">
          <ChevronLeft className="text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold ml-4">
          Ajouter une plante
        </h1>
      </header>

      <main className="container mx-auto px-4 py-6">
        <form>
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
            <Label htmlFor="name">Nom de la plante</Label>
            <Input
              id="name"
              placeholder="Rose..."
              value={nom}
              onChange={(e) => setNom(e.target.value)}
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
          <div className="grid grid-cols-2 gap-6">
            <div className="mb-4">
              <Label htmlFor="start-date">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    {dateDebutSelected ? debut : "Choisir une date"}
                    <div className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" onSelect={handleDebutDateChange} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="mb-4">
              <Label htmlFor="end-date">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                  >
                    {dateFinSelected ? fin : "Choisir une date"}
                    <div className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" onSelect={handleFinDateChange} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <button
            type="button"
            onClick={ajouterPlante}
            className="bg-green-600 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
          >
            Ajouter
          </button>
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
          <div className="fixed z-10  inset-0 overflow-y-auto">
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
                          Une erreur s'est produite. Veuillez réessayer.
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
    </div>
  );
};

export default PlantePage;
