'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job/JobCard';
import { PUBLIC_JOBS_QUERY, CANDIDATE_ROLES_QUERY } from '@/lib/graphql/queries';
import { useClaimWizard } from '@/hooks/useClaimWizard';
import type { PublicJobCard } from '@/types';

/** Demo jobs — best matches (role + location match). Slugs must exist in DEMO_JOBS map. */
const DEMO_BEST_MATCHES: PublicJobCard[] = [
  { id: 'preview-001', slug: 'journeyman-electrician-houston-tx-12345', title: 'Journeyman Electrician', employerName: 'Gulf Coast Energy Services', location: 'Houston, TX', employmentTypeText: 'Full-time', payRateText: '$38–45/hr', startDateText: 'March 3, 2026', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'demo-emp-1', slug: 'master-electrician-dallas', title: 'Master Electrician', employerName: 'Gulf Coast Energy Services', location: 'Dallas, TX', employmentTypeText: 'Full-time', payRateText: '$48–55/hr', startDateText: 'March 10, 2026', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'demo-emp-2', slug: 'apprentice-electrician-houston', title: 'Apprentice Electrician', employerName: 'Gulf Coast Energy Services', location: 'Houston, TX', employmentTypeText: 'Full-time', payRateText: '$22–28/hr', startDateText: 'March 17, 2026', createdAt: '2026-02-14T00:00:00Z' },
];

/** Demo jobs — additional (right/adjacent roles, different locations). Slugs must exist in DEMO_JOBS map. */
const DEMO_ADDITIONAL_JOBS: PublicJobCard[] = [
  { id: 'demo-sim-1', slug: 'electrician-calgary', title: 'Journeyman Electrician', employerName: 'Vertex Energy Services', location: 'Calgary, AB', employmentTypeText: 'Full-time', payRateText: '$45–55/hr', startDateText: 'March 3, 2026', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'demo-sim-2', slug: 'pipefitter-fort-mcmurray', title: 'Pipefitter — Turnaround', employerName: 'Clearstream Energy', location: 'Fort McMurray, AB', employmentTypeText: 'Contract', payRateText: '$52/hr + LOA', startDateText: 'March 24, 2026', createdAt: '2026-02-14T00:00:00Z' },
  { id: 'demo-sim-3', slug: 'welder-b-pressure', title: 'B-Pressure Welder', employerName: 'Aecon Industrial', location: 'Edmonton, AB', employmentTypeText: 'Full-time', payRateText: '$48–58/hr', startDateText: 'April 7, 2026', createdAt: '2026-02-13T00:00:00Z' },
  { id: 'demo-sim-4', slug: 'heavy-equipment-operator', title: 'Heavy Equipment Operator', employerName: 'North American Construction', location: 'Grande Prairie, AB', employmentTypeText: 'Rotational', payRateText: '$42/hr + camp', startDateText: 'March 15, 2026', createdAt: '2026-02-12T00:00:00Z' },
];

function getAppDeepLink(): string {
  return 'https://moblyze.app.link/download?~channel=web-claim&~campaign=profile-claim';
}

interface MatchingJobsProps {
  selectedRoleIds: string[];
  workLocations: string[];
  demo?: boolean;
}

/** Check if a job location fuzzy-matches any of the user's work locations */
function locationMatches(jobLocation: string, workLocations: string[]): boolean {
  const jobLoc = jobLocation.toLowerCase();
  return workLocations.some((loc) => {
    const userLoc = loc.toLowerCase();
    // Match city name (e.g. "Houston" in "Houston, TX")
    const city = userLoc.split(',')[0].trim();
    return jobLoc.includes(city) || userLoc.includes(jobLoc.split(',')[0].trim());
  });
}

/**
 * Fetch all public jobs, score by role name overlap + location,
 * and display two carousels: best matches and additional jobs.
 */
