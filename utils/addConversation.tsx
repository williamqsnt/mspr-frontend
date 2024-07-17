// addConversation.js
import axios from 'axios';

// Fonction pour ajouter une conversation
async function addConversation(plantId:any, ownerId:any, guardianId:any) {
  try {
    const url = 'http://localhost:3000/api/conversation/ajouter';
    const params = { id_plt: plantId, id_utl1: ownerId, id_utl2: guardianId, type: 'chat' };
    const response = await axios.post(url, null, { params });

    return response;
  } catch (error) {
    console.error('Error adding conversation:', error);
    throw error;
  }
}

export default addConversation;
