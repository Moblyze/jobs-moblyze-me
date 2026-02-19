'use client';

import { use, useEffect } from 'react';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { useAuth } from '@/hooks/useAuth';
import { ApplyWizard } from '@/components/apply/ApplyWizard';

interface ApplyPageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ slug?: string; jobTitle?: string }>;
}

/**
 * Apply wizard page — client component (auth requires localStorage).
 * Route: /apply/[jobId]?slug={jobSlug}&jobTitle={jobTitle}
 *
 * If already authenticated, skips auth step and goes directly to role selection.
 */
export default function ApplyPage({ params, searchParams }: ApplyPageProps) {
  const { jobId } = use(params);
  const { slug, jobTitle } = use(searchParams);

  const { setJobContext, setStep, step } = useApplyWizard();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Store job context in wizard state for cross-step access
    setJobContext(jobId, slug ?? '');

    // Already authenticated: skip phone OTP, go straight to role selection
    if (isAuthenticated && (step === 'phone' || step === 'verify')) {
      setStep('roles');
    }
  }, [jobId, slug, isAuthenticated, setJobContext, setStep, step]);

  return (
    <main className="min-h-screen bg-background">
      <ApplyWizard jobTitle={jobTitle} />
    </main>
  );
}
