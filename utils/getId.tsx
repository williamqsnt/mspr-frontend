// getId.js
import axios from 'axios';

// Fonction pour récupérer l'ID de l'utilisateur à partir du pseudo
async function getId(pseudo:any) {
  try {
    const url = `http://localhost:3000/api/utilisateurs/id?psd_utl=${encodeURIComponent(pseudo)}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      return response.data.utilisateur.toString();
    } else {
      throw new Error('Failed to load user ID');
    }
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw error;
  }
}

export default getId;
