// getPlantDataFromAPI.js
import axios from 'axios';

// Fonction pour récupérer les données de la plante à partir de l'API
async function getPlantDataFromAPI(address:any) {
  try {
    const url = `http://localhost:3000/api/plante/afficher?adr_plt=${encodeURIComponent(address)}`;
    const response = await axios.get(url);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching plant data:', error);
  }

  return null;
}

export default getPlantDataFromAPI;
