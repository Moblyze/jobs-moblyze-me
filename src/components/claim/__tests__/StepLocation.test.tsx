import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepLocation } from '../StepLocation';
import type { GeocodedLocation } from '@/types';

// Mock mapbox module
vi.mock('@/lib/mapbox', () => ({
  searchLocations: vi.fn().mockResolvedValue([]),
  reverseGeocode: vi.fn().mockResolvedValue(null),
}));

// Mock navigator.geolocation — call error callback immediately to settle component
const mockGetCurrentPosition = vi.fn((_success, error) => {
  if (error) error(new Error('denied'));
});
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: mockGetCurrentPosition,
  },
  writable: true,
});

describe('StepLocation', () => {
  const defaultProps = {
    location: null as GeocodedLocation | null,
    onSelect: vi.fn(),
    onNext: vi.fn(),
    demo: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', () => {
    render(<StepLocation {...defaultProps} />);
    expect(screen.getByText('Your location')).toBeInTheDocument();
  });

  it('renders subtext', () => {
    render(<StepLocation {...defaultProps} />);
    expect(
      screen.getByText(/show you jobs near you/i)
    ).toBeInTheDocument();
  });

  it('shows search input when no location is selected', () => {
    render(<StepLocation {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Search for a city...')
    ).toBeInTheDocument();
  });

  it('shows "Use my current location" button when no location selected', () => {
    render(<StepLocation {...defaultProps} />);
    expect(
      screen.getByText('Use my current location')
    ).toBeInTheDocument();
  });

  it('auto-fills Houston in demo mode', () => {
    const onSelect = vi.fn();
    render(
      <StepLocation {...defaultProps} onSelect={onSelect} demo={true} />
    );

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'Houston, TX',
        city: 'Houston',
        stateCode: 'TX',
      })
    );
  });

  it('displays selected location with clear button', () => {
    const houstonLoc: GeocodedLocation = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };

    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(screen.getByText('Houston, TX')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear location')).toBeInTheDocument();
  });

  it('hides search input when location is selected', () => {
    const houstonLoc: GeocodedLocation = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };

    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(
      screen.queryByPlaceholderText('Search for a city...')
    ).not.toBeInTheDocument();
  });

  it('calls onSelect with empty location when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const houstonLoc: GeocodedLocation = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };

    render(
      <StepLocation {...defaultProps} location={houstonLoc} onSelect={onSelect} />
    );

    await user.click(screen.getByLabelText('Clear location'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: '' })
    );
  });

  it('shows "Continue" button when location is selected', () => {
    const houstonLoc: GeocodedLocation = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };

    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });

  it('shows disabled Continue button when no location or work regions selected', () => {
    render(<StepLocation {...defaultProps} />);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();
  });

  it('calls onNext when Continue button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const houstonLoc: GeocodedLocation = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };

    render(
      <StepLocation {...defaultProps} location={houstonLoc} onNext={onNext} />
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('pre-fills from profile location when available', () => {
    const onSelect = vi.fn();
    const profileLoc: GeocodedLocation = {
      displayName: 'Dallas, TX',
      city: 'Dallas',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 32.78, lng: -96.80 },
    };

    render(
      <StepLocation
        {...defaultProps}
        onSelect={onSelect}
        profileLocation={profileLoc}
      />
    );

    expect(onSelect).toHaveBeenCalledWith(profileLoc);
  });

  it('shows Continue button when location is selected', () => {
    const houstonLoc: GeocodedLocation = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };

    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});
