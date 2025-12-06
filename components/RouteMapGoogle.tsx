import React, { useEffect, useRef, useState } from 'react';
import { ItineraryItem } from '../types';
import { Loader, MapPin } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface RouteMapGoogleProps {
  items: ItineraryItem[];
}

const RouteMapGoogle: React.FC<RouteMapGoogleProps> = ({ items }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const directionsServiceRef = useRef<any | null>(null);
  const directionsRendererRef = useRef<any | null>(null);
  const infoWindowRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);

  const [mapLoading, setMapLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.google) {
        const defaultCenter = { lat: 34.052235, lng: -118.243683 }; // Default to LA
        const mapOptions: any = {
          center: defaultCenter,
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        };
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          // customize marker icons for start/end/waypoints
          markerOptions: {
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="%2310B981" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 1.5l-6 6v10.5l6 6l6-6V7.5l-6-6z"/><circle cx="12" cy="7.5" r="2.5" fill="white"/></svg>',
              scaledSize: new window.google.maps.Size(30, 30),
              anchor: new window.google.maps.Point(15, 30)
            }
          },
          polylineOptions: {
            strokeColor: '#4F46E5', // Indigo-600
            strokeOpacity: 0.8,
            strokeWeight: 5
          },
          suppressMarkers: true // We'll add custom markers for numbering
        });
        infoWindowRef.current = new window.google.maps.InfoWindow();
        setMapLoading(false);
      } else {
        setError('Google Maps API not loaded.');
      }
    };

    if (window.google?.maps) {
      initMap();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 200);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Render directions when items change
  useEffect(() => {
    if (!mapInstanceRef.current || !directionsServiceRef.current || !directionsRendererRef.current || mapLoading) {
      return;
    }

    const validItems = items.filter(i => i.coordinates);
    if (validItems.length < 2) {
      setError('Need at least two places with coordinates to plan a route.');
      directionsRendererRef.current.setDirections({ routes: [] }); // Clear route
      clearCustomMarkers();
      return;
    }

    setRouteLoading(true);
    setError(null);
    clearCustomMarkers(); // Clear old markers before drawing new ones

    const origin = validItems[0].coordinates;
    const destination = validItems[validItems.length - 1].coordinates;
    const waypoints = validItems.slice(1, -1).map(item => ({
      location: item.coordinates,
      stopover: true,
    }));

    const request: any = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsServiceRef.current.route(request, (result: any, status: any) => {
      setRouteLoading(false);
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);
        renderCustomMarkers(validItems, result.routes[0].legs);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.fitBounds(result.routes[0].bounds);
        }
      } else {
        console.error('Directions request failed due to ' + status);
        setError('Could not get directions: ' + status);
        directionsRendererRef.current.setDirections({ routes: [] }); // Clear route
      }
    });

  }, [items, mapLoading]);

  const clearCustomMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  const renderCustomMarkers = (items: ItineraryItem[], legs: any[]) => {
    if (!mapInstanceRef.current || !window.google) return;

    // Start marker
    addCustomMarker(items[0], 0, 'Start', '#10B981'); // Teal for start

    // Waypoint markers
    for (let i = 0; i < legs.length; i++) {
        // Legs[i].start_location is the waypoint for the i+1th item
        const itemIndex = i + 1;
        if (itemIndex < items.length - 1) { // Not the last item
            addCustomMarker(items[itemIndex], itemIndex, items[itemIndex].activity, '#6366F1'); // Indigo for waypoints
        }
    }

    // End marker
    addCustomMarker(items[items.length - 1], items.length - 1, 'End', '#EF4444'); // Red for end
  };

  const addCustomMarker = (item: ItineraryItem, index: number, label: string, color: string) => {
    if (!mapInstanceRef.current || !item.coordinates || !window.google) return;

    const marker = new window.google.maps.Marker({
        position: item.coordinates,
        map: mapInstanceRef.current,
        title: item.activity,
        icon: {
            // SVG icon for numbering
            url: `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M12 1.5l-6 6v10.5l6 6l6-6V7.5l-6-6z"/><circle cx="12" cy="7.5" r="2.5" fill="white"/><text x="12" y="10" font-family="Arial" font-size="9" fill="black" text-anchor="middle" dy="0.3">${index + 1}</text></svg>`,
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 30)
        },
        label: {
            text: `${index + 1}`,
            className: `font-bold text-xs ${index === 0 ? 'text-teal-900' : index === items.length - 1 ? 'text-red-900' : 'text-indigo-900'}`,
            color: 'black', // The fill for the text in the SVG is black, this is if we used the built-in label
            fontSize: '10px',
            fontWeight: 'bold',
        }
    });

    marker.addListener('click', () => {
        if (infoWindowRef.current) {
            infoWindowRef.current.setContent(`
                <div style="padding: 10px; font-family: 'Inter', sans-serif;">
                    <h4 style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #333;">${item.activity}</h4>
                    <p style="margin: 0; font-size: 13px; color: #666;">${item.description || 'No description available.'}</p>
                    ${item.time ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Arrival: ${item.time}</p>` : ''}
                    ${item.travelTime && index > 0 ? `<p style="margin: 0; font-size: 12px; color: #999;">Travel from previous: ${item.travelTime}</p>` : ''}
                </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
    });
    markersRef.current.push(marker);
};

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden mb-8 relative h-80 w-full animate-fade-in">
      <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full shadow-sm z-10 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Optimized Route Map
      </div>

      <div ref={mapRef} className="w-full h-full">
        {mapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400">
            <Loader className="animate-spin mr-2" size={24} /> Loading Map...
          </div>
        )}
        {routeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 z-20">
            <Loader className="animate-spin mr-2" size={24} /> Calculating Route...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 z-20 p-4 text-center rounded-3xl">
            <MapPin className="mb-2" size={32} />
            <p className="font-semibold text-sm">{error}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Please ensure valid coordinates and API Key.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMapGoogle;