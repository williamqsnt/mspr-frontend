"use client";
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const router = useRouter();

  // Exemple de données
  const [plantes, setPlantes] = useState(['Plante1', 'Plante2', 'Plante3']);
  const [gardiennages, setGardiennages] = useState(['Plante1', 'Plante2', 'Plante3']);

  useEffect(() => {
    // Code de récupération des données du profil, si nécessaire
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pseudo');
    router.push('/');
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Mes Plantes - Profil</title>
        <meta name="description" content="Profil de l'utilisateur" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-green-500 py-4 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold">Accueil</h1>
          <p onClick={handleLogout} className="text-white cursor-pointer">
            Déconnexion
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Nom Prenom</h2>
        </div>

        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4">Mes plantes :</h3>
          <div className="bg-white rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
              {plantes.map((plante, index) => (
                <li key={index} className="px-6 py-4">
                  {plante}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4">Mes gardiennages :</h3>
          <div className="bg-white rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200">
              {gardiennages.map((gardiennage, index) => (
                <li key={index} className="px-6 py-4">
                  {gardiennage}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
