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
        "name": "Furnas Hall Parking",
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
        "name": "Ketter Hall Parking",
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

      // Change cursor on hover
      map.current.on('mouseenter', 'parking-lots-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'parking-lots-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
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

      // Highlight on hover
      map.current.on('mouseenter', 'parking-lots-fill', () => {
        if (map.current) {
          map.current.setPaintProperty('parking-lots-fill', 'fill-opacity', 0.7);
        }
      });

      map.current.on('mouseleave', 'parking-lots-fill', () => {
        if (map.current) {
          map.current.setPaintProperty('parking-lots-fill', 'fill-opacity', 0.5);
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

