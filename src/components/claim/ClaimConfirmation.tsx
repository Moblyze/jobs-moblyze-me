'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job/JobCard';
import { PUBLIC_JOBS_QUERY, CANDIDATE_ROLES_QUERY } from '@/lib/graphql/queries';
import type { PublicJobCard } from '@/types';

/** Demo jobs for claim confirmation */
const DEMO_MATCHING_JOBS: PublicJobCard[] = [
  { id: 'match-1', slug: 'journeyman-electrician-houston', title: 'Journeyman Electrician', employerName: 'Gulf Coast Energy Services', location: 'Houston, TX', employmentTypeText: 'Full-time', payRateText: '$45-55/hr', startDateText: 'March 10, 2026', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'match-2', slug: 'industrial-electrician-dallas', title: 'Industrial Electrician', employerName: 'Vertex Energy Services', location: 'Dallas, TX', employmentTypeText: 'Contract', payRateText: '$50-60/hr', startDateText: 'March 17, 2026', createdAt: '2026-02-14T00:00:00Z' },
  { id: 'match-3', slug: 'pipefitter-turnaround', title: 'Pipefitter — Turnaround', employerName: 'Clearstream Energy', location: 'Fort McMurray, AB', employmentTypeText: 'Contract', payRateText: '$52/hr + LOA', startDateText: 'March 24, 2026', createdAt: '2026-02-13T00:00:00Z' },
  { id: 'match-4', slug: 'welder-b-pressure', title: 'B-Pressure Welder', employerName: 'Aecon Industrial', location: 'Edmonton, AB', employmentTypeText: 'Full-time', payRateText: '$48-58/hr', startDateText: 'April 7, 2026', createdAt: '2026-02-12T00:00:00Z' },
];

function getAppDeepLink(): string {
  return 'https://moblyze.app.link/download?~channel=web-claim&~campaign=profile-claim';
}

interface MatchingJobsProps {
  selectedRoleIds: string[];
  demo?: boolean;
}

/**
 * Fetch all public jobs, score by role name overlap with the user's selected roles,
 * and display the best matches.
 */
function MatchingJobs({ selectedRoleIds, demo }: MatchingJobsProps) {
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

  // Score and sort jobs
  const matchedJobs = useMemo(() => {
    if (demo) return DEMO_MATCHING_JOBS;

    const jobs = jobsData?.publicJobs ?? [];
    if (jobs.length === 0) return [];

    // Score each job by role name overlap
    const scored = jobs.map((job) => {
      const jobRoleNames = (job.roles ?? []).map((r) => r.name);
      const roleScore = jobRoleNames.filter((name) => selectedRoleNames.has(name)).length;
      return { ...job, score: roleScore };
    });

    // Sort: matches first (by score desc), then by recency
    scored.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return scored.slice(0, 6);
  }, [demo, jobsData, selectedRoleNames]);

  if (demo) {
    return <JobCarousel title="Jobs matching your profile" jobs={DEMO_MATCHING_JOBS} />;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (matchedJobs.length === 0) return null;

  const hasMatches = matchedJobs.some((j) => 'score' in j && (j as { score: number }).score > 0);
  const title = hasMatches ? 'Jobs matching your profile' : 'Latest opportunities';

  return <JobCarousel title={title} jobs={matchedJobs} />;
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
  demo?: boolean;
}

/**
 * Claim flow confirmation page.
 *
 * Shows: success banner, name greeting, matching jobs carousel, app download CTA.
 */
export function ClaimConfirmation({ name, selectedRoleIds, demo }: ClaimConfirmationProps) {
  const appDeepLink = getAppDeepLink();
  // Capture all needed data in refs BEFORE reset clears wizard state
  const capturedName = useRef(name);
  const capturedRoleIds = useRef(selectedRoleIds);

  useEffect(() => {
    if (name) capturedName.current = name;
    if (selectedRoleIds.length > 0) capturedRoleIds.current = selectedRoleIds;
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
        <p className="text-muted-foreground text-sm">
          We&apos;ll send you new jobs that are a good match for you. Use the app to browse more
          jobs, build your profile, and check your application status.
        </p>
      </div>

      {/* Matching Jobs — only show when we have roles to match against */}
      {hasRoles && (
        <MatchingJobs selectedRoleIds={capturedRoleIds.current} demo={demo} />
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
