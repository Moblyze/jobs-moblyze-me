/**
 * Mapbox geocoding utilities for location search and reverse geocoding.
 * Uses Mapbox Geocoding API v5 — no SDK needed, just fetch().
 *
 * Free tier: 100,000 requests/month.
 * Reference: internal-jobs-review/src/services/mapboxGeocoder.js
 */

import type { GeocodedLocation } from '@/types';

const MAPBOX_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

function getToken(): string {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
}

/** Parse a Mapbox feature into our GeocodedLocation shape */
function parseFeature(feature: {
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string; short_code?: string }>;
  text?: string;
  place_type?: string[];
}): GeocodedLocation {
  let city: string | null = null;
  let state: string | null = null;
  let stateCode: string | null = null;
  let country: string | null = null;
  let countryCode: string | null = null;

  if (feature.place_type?.includes('place') || feature.place_type?.includes('locality')) {
    city = feature.text ?? null;
  }

  if (feature.context) {
    for (const item of feature.context) {
      const id = item.id ?? '';
      if (id.startsWith('place.')) {
        city = city ?? item.text;
      } else if (id.startsWith('region.')) {
        state = item.text;
        if (item.short_code) {
          const parts = item.short_code.split('-');
          stateCode = parts.length > 1 ? parts[1].toUpperCase() : null;
        }
      } else if (id.startsWith('country.')) {
        country = item.text;
        countryCode = item.short_code?.toUpperCase() ?? null;
      }
    }
  }

  // Format display name
  let displayName = feature.place_name;
  if (countryCode === 'US' && city && stateCode) {
    displayName = `${city}, ${stateCode}`;
  } else if (city && state && country) {
    displayName = `${city}, ${state}, ${country}`;
  } else if (city && country) {
    displayName = `${city}, ${country}`;
  }

  return {
    displayName,
    city,
    state,
    stateCode,
    country,
    countryCode,
    coordinates: {
      lat: feature.center[1],
      lng: feature.center[0],
    },
  };
}

/**
 * Search for locations by text query (autocomplete).
 * Returns up to 5 suggestions.
 */
export async function searchLocations(query: string): Promise<GeocodedLocation[]> {
  const token = getToken();
  if (!token || !query.trim()) return [];

  const encoded = encodeURIComponent(query.trim());
  const url = `${MAPBOX_BASE_URL}/${encoded}.json?access_token=${token}&limit=5&types=place,locality,neighborhood`;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features ?? []).map(parseFeature);
  } catch {
    return [];
  }
}

/**
 * Reverse geocode coordinates to a location.
 * Used for browser geolocation → readable location.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation | null> {
  const token = getToken();
  if (!token) return null;

  const url = `${MAPBOX_BASE_URL}/${lng},${lat}.json?access_token=${token}&limit=1&types=place,locality`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.features?.length) return null;
    return parseFeature(data.features[0]);
  } catch {
    return null;
  }
}
