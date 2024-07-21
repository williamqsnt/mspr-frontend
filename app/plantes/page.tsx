'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PlantDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [plante, setPlante] = useState(null);

  useEffect(() => {
    if (id) {
      fetchPlanteDetails();
    }
  }, [id]);

  const fetchPlanteDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/plante/afficher?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setPlante(data.plante);
      } else {
        console.error('Erreur lors de la récupération des détails de la plante');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la plante:', error);
    }
  };

  if (!plante) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{plante.nom}</h1>
      <img src={plante.photoUrl} alt={plante.nom} />
      <p>{plante.description}</p>
      <p>{plante.adresse}</p>
      {/* Ajoutez d'autres détails de la plante ici */}
    </div>
  );
};

export default PlantDetailPage;
