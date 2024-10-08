'use client';

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Menu from "@/components/menu";

export default function GardiennagePage() {
  const [plantes, setPlantes] = useState<any[]>([]);
  const [selectedPlante, setSelectedPlante] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'enCours' | 'aVenir' | 'passes'>('enCours');
  const [token, setToken] = useState<string | null>(null); 
  const [idUtilisateur, setIdUtilisateur] = useState<string | null>(null); 
  const router = useRouter();

  useEffect(() => {
    // Récupération des valeurs de localStorage côté client
    const storedToken = localStorage.getItem('token');
    const storedIdUtilisateur = localStorage.getItem('idUtilisateur');
    setToken(storedToken);
    setIdUtilisateur(storedIdUtilisateur);
  }, []);

  useEffect(() => {
    if (!idUtilisateur || !token) return;

    const fetchPlantes = async () => {
      try {
        const headers = new Headers();
        if (token) {
          headers.append('Authorization', `Bearer ${token}`);
        }

        // Récupérer les gardiennages
        const responseGardiennages = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/gardiennage/afficherGardes?idUtilisateur=${idUtilisateur}`, { headers });
        if (!responseGardiennages.ok) throw new Error("Failed to fetch gardiennages");

        const dataGardiennages = await responseGardiennages.json();

        // Regrouper les gardiennages par plante
        const plantsWithGardiennages: { [key: number]: any } = {
          
        };
        dataGardiennages.gardiennages.forEach((g: any) => {
          if (!plantsWithGardiennages[g.idPlante]) {
            plantsWithGardiennages[g.idPlante] = {
              idPlante: g.idPlante,
              gardiennages: [],
            };
          }
          plantsWithGardiennages[g.idPlante].gardiennages.push(g);
        });

        const idsPlantes = Object.keys(plantsWithGardiennages).map(Number);

        // Récupérer les détails des plantes
        const plantesPromises = idsPlantes.map(async (idPlante: number) => {
          try {
            const responsePlante = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/plante/afficher?idPlante=${idPlante}`, { headers });
            if (!responsePlante.ok) throw new Error(`Failed to fetch plante with id ${idPlante}`);

            const dataPlante = await responsePlante.json();
            // Associer les gardiennages aux plantes
            const planteWithGardiennages = {
              ...dataPlante.plante,
              gardiennages: plantsWithGardiennages[idPlante]?.gardiennages || [],
            };

            return planteWithGardiennages;
          } catch (error) {
            console.error(`Error fetching details for plante id ${idPlante}:`, error);
            return null;
          }
        });

        const plantesDetails = await Promise.all(plantesPromises);
        const validPlantesDetails = plantesDetails.filter((plante: any) => plante !== null);

        setPlantes(validPlantesDetails);
      } catch (error) {
        console.error("Error fetching plantes:", error);
        setError("Erreur lors de la récupération des plantes");
      }
    };

    fetchPlantes();
  }, [idUtilisateur, token]); 

  useEffect(() => {
    if (error) {
      console.error('Error:', error);
    }
  }, [error]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date invalide"; 
    }

    const options: any = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return date.toLocaleDateString("fr-FR", options);
  };

  const filterGardiennages = (gardiennages: any[]) => {
    const now = new Date();
    return gardiennages.filter((g: any) => {
      const dateDebut = new Date(g.dateDebut);
      const dateFin = new Date(g.dateFin);
      if (selectedTab === 'enCours') {
        return dateDebut <= now && dateFin >= now;
      } else if (selectedTab === 'aVenir') {
        return dateDebut > now;
      } else if (selectedTab === 'passes') {
        return dateFin < now;
      }
      return false;
    });
  };

  const showPlanteDetails = (plante: any) => {
    setSelectedPlante(plante);
  };

  const closePlanteDetails = () => {
    setSelectedPlante(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Head>
        <title>Mes gardiennages</title>
        <meta name="description" content="Liste des gardiennages de plantes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex mx-2 p-4">
        <button
          onClick={() => router.push('/plantes-utilisateur')}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-l-lg  bg-gray-200 text-gray-600`}
        >
          Mes plantes
        </button>
        <button
          className={`flex-1 px-4 text-sm font-semibold rounded-r-lg bg-[#1CD672] text-black`}
        >
          Mes gardiennages
        </button>
      </div>
      <main className="container mx-auto px-4 py-6 h-screen">
        <div className="mb-4">
          <div className="flex space-x-4">
            {['enCours', 'aVenir', 'passes'].map(tab => (
              <button
                key={tab}
                className={`py-2 px-4 rounded-lg ${selectedTab === tab ? 'bg-[#1CD672] text-black' : 'bg-white text-gray-700'}`}
                onClick={() => setSelectedTab(tab as 'enCours' | 'aVenir' | 'passes')}
              >
                {tab === 'enCours' ? 'En cours' : tab === 'aVenir' ? 'À venir' : 'Passés'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Array.isArray(plantes) && plantes.length > 0 ? (
            plantes.flatMap(plante =>
              filterGardiennages(plante.gardiennages).map((g: any) => (
                <div
                  key={`${plante.idPlante}-${g.idGardiennage}`}
                  className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
                  onClick={() => showPlanteDetails({ ...plante, dateDebut: g.dateDebut, dateFin: g.dateFin })}
                >
                  <h2 className="text-xl font-bold">{plante.nom}</h2>
                  <p className="text-gray-600">{plante.adresse}</p>
                  <p className="text-gray-500">Date de début: {formatDateTime(g.dateDebut)}</p>
                  <p className="text-gray-500">Date de fin: {formatDateTime(g.dateFin)}</p>
                </div>
              ))
            )
          ) : (
            <p>Aucune plante trouvée</p>
          )}
        </div>
      </main>

      {selectedPlante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white w-full max-w-md p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedPlante.nom}</h2>
              <button
                onClick={closePlanteDetails}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                Fermer
              </button>
            </div>
            <p>
              <strong>Espèce:</strong> {selectedPlante.espece.libelle}
            </p>
            <p>
              <strong>Description:</strong> {selectedPlante.description}
            </p>
            <p>
              <strong>Adresse:</strong> {selectedPlante.adresse}
            </p>

            {selectedPlante.photoUrl && (
              <img src={selectedPlante.photoUrl} alt={`Photo de ${selectedPlante.nom}`} className="mt-4" />
            )}
            {selectedPlante.gardiennages.length > 0 && (
              <div className="mt-4">
                <ul>
                  {selectedPlante.gardiennages.map((g: any) => (
                    <li key={g.idGardiennage}>
                      <p><strong>Date de début:</strong> {formatDateTime(g.dateDebut)}</p>
                      <p><strong>Date de fin:</strong> {formatDateTime(g.dateFin)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      <Menu />
    </div>
  );
}
