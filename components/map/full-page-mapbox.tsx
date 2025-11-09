'use client';

import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface FullPageMapboxProps {
  center: [number, number];
  zoom?: number;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function FullPageMapbox({ center, zoom = 17.5, leftSidebar, rightSidebar }: FullPageMapboxProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom
    });

    // Add navigation controls (zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Cleanup on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom]);

  return (
    <div className="fixed inset-0 flex">
      {/* Left Sidebar */}
      {leftSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto shadow-lg">
          {leftSidebar}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <div
          ref={mapContainer}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Right Sidebar */}
      {rightSidebar && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
          {rightSidebar}
        </div>
      )}
    </div>
  );
}

