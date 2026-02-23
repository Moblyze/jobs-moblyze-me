import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

const houstonLoc: GeocodedLocation = {
  displayName: 'Houston, TX',
  city: 'Houston',
  state: 'Texas',
  stateCode: 'TX',
  country: 'United States',
  countryCode: 'US',
  coordinates: { lat: 29.76, lng: -95.37 },
};

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
    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(screen.getByLabelText('Clear location')).toBeInTheDocument();
    // Houston, TX appears in the location card and as a popular pill — just verify clear button exists
  });

  it('hides search input when location is selected', () => {
    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(
      screen.queryByPlaceholderText('Search for a city...')
    ).not.toBeInTheDocument();
  });

  it('calls onSelect with empty location when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <StepLocation {...defaultProps} location={houstonLoc} onSelect={onSelect} />
    );

    await user.click(screen.getByLabelText('Clear location'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: '' })
    );
  });

  it('shows "Continue" button when location is selected', () => {
    render(<StepLocation {...defaultProps} location={houstonLoc} />);
    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });

  it('shows disabled Continue button when no location or work locations selected', () => {
    render(<StepLocation {...defaultProps} />);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();
  });

  it('calls onNext when Continue button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

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

  /* ---- New tests for browsable multi-select ---- */

  it('renders popular city pills', () => {
    render(<StepLocation {...defaultProps} />);
    // Check a few popular cities are rendered as buttons
    expect(screen.getByRole('button', { name: /Denver, CO/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Midland, TX/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calgary, AB/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aberdeen, UK/ })).toBeInTheDocument();
  });

  it('shows "Where can you work?" heading', () => {
    render(<StepLocation {...defaultProps} />);
    expect(screen.getByText('Where can you work?')).toBeInTheDocument();
  });

  it('toggles popular city pill on click', async () => {
    const user = userEvent.setup();
    const onWorkLocationsChange = vi.fn();

    render(
      <StepLocation
        {...defaultProps}
        workLocations={[]}
        onWorkLocationsChange={onWorkLocationsChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /Denver, CO/ }));
    expect(onWorkLocationsChange).toHaveBeenCalledWith(['Denver, CO']);
  });

  it('deselects a popular city pill when already selected', async () => {
    const user = userEvent.setup();
    const onWorkLocationsChange = vi.fn();

    render(
      <StepLocation
        {...defaultProps}
        workLocations={['Denver, CO']}
        onWorkLocationsChange={onWorkLocationsChange}
      />
    );

    // There are two buttons matching "Denver, CO": the remove X in the selected pills
    // and the popular pill itself. We want the popular pill (the one with the checkmark).
    const denverButtons = screen.getAllByRole('button', { name: /Denver, CO/ });
    // The popular pill is the one that is NOT the "Remove" button
    const popularPill = denverButtons.find(
      (btn) => !btn.getAttribute('aria-label')?.startsWith('Remove')
    );
    expect(popularPill).toBeDefined();
    await user.click(popularPill!);
    expect(onWorkLocationsChange).toHaveBeenCalledWith([]);
  });

  it('shows selected work locations as removable pills', () => {
    render(
      <StepLocation
        {...defaultProps}
        workLocations={['Denver, CO', 'Midland, TX']}
        onWorkLocationsChange={vi.fn()}
      />
    );

    const selectedSection = screen.getByTestId('selected-work-locations');
    expect(within(selectedSection).getByText('Denver, CO')).toBeInTheDocument();
    expect(within(selectedSection).getByText('Midland, TX')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Denver, CO')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Midland, TX')).toBeInTheDocument();
  });

  it('removes a work location when X is clicked on a selected pill', async () => {
    const user = userEvent.setup();
    const onWorkLocationsChange = vi.fn();

    render(
      <StepLocation
        {...defaultProps}
        workLocations={['Denver, CO', 'Midland, TX']}
        onWorkLocationsChange={onWorkLocationsChange}
      />
    );

    await user.click(screen.getByLabelText('Remove Denver, CO'));
    expect(onWorkLocationsChange).toHaveBeenCalledWith(['Midland, TX']);
  });

  it('enables Continue when work locations are selected but no home location', () => {
    render(
      <StepLocation
        {...defaultProps}
        location={null}
        workLocations={['Denver, CO']}
        onWorkLocationsChange={vi.fn()}
      />
    );

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).not.toBeDisabled();
  });

  it('shows browse search input', () => {
    render(<StepLocation {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Search or browse all cities...')
    ).toBeInTheDocument();
  });

  it('opens grouped dropdown on search focus', async () => {
    const user = userEvent.setup();

    render(<StepLocation {...defaultProps} />);

    await user.click(screen.getByPlaceholderText('Search or browse all cities...'));

    // Should show grouped region headers
    expect(screen.getByText('Gulf Coast & Southeast')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Middle East')).toBeInTheDocument();
  });
});
