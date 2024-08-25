"use client";
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import PrendrePhoto from "@/components/prendrePhoto";
import { CalendarIcon, ChevronLeft, FlowerIcon, HomeIcon, Leaf, MailIcon, MessageCircle, User, UserIcon } from 'lucide-react';
import Link from 'next/link';

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
  const [photos, setPhotos] = useState<any>(null);
  const idUtilisateur = parseInt(localStorage.getItem("idUtilisateur") || "0");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
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

  const ajouterPhotos = async (photo: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/plante/ajouterPhoto",
        { image: photo },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Inclure le token dans l'en-tête Authorization
            "Content-Type": "application/json", // Spécifier le type de contenu
          },
        }
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo :", error);
      throw new Error("Échec du téléchargement de la photo");
    }
  };

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

    if (photos) {
      try {
        const contenu = await ajouterPhotos(photos);
        // On ajoute "IsPhoto" au début du contenu pour savoir si c'est une photo ou un message
        const url = `http://localhost:3000/api/message/ajouter?contenu=${encodeURIComponent(
          "IsPhoto" + contenu
        )}&idConversation=${idConversation}&idUtilisateur=${idUtilisateur}`;

        await axios.post(url, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPhotos(null);
      } catch (error) {
        setErreur("Erreur lors de l'envoi de la photo");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
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
          {messages.map((message, index) => {
            const isPhoto = message.contenu.startsWith("IsPhoto");
            const photoUrl = isPhoto
              ? message.contenu.replace("IsPhoto", "").trim()
              : null;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-md ${
                  message.idUtilisateur === idUtilisateur
                    ? "bg-blue-100 self-end"
                    : "bg-gray-100 self-start"
                }`}
              >
                {isPhoto ? (
                  <img
                    src={photoUrl || ""}
                    alt="Message Image"
                    className="rounded-lg max-w-xs"
                  />
                ) : (
                  <p>{message.contenu}</p>
                )}
                <small className="text-gray-500">
                  {new Date(message.dateEnvoi).toLocaleTimeString()}
                </small>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="flex p-4 bg-white border-t">
        <div className="mt-4 mx-2">
          <PrendrePhoto onPhotoConfirmed={setPhotos} />
        </div>
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
      <footer className="bg-white shadow-lg">
        <nav className="flex flex-col items-center w-full">
          <div className="w-full flex justify-center">
            <div className="w-full h-px bg-gray-600 my-2"> </div>
          </div>
          <div className="flex justify-around items-center py-3 w-full">
            <Link href="/" passHref>
              <p className="flex flex-col items-center">
                <HomeIcon size={25} />
                <span className="text-xs mt-1">Accueil</span>
              </p>
            </Link>
            <Link href="/plantes-utilisateur" passHref>
              <p className="flex flex-col items-center">
                <Leaf size={25} />
                <span className="text-xs mt-1">Plantes</span>
              </p>
            </Link>
            <Link href="/messages" passHref>
              <p className="flex flex-col items-center">
                <MessageCircle size={25} />
                <span className="text-xs mt-1">Messages</span>
              </p>
            </Link>
            <Link href="/profile" passHref>
              <p className="flex flex-col items-center">
                <User size={25} />
                <span className="text-xs mt-1">Profil</span>
              </p>
            </Link>
          </div>
        </nav>
      </footer>
    </div>
  );
}
