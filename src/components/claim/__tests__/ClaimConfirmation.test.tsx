import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClaimConfirmation } from '../ClaimConfirmation';

// Mock Apollo useQuery
vi.mock('@apollo/client/react', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: null,
    loading: false,
    error: null,
  }),
}));

// Mock GraphQL queries
vi.mock('@/lib/graphql/queries', () => ({
  PUBLIC_JOBS_QUERY: { kind: 'Document', definitions: [] },
  CANDIDATE_ROLES_QUERY: { kind: 'Document', definitions: [] },
}));

// Mock JobCard component
vi.mock('@/components/job/JobCard', () => ({
  JobCard: ({ job }: { job: { title: string } }) => (
    <div data-testid="job-card">{job.title}</div>
  ),
}));

describe('ClaimConfirmation', () => {
  const defaultProps = {
    name: 'Jesse',
    selectedRoleIds: ['role-1'],
    demo: false,
  };

  it('renders success banner with personalized greeting', () => {
    render(<ClaimConfirmation {...defaultProps} />);
    expect(screen.getByText("You're in, Jesse!")).toBeInTheDocument();
  });

  it('renders generic greeting when name is null', () => {
    render(<ClaimConfirmation {...defaultProps} name={null} />);
    expect(screen.getByText("You're in!")).toBeInTheDocument();
  });

  it('renders app download CTA link', () => {
    render(<ClaimConfirmation {...defaultProps} />);
    expect(screen.getByText('Download the Moblyze App')).toBeInTheDocument();

    const link = screen.getByText('Download the Moblyze App').closest('a');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('moblyze.app.link')
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders confirmation message', () => {
    render(<ClaimConfirmation {...defaultProps} />);
    expect(
      screen.getByText(/send you new jobs that are a good match/i)
    ).toBeInTheDocument();
  });

  it('renders app tracking description', () => {
    render(<ClaimConfirmation {...defaultProps} />);
    expect(
      screen.getByText(/track your matches/i)
    ).toBeInTheDocument();
  });

  it('shows demo matching jobs in demo mode', () => {
    render(
      <ClaimConfirmation {...defaultProps} demo={true} />
    );
    // In demo mode, MatchingJobs uses DEMO_MATCHING_JOBS
    expect(screen.getByText('Jobs matching your profile')).toBeInTheDocument();
    expect(screen.getByText('Journeyman Electrician')).toBeInTheDocument();
  });
});
