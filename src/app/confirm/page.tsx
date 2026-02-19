import type { Metadata } from 'next';
import { ConfirmationContent } from '@/components/confirm/ConfirmationContent';

export const metadata: Metadata = {
  title: 'Application Submitted | Moblyze',
  description: 'Your job application has been submitted.',
  robots: { index: false, follow: false },
};

interface ConfirmPageProps {
  searchParams: Promise<{ jobId?: string; slug?: string }>;
}

/**
 * Post-apply confirmation page — Server Component shell.
 *
 * Route: /confirm?jobId={jobId}&slug={jobSlug}
 *
 * Reads jobId and slug from search params and passes to the client
 * ConfirmationContent which handles wizard state cleanup and CTAs.
 */
export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { jobId, slug } = await searchParams;

  return (
    <main className="min-h-screen bg-background">
      <ConfirmationContent jobId={jobId} slug={slug} />
    </main>
  );
}
