"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";
import Menu from "@/components/menu";

const MapComponent = dynamic(() => import("@/components/MapComponent"), { ssr: false });

interface Address {
  adresse: string;
  idPlante: string;
}

export default function ChercherPlantePage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const pseudo = typeof window !== 'undefined' ? localStorage.getItem('pseudo') : null;

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/plante/recupererlocalisation`, { headers: headers }
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des adresses de plantes.");
        }
        const responseData = await response.json();
        setAddresses(responseData.adresses);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    }
    fetchAddresses();
  }, []);

  async function handleSavePlant(idPlante: string, idGardiennage: string, idUtilisateur: string) {
    if (!pseudo) {
      console.error('Pseudo is not available');
      return;
    }

    try {
      const idResponse = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers: headers });
      if (!idResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'ID utilisateur.');
      }

      const idData = await idResponse.json();
      const idUtilisateur1 = idData.idUtilisateur;

      const ajoutResponse = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/gardiennage/ajouterGardien?idGardiennage=${idGardiennage}&idUtilisateur=${idUtilisateur1}`, {
        method: 'PUT',
        headers: headers,
      });

      if (!ajoutResponse.ok) {
        throw new Error('Erreur lors de l\'ajout du gardien au gardiennage.');
      }

      const conversationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/conversation/ajouter?`
        + new URLSearchParams({
          idUtilisateur: idUtilisateur1,
          idUtilisateur_1: idUtilisateur,
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
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la plante:', error);
    }
  }

  return (
    <div>
      <Head>
        <title>OpenStreetMap Map</title>
        <meta name="description" content="TrouverPage" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <MapComponent addresses={addresses} onSave={handleSavePlant} />
      </main>
      <div className="z-50">
        <Menu />
      </div>
    </div>
  );
}
