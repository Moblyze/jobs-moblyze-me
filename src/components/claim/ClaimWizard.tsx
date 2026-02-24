'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { useClaimWizard } from '@/hooks/useClaimWizard';
import { StepAuth } from '@/components/apply/StepAuth';
import { StepPassword } from '@/components/shared/StepPassword';
import { StepRoles } from '@/components/apply/StepRoles';
import { StepCV } from '@/components/apply/StepCV';
import { StepCerts } from './StepCerts';
import { StepLocation } from './StepLocation';
import { ClaimConfirmation } from './ClaimConfirmation';
import { CANDIDATE_POOL_PREVIEW_QUERY, CURRENT_USER_QUERY, CANDIDATE_WORK_LOCATIONS_QUERY } from '@/lib/graphql/queries';
import { UPDATE_ROLE_PREFERENCES, UPDATE_WORK_LOCATION_PREFERENCES, UPLOAD_CERTIFICATION, UPDATE_CANDIDATE_PROFILE_DETAILS } from '@/lib/graphql/mutations';
import type { CertUpload } from './StepCerts';
import type { ClaimStep } from '@/types';

const STEP_LABELS: Record<ClaimStep, string> = {
  landing: 'Welcome',
  phone: 'Verify Phone',
  verify: 'Verify Code',
  password: 'Create Password',
  roles: 'Select Roles',
  certs: 'Certifications',
  location: 'Location',
  resume: 'Upload CV',
  confirmation: 'Done',
};

function getProgressValue(step: ClaimStep): number {
  switch (step) {
    case 'landing': return 0;
    case 'phone': return 8;
    case 'verify': return 15;
    case 'password': return 25;
    case 'roles': return 38;
    case 'certs': return 52;
    case 'location': return 66;
    case 'resume': return 80;
    case 'confirmation': return 100;
  }
}

function getStepNumber(step: ClaimStep): number {
  switch (step) {
    case 'landing':
    case 'phone':
    case 'verify':
      return 1;
    case 'password': return 2;
    case 'roles': return 3;
    case 'certs': return 4;
    case 'location': return 5;
    case 'resume': return 6;
    case 'confirmation': return 6;
  }
}

interface ClaimWizardProps {
  candidatePoolId?: string | null;
  firstName?: string | null;
  returning?: boolean;
}

/**
 * Profile claim wizard — 6-step flow for candidates from Courier outreach.
 *
 * Reuses StepAuth and StepCV from apply flow. StepAuth writes to useApplyWizard;
 * this component bridges the auth result into useClaimWizard.
 */
