"use client";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import CameraCapture from '@/components/camera';

interface Message {
  txt_msg: string;
  exp_msg: string;
  psd_utl: string;
  psd_utl_1: string;
}

interface ChatPageProps {
  myPseudo: string;
  proprietaire: string;
  gardien: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ myPseudo, proprietaire, gardien }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const messageController = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem('token');

  const headers = new Headers();
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const endpoint = `http://15.237.169.255:3000/api/message/afficher`;
      const psd_utl = myPseudo === 'gardien' ? 'proprietaire' : 'gardien';
      const psd_utl_1 = proprietaire.toString();

      const response = await axios.get(endpoint, {
        params: {
          psd_utl,
          psd_utl_1,
        },
      });

      if (response.status === 200) {
        setMessages(response.data);
      } else {
        console.log('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (messageText.trim() === '') {
      return;
    }

    try {
      const endpoint = `http://localhost:3000/api/message/ajouter`;
      const response = await axios.post(endpoint, {
        txt_msg: messageText,
        exp_msg: myPseudo,
        psd_utl: gardien,
        psd_utl_1: proprietaire,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`, // Inclure le token dans l'en-tête Authorization
          'Content-Type': 'application/json' // Spécifier le type de contenu, si nécessaire
        }});

      if (response.status === 200) {
        setMessageText('');
        loadMessages();
      } else {
        console.log('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          {myPseudo === proprietaire ? gardien : myPseudo === gardien ? proprietaire : 'Pas de conversation'}
        </h1>
      </div>

      <div className="mb-8 max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className="p-4 border-b border-gray-200">
            <p className="text-gray-800">{msg.txt_msg}</p>
            <p className="text-sm text-gray-500">{msg.exp_msg}</p>
          </div>
        ))}
      </div>
    
    <CameraCapture />

      <div className="flex items-center">
        <input
          ref={messageController}
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Tapez un message..."
          className="flex-grow p-2 border border-gray-300 rounded-l-md"
        />
        <button onClick={sendMessage} className="p-2 bg-green-500 text-white rounded-r-md hover:bg-blue-600">
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
