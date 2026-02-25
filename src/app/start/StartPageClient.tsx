'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useClaimWizard } from '@/hooks/useClaimWizard';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { useAuth } from '@/hooks/useAuth';
import { AttributionCapture } from '@/components/job/AttributionCapture';
import { ClaimWizard } from '@/components/claim/ClaimWizard';
import { CANDIDATE_POOL_PREVIEW_QUERY } from '@/lib/graphql/queries';
import type { BranchInfo } from '@/types';

/**
 * /start — Profile claim page for candidates from Courier outreach.
 *
 * URL: /start?utm_source=courier&campaign_id={id}&candidate_id={poolId}
 *      /start/roles, /start/certs, /start/location, etc.
 *
 * The step is read client-side from the URL pathname (/start/roles → 'roles').
 * Query params (demo, returning, candidate_id, utm_source, etc.) still work as before.
 *
 * Flow:
 * 1. Captures UTM/attribution params (AttributionCapture)
 * 2. Fetches candidate's first name via candidatePoolPreview (for personalized greeting)
 * 3. Launches ClaimWizard with landing → auth → roles → certs → location → CV → confirmation
 */
export default function StartPageClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const candidatePoolId = searchParams.get('candidate_id');
  const demo = searchParams.get('demo') === 'true';
  const returning = searchParams.get('returning') === 'true';

  // Read initial step from URL path: /start/roles → 'roles', /start → null
  const pathSegments = pathname.split('/').filter(Boolean);
  const initialStep = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : null;

  const claimWizard = useClaimWizard();
  const applyWizard = useApplyWizard();
  const { isAuthenticated } = useAuth();

  // Fetch candidate first name for personalized landing page
  const { data: previewData } = useQuery<{ candidatePoolPreview?: { firstName?: string } }>(CANDIDATE_POOL_PREVIEW_QUERY, {
    variables: { id: candidatePoolId },
    skip: !candidatePoolId || demo,
  });

  const firstName = demo ? 'Jesse' : previewData?.candidatePoolPreview?.firstName ?? null;

  // Initialize claim wizard on mount
  useEffect(() => {
    if (candidatePoolId) {
      claimWizard.setCandidatePoolId(candidatePoolId);
    }

    if (returning) {
      claimWizard.setReturning(true);
    }

    // Restore step from URL if present
    if (initialStep && !demo) {
      const validSteps = ['phone', 'verify', 'roles', 'certs', 'location', 'resume', 'confirmation'];
      if (validSteps.includes(initialStep)) {
        claimWizard.setStep(initialStep as any);
        if (initialStep === 'phone' || initialStep === 'verify') {
          applyWizard.setStep(initialStep as any);
        }
      }
    }

    if (demo) {
      const applyDemoState = () => {
        claimWizard.setDemo(true);
        applyWizard.setDemo(true);
        claimWizard.setStep('landing');
      };

      applyDemoState();

      // Zustand's persist middleware hydrates from localStorage asynchronously.
      // Hydration can restore stale state (step: 'roles', demo: false) that
      // overrides the reset above.  Always subscribe to onFinishHydration to
      // re-apply — the callback is a no-op if hydration already happened
      // before the subscription, but in that case our applyDemoState() above
      // already ran after hydration completed.
      const unsub = useClaimWizard.persist.onFinishHydration(() => {
        applyDemoState();
      });
      return unsub;
    }

    // Capture attribution from URL
    const channel = searchParams.get('utm_source');
    const campaign = searchParams.get('utm_campaign');
    const campaignId = searchParams.get('campaign_id');

    if (channel || campaign || campaignId || candidatePoolId) {
      const info: BranchInfo = {
        channel: channel ?? undefined,
        campaign: campaign ?? undefined,
        campaignId: campaignId ?? undefined,
        candidatePoolId: candidatePoolId ?? undefined,
        referringLink: typeof window !== 'undefined' ? window.location.href : undefined,
      };
      claimWizard.setBranchInfo(info);
      applyWizard.setBranchInfo(info);
    }

    // If already authenticated, skip to roles
    if (isAuthenticated && (claimWizard.step === 'landing' || claimWizard.step === 'phone' || claimWizard.step === 'verify')) {
      claimWizard.setStep('roles');
      applyWizard.setStep('roles');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidatePoolId, demo]);

  return (
    <main className="min-h-screen bg-background">
      <AttributionCapture />
      <ClaimWizard candidatePoolId={candidatePoolId} firstName={firstName} returning={returning} />
    </main>
  );
}
