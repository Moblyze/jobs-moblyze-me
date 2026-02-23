'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Loader2, Search, X, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { searchLocations, reverseGeocode } from '@/lib/mapbox';
import type { GeocodedLocation } from '@/types';

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

/** ~20 popular energy-industry cities shown as quick-select pills */
const POPULAR_PILLS = [
  'Houston, TX',
  'Denver, CO',
  'Midland, TX',
  'Calgary, AB',
  'Aberdeen, UK',
  'New Orleans, LA',
  'Oklahoma City, OK',
  'Pittsburgh, PA',
  'Dubai, UAE',
  'Odessa, TX',
  'Anchorage, AK',
  'San Antonio, TX',
  'Williston, ND',
  'Perth, Australia',
  'Fort McMurray, AB',
  'Casper, WY',
  'Bakersfield, CA',
  'Stavanger, Norway',
  'Singapore',
  'Beaumont, TX',
];

/** Full browsable city list grouped by region */
const GROUPED_CITIES: { group: string; cities: string[] }[] = [
  {
    group: 'Gulf Coast & Southeast',
    cities: [
      'Houston, TX', 'New Orleans, LA', 'Corpus Christi, TX', 'Beaumont, TX',
      'Lake Charles, LA', 'Baton Rouge, LA', 'Mobile, AL', 'Pascagoula, MS',
      'Port Arthur, TX', 'Galveston, TX', 'Lafayette, LA', 'Houma, LA',
    ],
  },
  {
    group: 'Permian Basin & West Texas',
    cities: [
      'Midland, TX', 'Odessa, TX', 'Carlsbad, NM', 'Pecos, TX',
      'Lubbock, TX', 'Big Spring, TX', 'Hobbs, NM', 'Andrews, TX',
    ],
  },
  {
    group: 'Eagle Ford & South Texas',
    cities: [
      'San Antonio, TX', 'Laredo, TX', 'Gonzales, TX', 'Karnes City, TX',
      'Cotulla, TX', 'Three Rivers, TX',
    ],
  },
  {
    group: 'North Texas & Oklahoma',
    cities: [
      'Dallas, TX', 'Fort Worth, TX', 'Oklahoma City, OK', 'Tulsa, OK',
      'Enid, OK', 'Ardmore, OK',
    ],
  },
  {
    group: 'Appalachia & Northeast',
    cities: [
      'Pittsburgh, PA', 'Morgantown, WV', 'Wheeling, WV', 'Canonsburg, PA',
      'Washington, PA', 'Clarksburg, WV', 'Williamsport, PA', 'Philadelphia, PA',
    ],
  },
  {
    group: 'Rockies & Mountain West',
    cities: [
      'Denver, CO', 'Casper, WY', 'Greeley, CO', 'Rock Springs, WY',
      'Grand Junction, CO', 'Vernal, UT', 'Cheyenne, WY', 'Billings, MT',
    ],
  },
  {
    group: 'Bakken & Upper Midwest',
    cities: [
      'Williston, ND', 'Dickinson, ND', 'Minot, ND', 'Bismarck, ND',
      'Sidney, MT',
    ],
  },
  {
    group: 'Alaska',
    cities: [
      'Anchorage, AK', 'Fairbanks, AK', 'Kenai, AK', 'Prudhoe Bay, AK',
      'Valdez, AK',
    ],
  },
  {
    group: 'California & West Coast',
    cities: [
      'Bakersfield, CA', 'Los Angeles, CA', 'Long Beach, CA', 'Richmond, CA',
      'Martinez, CA', 'Seattle, WA', 'Portland, OR',
    ],
  },
  {
    group: 'Other US Cities',
    cities: [
      'Atlanta, GA', 'Charlotte, NC', 'Nashville, TN', 'Jacksonville, FL',
      'Chicago, IL', 'Detroit, MI', 'Indianapolis, IN', 'Shreveport, LA',
      'Memphis, TN', 'Tampa, FL', 'Phoenix, AZ', 'Las Vegas, NV',
    ],
  },
  {
    group: 'Canada',
    cities: [
      'Calgary, AB', 'Edmonton, AB', 'Fort McMurray, AB', 'Grande Prairie, AB',
      'Red Deer, AB', 'Regina, SK', 'Saskatoon, SK', 'Vancouver, BC',
      'St. John\'s, NL', 'Halifax, NS',
    ],
  },
  {
    group: 'United Kingdom & North Sea',
    cities: [
      'Aberdeen, UK', 'London, UK', 'Great Yarmouth, UK', 'Stavanger, Norway',
      'Bergen, Norway',
    ],
  },
  {
    group: 'Middle East',
    cities: [
      'Dubai, UAE', 'Abu Dhabi, UAE', 'Doha, Qatar', 'Riyadh, Saudi Arabia',
      'Dammam, Saudi Arabia', 'Kuwait City, Kuwait',
    ],
  },
  {
    group: 'Asia Pacific',
    cities: [
      'Singapore', 'Perth, Australia', 'Melbourne, Australia', 'Kuala Lumpur, Malaysia',
      'Jakarta, Indonesia', 'Bangkok, Thailand',
    ],
  },
  {
    group: 'Latin America',
    cities: [
      'Mexico City, Mexico', 'Villahermosa, Mexico', 'Rio de Janeiro, Brazil',
      'Bogot\u00e1, Colombia', 'Buenos Aires, Argentina', 'Lima, Peru',
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface StepLocationProps {
  /** Currently selected home location */
  location: GeocodedLocation | null;
  /** Pre-filled location from profile (city, state) */
  profileLocation?: GeocodedLocation | null;
  /** Called when user selects a home location */
  onSelect: (location: GeocodedLocation) => void;
  /** Work location preferences - city names the user is willing to work in */
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
 * Redesigned as a best-in-class browsable multi-select:
 * - Popular energy-industry cities as quick-select pills
 * - Searchable, grouped, scrollable city list
 * - Multi-select with tappable checkmarks
 * - Mapbox fallback for custom locations not in the static list
 * - Home location detection via geolocation
 */
export function StepLocation({
  location,
  profileLocation,
  onSelect,
  workLocations = [],
  onWorkLocationsChange,
  onNext,
  demo,
}: StepLocationProps) {
  /* ---- Home location state ---- */
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ---- Work locations multi-select state ---- */
  const [workQuery, setWorkQuery] = useState('');
  const [workSuggestions, setWorkSuggestions] = useState<GeocodedLocation[]>([]);
  const [workSearching, setWorkSearching] = useState(false);
  const workDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- On mount: auto-fill home location ---- */
  useEffect(() => {
    if (location) return;
    if (profileLocation) {
      onSelect(profileLocation);
      return;
    }

    if (demo) {
      onSelect({
        displayName: 'Houston, TX',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        countryCode: 'US',
        coordinates: { lat: 29.7604, lng: -95.3698 },
      });
      onWorkLocationsChange?.(['Houston, TX', 'Midland, TX']);
      return;
    }

    if ('geolocation' in navigator) {
      setGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (result) onSelect(result);
          setGeolocating(false);
        },
        () => setGeolocating(false),
        { timeout: 5000 },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Home location search (Mapbox) ---- */
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
        if (result) onSelect(result);
        else setGeoError('Could not determine your location. Please search instead.');
        setGeolocating(false);
      },
      () => {
        setGeoError('Location access denied. Please search for your city.');
        setGeolocating(false);
      },
      { timeout: 5000 },
    );
  };

  /* ---- Work locations helpers ---- */
  const selectedSet = useMemo(() => new Set(workLocations), [workLocations]);

  const toggleCity = useCallback(
    (city: string) => {
      if (!onWorkLocationsChange) return;
      if (selectedSet.has(city)) {
        onWorkLocationsChange(workLocations.filter((l) => l !== city));
      } else {
        onWorkLocationsChange([...workLocations, city]);
      }
    },
    [onWorkLocationsChange, workLocations, selectedSet],
  );

  const addCity = useCallback(
    (city: string) => {
      if (!onWorkLocationsChange) return;
      if (!selectedSet.has(city)) {
        onWorkLocationsChange([...workLocations, city]);
      }
    },
    [onWorkLocationsChange, workLocations, selectedSet],
  );

  const removeCity = useCallback(
    (city: string) => {
      if (!onWorkLocationsChange) return;
      onWorkLocationsChange(workLocations.filter((l) => l !== city));
    },
    [onWorkLocationsChange, workLocations],
  );

  /* ---- Popular city names for dedup ---- */
  const allPopularCityNames = useMemo(() => {
    const names = new Set<string>();
    for (const group of GROUPED_CITIES) {
      for (const city of group.cities) {
        names.add(city.toLowerCase());
        const commaIdx = city.indexOf(',');
        if (commaIdx > 0) names.add(city.slice(0, commaIdx).toLowerCase());
      }
    }
    return names;
  }, []);

  /* ---- Filtered grouped list ---- */
  const filteredGroups = useMemo(() => {
    const q = workQuery.toLowerCase().trim();
    return GROUPED_CITIES.map((group) => {
      const filtered = group.cities.filter((city) => !q || city.toLowerCase().includes(q));
      return { ...group, cities: filtered };
    }).filter((g) => g.cities.length > 0);
  }, [workQuery]);

  /* ---- Deduped Mapbox results ---- */
  const dedupedMapbox = useMemo(() => {
    return workSuggestions.filter((s) => {
      const name = s.displayName.toLowerCase();
      if (allPopularCityNames.has(name)) return false;
      const commaIdx = name.indexOf(',');
      if (commaIdx > 0 && allPopularCityNames.has(name.slice(0, commaIdx))) return false;
      return true;
    });
  }, [workSuggestions, allPopularCityNames]);

  /* ---- Work location Mapbox search ---- */
  const handleWorkSearch = useCallback((value: string) => {
    setWorkQuery(value);
    setDropdownOpen(true);
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

  /* ---- Click-outside / Escape to close dropdown ---- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dropdownOpen) {
        setDropdownOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const hasValidLocation = location && location.displayName;
  const canContinue = hasValidLocation || workLocations.length > 0;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="space-y-6 pb-44">
      {/* ---- Header ---- */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="size-6" />
          Your location
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We&apos;ll use this to show you jobs near you.
        </p>
      </div>

      {/* ---- Home location (unchanged UX) ---- */}
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

          {geoError && <p className="text-sm text-destructive">{geoError}</p>}
        </>
      )}

      {/* ---- Work locations multi-select ---- */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Where can you work?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap cities to select them, or search for any location.
          </p>
        </div>

        {/* ---- Selected locations as removable pills ---- */}
        {workLocations.length > 0 && (
          <div className="flex flex-wrap gap-1.5" data-testid="selected-work-locations">
            {workLocations.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
              >
                <MapPin className="size-3" />
                {name}
                <button
                  type="button"
                  onClick={() => removeCity(name)}
                  className="ml-0.5 text-primary/60 hover:text-primary"
                  aria-label={`Remove ${name}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* ---- Popular city pills ---- */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_PILLS.map((city) => {
            const isSelected = selectedSet.has(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  isSelected
                    ? 'border border-primary bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:border-primary/50',
                )}
              >
                {isSelected && <Check className="inline size-3 mr-1 -ml-0.5" />}
                {city}
              </button>
            );
          })}
        </div>

        {/* ---- Search input with browsable dropdown ---- */}
        <div ref={containerRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              ref={inputRef}
              type="text"
              inputMode="search"
              placeholder="Search or browse all cities..."
              value={workQuery}
              onChange={(e) => handleWorkSearch(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              className="pl-9 pr-9"
            />
            {workSearching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
            ) : (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={cn('size-4 transition-transform', dropdownOpen && 'rotate-180')} />
              </button>
            )}
          </div>

          {/* ---- Browsable grouped dropdown ---- */}
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 z-30 mt-1 rounded-md border border-border bg-background shadow-lg overflow-hidden max-h-72 overflow-y-auto"
            >
              {/* Mapbox search results (when typing and no static match) */}
              {dedupedMapbox.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0 z-10">
                    Search results
                  </div>
                  {dedupedMapbox.map((loc, i) => {
                    const isSelected = selectedSet.has(loc.displayName);
                    return (
                      <button
                        key={`mapbox-${loc.displayName}-${i}`}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            removeCity(loc.displayName);
                          } else {
                            addCity(loc.displayName);
                          }
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors',
                          isSelected ? 'bg-primary/5' : 'hover:bg-accent',
                        )}
                      >
                        {isSelected ? (
                          <Check className="size-4 shrink-0 text-primary" />
                        ) : (
                          <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className={cn(isSelected && 'text-primary font-medium')}>{loc.displayName}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Grouped popular cities */}
              {filteredGroups.map((group) => (
                <div key={group.group}>
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky top-0 z-10">
                    {group.group}
                  </div>
                  {group.cities.map((city) => {
                    const isSelected = selectedSet.has(city);
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => toggleCity(city)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors',
                          isSelected ? 'bg-primary/5' : 'hover:bg-accent',
                        )}
                      >
                        {isSelected ? (
                          <Check className="size-4 shrink-0 text-primary" />
                        ) : (
                          <MapPin className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span className={cn(isSelected && 'text-primary font-medium')}>{city}</span>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Empty state */}
              {filteredGroups.length === 0 && dedupedMapbox.length === 0 && !workSearching && workQuery.trim() && (
                <div className="px-3.5 py-3 text-sm text-muted-foreground">
                  No matches found. Keep typing to search more locations.
                </div>
              )}

              {/* Done / close button at bottom */}
              <div className="sticky bottom-0 border-t border-border bg-background px-3.5 py-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
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
        </div>
      </div>

      {/* ---- Fixed bottom bar ---- */}
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
