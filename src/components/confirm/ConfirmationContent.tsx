'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { CheckCircle2, Smartphone, Upload, Loader2 } from 'lucide-react';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/job/JobCard';
import { CertVerification } from './CertVerification';
import { SIMILAR_JOBS_QUERY } from '@/lib/graphql/queries';
import type { PublicJobCard } from '@/types';

const BRANCH_KEY = process.env.NEXT_PUBLIC_BRANCH_KEY ?? '';

// Branch deep link for Moblyze app download
function getAppDeepLink(jobId?: string): string {
  const base = 'https://moblyze.app.link/download';
  if (!jobId) return base;
  return `${base}?~channel=web-confirm&~campaign=post-apply&jobId=${jobId}`;
}

interface SimilarJobsSectionProps {
  jobId?: string;
}

/**
 * Client-side similar jobs section using Apollo useQuery.
 * SimilarJobs Server Component cannot be rendered from a Client Component,
 * so we fetch here using the same SIMILAR_JOBS_QUERY.
 */
function SimilarJobsSection({ jobId }: SimilarJobsSectionProps) {
  const { data, loading } = useQuery<{ similarJobs: PublicJobCard[] }>(
    SIMILAR_JOBS_QUERY,
    {
      variables: { jobId, limit: 6 },
      skip: !jobId,
    }
  );

  if (!jobId || loading) {
    return loading ? (
      <div className="flex justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    ) : null;
  }

  const jobs = data?.similarJobs ?? [];
  if (jobs.length === 0) return null;

  return (
    <section className="pt-4">
      <h2 className="text-lg font-semibold mb-4">More Jobs You Might Like</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}

interface ConfirmationContentProps {
  jobId?: string;
  slug?: string;
}

/**
 * Post-apply confirmation page content — client component.
 *
 * Responsibilities:
 * 1. Clear wizard state on load (application is complete)
 * 2. Show success message with green checkmark
 * 3. Cert verification (UI-only, deferred)
 * 4. Profile enhancement: CV upload CTA
 * 5. App download CTA with Branch deep link
 * 6. Similar jobs (client-side fetch via Apollo)
 */
export function ConfirmationContent({ jobId, slug }: ConfirmationContentProps) {
  const { name, reset } = useApplyWizard();
  const appDeepLink = getAppDeepLink(jobId);
  const jobHref = slug ? `/jobs/${slug}` : '/';

  // Clear wizard state on mount — application is complete
  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">

      {/* Success Banner */}
      <div className="flex flex-col items-center text-center space-y-3">
        <CheckCircle2 className="size-14 text-green-500" />
        <h1 className="text-2xl font-bold tracking-tight">Application Submitted!</h1>
        {name && (
          <p className="text-muted-foreground text-sm">
            Nice work, {name}. The employer will be in touch.
          </p>
        )}
        {!name && (
          <p className="text-muted-foreground text-sm">
            The employer will review your application and be in touch soon.
          </p>
        )}
        {slug && (
          <Link
            href={jobHref}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            View job posting
          </Link>
        )}
      </div>

      {/* Cert Verification */}
      <CertVerification />

      {/* Profile Enhancement: Upload CV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="size-4" />
            Upload your CV
          </CardTitle>
          <CardDescription>
            Employers are more likely to respond when they can see your full work history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/*
            TODO: Wire to uploadResume mutation and file input when ready.
            UPLOAD_RESUME mutation is defined in mutations.ts.
          */}
          <Button variant="outline" disabled className="w-full">
            Upload CV <span className="ml-2 text-xs text-muted-foreground">(coming soon)</span>
          </Button>
        </CardContent>
      </Card>

      {/* App Download CTA */}
      <Card className="bg-primary text-primary-foreground border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-primary-foreground">
            <Smartphone className="size-4" />
            Get the Moblyze App
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Track your application, get notified instantly, and browse more jobs — all from your phone.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <a
            href={appDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="secondary"
              className="w-full font-semibold"
            >
              Download on App Store
            </Button>
          </a>
          <a
            href={appDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="secondary"
              className="w-full font-semibold"
            >
              Get it on Google Play
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Similar Jobs */}
      <SimilarJobsSection jobId={jobId} />
    </div>
  );
}