function MatchingJobs({ selectedRoleIds, workLocations, demo }: MatchingJobsProps) {
  // Fetch all roles to map IDs → names
  const { data: rolesData } = useQuery<{ paginatedCandidateRoles?: { roles: Array<{ id: string; name: string }> } }>(CANDIDATE_ROLES_QUERY, {
    variables: { limit: 500 },
    skip: demo,
  });

  // Fetch all public jobs
  const { data: jobsData, loading } = useQuery<{ publicJobs: (PublicJobCard & { roles?: Array<{ id: string; name: string }> })[] }>(
    PUBLIC_JOBS_QUERY,
    { variables: { limit: 200 }, skip: demo }
  );

  // Build role name set from selected IDs
  const selectedRoleNames = useMemo(() => {
    const allRoles = rolesData?.paginatedCandidateRoles?.roles ?? [];
    return new Set(
      selectedRoleIds
        .map((id: string) => allRoles.find((r: { id: string; name: string }) => r.id === id)?.name)
        .filter(Boolean)
    );
  }, [selectedRoleIds, rolesData]);

  // Split jobs into best matches (role + location) and additional (role only)
  const { bestMatches, additionalJobs } = useMemo(() => {
    if (demo) return { bestMatches: DEMO_BEST_MATCHES, additionalJobs: DEMO_ADDITIONAL_JOBS };

    const jobs = jobsData?.publicJobs ?? [];
    if (jobs.length === 0) return { bestMatches: [], additionalJobs: [] };

    // Score each job
    const scored = jobs.map((job) => {
      const jobRoleNames = (job.roles ?? []).map((r) => r.name);
      const roleScore = jobRoleNames.filter((name) => selectedRoleNames.has(name)).length;
      const hasLocationMatch = locationMatches(job.location, workLocations);
      return { ...job, roleScore, hasLocationMatch };
    });

    // Best matches: has role overlap AND location match
    const best = scored
      .filter((j) => j.roleScore > 0 && j.hasLocationMatch)
      .sort((a, b) => b.roleScore - a.roleScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    // Additional: has role overlap but NO location match (exclude jobs already in best)
    const bestIds = new Set(best.map((j) => j.id));
    const additional = scored
      .filter((j) => j.roleScore > 0 && !j.hasLocationMatch && !bestIds.has(j.id))
      .sort((a, b) => b.roleScore - a.roleScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    // If no location-based split is possible (no work locations), fall back to single list
    if (workLocations.length === 0) {
      const all = scored
        .filter((j) => j.roleScore > 0)
        .sort((a, b) => b.roleScore - a.roleScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { bestMatches: all.slice(0, 6), additionalJobs: [] as typeof all };
    }

    return { bestMatches: best, additionalJobs: additional };
  }, [demo, jobsData, selectedRoleNames, workLocations]);

  if (demo) {
    return (
      <>
        <JobCarousel title="Jobs that look like a good match" jobs={DEMO_BEST_MATCHES} />
        <JobCarousel title="Additional jobs you may want to look at" jobs={DEMO_ADDITIONAL_JOBS} />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (bestMatches.length === 0 && additionalJobs.length === 0) return null;

  return (
    <>
      {bestMatches.length > 0 && (
        <JobCarousel
          title={workLocations.length > 0 ? 'Jobs that look like a good match' : 'Jobs matching your profile'}
          jobs={bestMatches}
        />
      )}
      {additionalJobs.length > 0 && (
        <JobCarousel title="Additional jobs you may want to look at" jobs={additionalJobs} />
      )}
    </>
  );
}

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

interface ClaimConfirmationProps {
  name: string | null;
  selectedRoleIds: string[];
  workLocations: string[];
  demo?: boolean;
}

/**
 * Claim flow confirmation page.
 *
 * Shows: success banner, name greeting, two job carousels, app download CTA.
 */
export function ClaimConfirmation({ name, selectedRoleIds, workLocations, demo }: ClaimConfirmationProps) {
  const appDeepLink = getAppDeepLink();
  const claimWizard = useClaimWizard();

  // Capture all needed data in refs BEFORE reset clears wizard state.
  // The parent passes these from claimWizard — after reset they become
  // empty, but the refs preserve the original values for display.
  const capturedName = useRef(name);
  const capturedRoleIds = useRef(selectedRoleIds);
  const capturedWorkLocations = useRef(workLocations);
  const capturedDemo = useRef(demo);
  const didReset = useRef(false);

  useEffect(() => {
    if (didReset.current) return;
    didReset.current = true;

    // Snapshot current values before reset
    if (name) capturedName.current = name;
    if (selectedRoleIds.length > 0) capturedRoleIds.current = selectedRoleIds;
    if (workLocations.length > 0) capturedWorkLocations.current = workLocations;
    capturedDemo.current = demo;

    // Clear wizard data so re-visiting /start begins fresh, but keep the
    // step at 'confirmation' so the parent keeps rendering this component.
    // The step will reset to 'landing' on the next visit via StartPageClient.
    claimWizard.reset();
    claimWizard.setStep('confirmation');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasRoles = capturedRoleIds.current.length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-32">
      {/* Success Banner */}
      <div className="flex flex-col items-center text-center space-y-2 pb-6">
        <CheckCircle2 className="size-14 text-green-500" />
        <h1 className="text-2xl font-bold tracking-tight">
          {capturedName.current ? `You're in, ${capturedName.current}!` : "You're in!"}
        </h1>
        <div className="h-2" />
        <p className="text-muted-foreground text-sm">
          We&apos;ll send you new jobs that are a good match for you. Use the app to browse more
          jobs, build your profile, and check your application status.
        </p>
      </div>

      {/* Job Carousels — best matches + additional jobs */}
      {hasRoles && (
        <MatchingJobs
          selectedRoleIds={capturedRoleIds.current}
          workLocations={capturedWorkLocations.current}
          demo={capturedDemo.current}
        />
      )}

      {/* Sticky App Download Footer — matches wizard steps' sticky bar pattern */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="h-4 mb-3" />
          <a href={appDeepLink} target="_blank" rel="noopener noreferrer">
            <Button variant="default" className="w-full h-11 font-semibold relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/moblyze-app-icon.webp`}
                alt=""
                width={24}
                height={24}
                className="rounded shrink-0 absolute left-4"
              />
              Download the Moblyze App
            </Button>
          </a>
          <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
            <p className="text-center text-xs text-muted-foreground">
              Track your matches, get notified about new jobs, and manage your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
