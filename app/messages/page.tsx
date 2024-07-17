"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [userPseudos, setUserPseudos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const fetchedConversations = await getConversationsFromAPI(
        "proprietaire"
      ); // Remplacez 'proprietaire' par votre pseudo
      setConversations(fetchedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversationsFromAPI = async (pseudo) => {
    try {
      const id = await getId(pseudo);
      const response = await fetch(
        `http://localhost:3000/api/conversation/afficher?id_utl=${id}`
      );
      if (response.ok) {
        const jsonData = await response.json();
        const conversations = jsonData.map((conv) => ({
          id_conv: conv.id_conv,
          other_user_id: conv.id_utl1 === id ? conv.id_utl2 : conv.id_utl1,
        }));
        return conversations;
      } else {
        throw new Error("Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error in getConversationsFromAPI:", error);
      return [];
    }
  };

  const getId = async (pseudo) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/utilisateur/id?psd_utl=${pseudo}`
      );
      if (response.ok) {
        const jsonData = await response.json();
        return jsonData.utilisateur.toString();
      } else {
        throw new Error("Failed to fetch user ID");
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      throw error;
    }
  };

  const getPseudo = async (userId) => {
    if (userPseudos[userId]) {
      return userPseudos[userId];
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/utilisateur/pseudo?id_utl=${userId}`
      );
      if (response.ok) {
        const jsonData = await response.json();
        setUserPseudos((prevUserPseudos) => ({
          ...prevUserPseudos,
          [userId]: jsonData.utilisateur,
        }));
        return jsonData.utilisateur;
      } else {
        throw new Error("Failed to fetch pseudo");
      }
    } catch (error) {
      console.error("Error fetching pseudo:", error);
      return "Unknown";
    }
  };

  const handleConversationClick = (conversationId) => {
    router.push(`/chat/${conversationId}`); // Redirige vers la page de chat avec l'ID de la conversation
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Conversations</title>
        <meta name="description" content="Liste des conversations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-green-500 py-4 px-6 flex items-center">
        <button onClick={() => window.history.back()} className="flex">
          <ChevronLeft className="text-white" />
        </button>
        <h1 className="text-white text-2xl font-bold ml-4">
        Conversations
        </h1>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center">
            <p className="text-gray-600 text-lg">Chargement en cours...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center">
            <p className="text-gray-600 text-lg">
              Aucune conversation trouvée.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div
                key={conv.id_conv}
                className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-100"
                onClick={() => handleConversationClick(conv.id_conv)}
              >
                <p className="text-lg font-semibold">Conversation avec :</p>
                <p className="text-green-600">
                  {getPseudo(conv.other_user_id)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
