'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { useAuth } from '@/hooks/useAuth';
import { ApplyWizard } from '@/components/apply/ApplyWizard';

/**
 * Apply wizard page — client component (auth requires localStorage).
 * Route: /apply/[jobId]?slug={jobSlug}&jobTitle={jobTitle}
 *
 * If already authenticated, skips auth step and goes directly to role selection.
 */
export default function ApplyPageClient() {
  const params = useParams<{ jobId: string }>();
  const searchParams = useSearchParams();

  const jobId = params.jobId;
  const slug = searchParams.get('slug') ?? undefined;
  const jobTitle = searchParams.get('jobTitle') ?? undefined;
  const demo = searchParams.get('demo');
  const returning = searchParams.get('returning');
  const whiteLabel = searchParams.get('whiteLabel');
  const employerId = searchParams.get('employerId');

  const { setJobContext, setStep, setDemo, setDemoReturning, setWhiteLabel, setEmployerId, step } = useApplyWizard();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Store job context in wizard state for cross-step access
    setJobContext(jobId, slug ?? '');

    // Store employerId for white-label jobs so confirm page can fetch employer jobs
    setEmployerId(employerId ?? null);

    // Enable demo mode when param is present (used from /preview)
    // Always reset to phone step so reviewers can tap through the full flow
    if (demo === 'true') {
      setDemo(true);
      setDemoReturning(returning === 'true');
      setWhiteLabel(whiteLabel === 'true');
      setStep('phone');
      return;
    }

    // Already authenticated: skip phone OTP, go straight to role selection
    if (isAuthenticated && (step === 'phone' || step === 'verify')) {
      setStep('roles');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, slug, demo, employerId]);

  return (
    <main className="min-h-screen bg-background">
      <ApplyWizard jobTitle={jobTitle} />
    </main>
  );
}
