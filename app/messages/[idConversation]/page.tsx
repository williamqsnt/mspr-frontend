"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import io from "socket.io-client";

export default function MessagesPage() {
  const router = useRouter();
  const { idConversation } = useParams(); // Pour récupérer l'ID de la conversation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [erreur, setErreur] = useState(null);
  const token = localStorage.getItem("token");

  // Initialiser la connexion Socket.IO
  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      query: { token },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Récupérer les messages dès que la connexion est établie
  useEffect(() => {
    if (socket && idConversation) {
      socket.emit("recupererMessages", idConversation);

      socket.on("messagesRecus", (messages) => {
        setMessages(messages);
      });

      socket.on("erreur", (message) => {
        setErreur(message);
      });
    }
  }, [socket, idConversation]);

  // Envoyer un nouveau message
  const handleSendMessage = () => {
    if (socket && newMessage.trim() !== "") {
      socket.emit("envoyerMessage", { idConversation, contenu: newMessage });
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <button onClick={() => router.back()} className="flex">
          <ChevronLeft className="text-black" />
        </button>
      </header>
      <main className="flex-1 p-4">
        {erreur && <p className="text-red-500">{erreur}</p>}
        <div className="flex flex-col space-y-4 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-md ${
                message.envoyeParUtilisateur ? "bg-blue-100 self-end" : "bg-gray-100 self-start"
              }`}
            >
              <p>{message.contenu}</p>
              <small className="text-gray-500">{new Date(message.dateEnvoi).toLocaleTimeString()}</small>
            </div>
          ))}
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
