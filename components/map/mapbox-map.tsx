'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// GeoJSON data for parking lots
const parkingLotsGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Furnas Parking Lot",
        "route": "/lot/furnas"
      },
      "geometry": {
        "coordinates": [
          [
            [-78.78661757605275, 43.00300510157504],
            [-78.78661757605275, 43.001877652151194],
            [-78.786150737221, 43.001877652151194],
            [-78.786150737221, 43.00300510157504],
            [-78.78661757605275, 43.00300510157504]
          ]
        ],
        "type": "Polygon"
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Ketter Parking Lot",
        "route": "/lot/ketter"
      },
      "geometry": {
        "coordinates": [
          [
            [-78.7890496739093, 43.00293476162412],
            [-78.7890496739093, 43.00206138611543],
            [-78.78872397239886, 43.00206138611543],
            [-78.78872397239886, 43.00293476162412],
            [-78.7890496739093, 43.00293476162412]
          ]
        ],
        "type": "Polygon"
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Jarvis A Parking Lot",
        "route": "/lot/jarvis-a"
      },
      "geometry": {
        "coordinates": [
          [
            [-78.789121, 43.003432],
            [-78.787814, 43.003432],
            [-78.787814, 43.004264],
            [-78.789121, 43.004264],
          ]
        ],
        "type": "Rectangle"
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Jarvis B Parking Lot",
        "route": "/lot/jarvis-b"
      },
      "geometry": {
        "coordinates": [
          [
            [-78.787600, 43.003434],
            [-78.786355, 43.004263],
            [-78.786355, 43.004263],
            [-78.787600, 43.003434]
          ]
        ],
        "type": "Rectangle"
      }
    }
  ]
};

export default function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-78.78756817565733, 43.00241006994426],
      zoom: 17.5
    });

    // Add navigation controls (zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Create popup instance
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'parking-lot-popup'
    });

    // Add parking lot layers when map loads
    map.current.on('load', () => {
      if (!map.current) return;

      // Add the GeoJSON source
      map.current.addSource('parking-lots', {
        type: 'geojson',
        data: parkingLotsGeoJSON as GeoJSON.FeatureCollection
      });

      // Add a fill layer for the polygons
      map.current.addLayer({
        id: 'parking-lots-fill',
        type: 'fill',
        source: 'parking-lots',
        paint: {
          'fill-color': '#3b82f6', // Blue color
          'fill-opacity': 0.5
        }
      });

      // Add an outline layer for the polygons
      map.current.addLayer({
        id: 'parking-lots-outline',
        type: 'line',
        source: 'parking-lots',
        paint: {
          'line-color': '#1d4ed8', // Darker blue
          'line-width': 2
        }
      });

      // Handle mouseenter - show tooltip and highlight
      map.current.on('mouseenter', 'parking-lots-fill', (e) => {
        if (!map.current) return;

        // Change cursor to pointer
        map.current.getCanvas().style.cursor = 'pointer';

        // Highlight the polygon
        map.current.setPaintProperty('parking-lots-fill', 'fill-opacity', 0.7);

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const name = feature.properties?.name;

          // Get the coordinates to position popup above the polygon
          if (feature.geometry.type === 'Polygon') {
            const coordinates = feature.geometry.coordinates[0];

            // Find the northernmost (maximum latitude) and center longitude
            let maxLat = -Infinity;
            let sumLng = 0;

            coordinates.forEach(coord => {
              const [lng, lat] = coord;
              if (lat > maxLat) {
                maxLat = lat;
              }
              sumLng += lng;
            });

            const centerLng = sumLng / coordinates.length;

            // Set popup content and position it above the polygon
            popup
              .setLngLat([centerLng, maxLat])
              .setHTML(`<div style="font-weight: 600; padding: 4px 8px;">${name}</div>`)
              .addTo(map.current);
          }
        }
      });

      // Handle mouseleave - hide tooltip and remove highlight
      map.current.on('mouseleave', 'parking-lots-fill', () => {
        if (!map.current) return;

        // Reset cursor
        map.current.getCanvas().style.cursor = '';

        // Remove highlight
        map.current.setPaintProperty('parking-lots-fill', 'fill-opacity', 0.5);

        // Remove popup
        popup.remove();
      });

      // Handle clicks on parking lots
      map.current.on('click', 'parking-lots-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const route = feature.properties?.route;

          if (route) {
            router.push(route);
          }
        }
      });
    });

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, [router]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div
        ref={mapContainer}
        className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200"
      />
    </div>
  );
}

