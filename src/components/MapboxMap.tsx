import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapLocation {
  name: string;
  address: string;
  coordinates: [number, number];
  color: string;
}

interface MapboxMapProps {
  locations: MapLocation[];
  height?: string;
  zoom?: number;
}

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

const MapboxMap: React.FC<MapboxMapProps> = ({ 
  locations, 
  height = 'h-64', 
  zoom = 11 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_ACCESS_TOKEN) return;

    // Initialize map
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    
    // Calculate center point from all locations
    const centerLng = locations.reduce((sum, loc) => sum + loc.coordinates[0], 0) / locations.length;
    const centerLat = locations.reduce((sum, loc) => sum + loc.coordinates[1], 0) / locations.length;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [centerLng, centerLat],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each location
    locations.forEach((location) => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.style.width = '20px';
      markerElement.style.height = '20px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor = location.color;
      markerElement.style.border = '3px solid white';
      markerElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      markerElement.style.cursor = 'pointer';

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-2">
          <h4 class="font-bold text-sm mb-1">${location.name}</h4>
          <p class="text-xs text-gray-600">${location.address}</p>
        </div>
      `);

      // Add marker with popup
      new mapboxgl.Marker(markerElement)
        .setLngLat(location.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      markerElement.addEventListener('mouseenter', () => popup.addTo(map.current!));
      markerElement.addEventListener('mouseleave', () => popup.remove());
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [locations, zoom]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className={`${height} bg-muted rounded-lg flex items-center justify-center border border-border/20`}>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground font-sport mb-2">
            Configuration requise pour afficher la carte
          </p>
          <p className="text-xs text-muted-foreground font-sport">
            Configurez VITE_MAPBOX_ACCESS_TOKEN
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={`${height} rounded-lg shadow-lg`} />;
};

export default MapboxMap;