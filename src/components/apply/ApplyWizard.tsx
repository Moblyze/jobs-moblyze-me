'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { StepAuth } from './StepAuth';
import { StepPassword } from '@/components/shared/StepPassword';
import { StepRoles } from './StepRoles';
import { StepLocation } from '@/components/claim/StepLocation';
import { StepCV } from './StepCV';
import { CURRENT_USER_QUERY, CANDIDATE_WORK_LOCATIONS_QUERY } from '@/lib/graphql/queries';
import { UPDATE_WORK_LOCATION_PREFERENCES, UPDATE_CANDIDATE_PROFILE_DETAILS } from '@/lib/graphql/mutations';
import { useStepSync } from '@/hooks/useStepSync';
import type { WizardStep } from '@/types';

const APPLY_SYNC_STEPS: readonly WizardStep[] = [
  'phone', 'verify', 'password', 'roles', 'location', 'resume', 'confirm', 'success',
] as const;

interface ApplyWizardProps {
  /** Job title shown in the header — passed from URL params on initial load */
  jobTitle?: string;
}

const STEP_LABELS: Record<WizardStep, string> = {
  phone: "Let's get started",
  verify: "Let's get started",
  password: "Let's get started",
  roles: 'Select Roles',
  location: 'Location',
  resume: 'Upload CV',
  confirm: 'Submit',
  success: 'Done',
};

function getProgressValue(step: WizardStep): number {
  if (step === 'phone' || step === 'verify' || step === 'password') return 20;
  if (step === 'roles') return 40;
  if (step === 'location') return 60;
  if (step === 'resume') return 80;
  return 100;
}

function getCurrentStepNumber(step: WizardStep): number {
  if (step === 'phone' || step === 'verify' || step === 'password') return 1;
  if (step === 'roles') return 2;
  if (step === 'location') return 3;
  if (step === 'resume') return 4;
  return 5;
}

/**
 * Multi-step apply wizard shell.
 * - Progress bar shows current position (5 steps: Get Started, Roles, Location, Resume, Confirm)
 * - Auth steps (phone/verify/name/password) grouped as step 1 "Let's get started"
 * - "Back to job" link hidden during auth steps to avoid duplicate navigation
 * - Resume step is optional (step 4) — skipped when user already has one on file
 * - Confirm/success is step 5 — navigates to /confirm page
 * - "Back to job" link uses slug from wizard state
 */
