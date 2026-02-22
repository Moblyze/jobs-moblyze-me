'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchLocations, reverseGeocode } from '@/lib/mapbox';
import type { GeocodedLocation } from '@/types';

interface StepLocationProps {
  /** Currently selected location */
  location: GeocodedLocation | null;
  /** Pre-filled location from profile (city, state) */
  profileLocation?: GeocodedLocation | null;
  /** Called when user selects a location */
  onSelect: (location: GeocodedLocation) => void;
  /** Called when user advances */
  onNext: () => void;
  /** Demo mode */
  demo?: boolean;
}

/**
 * Step 4 of the claim wizard: location selection.
 *
 * Features:
 * - Mapbox Search autocomplete (type-ahead)
 * - Browser geolocation on mount → reverse geocode → pre-fill
 * - Pre-fill from profile location if available
 * - Selected location shown as a card with clear button
 */
export function StepLocation({ location, profileLocation, onSelect, onNext, demo }: StepLocationProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // On mount: try to pre-fill from profile, then browser geolocation
  useEffect(() => {
    if (location) return; // Already have a location
    if (profileLocation) {
      onSelect(profileLocation);
      return;
    }

    if (demo) {
      // Demo mode: fake geolocation
      onSelect({
        displayName: 'Houston, TX',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        countryCode: 'US',
        coordinates: { lat: 29.7604, lng: -95.3698 },
      });
      return;
    }

    // Try browser geolocation
    if ('geolocation' in navigator) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (result) {
            onSelect(result);
          }
          setGeolocating(false);
        },
        () => {
          // User denied or error — just show empty search
          setGeolocating(false);
        },
        { timeout: 5000 }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchLocations(value);
      setSuggestions(results);
      setSearching(false);
    }, 300);
  }, []);

  const handleSelectSuggestion = (loc: GeocodedLocation) => {
    onSelect(loc);
    setQuery('');
    setSuggestions([]);
  };

  const handleClear = () => {
    onSelect({
      displayName: '',
      city: null,
      state: null,
      stateCode: null,
      country: null,
      countryCode: null,
      coordinates: null,
    });
  };

  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeolocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (result) {
          onSelect(result);
        } else {
          setGeoError('Could not determine your location. Please search instead.');
        }
        setGeolocating(false);
      },
      () => {
        setGeoError('Location access denied. Please search for your city.');
        setGeolocating(false);
      },
      { timeout: 5000 }
    );
  };

  const hasValidLocation = location && location.displayName;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="size-6" />
          Your location
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We&apos;ll use this to show you jobs near you.
        </p>
      </div>

      {/* Selected location display */}
      {hasValidLocation ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <MapPin className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{location.displayName}</p>
            {location.country && location.countryCode !== 'US' && (
              <p className="text-xs text-muted-foreground">{location.country}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
            aria-label="Clear location"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              inputMode="search"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="rounded-md border border-border bg-background shadow-lg overflow-hidden">
              {suggestions.map((loc, i) => (
                <button
                  key={`${loc.displayName}-${i}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(loc)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-sm text-left transition-colors hover:bg-accent"
                >
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <span>{loc.displayName}</span>
                </button>
              ))}
            </div>
          )}

          {/* Use my location button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geolocating}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {geolocating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Navigation className="size-4" />
            )}
            {geolocating ? 'Getting your location...' : 'Use my current location'}
          </button>

          {geoError && (
            <p className="text-sm text-destructive">{geoError}</p>
          )}
        </>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          className="w-full h-11"
          onClick={onNext}
        >
          {hasValidLocation ? 'Continue' : 'Skip'}
        </Button>

        {hasValidLocation && (
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={onNext}
          >
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
