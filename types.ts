export type ViewState = 'onboarding' | 'home' | 'discover' | 'details' | 'itinerary' | 'map' | 'events' | 'profile' | 'planner' | 'budget' | 'alerts';

export interface Place {
  id: string;
  title: string;
  image: string;
  tags: string[];
  description: string;
  rating: number;
  reviews: number;
  cost: string; // e.g. "$", "$$", "Free"
  bestTime: string;
  coordinates: { lat: number; lng: number };
  hiddenGemReason?: string;
  address?: string;
}

export interface SavedPlace extends Place {
  addedAt: string; // ISO Date string
  notes?: string;
}

export interface ItineraryItem {
  id: string;
  time: string; // "09:00 AM"
  period: 'Morning' | 'Afternoon' | 'Evening';
  activity: string;
  placeId?: string;
  description?: string;
  mapUrl?: string;
  image?: string;
  rating?: number;
  distance?: string;
  travelTime?: string; // New: Time to travel to this spot
  notes?: string;
  coordinates?: { lat: number; lng: number }; // New: For plotting the route
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
}

export interface UserPreferences {
  name: string;
  interests: string[];
}