'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Loader2, Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchLocations, reverseGeocode } from '@/lib/mapbox';
import type { GeocodedLocation } from '@/types';

/** Energy regions matching internal-jobs-review/src/utils/energyRegions.js */
const TOP_REGIONS = [
  { id: 'gulf-of-mexico', name: 'Gulf of Mexico', description: 'Houston, New Orleans, Gulf offshore' },
  { id: 'permian-basin', name: 'Permian Basin', description: 'Midland, Odessa, Carlsbad' },
  { id: 'north-sea', name: 'North Sea', description: 'Aberdeen, UK/Norway offshore' },
  { id: 'appalachia', name: 'Appalachia', description: 'PA, WV (Marcellus/Utica)' },
  { id: 'alaska', name: 'Alaska', description: 'Anchorage, Prudhoe Bay' },
];

const MORE_REGIONS = [
  { id: 'middle-east', name: 'Middle East', description: 'UAE, Saudi Arabia, Qatar, Kuwait' },
  { id: 'asia-pacific', name: 'Asia Pacific', description: 'Singapore, Malaysia, Australia' },
  { id: 'western-canada', name: 'Western Canada', description: 'Alberta & Saskatchewan' },
  { id: 'rockies', name: 'Rockies', description: 'Colorado, Wyoming' },
  { id: 'eagle-ford', name: 'Eagle Ford', description: 'South Texas' },
  { id: 'bakken', name: 'Bakken', description: 'North Dakota' },
  { id: 'latin-america', name: 'Latin America', description: 'Brazil, Mexico, Colombia' },
  { id: 'dj-basin', name: 'DJ Basin', description: 'Denver-Julesburg, CO/WY' },
];

