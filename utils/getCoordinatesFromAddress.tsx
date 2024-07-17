// utils/geocode.ts
import axios from "axios";
import { LatLngExpression } from "leaflet";

async function getCoordinatesFromAddress(address: string): Promise<LatLngExpression | null> {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`
    );

    if (response.status === 200 && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return [parseFloat(lat), parseFloat(lon)];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}

export default getCoordinatesFromAddress;
