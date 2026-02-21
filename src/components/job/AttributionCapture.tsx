'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import type { BranchInfo } from '@/types';

/**
 * Captures UTM and campaign attribution params from the URL on mount.
 * Branch auto-appends these params when redirecting outreach links to the web URL.
 * Renders nothing — pure side-effect component.
 */
export function AttributionCapture() {
  const searchParams = useSearchParams();
  const setBranchInfo = useApplyWizard((s) => s.setBranchInfo);

  useEffect(() => {
    const channel = searchParams.get('utm_source');
    const campaign = searchParams.get('utm_campaign');
    const campaignId = searchParams.get('campaign_id');
    const candidatePoolId = searchParams.get('candidate_id');

    // Only store if at least one attribution param is present
    if (channel || campaign || campaignId || candidatePoolId) {
      const info: BranchInfo = {
        channel: channel ?? undefined,
        campaign: campaign ?? undefined,
        campaignId: campaignId ?? undefined,
        candidatePoolId: candidatePoolId ?? undefined,
        referringLink: typeof window !== 'undefined' ? window.location.href : undefined,
      };
      setBranchInfo(info);
    }
  }, [searchParams, setBranchInfo]);

  return null;
}
