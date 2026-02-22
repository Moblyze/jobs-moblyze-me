'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
 *
 * Flow:
 * 1. Captures UTM/attribution params (AttributionCapture)
 * 2. Fetches candidate's first name via candidatePoolPreview (for personalized greeting)
 * 3. Launches ClaimWizard with landing → auth → roles → certs → location → CV → confirmation
 */
export default function StartPageClient() {
  const searchParams = useSearchParams();
  const candidatePoolId = searchParams.get('candidate_id');
  const demo = searchParams.get('demo') === 'true';

  const claimWizard = useClaimWizard();
  const applyWizard = useApplyWizard();
  const { isAuthenticated } = useAuth();

  // Fetch candidate first name for personalized landing page
  const { data: previewData } = useQuery(CANDIDATE_POOL_PREVIEW_QUERY, {
    variables: { id: candidatePoolId },
    skip: !candidatePoolId || demo,
  });

  const firstName = demo ? 'Demo' : previewData?.candidatePoolPreview?.firstName ?? null;

  // Initialize claim wizard on mount
  useEffect(() => {
    if (candidatePoolId) {
      claimWizard.setCandidatePoolId(candidatePoolId);
    }

    if (demo) {
      claimWizard.setDemo(true);
      applyWizard.setDemo(true);
      claimWizard.setStep('landing');
      return;
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
      <ClaimWizard candidatePoolId={candidatePoolId} firstName={firstName} />
    </main>
  );
}
