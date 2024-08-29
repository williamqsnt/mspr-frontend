'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { encrypt } from "@/utils/cryptoUtils";
import { ArrowLeft } from 'lucide-react';

export default function Inscription() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openRgpdDialog, setOpenRgpdDialog] = useState(false);

  const handleInscription = async () => {
    try {
      const encryptedNom = encrypt(nom);
      const encryptedPrenom = encrypt(prenom);
      const encryptedDateNaissance = encrypt(dateNaissance);
      const encryptedNumero = encrypt(numero);
      const encryptedEmail = encrypt(email);
      const encryptedAdresse = encrypt(adresse);
      const encryptedMotDePasse = encrypt(motDePasse);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/utilisateur/ajouter`, {
        nom: encryptedNom,
        prenom: encryptedPrenom,
        dateNaissance: encryptedDateNaissance,
        numero: encryptedNumero,
        email: encryptedEmail,
        adresse: encryptedAdresse,
        pseudo: pseudo,
        motDePasse: encryptedMotDePasse,
      });


      if (response.status === 200) {
        window.location.href = '/login';
      } else {
        console.error('Erreur lors de l\'ajout de l\'utilisateur: Code retour non 200');
        setErrorMessage('Erreur lors de l\'ajout de l\'utilisateur');
        setErrorDialog(true);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      setErrorMessage('Erreur lors de l\'ajout de l\'utilisateur');
      setErrorDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleShowDialog = () => {
    setOpenDialog(true);
  };

  const handleShowErrorDialog = () => {
    setErrorDialog(true);
  };

  const handleCloseErrorDialog = () => {
    setErrorDialog(false);
  };

  const handleShowRgpdDialog = () => {
    setOpenRgpdDialog(true);
  };

  const handleCloseRgpdDialog = () => {
    setOpenRgpdDialog(false);
  };

  const isDateValid = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    if (day > 31 || month > 12 || year > new Date().getFullYear()) {
      return false;
    }

    const birthDate = new Date(year, month - 1, day);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);

    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!isChecked) {
      setErrorMessage('Vous devez accepter les conditions d\'utilisation');
      handleShowErrorDialog();
      return;
    }
    if (!isDateValid(dateNaissance)) {
      setErrorMessage('Date de naissance invalide ou vous devez avoir plus de 18 ans');
      handleShowErrorDialog();
      return;
    }
    handleInscription();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <button onClick={() => window.history.back()} className="flex">
            <ArrowLeft className="mr-2" />
            Retour
          </button>

          <h2 className="text-3xl font-semibold text-center mb-6 text-green-600">
            Inscription
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-sm font-medium text-gray-700"
              >
                Nom
              </label>
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                pattern="[A-Za-z\-]+"
                title="Le nom ne peut contenir que des lettres et des tirets."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="prenom"
                className="block text-sm font-medium text-gray-700"
              >
                Prénom
              </label>
              <input
                type="text"
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
                pattern="[A-Za-z\-]+"
                title="Le prenom ne peut contenir que des lettres et des tirets."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="dateNaissance"
                className="block text-sm font-medium text-gray-700"
              >
                Date de naissance (JJ/MM/AAAA)
              </label>
              <input
                type="tel"
                id="dateNaissance"
                value={dateNaissance}
                onChange={(e) => {
                  const input = e.target.value.replace(/[^\d]/g, '');
                  let formattedDate = input;

                  if (input.length > 2) {
                    formattedDate = `${input.slice(0, 2)}/${input.slice(2)}`;
                  }
                  if (input.length > 4) {
                    formattedDate = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4, 8)}`;
                  }

                  setDateNaissance(formattedDate);
                }}
                pattern="\d{2}/\d{2}/\d{4}"
                title="Veuillez entrer une date valide au format JJ/MM/AAAA."
                required
                placeholder="JJ/MM/AAAA"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="numero"
                className="block text-sm font-medium text-gray-700"
              >
                Numéro de téléphone
              </label>
              <input
                type="text"
                id="numero"
                value={numero}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,10}$/.test(value)) {
                    setNumero(value);
                  }
                }}
                maxLength={10}
                pattern="\d{10}"
                required
                title="Veuillez entrer un numéro de téléphone valide"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="adresse"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse
              </label>
              <input
                type="text"
                id="adresse"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="pseudo"
                className="block text-sm font-medium text-gray-700"
              >
                Pseudo
              </label>
              <input
                type="text"
                id="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                pattern="[A-Za-z\-]+"
                title="Le pseudo ne peut contenir que des lettres et des tirets."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <label
                htmlFor="motDePasse"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="motDePasse"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="conditions"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="conditions"
                className="ml-2 block text-sm text-gray-900"
              >
                J&apos;accepte les conditions d&apos;utilisation
              </label>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-600"
              >
                S&apos;inscrire
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={handleShowRgpdDialog}
              className="text-green-500 hover:underline"
            >
              Voir les conditions d&apos;utilisation et RGPD
            </button>
          </div>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 ${openDialog ? "block" : "hidden"
            }`}
        >
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl mb-4">Conditions d&apos;utilisation</h2>
            <p className="text-sm text-gray-700 mb-4">
              Bienvenue sur notre application mobile ! Nous sommes ravis de vous
              compter parmi nos utilisateurs. Veuillez lire attentivement les
              présentes Conditions d&apos;utilisation, car elles régissent votre
              accès et votre utilisation de nos services.
            </p>
            <ol className="list-decimal text-sm text-gray-700">
              <li>Acceptation des Conditions d&apos;utilisation</li>
              <li>Modifications des Conditions d&apos;utilisation</li>
              <li>Utilisation de l&apos;Application</li>
            </ol>
            <button
              className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={handleCloseDialog}
            >
              Fermer
            </button>
          </div>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 ${errorDialog ? "block" : "hidden"
            }`}
        >
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl mb-4">Erreur</h2>
            <p className="text-sm text-gray-700 mb-4">{errorMessage}</p>
            <button
              className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={handleCloseErrorDialog}
            >
              OK
            </button>
          </div>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 ${openRgpdDialog ? "block" : "hidden"
            }`}
        >
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl mb-4">Conditions d&apos;utilisation et RGPD</h2>
            <p className="text-sm text-gray-700 mb-4">
              Nous respectons votre vie privée et nous engageons à protéger vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD). Voici nos pratiques en matière de confidentialité :
            </p>
            <ul className="list-disc text-sm text-gray-700 mb-4">
              <li>Nous collectons vos données uniquement pour les besoins de la gestion de votre compte.</li>
              <li>Vos données sont sécurisées et ne seront pas partagées avec des tiers sans votre consentement.</li>
              <li>Vous avez le droit d&apos;accéder à vos données, de les rectifier ou de les supprimer.</li>
            </ul>
            <button
              className="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
              onClick={handleCloseRgpdDialog}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