export function ClaimWizard({ candidatePoolId, firstName, returning }: ClaimWizardProps) {
  const claimWizard = useClaimWizard();
  const applyWizard = useApplyWizard();

  const totalSteps = 6;
  const [locationSaving, setLocationSaving] = useState(false);

  // Mutations for saving data
  const [updateWorkLocationPrefs] = useMutation(UPDATE_WORK_LOCATION_PREFERENCES);
  const [uploadCertification] = useMutation(UPLOAD_CERTIFICATION);
  const [updateProfileDetails] = useMutation(UPDATE_CANDIDATE_PROFILE_DETAILS);

  // Fetch all available work locations for name→ID mapping
  const { data: workLocationsData } = useQuery<{
    candidateWorkLocations: Array<{ id: string; name: string }>;
  }>(CANDIDATE_WORK_LOCATIONS_QUERY, {
    skip: !claimWizard.token || claimWizard.demo,
  });

  // Bridge: sync applyWizard step transitions to claimWizard
  useEffect(() => {
    if (applyWizard.step === 'verify' && claimWizard.step === 'phone') {
      // OTP sent — sync to claim wizard so back button shows
      claimWizard.setStep('verify');
    }
    if (applyWizard.token && applyWizard.step === 'password') {
      // Auth completed — sync to claim wizard, go to password step
      claimWizard.setToken(applyWizard.token);
      claimWizard.setPhone(applyWizard.phone ?? '');
      claimWizard.setName(applyWizard.name ?? '');
      claimWizard.setStep('password');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyWizard.token, applyWizard.step]);

  // Fetch current user after auth for pre-filling
  const { data: currentUserData } = useQuery<{
    currentUser?: {
      firstName?: string;
      candidateProfile?: {
        resumeUrl?: string;
        roles?: Array<{ id: string; name: string }>;
        certification?: Array<{ id: string; name?: string | null }> | null;
        homeLocation?: string | null;
        workLocations?: Array<{ id: string; name: string }> | null;
      };
    };
  }>(CURRENT_USER_QUERY, {
    skip: !claimWizard.token || claimWizard.demo,
  });

  // Pre-fill from currentUser profile when returning
  useEffect(() => {
    if (!currentUserData?.currentUser || !returning) return;
    const user = currentUserData.currentUser;
    const profile = user.candidateProfile;

    if (user.firstName && !claimWizard.name) {
      claimWizard.setName(user.firstName);
    }
    if (profile?.roles?.length && claimWizard.selectedRoleIds.length === 0) {
      claimWizard.setRoles(profile.roles.map((r: { id: string }) => r.id));
      applyWizard.setRoles(profile.roles.map((r: { id: string }) => r.id));
    }
    // Pre-fill certifications from profile
    if (profile?.certification?.length && claimWizard.selectedCertNames.length === 0) {
      const certNames = profile.certification
        .map((c) => c.name)
        .filter((name): name is string => Boolean(name));
      if (certNames.length > 0) {
        claimWizard.setCerts(certNames);
      }
    }
    // Pre-fill home location from profile
    if (profile?.homeLocation && !claimWizard.location?.displayName) {
      claimWizard.setLocation({
        displayName: profile.homeLocation,
        city: null,
        state: null,
        stateCode: null,
        country: null,
        countryCode: null,
        coordinates: null,
      });
    }
    // Pre-fill work locations from profile
    if (profile?.workLocations?.length && claimWizard.workLocations.length === 0) {
      claimWizard.setWorkLocations(profile.workLocations.map((wl) => wl.name));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserData, returning]);

  // Derived profile data for passing to child steps
  const profileCertNames = useMemo(() => {
    const certs = currentUserData?.currentUser?.candidateProfile?.certification;
    if (!certs) return [];
    return certs.map((c) => c.name).filter((name): name is string => Boolean(name));
  }, [currentUserData]);

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

  const currentStep = claimWizard.step;
  const progressValue = getProgressValue(currentStep);
  const stepNumber = getStepNumber(currentStep);

  // Sync step to URL for shareable/bookmarkable steps
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      if (currentStep !== 'landing') {
        params.set('step', currentStep);
      } else {
        params.delete('step');
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch {
      // jsdom or SSR — skip URL sync
    }
  }, [currentStep]);

  const canGoBack = currentStep === 'verify' || currentStep === 'certs' || currentStep === 'location' || currentStep === 'resume' || currentStep === 'roles';

  // Skip is only visible when the user hasn't selected anything on the current step
  const canSkip = (() => {
    switch (currentStep) {
      case 'certs':
        return claimWizard.selectedCertNames.length === 0;
      case 'location':
        return !claimWizard.location?.displayName && claimWizard.workLocations.length === 0;
      case 'resume':
        return true; // CV is always skippable (file selection is local)
      default:
        return false;
    }
  })();

  const handleBack = () => {
    switch (currentStep) {
      case 'verify':
        claimWizard.setStep('phone');
        applyWizard.setStep('phone');
        break;
      case 'roles':
        claimWizard.setStep('password');
        break;
      case 'certs':
        claimWizard.setStep('roles');
        applyWizard.setStep('roles');
        break;
      case 'location':
        claimWizard.setStep('certs');
        break;
      case 'resume':
        claimWizard.setStep('location');
        break;
    }
  };

  const handleSkip = () => {
    switch (currentStep) {
      case 'certs':
        handleCertsNext([]);
        break;
      case 'location':
        handleLocationNext();
        break;
      case 'resume':
        handleCVComplete();
        break;
    }
  };

  // Password step completion — advance to roles
  const handlePasswordComplete = () => {
    claimWizard.setStep('roles');
    applyWizard.setStep('roles');
  };

  // StepRoles completion handler — skip applyToJob, save roles, advance to certs
  const handleRolesComplete = () => {
    claimWizard.setStep('certs');
  };

  // Save certs to backend (for certs with uploaded files), then advance
  const handleCertsNext = useCallback(async (uploads: CertUpload[]) => {
    // Upload certs that have files attached (backend requires file: Upload!)
    if (!claimWizard.demo && uploads.length > 0) {
      await Promise.allSettled(
        uploads.map((cert) =>
          uploadCertification({
            variables: {
              file: cert.file,
              name: cert.name,
              expiry: cert.expiry || null,
            },
          })
        )
      );
      // Errors are silently ignored — don't block the user
    }
    claimWizard.setStep('location');
  }, [claimWizard, uploadCertification]);

  // Save home location + work locations to backend, then advance
  const handleLocationNext = useCallback(async () => {
    if (!claimWizard.demo) {
      setLocationSaving(true);
      try {
        const saves: Promise<unknown>[] = [];

        // Save home location
        if (claimWizard.location?.displayName) {
          saves.push(
            updateProfileDetails({
              variables: { homeLocation: claimWizard.location.displayName },
            })
          );
        }

        // Save work location preferences
        if (claimWizard.workLocations.length > 0 && workLocationsData?.candidateWorkLocations) {
          const allLocations = workLocationsData.candidateWorkLocations;
          const matchedIds = claimWizard.workLocations
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

        await Promise.allSettled(saves);
      } catch (err) {
        console.error('Failed to save locations:', err);
      } finally {
        setLocationSaving(false);
      }
    }

    // Check if user already has a resume
    const hasResume = Boolean(currentUserData?.currentUser?.candidateProfile?.resumeUrl);
    if (hasResume) {
      claimWizard.setStep('confirmation');
    } else {
      claimWizard.setStep('resume');
    }
  }, [claimWizard, workLocationsData, updateWorkLocationPrefs, updateProfileDetails, currentUserData]);

  const handleCVComplete = () => {
    claimWizard.setStep('confirmation');
  };

  // Landing page
  if (currentStep === 'landing') {
    const handleGetStarted = () => {
      // Pre-fill name into applyWizard so StepAuth has it
      if (firstName) {
        applyWizard.setName(firstName);
        claimWizard.setName(firstName);
      }
      claimWizard.setStep('phone');
      applyWizard.setStep('phone');
    };

    return (
      <div className="mx-auto max-w-lg px-4 flex flex-col min-h-screen">
        {/* Logo pinned to top */}
        <div className="pt-10 pb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.moblyze.me/images/SiteNavLogo.png"
            alt="Moblyze"
            width={144}
            height={32}
            className="mx-auto"
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center pb-28">
          <h1 className="text-3xl font-bold tracking-tight py-6">
            {returning && firstName
              ? `Welcome back, ${firstName}`
              : firstName
                ? `${firstName}, claim your profile`
                : returning
                  ? 'Welcome back to Moblyze'
                  : 'Claim your profile on Moblyze'}
          </h1>

          <p className="text-muted-foreground mb-10">
            Confirm your details and we&apos;ll match you to the best Energy jobs.
          </p>
          <ul className="text-sm text-muted-foreground space-y-3 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
              Confirm your phone number
            </li>
            <li className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
              Verify your trades and certs
            </li>
            <li className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
              We&apos;ll send you new job matches
            </li>
          </ul>
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="h-4 mb-3" />
            <Button
              onClick={handleGetStarted}
              className="w-full h-11"
            >
              Get Started
            </Button>
            <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
              <p className="text-center text-xs text-muted-foreground">
                Verify your info in a couple minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation page
  if (currentStep === 'confirmation') {
    return (
      <ClaimConfirmation
        name={claimWizard.name}
        selectedRoleIds={claimWizard.selectedRoleIds}
        workLocations={claimWizard.workLocations}
        demo={claimWizard.demo}
      />
    );
  }

  // Wizard steps
  return (
    <div className="mx-auto max-w-lg px-6 pt-8 pb-6">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{STEP_LABELS[currentStep]}</span>
          <span className="text-xs text-muted-foreground">
            Step {stepNumber} of {totalSteps}
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
              {currentStep === 'verify' ? 'Change number' : 'Back'}
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
      {(currentStep === 'phone' || currentStep === 'verify') && (
        <StepAuth />
      )}

      {currentStep === 'password' && (
        <StepPassword
          onComplete={handlePasswordComplete}
          demo={claimWizard.demo}
        />
      )}

      {currentStep === 'roles' && (
        <ClaimStepRoles onComplete={handleRolesComplete} />
      )}

      {currentStep === 'certs' && (
        <StepCerts
          selectedCertNames={claimWizard.selectedCertNames}
          onSelectionChange={(certs) => claimWizard.setCerts(certs)}
          onNext={handleCertsNext}
          profileCertNames={profileCertNames}
        />
      )}

      {currentStep === 'location' && (
        <StepLocation
          location={claimWizard.location}
          profileLocation={profileLocation}
          onSelect={(loc) => claimWizard.setLocation(loc)}
          workLocations={claimWizard.workLocations}
          onWorkLocationsChange={(locs) => claimWizard.setWorkLocations(locs)}
          onNext={handleLocationNext}
          demo={claimWizard.demo}
        />
      )}

      {currentStep === 'resume' && (
        <StepCV onComplete={handleCVComplete} />
      )}
    </div>
  );
}

/**
 * Wrapper around StepRoles that skips applyToJob and advances to certs.
 * StepRoles reads from useApplyWizard, so we configure it accordingly.
 */
function ClaimStepRoles({ onComplete }: { onComplete: () => void }) {
  const claimWizard = useClaimWizard();
  const applyWizard = useApplyWizard();
  const [updateRolePreferences] = useMutation(UPDATE_ROLE_PREFERENCES);

  // Pre-fill StepRoles by setting selected roles in applyWizard
  useEffect(() => {
    if (claimWizard.selectedRoleIds.length > 0) {
      applyWizard.setRoles(claimWizard.selectedRoleIds);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for when StepRoles advances to 'resume' step (its completion signal)
  // In claim mode, we intercept this and redirect to certs instead
  useEffect(() => {
    if (applyWizard.step === 'resume' || applyWizard.step === 'confirm') {
      // StepRoles completed — sync roles to claim wizard
      claimWizard.setRoles(applyWizard.selectedRoleIds);
      onComplete();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyWizard.step]);

  return <StepRoles />;
}
