"use client";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

export default function MessagesPage() {
  const router = useRouter();
  const { idConversation } = useParams();
  const [messages, setMessages] = useState<{
    dateEnvoi: string | number | Date;
    idUtilisateur: number;
    contenu: string;
  }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [avatar, setAvatar] = useState("");
  const token = localStorage.getItem("token");
  const idUtilisateur = parseInt(localStorage.getItem("idUtilisateur") || "0");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Récupération du pseudo de l'utilisateur connecté
        const pseudoResponse = await fetch(
          `http://localhost:3000/api/utilisateur/recupererPseudo?idUtilisateur=${idUtilisateur}`,
          { headers }
        );
        const pseudoData = await pseudoResponse.json();
        setPseudo(pseudoData.pseudo);

        // Récupération de l'avatar de l'utilisateur connecté
        const avatarResponse = await fetch(
          `http://localhost:3000/api/conversation/recupererPhotoPlante?idConversation=${idConversation}`,
          { headers }
        );
        const avatarData = await avatarResponse.json();
        setAvatar(avatarData.photoUrl || "/default-avatar.png");
      } catch (error) {
        setErreur("Erreur lors de la récupération des informations utilisateur");
      }
    };

    fetchUserInfo();

    const newSocket = io("http://localhost:3000", {
      query: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connecté au serveur Socket.IO");
      newSocket.emit("recupererMessages", idConversation);
    });

    newSocket.on("messagesRecus", (messagesRecus) => {
      setMessages(messagesRecus);
    });

    newSocket.on("erreur", (message) => {
      setErreur(message);
    });

    newSocket.on("nouveauMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [idConversation, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Envoyer un nouveau message
  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      try {
        const url = `http://localhost:3000/api/message/ajouter?contenu=${encodeURIComponent(
          newMessage
        )}&idConversation=${idConversation}&idUtilisateur=${idUtilisateur}`;

        await axios.post(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNewMessage("");
      } catch (error) {
        setErreur("Erreur lors de l'envoi du message");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <button onClick={() => router.back()} className="flex">
          <ChevronLeft className="text-black" />
        </button>
      </header>

      <div className="flex flex-col items-center my-4">
        <img
          src={avatar}
          alt="Avatar"
          className="w-16 h-16 rounded-full mb-2"
        />
        <h1 className="text-xl font-bold">{pseudo}</h1>
      </div>

      <main className="flex-1 p-4 overflow-y-auto">
        {erreur && <p className="text-red-500">{erreur}</p>}
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-md ${
                message.idUtilisateur === idUtilisateur
                  ? "bg-blue-100 self-end"
                  : "bg-gray-100 self-start"
              }`}
            >
              <p>{message.contenu}</p>
              <small className="text-gray-500">
                {new Date(message.dateEnvoi).toLocaleTimeString()}
              </small>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="flex p-4 bg-white border-t">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Votre message..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Envoyer
        </button>
      </footer>
    </div>
  );
}