/** Browsable city list grouped by region — shown on focus before typing */
const POPULAR_CITIES: { group: string; cities: string[] }[] = [
  // US — Gulf Coast & Southeast
  { group: 'Gulf Coast & Southeast', cities: [
    'Houston, TX', 'New Orleans, LA', 'Corpus Christi, TX', 'Beaumont, TX',
    'Lake Charles, LA', 'Baton Rouge, LA', 'Mobile, AL', 'Pascagoula, MS',
    'Port Arthur, TX', 'Galveston, TX', 'Lafayette, LA', 'Houma, LA',
  ] },
  // US — Permian Basin & West Texas
  { group: 'Permian Basin & West Texas', cities: [
    'Midland, TX', 'Odessa, TX', 'Carlsbad, NM', 'Pecos, TX',
    'Lubbock, TX', 'Big Spring, TX', 'Hobbs, NM', 'Andrews, TX',
  ] },
  // US — Eagle Ford & South Texas
  { group: 'Eagle Ford & South Texas', cities: [
    'San Antonio, TX', 'Laredo, TX', 'Gonzales, TX', 'Karnes City, TX',
    'Cotulla, TX', 'Three Rivers, TX',
  ] },
  // US — North Texas & Oklahoma
  { group: 'North Texas & Oklahoma', cities: [
    'Dallas, TX', 'Fort Worth, TX', 'Oklahoma City, OK', 'Tulsa, OK',
    'Enid, OK', 'Ardmore, OK',
  ] },
  // US — Appalachia & Northeast
  { group: 'Appalachia & Northeast', cities: [
    'Pittsburgh, PA', 'Morgantown, WV', 'Wheeling, WV', 'Canonsburg, PA',
    'Washington, PA', 'Clarksburg, WV', 'Williamsport, PA', 'Philadelphia, PA',
  ] },
  // US — Rockies & DJ Basin
  { group: 'Rockies & Mountain West', cities: [
    'Denver, CO', 'Casper, WY', 'Greeley, CO', 'Rock Springs, WY',
    'Grand Junction, CO', 'Vernal, UT', 'Cheyenne, WY', 'Billings, MT',
  ] },
  // US — Bakken
  { group: 'Bakken & Upper Midwest', cities: [
    'Williston, ND', 'Dickinson, ND', 'Minot, ND', 'Bismarck, ND',
    'Sidney, MT',
  ] },
  // US — Alaska
  { group: 'Alaska', cities: [
    'Anchorage, AK', 'Fairbanks, AK', 'Kenai, AK', 'Prudhoe Bay, AK',
    'Valdez, AK',
  ] },
  // US — West Coast & California
  { group: 'California & West Coast', cities: [
    'Bakersfield, CA', 'Los Angeles, CA', 'Long Beach, CA', 'Richmond, CA',
    'Martinez, CA', 'Seattle, WA', 'Portland, OR',
  ] },
  // US — Other Major Cities
  { group: 'Other US Cities', cities: [
    'Atlanta, GA', 'Charlotte, NC', 'Nashville, TN', 'Jacksonville, FL',
    'Chicago, IL', 'Detroit, MI', 'Indianapolis, IN', 'Shreveport, LA',
    'Memphis, TN', 'Tampa, FL', 'Phoenix, AZ', 'Las Vegas, NV',
  ] },
  // Canada
  { group: 'Canada', cities: [
    'Calgary, AB', 'Edmonton, AB', 'Fort McMurray, AB', 'Grande Prairie, AB',
    'Red Deer, AB', 'Regina, SK', 'Saskatoon, SK', 'Vancouver, BC',
    'St. John\'s, NL', 'Halifax, NS',
  ] },
  // International
  { group: 'United Kingdom & North Sea', cities: [
    'Aberdeen, UK', 'London, UK', 'Great Yarmouth, UK', 'Stavanger, Norway',
    'Bergen, Norway',
  ] },
  { group: 'Middle East', cities: [
    'Dubai, UAE', 'Abu Dhabi, UAE', 'Doha, Qatar', 'Riyadh, Saudi Arabia',
    'Dammam, Saudi Arabia', 'Kuwait City, Kuwait',
  ] },
  { group: 'Asia Pacific', cities: [
    'Singapore', 'Perth, Australia', 'Melbourne, Australia', 'Kuala Lumpur, Malaysia',
    'Jakarta, Indonesia', 'Bangkok, Thailand',
  ] },
  { group: 'Latin America', cities: [
    'Mexico City, Mexico', 'Villahermosa, Mexico', 'Rio de Janeiro, Brazil',
    'Bogotá, Colombia', 'Buenos Aires, Argentina', 'Lima, Peru',
  ] },
];

