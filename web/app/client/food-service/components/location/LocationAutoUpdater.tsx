'use client';

import { useEffect, useRef } from 'react';

type StoredLocation = {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: number;
};

const GEO_MIN_DISTANCE_METERS = 60;
const GEO_MAX_AGE_MS = 2 * 60 * 1000;

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const reverseGeocode = async (latitude: number, longitude: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`,
    {
      headers: {
        'User-Agent': 'FoodDeli/1.0',
      },
    }
  );

  if (!response.ok) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  const data = await response.json();
  return data?.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

export default function LocationAutoUpdater() {
  const watchIdRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    const permission = localStorage.getItem('locationPermissionAsked');
    const token = localStorage.getItem('token');

    if (!token || permission !== 'true') {
      return;
    }

    const handlePosition = async (position: GeolocationPosition) => {
      if (isProcessingRef.current) {
        return;
      }

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      try {
        const raw = localStorage.getItem('userLocation');
        const previous = raw ? (JSON.parse(raw) as Partial<StoredLocation>) : null;

        const hasPrevious =
          previous &&
          typeof previous.latitude === 'number' &&
          typeof previous.longitude === 'number' &&
          typeof previous.timestamp === 'number';

        const movedEnough = hasPrevious
          ? haversineMeters(previous.latitude as number, previous.longitude as number, latitude, longitude) >= GEO_MIN_DISTANCE_METERS
          : true;

        const staleEnough = hasPrevious
          ? Date.now() - (previous.timestamp as number) >= GEO_MAX_AGE_MS
          : true;

        if (!movedEnough && !staleEnough) {
          return;
        }

        isProcessingRef.current = true;
        const address = await reverseGeocode(latitude, longitude);

        const nextLocation: StoredLocation = {
          latitude,
          longitude,
          address,
          timestamp: Date.now(),
        };

        localStorage.setItem('userLocation', JSON.stringify(nextLocation));
        window.dispatchEvent(new Event('user-location-updated'));
      } catch (error) {
        console.error('LocationAutoUpdater error:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        void handlePosition(position);
      },
      (error) => {
        console.error('Location watcher error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return null;
}
