'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job/JobCard';
import { CertVerification } from './CertVerification';
import { SIMILAR_JOBS_QUERY, PUBLIC_JOBS_QUERY } from '@/lib/graphql/queries';
import type { PublicJobCard } from '@/types';

// Branch deep link for Moblyze app download
function getAppDeepLink(jobId?: string): string {
  const base = 'https://moblyze.app.link/download';
  if (!jobId) return base;
  return `${base}?~channel=web-confirm&~campaign=post-apply&jobId=${jobId}`;
}

/** Demo employer jobs — shown in white-label demo mode */
const DEMO_EMPLOYER_JOBS: PublicJobCard[] = [
  { id: 'emp-1', slug: 'master-electrician-dallas', title: 'Master Electrician', employerName: 'Gulf Coast Energy Services', location: 'Dallas, TX', employmentTypeText: 'Full-time', payRateText: '$48–55/hr', startDateText: 'March 10, 2026', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'emp-2', slug: 'apprentice-electrician-houston', title: 'Apprentice Electrician', employerName: 'Gulf Coast Energy Services', location: 'Houston, TX', employmentTypeText: 'Full-time', payRateText: '$22–28/hr', startDateText: 'March 17, 2026', createdAt: '2026-02-14T00:00:00Z' },
  { id: 'emp-3', slug: 'electrical-foreman-austin', title: 'Electrical Foreman', employerName: 'Gulf Coast Energy Services', location: 'Austin, TX', employmentTypeText: 'Contract', payRateText: '$55–62/hr', startDateText: 'April 1, 2026', createdAt: '2026-02-13T00:00:00Z' },
];

/** Demo similar jobs — always shown in non-white-label demo mode */
const DEMO_SIMILAR_JOBS: PublicJobCard[] = [
  { id: 'sim-1', slug: 'electrician-calgary', title: 'Journeyman Electrician', employerName: 'Vertex Energy Services', location: 'Calgary, AB', employmentTypeText: 'Full-time', payRateText: '$45–55/hr', startDateText: 'March 3, 2026', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'sim-2', slug: 'pipefitter-fort-mcmurray', title: 'Pipefitter — Turnaround', employerName: 'Clearstream Energy', location: 'Fort McMurray, AB', employmentTypeText: 'Contract', payRateText: '$52/hr + LOA', startDateText: 'March 24, 2026', createdAt: '2026-02-14T00:00:00Z' },
  { id: 'sim-3', slug: 'welder-b-pressure', title: 'B-Pressure Welder', employerName: 'Aecon Industrial', location: 'Edmonton, AB', employmentTypeText: 'Full-time', payRateText: '$48–58/hr', startDateText: 'April 7, 2026', createdAt: '2026-02-13T00:00:00Z' },
  { id: 'sim-4', slug: 'heavy-equipment-operator', title: 'Heavy Equipment Operator', employerName: 'North American Construction', location: 'Grande Prairie, AB', employmentTypeText: 'Rotational', payRateText: '$42/hr + camp', startDateText: 'March 15, 2026', createdAt: '2026-02-12T00:00:00Z' },
];

/** Horizontal scrollable carousel — each card is ~80vw so the next one peeks */
function JobCarousel({ title, jobs }: { title: string; jobs: PublicJobCard[] }) {
  if (jobs.length === 0) return null;

  return (
    <section className="pt-6">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
        {jobs.map((job) => (
          <div key={job.id} className="snap-start shrink-0 w-[80vw] max-w-sm">
            <JobCard job={job} />
          </div>
        ))}
      </div>
    </section>
  );
}

interface JobRecommendationsProps {
  jobId?: string;
  demo?: boolean;
  whiteLabel?: boolean;
  /** Client organization ID — when present and whiteLabel=true, fetches employer jobs */
  employerId?: string;
}

/**
 * Renders job recommendations below the confirmation message.
 *
 * - White-label + demo: hardcoded DEMO_EMPLOYER_JOBS
 * - White-label + production + employerId: employer's other open jobs via publicJobs(employerId:)
 * - White-label + production + no other open jobs: returns null (section hidden)
 * - Standard mode + demo: hardcoded DEMO_SIMILAR_JOBS
 * - Standard mode + production: similar jobs via similarJobs(jobId:)
 */