export function ApplyWizard({ jobTitle }: ApplyWizardProps) {
  const router = useRouter();
  const applyWizard = useApplyWizard();
  const { step, setStep, jobSlug, jobId, demo, whiteLabel, employerId, token, location, workLocations } = applyWizard;

  const [locationSaving, setLocationSaving] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Clear stale location errors when navigating back to the location step
  useEffect(() => {
    if (step === 'location') setLocationError(null);
  }, [step]);

  // Sync step to ?step= URL param for deep-linking and browser back/forward
  useStepSync(step, setStep, APPLY_SYNC_STEPS);

  // Mutations for saving location data
  const [updateWorkLocationPrefs] = useMutation(UPDATE_WORK_LOCATION_PREFERENCES);
  const [updateProfileDetails] = useMutation(UPDATE_CANDIDATE_PROFILE_DETAILS);

  // Fetch current user after auth for resume check
  const { data: currentUserData } = useQuery<{
    currentUser?: {
      candidateProfile?: {
        resumeUrl?: string;
        homeLocation?: string | null;
        workLocations?: Array<{ id: string; name: string }> | null;
      };
    };
  }>(CURRENT_USER_QUERY, {
    skip: !token || demo,
  });

  // Fetch all available work locations for name→ID mapping
  const { data: workLocationsData } = useQuery<{
    candidateWorkLocations: Array<{ id: string; name: string }>;
  }>(CANDIDATE_WORK_LOCATIONS_QUERY, {
    skip: !token || demo,
  });

  // Pre-filled location from profile
  const profileLocation = useMemo(() => {
    const homeLocation = currentUserData?.currentUser?.candidateProfile?.homeLocation;
    if (!homeLocation) return null;
    return {
      displayName: homeLocation,
      city: null as string | null,
      state: null as string | null,
      stateCode: null as string | null,
      country: null as string | null,
      countryCode: null as string | null,
      coordinates: null as { lat: number; lng: number } | null,
    };
  }, [currentUserData]);

  const progressValue = getProgressValue(step);
  const currentStepNum = getCurrentStepNumber(step);
  const totalSteps = 5;

  const backToJobHref = demo ? '/preview' : jobSlug ? `/jobs/${jobSlug}` : '/';
  const isAuthStep = step === 'phone' || step === 'verify' || step === 'password';

  /** Whether a back button should be shown for the current step */
  const canGoBack = step === 'verify' || step === 'roles' || step === 'location' || step === 'resume';

  // Skip is only visible when the user hasn't selected anything on the current step
  const canSkip = (() => {
    switch (step) {
      case 'location':
        return !location?.displayName && workLocations.length === 0;
      case 'resume':
        return true; // CV is always skippable
      default:
        return false;
    }
  })();

  const handleBack = () => {
    if (step === 'verify') {
      setStep('phone');
    } else if (step === 'roles') {
      setStep('password');
    } else if (step === 'location') {
      setStep('roles');
    } else if (step === 'resume') {
      setStep('location');
    }
  };

  const handleSkip = () => {
    switch (step) {
      case 'location':
        handleLocationNext();
        break;
      case 'resume':
        handleCVComplete();
        break;
    }
  };

  // Save home location + work locations to backend, then advance
  const handleLocationNext = useCallback(async () => {
    setLocationError(null);

    const isDemo = demo || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true');

    if (!isDemo) {
      setLocationSaving(true);
      try {
        const saves: Promise<unknown>[] = [];

        // Save home location
        if (location?.displayName) {
          saves.push(
            updateProfileDetails({
              variables: { homeLocation: location.displayName },
            })
          );
        }

        // Save work location preferences
        if (workLocations.length > 0 && workLocationsData?.candidateWorkLocations) {
          const allLocations = workLocationsData.candidateWorkLocations;
          const matchedIds = workLocations
            .map((cityName) => {
              const exact = allLocations.find((loc) => loc.name === cityName);
              if (exact) return exact.id;
              const lower = cityName.toLowerCase();
              const approx = allLocations.find((loc) => loc.name.toLowerCase() === lower);
              if (approx) return approx.id;
              const cityOnly = cityName.split(',')[0].trim().toLowerCase();
              const partial = allLocations.find((loc) => loc.name.toLowerCase().includes(cityOnly));
              return partial?.id ?? null;
            })
            .filter((id): id is string => id !== null);

          if (matchedIds.length > 0) {
            saves.push(
              updateWorkLocationPrefs({
                variables: { candidateWorkLocationIds: matchedIds },
              })
            );
          }
        }

        const results = await Promise.allSettled(saves);
        const failures = results.filter((r) => r.status === 'rejected');
        if (failures.length > 0) {
          console.error('Failed to save some location data:', failures);
          setLocationError('Some location data failed to save. You can continue — we\'ll retry later.');
        }
      } catch (err) {
        console.error('Failed to save locations:', err);
        setLocationError('Failed to save location data. You can continue — we\'ll retry later.');
      } finally {
        setLocationSaving(false);
      }
    }

    // Check if user already has a resume
    const hasResume = Boolean(currentUserData?.currentUser?.candidateProfile?.resumeUrl);
    if (hasResume) {
      // In apply mode, go to confirm page since application was already submitted
      let confirmUrl = jobSlug
        ? `/confirm?jobId=${jobId}&slug=${jobSlug}`
        : `/confirm?jobId=${jobId}`;
      if (demo) confirmUrl += '&demo=true';
      if (whiteLabel) confirmUrl += '&whiteLabel=true';
      if (employerId) confirmUrl += `&employerId=${encodeURIComponent(employerId)}`;
      router.push(confirmUrl);
    } else {
      setStep('resume');
    }
  }, [demo, location, workLocations, workLocationsData, updateWorkLocationPrefs, updateProfileDetails, currentUserData, jobSlug, jobId, whiteLabel, employerId, router, setStep]);

  const handleCVComplete = () => {
    // After CV step (upload or skip), navigate to confirmation page
    let confirmUrl = jobSlug
      ? `/confirm?jobId=${jobId}&slug=${jobSlug}`
      : `/confirm?jobId=${jobId}`;
    if (demo) confirmUrl += '&demo=true';
    if (whiteLabel) confirmUrl += '&whiteLabel=true';
    if (employerId) confirmUrl += `&employerId=${encodeURIComponent(employerId)}`;
    router.push(confirmUrl);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header — hide "Back to job" during auth steps to avoid duplicate nav */}
      <div className="mb-6">
        {!isAuthStep && step !== 'roles' && (
          <Link
            href={backToJobHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to job
          </Link>
        )}

        {jobTitle && (
          <p className="text-sm text-muted-foreground truncate">
            Applying for:{' '}
            <span className="font-medium text-foreground">{jobTitle}</span>
          </p>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{STEP_LABELS[step]}</span>
          <span className="text-xs text-muted-foreground">
            Step {currentStepNum} of {totalSteps}
          </span>
        </div>
        <Progress value={progressValue} className="h-1" />
      </div>

      {/* Navigation row: Back (left) + Skip (right) */}
      {(canGoBack || canSkip) && (
        <div className="flex items-center justify-between mb-4">
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3" />
              {step === 'verify' ? 'Change number' : 'Back'}
            </button>
          ) : <div />}
          {canSkip ? (
            <button
              onClick={handleSkip}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
              <ArrowRight className="size-3.5" />
            </button>
          ) : <div />}
        </div>
      )}

      {/* Step content */}
      {(step === 'phone' || step === 'verify') && <StepAuth />}
      {step === 'password' && (
        <StepPassword
          onComplete={() => setStep('roles')}
          demo={demo}
        />
      )}
      {step === 'roles' && <StepRoles />}
      {step === 'location' && (
        <StepLocation
          location={location}
          profileLocation={profileLocation}
          onSelect={(loc) => applyWizard.setLocation(loc)}
          workLocations={workLocations}
          onWorkLocationsChange={(locs) => applyWizard.setWorkLocations(locs)}
          onNext={handleLocationNext}
          demo={demo}
          saving={locationSaving}
          saveError={locationError}
        />
      )}
      {step === 'resume' && <StepCV onComplete={handleCVComplete} />}
    </div>
  );
}