interface StepLocationProps {
  /** Currently selected location */
  location: GeocodedLocation | null;
  /** Pre-filled location from profile (city, state) */
  profileLocation?: GeocodedLocation | null;
  /** Called when user selects a location */
  onSelect: (location: GeocodedLocation) => void;
  /** Work location preferences - regions/areas willing to work */
  workLocations?: string[];
  onWorkLocationsChange?: (locations: string[]) => void;
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
 * - Work location region preferences (multi-select pills)
 */
export function StepLocation({ location, profileLocation, onSelect, workLocations = [], onWorkLocationsChange, onNext, demo }: StepLocationProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [showMoreRegions, setShowMoreRegions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [workQuery, setWorkQuery] = useState('');
  const [workSuggestions, setWorkSuggestions] = useState<GeocodedLocation[]>([]);
  const [workSearching, setWorkSearching] = useState(false);
  const workDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [workDropdownOpen, setWorkDropdownOpen] = useState(false);
  const workInputRef = useRef<HTMLInputElement>(null);
  const workDropdownRef = useRef<HTMLDivElement>(null);

  // On mount: try to pre-fill from profile, then browser geolocation
  useEffect(() => {
    if (location) return; // Already have a location
    if (profileLocation) {
      onSelect(profileLocation);
      return;
    }

    if (demo) {
      // Demo mode: fake geolocation + pre-select work regions
      onSelect({
        displayName: 'Houston, TX',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        countryCode: 'US',
        coordinates: { lat: 29.7604, lng: -95.3698 },
      });
      onWorkLocationsChange?.(['gulf-of-mexico', 'permian-basin']);
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

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        workDropdownRef.current &&
        !workDropdownRef.current.contains(e.target as Node) &&
        workInputRef.current &&
        !workInputRef.current.contains(e.target as Node)
      ) {
        setWorkDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && workDropdownOpen) {
        setWorkDropdownOpen(false);
        workInputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [workDropdownOpen]);

  // Build set of all popular city names for deduplication
  const allPopularCityNames = useMemo(() => {
    const names = new Set<string>();
    for (const group of POPULAR_CITIES) {
      for (const city of group.cities) {
        names.add(city.toLowerCase());
        // Also index by city name only (before comma) for fuzzy dedup
        const commaIdx = city.indexOf(',');
        if (commaIdx > 0) names.add(city.slice(0, commaIdx).toLowerCase());
      }
    }
    return names;
  }, []);

  // Filter popular cities based on query, excluding already-selected
  const filteredCities = useMemo(() => {
    const q = workQuery.toLowerCase().trim();
    return POPULAR_CITIES.map((group) => {
      const filtered = group.cities.filter((city) => {
        if (workLocations.includes(city)) return false;
        return !q || city.toLowerCase().includes(q);
      });
      return { ...group, cities: filtered };
    }).filter((group) => group.cities.length > 0);
  }, [workQuery, workLocations]);

  // Deduplicated Mapbox results — hide cities already in the popular list
  const dedupedWorkSuggestions = useMemo(() => {
    if (workSuggestions.length === 0) return [];
    return workSuggestions.filter((s) => {
      const name = s.displayName.toLowerCase();
      // Exact match
      if (allPopularCityNames.has(name)) return false;
      // Match by city name only (Mapbox returns "Atlanta, Georgia" vs our "Atlanta, GA")
      const commaIdx = name.indexOf(',');
      if (commaIdx > 0 && allPopularCityNames.has(name.slice(0, commaIdx))) return false;
      // Already selected
      if (workLocations.includes(s.displayName)) return false;
      return true;
    });
  }, [workSuggestions, allPopularCityNames, workLocations]);

  const toggleWorkLocation = (region: string) => {
    if (!onWorkLocationsChange) return;
    if (workLocations.includes(region)) {
      onWorkLocationsChange(workLocations.filter((r) => r !== region));
    } else {
      onWorkLocationsChange([...workLocations, region]);
    }
  };

  // Debounced search for work locations — augments browsable list with Mapbox results
  const handleWorkSearch = useCallback((value: string) => {
    setWorkQuery(value);
    setWorkDropdownOpen(true);
    if (workDebounceRef.current) clearTimeout(workDebounceRef.current);

    if (!value.trim()) {
      setWorkSuggestions([]);
      return;
    }

    workDebounceRef.current = setTimeout(async () => {
      setWorkSearching(true);
      const results = await searchLocations(value);
      setWorkSuggestions(results);
      setWorkSearching(false);
    }, 300);
  }, []);

  const handleAddWorkCity = (cityName: string) => {
    if (!onWorkLocationsChange) return;
    if (!workLocations.includes(cityName)) {
      onWorkLocationsChange([...workLocations, cityName]);
    }
    setWorkQuery('');
    setWorkSuggestions([]);
    // Keep dropdown open so user can multi-select
  };

  const handleAddWorkLocation = (loc: GeocodedLocation) => {
    if (!onWorkLocationsChange) return;
    const name = loc.displayName;
    if (!workLocations.includes(name)) {
      onWorkLocationsChange([...workLocations, name]);
    }
    setWorkQuery('');
    setWorkSuggestions([]);
  };

  const removeWorkLocation = (name: string) => {
    if (!onWorkLocationsChange) return;
    onWorkLocationsChange(workLocations.filter((l) => l !== name));
  };

  // Separate region IDs from location display names for the pills
  const ALL_REGION_IDS = new Set([...TOP_REGIONS, ...MORE_REGIONS].map((r) => r.id));
  const workLocationNames = workLocations.filter((l) => !ALL_REGION_IDS.has(l));

  const hasValidLocation = location && location.displayName;
  const canContinue = hasValidLocation || workLocations.length > 0;

  return (
    <div className="space-y-6 pb-44">
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

      {/* Work location preferences */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Where else can you work?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select regions or search for specific locations.
          </p>
        </div>

        {/* Energy region quick-select pills */}
        <div className="flex flex-wrap gap-1.5">
          {TOP_REGIONS.map((region) => {
            const selected = workLocations.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => toggleWorkLocation(region.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? 'border border-primary bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:border-primary/50'
                )}
              >
                {region.name}
              </button>
            );
          })}

          {showMoreRegions && MORE_REGIONS.map((region) => {
            const selected = workLocations.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => toggleWorkLocation(region.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? 'border border-primary bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:border-primary/50'
                )}
              >
                {region.name}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowMoreRegions(!showMoreRegions)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {showMoreRegions ? 'Show less' : `+${MORE_REGIONS.length} more`}
          </button>
        </div>

        {/* Browsable location search — shows popular cities on focus, filters as you type */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            ref={workInputRef}
            type="text"
            inputMode="search"
            placeholder="Search or browse cities..."
            value={workQuery}
            onChange={(e) => handleWorkSearch(e.target.value)}
            onFocus={() => setWorkDropdownOpen(true)}
            className="pl-9 pr-9"
          />
          {workSearching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          ) : (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                setWorkDropdownOpen(!workDropdownOpen);
                workInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className={cn('size-4 transition-transform', workDropdownOpen && 'rotate-180')} />
            </button>
          )}
        </div>

        {/* Browsable dropdown — popular cities grouped by region + Mapbox results */}
        {workDropdownOpen && (
          <div
            ref={workDropdownRef}
            className="rounded-md border border-border bg-background shadow-lg overflow-hidden max-h-64 overflow-y-auto"
          >
            {/* Mapbox search results (when typing) — deduped against popular list */}
            {dedupedWorkSuggestions.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                  Search results
                </div>
                {dedupedWorkSuggestions.map((loc, i) => (
                  <button
                    key={`work-${loc.displayName}-${i}`}
                    type="button"
                    onClick={() => handleAddWorkLocation(loc)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors hover:bg-accent"
                  >
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span>{loc.displayName}</span>
                  </button>
                ))}
              </>
            )}

            {/* Grouped popular cities */}
            {filteredCities.map((group) => (
              <div key={group.group}>
                <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0">
                  {group.group}
                </div>
                {group.cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleAddWorkCity(city)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors hover:bg-accent"
                  >
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            ))}

            {/* Empty state */}
            {filteredCities.length === 0 && dedupedWorkSuggestions.length === 0 && !workSearching && workQuery.trim() && (
              <div className="px-3.5 py-3 text-sm text-muted-foreground">
                No matches found. Keep typing to search more locations.
              </div>
            )}

            {/* Done button — easy close target */}
            <div className="sticky bottom-0 border-t border-border bg-background px-3.5 py-2">
              <button
                type="button"
                onClick={() => {
                  setWorkDropdownOpen(false);
                  setWorkQuery('');
                  setWorkSuggestions([]);
                }}
                className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 py-1"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Selected work locations as removable pills */}
        {workLocationNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {workLocationNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
              >
                <MapPin className="size-3" />
                {name}
                <button
                  type="button"
                  onClick={() => removeWorkLocation(name)}
                  className="ml-0.5 text-primary/60 hover:text-primary"
                  aria-label={`Remove ${name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="h-4 mb-3" />
          <Button
            className="w-full h-11"
            onClick={onNext}
            disabled={!canContinue}
          >
            Continue
          </Button>
          <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
            <p className="text-center text-xs text-muted-foreground">
              We'll send you opportunities relevant to your locations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
