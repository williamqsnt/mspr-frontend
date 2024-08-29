import axios from 'axios';
import router from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';

type ConfirmationPopupProps = {
  isOpen: boolean;
  onCancel: () => void;
  handleConfirm: () => Promise<void>;
};

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({ isOpen, onCancel, handleConfirm }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full z-10">
        <h2 className="text-xl font-semibold mb-4">Êtes-vous sûr de vouloir supprimer votre compte ?</h2>
        <p className="text-gray-600 mb-6">
          Cette action est irréversible. Une fois que vous avez supprimé votre compte, vous ne pourrez plus y accéder.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
