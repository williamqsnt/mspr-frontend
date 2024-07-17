// pages/accueil.js
"use client";
// pages/accueil.js
import { CalendarIcon, FlowerIcon, MailIcon, MenuIcon, PlusIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccueilPage() {
  const router = useRouter();
  const [isBotanist, setIsBotanist] = useState(false);

  useEffect(() => {
    fetchUserType();
  }, []);

  const fetchUserType = async () => {
    try {
      const response = await fetch(`http://15.237.169.255:3000/api/botaniste/estBotaniste?psd_utl=${pseudo}`);
      // const response = await fetch(`http://localhost:3000/api/botaniste/estBotaniste?psd_utl=${pseudo}`);

      if (response.ok) {
        setIsBotanist(true);
      } else {
        setIsBotanist(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du type utilisateur:', error);
      setIsBotanist(false);
    }
  };

  const handleNavigation = (route:any) => {
    router.push(route);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-green-600 text-primary-foreground">
        Arrosaje
        <div className="flex items-center gap-4">
          <button className="focus:outline-none" onClick={() => handleNavigation('/messages')}>
            <MailIcon className="w-6 h-6" />
            <span className="sr-only">Messages</span>
          </button>
          <button className="focus:outline-none" onClick={() => handleNavigation('/profile')}>
            <UserIcon className="w-6 h-6" />
            <span className="sr-only">Profile</span>
          </button>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-2 gap-4 p-4">
        <Link href="/chercher-plantes">
          <p className="flex flex-col items-center justify-center h-32 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none">
            <FlowerIcon className="w-8 h-8 mb-2" />
            <span>Chercher des plantes</span>
          </p>
        </Link>
        <button
          className="flex flex-col items-center justify-center h-32 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none"
          onClick={() => handleNavigation('/mes-gardiennages')}
        >
          <CalendarIcon className="w-8 h-8 mb-2" />
          <span>Mes gardiennages</span>
        </button>
      </main>
      {/* Bouton "+" au milieu en bas */}
      <div className="flex justify-center pb-8">
        <button
          className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary-dark focus:outline-none"
          onClick={() => handleNavigation('/demande-gardiennage')}
        >
          <PlusIcon className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
