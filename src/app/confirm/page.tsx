import type { Metadata } from 'next';
import { Suspense } from 'react';
import ConfirmPageClient from './ConfirmPageClient';

export const metadata: Metadata = {
  title: 'Application Submitted | Moblyze',
  description: 'Your job application has been submitted.',
  robots: { index: false, follow: false },
};

/**
 * Post-apply confirmation page.
 * Route: /confirm?jobId={jobId}&slug={jobSlug}
 * Uses client component to read searchParams (required for static export).
 */
export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense>
        <ConfirmPageClient />
      </Suspense>
    </main>
  );
}
