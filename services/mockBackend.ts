import { Place, SavedPlace } from "../types";

/**
 * ---------------------------------------------------------
 * ARCHITECTURE EXPLANATION (Per Request)
 * ---------------------------------------------------------
 * 
 * In a production environment, this file would be replaced by:
 * 1. Firebase Client SDK (initialized in a separate file)
 * 2. Firebase Cloud Functions (Node.js backend)
 * 
 * RECOMMENDED FIRESTORE STRUCTURE:
 * collection('users').doc(userId).collection('saved_places').doc(placeId)
 * {
 *   name: string,
 *   address: string,
 *   geo: GeoPoint(lat, lng),
 *   rating: number,
 *   photoUrl: string,
 *   addedAt: Timestamp,
 *   tags: string[]
 * }
 * 
 * RECOMMENDED CLOUD FUNCTION (exports.addPlace):
 * - Trigger: HTTPS Callable
 * - Inputs: { placeId: string }
 * - Logic: 
 *    1. Validate User Auth
 *    2. Fetch details from Google Places API (Server-side) using API Key
 *    3. Normalize data
 *    4. db.collection('users')...set(data)
 */

// --- MOCK IMPLEMENTATION BELOW ---

const STORAGE_KEY = 'wanderlust_saved_places';

// Simulate fetching saved places from Firestore
export const getSavedPlaces = async (): Promise<SavedPlace[]> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const data = localStorage.getItem(STORAGE_KEY);
      resolve(data ? JSON.parse(data) : []);
    }, 300);
  });
};

// Simulate the "addPlace" Cloud Function
// In a real app, this would be an HTTPS call to your Node.js backend
export const savePlaceToBackend = async (place: Place): Promise<SavedPlace> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const currentData = localStorage.getItem(STORAGE_KEY);
        const places: SavedPlace[] = currentData ? JSON.parse(currentData) : [];

        // Check if already saved (Idempotency)
        if (places.find(p => p.id === place.id)) {
          resolve(places.find(p => p.id === place.id)!);
          return;
        }

        // "Normalize" data as if the Cloud Function processed a raw Google API response
        const newSavedPlace: SavedPlace = {
          ...place,
          addedAt: new Date().toISOString(),
          // Ensure coordinates exist (Mocking the data normalization)
          coordinates: place.coordinates || { lat: 35.6 + (Math.random() * 0.1), lng: 139.7 + (Math.random() * 0.1) }
        };

        const updatedPlaces = [...places, newSavedPlace];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaces));
        
        console.log(`[Mock Cloud Function] Successfully saved place: ${place.title} to Firestore.`);
        resolve(newSavedPlace);
      } catch (e) {
        reject(e);
      }
    }, 600); // Simulate API latency
  });
};

export const removePlaceFromBackend = async (placeId: string): Promise<void> => {
    const currentData = localStorage.getItem(STORAGE_KEY);
    if (!currentData) return;
    const places: SavedPlace[] = JSON.parse(currentData);
    const filtered = places.filter(p => p.id !== placeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};