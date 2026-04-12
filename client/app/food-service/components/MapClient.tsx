'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fixLeafletIcon } from '../utils/leafletIconFix';

fixLeafletIcon();

type MarkerItem = { id: number; lat: number; lng: number; title?: string };

interface MapClientProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerItem[];
  className?: string;
}

// đây là địa chỉ cứng cho trung tâm của quận cầu giấy ở Hà Nội
export default function MapClient({ center = [21.028511, 105.804817], zoom = 14, markers = [], className }: MapClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-full h-[300px] bg-gray-100 ${className || ''}`} />;
  }

  return (
    <div className={className || ''}>
      <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          // CartoDB light basemap (không cần api key)
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='© OpenStreetMap, © CartoDB'
        />

        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            <Popup>{m.title || `Marker ${m.id}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
