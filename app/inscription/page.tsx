'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

export default function Inscription() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState(''); // Utilisation de date de naissance au lieu de l'âge
  const [numero, setNumero] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [errorDialog, setErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInscription = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/utilisateur/ajouter?nom=${nom}&prenom=${prenom}&dateNaissance=${dateNaissance}&numero=${numero}&email=${email}&adresse=${adresse}&pseudo=${pseudo}&motDePasse=${motDePasse}`
        );

      console.log('Utilisateur ajouté avec succès');
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

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!isChecked) {
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="dateNaissance"
                className="block text-sm font-medium text-gray-700"
              >
                Date de naissance (MM/JJ/AA)
              </label>
              <input
                type="text"
                id="dateNaissance"
                value={dateNaissance}
                onChange={(e) => setDateNaissance(e.target.value)}
                required
                placeholder="MM/DD/YY"
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
                onChange={(e) => setNumero(e.target.value)}
                required
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <label
                htmlFor="mot de passe"
                className="block text-sm font-medium text-gray-700"
              >
                Mot de passe
              </label>
              <input
                type="text"
                id="pseudo"
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
                J'accepte les conditions d'utilisation
              </label>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-green-600"
              >
                S'inscrire
              </button>
            </div>
          </form>
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 ${openDialog ? "block" : "hidden"
            }`}
        >
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl mb-4">Conditions d'utilisation</h2>
            <p className="text-sm text-gray-700 mb-4">
              Bienvenue sur notre application mobile ! Nous sommes ravis de vous
              compter parmi nos utilisateurs. Veuillez lire attentivement les
              présentes Conditions d'utilisation, car elles régissent votre
              accès et votre utilisation de nos services.
            </p>
            <ol className="list-decimal text-sm text-gray-700">
              <li>Acceptation des Conditions d'utilisation</li>
              <li>Modifications des Conditions d'utilisation</li>
              <li>Utilisation de l'Application</li>
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
      </div>
    </div>
  );
}