function JobRecommendations({ jobId, demo, whiteLabel, employerId }: JobRecommendationsProps) {
  // Non-white-label: fetch similar jobs across all employers
  const { data: similarData, loading: similarLoading } = useQuery<{ similarJobs: PublicJobCard[] }>(
    SIMILAR_JOBS_QUERY,
    {
      variables: { jobId, limit: 6 },
      skip: !jobId || !!demo || !!whiteLabel,
    }
  );

  // White-label production: fetch employer's other open jobs
  const { data: employerData, loading: employerLoading } = useQuery<{ publicJobs: PublicJobCard[] }>(
    PUBLIC_JOBS_QUERY,
    {
      variables: { employerId, limit: 4 },
      // Only run in white-label production mode with a known employerId
      skip: !whiteLabel || !!demo || !employerId,
    }
  );

  if (demo && whiteLabel) {
    // Demo mode with white-label: show hardcoded employer jobs
    return (
      <JobCarousel title="More from Gulf Coast Energy" jobs={DEMO_EMPLOYER_JOBS} />
    );
  }

  if (demo) {
    // Demo mode without white-label: show hardcoded similar jobs
    return (
      <JobCarousel title="Similar jobs to consider" jobs={DEMO_SIMILAR_JOBS} />
    );
  }

  if (whiteLabel && employerId) {
    // White-label production mode
    if (employerLoading) {
      return (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    // Filter out the current job the candidate just applied to
    const otherJobs = (employerData?.publicJobs ?? []).filter((j) => j.id !== jobId);
    if (otherJobs.length === 0) {
      // Employer has no other open jobs — hide section entirely
      return null;
    }

    const employerName = otherJobs[0]?.employerName ?? 'this employer';
    return (
      <JobCarousel title={`More opportunities from ${employerName}`} jobs={otherJobs} />
    );
  }

  // Standard (non-white-label) production mode
  if (!jobId) return null;

  if (similarLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <JobCarousel title="Similar jobs to consider" jobs={similarData?.similarJobs ?? []} />
  );
}

interface ConfirmationContentProps {
  jobId?: string;
  slug?: string;
  demo?: boolean;
  whiteLabel?: boolean;
  /** Client organization ID — passed through from apply flow for Tier 0 (white-label) candidates */
  employerId?: string;
}

/**
 * Post-apply confirmation page content — client component.
 *
 * Responsibilities:
 * 1. Clear wizard state on load (application is complete)
 * 2. Show success message with green checkmark
 * 3. Cert verification (UI-only, deferred)
 * 4. App download CTA with Branch deep link
 * 5. Job recommendations:
 *    - White-label (Tier 0): employer's other open jobs via publicJobs(employerId:)
 *    - Standard: similar jobs via similarJobs(jobId:)
 *    - Demo: hardcoded demo data
 */
export function ConfirmationContent({ jobId, slug, demo, whiteLabel, employerId }: ConfirmationContentProps) {
  const { name, reset } = useApplyWizard();
  const appDeepLink = getAppDeepLink(jobId);

  // Capture name before reset clears the store
  const capturedName = useRef(name);
  useEffect(() => {
    if (name) capturedName.current = name;
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suppress unused variable warning — slug is part of the public API for future use
  void slug;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-32">

      {/* Success Banner */}
      <div className="flex flex-col items-center text-center space-y-2 pb-6">
        <CheckCircle2 className="size-14 text-green-500" />
        <h1 className="text-2xl font-bold tracking-tight">Application Submitted!</h1>
        {capturedName.current && (
          <p className="text-lg font-semibold">Nice work, {capturedName.current}.</p>
        )}
        <p className="text-muted-foreground text-sm">
          Now let&apos;s make sure your profile stands out.
        </p>
      </div>

      {/* Cert Verification */}
      <div className="pb-6">
        <CertVerification />
      </div>

      {/* Job Recommendations: Employer carousel (white-label) or Similar Jobs */}
      <JobRecommendations jobId={jobId} demo={demo} whiteLabel={whiteLabel} employerId={employerId} />

      {/* Sticky App Download Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3">
        <div className="mx-auto max-w-2xl space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            {whiteLabel
              ? 'Stay connected with new opportunities from this employer — track your application in the app.'
              : 'Track your application, see more job matches, and be the first to hear about new jobs.'}
          </p>
          <a href={appDeepLink} target="_blank" rel="noopener noreferrer">
            <Button
              variant="default"
              className="w-full h-12 font-semibold relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/moblyze-app-icon.webp`}
                alt=""
                width={24}
                height={24}
                className="rounded shrink-0 absolute left-4"
              />
              {whiteLabel
                ? 'Download the Moblyze App to Stay Connected'
                : 'Download the Moblyze App'}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
