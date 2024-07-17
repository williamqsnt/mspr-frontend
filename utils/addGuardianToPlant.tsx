// addGuardianToPlant.js
import axios from 'axios';

// Fonction pour ajouter un gardien à une plante
async function addGuardianToPlant(plantId:any, userPseudo:any) {
  try {
    const url = 'http://localhost:3000/api/plante/ajouterGardien';
    const params = { id_plt: plantId, id_utl: userPseudo };
    const response = await axios.patch(url, null, { params });

    return response;
  } catch (error) {
    console.error('Error adding guardian to plant:', error);
    throw error;
  }
}

export default addGuardianToPlant;
