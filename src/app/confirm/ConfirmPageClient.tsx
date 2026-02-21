'use client';

import { useSearchParams } from 'next/navigation';
import { ConfirmationContent } from '@/components/confirm/ConfirmationContent';

/**
 * Post-apply confirmation page — Client Component for static export.
 *
 * Route: /confirm?jobId={jobId}&slug={jobSlug}&whiteLabel=true&employerId={employerId}
 *
 * - whiteLabel=true: Show employer-branded layout with employer jobs only
 * - employerId: Client organization ID used to fetch employer jobs (Tier 0 / white-label flow)
 * - demo=true: Use hardcoded demo data instead of live API calls
 */
export default function ConfirmPageClient() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') ?? undefined;
  const slug = searchParams.get('slug') ?? undefined;
  const demo = searchParams.get('demo');
  const whiteLabel = searchParams.get('whiteLabel');
  const employerId = searchParams.get('employerId') ?? undefined;

  return (
    <main className="min-h-screen bg-background">
      <ConfirmationContent
        jobId={jobId}
        slug={slug}
        demo={demo === 'true'}
        whiteLabel={whiteLabel === 'true'}
        employerId={employerId}
      />
    </main>
  );
}
