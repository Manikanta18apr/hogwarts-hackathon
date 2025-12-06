export type ViewState = 'home' | 'discover' | 'details' | 'itinerary' | 'map' | 'events' | 'profile';

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
}

export interface ItineraryItem {
  id: string;
  time: string; // "09:00 AM"
  period: 'Morning' | 'Afternoon' | 'Evening';
  activity: string;
  placeId?: string;
  description?: string;
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