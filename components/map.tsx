import React, { useEffect, useState } from 'react';
import { Marker, TileLayer, MapContainer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import getCoordinatesFromAddress from '@/utils/getCoordinatesFromAddress';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

interface Address {
    adresse: string;
    idPlante: string;
}

interface MapComponentProps {
    addresses: Address[];
    height: string;
    onSave: (idPlante: string, idGardiennage: string, idUtilisateur: string) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ addresses, height, onSave }) => {
    const [markerList, setMarkerList] = useState<JSX.Element[]>([]);
    const router = useRouter();  // Utilisation de useNavigate pour la redirection
    
    const handleNavigation = (route: string) => {
        router.push(route);
      };
    

    useEffect(() => {
        async function fetchMarkers() {
            const markers = await Promise.all(
                addresses.map(async (addressObj) => {
                    const coordinates = await getCoordinatesFromAddress(addressObj.adresse);
                    if (coordinates) {
                        return createMarker(coordinates, addressObj.adresse, addressObj.idPlante);
                    }
                    return null;
                })
            );
            setMarkerList(markers.filter((marker) => marker !== null) as JSX.Element[]);
        }
        fetchMarkers();
    }, [addresses]);

    function createMarker(latLng: LatLngExpression, address: string, idPlante: string): JSX.Element {
        return (
            <Marker
                key={address}
                position={latLng}
                eventHandlers={{
                    click: () => {
                        handleNavigation("/chercher-plantes");
                    },
                }}
            />
        );
    }

    return (
        <div style={{ height: height, width: '100%' }}>
            <MapContainer center={[45.76, 4.83]} zoom={13} className="h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markerList}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
