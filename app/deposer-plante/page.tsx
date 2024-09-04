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
import { useRouter } from 'next/navigation';
import Menu from "@/components/menu";

const PlantePage = () => {
  const [especes, setEspeces] = useState<Array<{ id: number; nom: string }>>([]);
  const [selectedEspeceId, setSelectedEspeceId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>("");
  const [nom, setNom] = useState<string>("");
  const [adresse, setAdresse] = useState<string>("");
  const [debut, setDebut] = useState<string>("");
  const [fin, setFin] = useState<string>("");
  const [dateDebutSelected, setDateDebutSelected] = useState<boolean>(false);
  const [dateFinSelected, setDateFinSelected] = useState<boolean>(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const router = useRouter();

  useEffect(() => {
    const fetchEspeces = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/espece/afficher");
        console.log("Données récupérées:", response.data);
        setEspeces(response.data.especes); // Accéder au tableau d'espèces dans l'objet retourné
      } catch (error) {
        console.error("Erreur lors de la récupération des espèces :", error);
      }
    };
  
    fetchEspeces();
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
      setErrorMessage("Veuillez ajouter une photo de la plante.");
      return;
    }

    if (!selectedEspeceId) {
      setErrorMessage("Veuillez sélectionner une espèce.");
      return;
    }

    try {
      const responsePhoto = await ajouterPhotos(photos);
      const idUtilisateur = localStorage.getItem("idUtilisateur");

      const params = new URLSearchParams({
        idEspece: selectedEspeceId.toString(),
        description: description,
        nom: nom,
        adresse: adresse,
        idUtilisateur: idUtilisateur ?? "",
        photoUrl: responsePhoto,
      });

      const url = `http://localhost:3000/api/plante/ajouter?${params.toString()}`;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(url, {}, { headers });

      if (response.status === 200) {
        setSuccessDialogOpen(true);
        router.push('/');
      } else {
        throw new Error("Une erreur s'est produite. Veuillez réessayer.");
        router.push('/');
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la plante :", error);
      setErrorDialogOpen(true);
    }
  };

  const ajouterPhotos = async (photo: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/plante/ajouterPhoto",
        { image: photo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo :", error);
      throw new Error("Échec du téléchargement de la photo");
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
    <option key={espece.idEspece} value={espece.idEspece}>
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
            {/* ... (success dialog code) */}
          </div>
        )}

        {errorDialogOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            {/* ... (error dialog code) */}
          </div>
        )}
      </main>
      <Menu />
    </div>
    
  );
};



export default PlantePage;
