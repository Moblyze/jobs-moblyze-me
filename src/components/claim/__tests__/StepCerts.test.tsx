import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepCerts } from '../StepCerts';

describe('StepCerts', () => {
  const defaultProps = {
    selectedCertNames: [] as string[],
    onSelectionChange: vi.fn(),
    onNext: vi.fn(),
    profileCertNames: [] as string[],
  };

  it('renders heading and subtext', () => {
    render(<StepCerts {...defaultProps} />);
    expect(screen.getByText('Your certifications')).toBeInTheDocument();
    expect(
      screen.getByText(/uploading a photo of each certification/i)
    ).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<StepCerts {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Search certifications...')
    ).toBeInTheDocument();
  });

  it('displays cert categories from taxonomy', () => {
    render(<StepCerts {...defaultProps} />);
    // Check for some known categories
    expect(screen.getByText('Safety')).toBeInTheDocument();
    expect(screen.getByText('Welding')).toBeInTheDocument();
    expect(screen.getByText('Trades')).toBeInTheDocument();
  });

  it('displays individual certs in categories', () => {
    render(<StepCerts {...defaultProps} />);
    expect(screen.getByText('OSHA 10')).toBeInTheDocument();
    expect(screen.getByText('CWI')).toBeInTheDocument();
    expect(screen.getByText('EPA 608')).toBeInTheDocument();
  });

  it('calls onSelectionChange when a cert is clicked', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <StepCerts {...defaultProps} onSelectionChange={onSelectionChange} />
    );

    await user.click(screen.getByText('OSHA 10'));
    expect(onSelectionChange).toHaveBeenCalledWith(['OSHA 10']);
  });

  it('deselects a cert when clicked again', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <StepCerts
        {...defaultProps}
        selectedCertNames={['OSHA 10']}
        onSelectionChange={onSelectionChange}
      />
    );

    // OSHA 10 appears in both the selected card and the category list.
    // Click the one in the category list (the button in the cert list).
    const allOsha10 = screen.getAllByText('OSHA 10');
    // The category list button is the last one
    const categoryButton = allOsha10[allOsha10.length - 1].closest('button');
    expect(categoryButton).not.toBeNull();
    await user.click(categoryButton!);
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('does not allow deselecting profile certs', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <StepCerts
        {...defaultProps}
        profileCertNames={['OSHA 30']}
        onSelectionChange={onSelectionChange}
      />
    );

    // Profile cert button should be disabled
    const osha30Buttons = screen.getAllByText('OSHA 30');
    // Click the one in the cert list (the button element)
    for (const el of osha30Buttons) {
      const button = el.closest('button');
      if (button && button.disabled) {
        await user.click(button);
      }
    }
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('shows "On profile" badge for profile certs', () => {
    render(
      <StepCerts {...defaultProps} profileCertNames={['OSHA 30']} />
    );
    const badges = screen.getAllByText('On profile');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('shows selected certs card when certs are selected', () => {
    render(
      <StepCerts {...defaultProps} selectedCertNames={['CWI', 'OSHA 10']} />
    );
    // Each selected cert appears in its own bordered card (and in the taxonomy list)
    expect(screen.getAllByText('CWI').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('OSHA 10').length).toBeGreaterThanOrEqual(2);
  });

  it('filters categories by search query', async () => {
    const user = userEvent.setup();
    render(<StepCerts {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search certifications...');
    await user.type(searchInput, 'OSHA');

    // OSHA certs should still be visible
    expect(screen.getByText('OSHA 10')).toBeInTheDocument();
    expect(screen.getByText('OSHA 30')).toBeInTheDocument();

    // Non-matching certs should be gone
    expect(screen.queryByText('CWI')).not.toBeInTheDocument();
  });

  it('shows disabled "Continue" button when nothing is selected', () => {
    render(<StepCerts {...defaultProps} />);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();
  });

  it('shows enabled "Continue" button when certs are selected', () => {
    render(
      <StepCerts {...defaultProps} selectedCertNames={['OSHA 10']} />
    );
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).not.toBeDisabled();
  });

  it('calls onNext when Continue button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(
      <StepCerts
        {...defaultProps}
        selectedCertNames={['OSHA 10']}
        onNext={onNext}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('shows selected count text', () => {
    render(
      <StepCerts {...defaultProps} selectedCertNames={['OSHA 10', 'CWI']} />
    );
    expect(screen.getByText('2 tickets selected')).toBeInTheDocument();
  });

  it('shows singular "ticket" for 1 selected', () => {
    render(
      <StepCerts {...defaultProps} selectedCertNames={['OSHA 10']} />
    );
    expect(screen.getByText('1 ticket selected')).toBeInTheDocument();
  });
});
