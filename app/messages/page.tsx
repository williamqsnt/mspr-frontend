'use client';

import * as React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Menu from "@/components/menu";

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<{
    idConversation: any; id: string; pseudo: string; avatar: string;
  }[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pseudoLocal, setPseudoLocal] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const pseudo = localStorage.getItem('pseudo') || '';

    setToken(storedToken);
    setPseudoLocal(pseudo);

    const fetchConversations = async () => {
      if (!pseudo || !storedToken) {
        console.error('Pseudo ou token non trouvés dans le localStorage');
        setErreur('Pseudo ou token non trouvés dans le localStorage');
        return;
      }

      try {
        const headers = new Headers();
        if (storedToken) {
          headers.append('Authorization', `Bearer ${storedToken}`);
        }

        // Récupérer l'ID utilisateur
        const idResponse = await fetch(`https${process.env.API_ENDPOINT}/api/utilisateur/recupererId?pseudo=${pseudo}`, { headers });
        if (idResponse.ok) {
          const idData = await idResponse.json();
          const idUtilisateur = idData.idUtilisateur;

          if (idUtilisateur) {
            // Récupérer les conversations
            const conversationResponse = await fetch(`${process.env.API_ENDPOINT}/api/conversation/afficher?idUtilisateur=${idUtilisateur}`, { headers });
            if (conversationResponse.ok) {
              const data = await conversationResponse.json();

              // Récupérer les détails des conversations
              const updatedConversations = await Promise.all(
                data.conversations.map(async (conversation: { idUtilisateur: any; idUtilisateur_1: any; idConversation: any; }) => {
                  const otherUserId = (conversation.idUtilisateur === idUtilisateur) ? conversation.idUtilisateur_1 : conversation.idUtilisateur;

                  const pseudoResponse = await fetch(`${process.env.API_ENDPOINT}/api/utilisateur/recupererPseudo?idUtilisateur=${otherUserId}`, { headers });
                  const pseudoData = pseudoResponse.ok ? await pseudoResponse.json() : { pseudo: "Unknown User" };

                  const avatarResponse = await fetch(`${process.env.API_ENDPOINT}/api/conversation/recupererPhotoPlante?idConversation=${conversation.idConversation}`, { headers });
                  const avatarData = avatarResponse.ok ? await avatarResponse.json() : { avatar: '/default-avatar.png' };

                  return {
                    ...conversation,
                    pseudo: pseudoData.pseudo,
                    avatar: avatarData.photoUrl || '/default-avatar.png'
                  };
                })
              );

              setConversations(updatedConversations);
            } else {
              console.error('Erreur lors de la récupération des conversations');
              setErreur('Erreur lors de la récupération des conversations');
            }
          } else {
            console.error('ID utilisateur non trouvé pour le pseudo');
            setErreur('ID utilisateur non trouvé pour le pseudo');
          }
        } else {
          console.error('Erreur lors de la récupération de l\'ID utilisateur');
          setErreur('Erreur lors de la récupération de l\'ID utilisateur');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        setErreur('Erreur lors de la récupération des conversations');
      }
    };

    fetchConversations();
  }, [pseudoLocal, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pseudo');
    router.push('/login');
  };

  const handleConversationClick = (pseudo: string) => {
    localStorage.setItem('memberPseudo', pseudo);  // Enregistrer le pseudo dans le localStorage
  };


  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 p-4">
        {erreur && <p className="text-red-500">{erreur}</p>}
        <section className="mt-2">
          <h3 className="text-xl font-bold mb-2">Mes conversations</h3>
          <div className="flex flex-col space-y-4">
            {conversations.map((conversation, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <Link href={`/messages/${conversation.idConversation}`}>
                  <button
                    className="w-full text-left flex items-center space-x-4 p-4 cursor-pointer focus:outline-none"
                    onClick={() => handleConversationClick(conversation.pseudo)}  // Appel de la fonction lors du clic
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <img src={conversation.avatar} alt="Avatar" className="w-11 h-11 rounded-full" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-bold">{conversation.pseudo}</h2>
                    </div>
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Menu />
    </div>
  );
}
