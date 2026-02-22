'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { useClaimWizard } from '@/hooks/useClaimWizard';
import { StepAuth } from '@/components/apply/StepAuth';
import { StepRoles } from '@/components/apply/StepRoles';
import { StepCV } from '@/components/apply/StepCV';
import { StepCerts } from './StepCerts';
import { StepLocation } from './StepLocation';
import { ClaimConfirmation } from './ClaimConfirmation';
import { CANDIDATE_POOL_PREVIEW_QUERY, CURRENT_USER_QUERY } from '@/lib/graphql/queries';
import { UPDATE_ROLE_PREFERENCES } from '@/lib/graphql/mutations';
import type { ClaimStep } from '@/types';

const STEP_LABELS: Record<ClaimStep, string> = {
  landing: 'Welcome',
  phone: 'Sign In',
  verify: 'Verify Code',
  roles: 'Select Roles',
  certs: 'Certifications',
  location: 'Location',
  resume: 'Upload CV',
  confirmation: 'Done',
};

function getProgressValue(step: ClaimStep): number {
  switch (step) {
    case 'landing': return 0;
    case 'phone': return 10;
    case 'verify': return 20;
    case 'roles': return 35;
    case 'certs': return 50;
    case 'location': return 65;
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
    case 'roles': return 2;
    case 'certs': return 3;
    case 'location': return 4;
    case 'resume': return 5;
    case 'confirmation': return 5;
  }
}

interface ClaimWizardProps {
  candidatePoolId?: string | null;
  firstName?: string | null;
}

/**
 * Profile claim wizard — 6-step flow for candidates from Courier outreach.
 *
 * Reuses StepAuth and StepCV from apply flow. StepAuth writes to useApplyWizard;
 * this component bridges the auth result into useClaimWizard.
 */
export function ClaimWizard({ candidatePoolId, firstName }: ClaimWizardProps) {
  const claimWizard = useClaimWizard();
  const applyWizard = useApplyWizard();

  const totalSteps = 5;

  // Bridge: when StepAuth completes (writes token to applyWizard), sync to claimWizard
  useEffect(() => {
    if (applyWizard.token && applyWizard.step === 'roles') {
      // Auth completed — sync to claim wizard
      claimWizard.setToken(applyWizard.token);
      claimWizard.setPhone(applyWizard.phone ?? '');
      claimWizard.setName(applyWizard.name ?? '');
      claimWizard.setStep('roles');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyWizard.token, applyWizard.step]);

  // Fetch current user after auth for pre-filling
  const { data: currentUserData } = useQuery(CURRENT_USER_QUERY, {
    skip: !claimWizard.token || claimWizard.demo,
  });

  const currentStep = claimWizard.step;
  const progressValue = getProgressValue(currentStep);
  const stepNumber = getStepNumber(currentStep);

  const canGoBack = currentStep === 'verify' || currentStep === 'certs' || currentStep === 'location' || currentStep === 'resume';

  const handleBack = () => {
    switch (currentStep) {
      case 'verify':
        claimWizard.setStep('phone');
        applyWizard.setStep('phone');
        break;
      case 'certs':
        claimWizard.setStep('roles');
        break;
      case 'location':
        claimWizard.setStep('certs');
        break;
      case 'resume':
        claimWizard.setStep('location');
        break;
    }
  };

  // StepRoles completion handler — skip applyToJob, save roles, advance to certs
  const handleRolesComplete = () => {
    claimWizard.setStep('certs');
  };

  const handleCertsNext = () => {
    claimWizard.setStep('location');
  };

  const handleLocationNext = () => {
    // Check if user already has a resume
    const hasResume = Boolean(currentUserData?.currentUser?.candidateProfile?.resumeUrl);
    if (hasResume) {
      claimWizard.setStep('confirmation');
    } else {
      claimWizard.setStep('resume');
    }
  };

  const handleCVComplete = () => {
    claimWizard.setStep('confirmation');
  };

  // Landing page
  if (currentStep === 'landing') {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="space-y-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/moblyze-app-icon.webp`}
            alt="Moblyze"
            width={64}
            height={64}
            className="rounded-xl mx-auto"
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {firstName ? `Hey ${firstName}, claim your profile` : 'Claim your profile on Moblyze'}
            </h1>
            <p className="mt-3 text-muted-foreground">
              Tell us about your skills and experience, and we&apos;ll match you
              with the best opportunities in energy and skilled trades.
            </p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
              Verify your phone number
            </li>
            <li className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
              Select your trades & certifications
            </li>
            <li className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
              Get matched with jobs
            </li>
          </ul>
          <button
            onClick={() => {
              claimWizard.setStep('phone');
              applyWizard.setStep('phone');
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold h-12 px-8 text-base transition-colors hover:bg-primary/90"
          >
            Get Started
          </button>
          <p className="text-xs text-muted-foreground">
            Takes about 2 minutes. No download required.
          </p>
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
        demo={claimWizard.demo}
        onReset={() => claimWizard.reset()}
      />
    );
  }

  // Wizard steps
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Progress header */}
      {currentStep !== 'phone' && currentStep !== 'verify' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{STEP_LABELS[currentStep]}</span>
            <span className="text-xs text-muted-foreground">
              Step {stepNumber} of {totalSteps}
            </span>
          </div>
          <Progress value={progressValue} className="h-1" />
        </div>
      )}

      {/* Back button */}
      {canGoBack && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-3" />
          {currentStep === 'verify' ? 'Change number' : 'Back'}
        </button>
      )}

      {/* Step content */}
      {(currentStep === 'phone' || currentStep === 'verify') && (
        <StepAuth />
      )}

      {currentStep === 'roles' && (
        <ClaimStepRoles onComplete={handleRolesComplete} />
      )}

      {currentStep === 'certs' && (
        <StepCerts
          selectedCertNames={claimWizard.selectedCertNames}
          onSelectionChange={(certs) => claimWizard.setCerts(certs)}
          onNext={handleCertsNext}
        />
      )}

      {currentStep === 'location' && (
        <StepLocation
          location={claimWizard.location}
          onSelect={(loc) => claimWizard.setLocation(loc)}
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
