import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchLocations, reverseGeocode } from '../mapbox';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('mapbox utilities', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('searchLocations', () => {
    it('returns empty array for empty query', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');
      const result = await searchLocations('');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array for whitespace-only query', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');
      const result = await searchLocations('   ');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns empty array when no token is configured', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', '');
      const result = await searchLocations('Houston');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns parsed locations from Mapbox API response', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              place_name: 'Houston, Texas, United States',
              center: [-95.3698, 29.7604],
              text: 'Houston',
              place_type: ['place'],
              context: [
                { id: 'region.123', text: 'Texas', short_code: 'US-TX' },
                { id: 'country.456', text: 'United States', short_code: 'us' },
              ],
            },
          ],
        }),
      });

      const result = await searchLocations('Houston');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        displayName: 'Houston, TX',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        countryCode: 'US',
        coordinates: { lat: 29.7604, lng: -95.3698 },
      });
    });

    it('returns empty array when API returns non-ok response', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await searchLocations('Houston');
      expect(result).toEqual([]);
    });

    it('returns empty array when fetch throws', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await searchLocations('Houston');
      expect(result).toEqual([]);
    });
  });

  describe('reverseGeocode', () => {
    it('returns null when no token is configured', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', '');
      const result = await reverseGeocode(29.76, -95.37);
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('returns parsed location from API response', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              place_name: 'Houston, Texas, United States',
              center: [-95.3698, 29.7604],
              text: 'Houston',
              place_type: ['place'],
              context: [
                { id: 'region.123', text: 'Texas', short_code: 'US-TX' },
                { id: 'country.456', text: 'United States', short_code: 'us' },
              ],
            },
          ],
        }),
      });

      const result = await reverseGeocode(29.7604, -95.3698);
      expect(result).toEqual({
        displayName: 'Houston, TX',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        countryCode: 'US',
        coordinates: { lat: 29.7604, lng: -95.3698 },
      });
    });

    it('returns null when API returns no features', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: [] }),
      });

      const result = await reverseGeocode(0, 0);
      expect(result).toBeNull();
    });

    it('returns null when API returns non-ok response', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await reverseGeocode(29.76, -95.37);
      expect(result).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await reverseGeocode(29.76, -95.37);
      expect(result).toBeNull();
    });
  });

  describe('parseFeature (tested via searchLocations)', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'pk.test-token');
    });

    it('formats US location as City, ST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              place_name: 'Dallas, Texas, United States',
              center: [-96.7970, 32.7767],
              text: 'Dallas',
              place_type: ['place'],
              context: [
                { id: 'region.1', text: 'Texas', short_code: 'US-TX' },
                { id: 'country.1', text: 'United States', short_code: 'us' },
              ],
            },
          ],
        }),
      });

      const result = await searchLocations('Dallas');
      expect(result[0].displayName).toBe('Dallas, TX');
      expect(result[0].stateCode).toBe('TX');
      expect(result[0].countryCode).toBe('US');
    });

    it('formats international location as City, State, Country', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              place_name: 'Calgary, Alberta, Canada',
              center: [-114.0719, 51.0447],
              text: 'Calgary',
              place_type: ['place'],
              context: [
                { id: 'region.1', text: 'Alberta', short_code: 'CA-AB' },
                { id: 'country.1', text: 'Canada', short_code: 'ca' },
              ],
            },
          ],
        }),
      });

      const result = await searchLocations('Calgary');
      expect(result[0].displayName).toBe('Calgary, Alberta, Canada');
      expect(result[0].stateCode).toBe('AB');
      expect(result[0].countryCode).toBe('CA');
    });

    it('extracts city from context when place_type is not place', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          features: [
            {
              place_name: 'Midtown, Houston, Texas, United States',
              center: [-95.38, 29.74],
              text: 'Midtown',
              place_type: ['neighborhood'],
              context: [
                { id: 'place.1', text: 'Houston' },
                { id: 'region.1', text: 'Texas', short_code: 'US-TX' },
                { id: 'country.1', text: 'United States', short_code: 'us' },
              ],
            },
          ],
        }),
      });

      const result = await searchLocations('Midtown');
      // city comes from context place.1 since place_type is neighborhood
      expect(result[0].city).toBe('Houston');
      expect(result[0].displayName).toBe('Houston, TX');
    });
  });
});
