import { Suspense } from 'react';
import { DEMO_JOBS } from '@/lib/demo-jobs';
import ApplyPageClient from './ApplyPageClient';

/** Pre-render demo job IDs for static export */
export function generateStaticParams() {
  return Array.from(DEMO_JOBS.values()).map((job) => ({ jobId: job.id }));
}

export default function ApplyPage() {
  return (
    <Suspense>
      <ApplyPageClient />
    </Suspense>
  );
}
