'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { StepAuth } from './StepAuth';
import { StepRoles } from './StepRoles';
import type { WizardStep } from '@/types';

interface ApplyWizardProps {
  /** Job title shown in the header — passed from URL params on initial load */
  jobTitle?: string;
}

const STEP_LABELS: Record<WizardStep, string> = {
  phone: 'Sign In',
  verify: 'Verify Code',
  name: 'Sign In',
  roles: 'Select Roles',
  resume: 'Submit',
  confirm: 'Submit',
  success: 'Done',
};

function getProgressValue(step: WizardStep): number {
  if (step === 'phone' || step === 'name') return 33;
  if (step === 'verify') return 50;
  if (step === 'roles') return 66;
  return 100;
}

function getCurrentStepNumber(step: WizardStep): number {
  if (step === 'phone' || step === 'verify' || step === 'name') return 1;
  return 2;
}

/**
 * Multi-step apply wizard shell.
 * - Progress bar shows current position (2 visible steps: Sign In, Select Roles)
 * - Routes to correct step component based on Zustand state
 * - "Back to job" link uses slug from wizard state
 */
export function ApplyWizard({ jobTitle }: ApplyWizardProps) {
  const { step, setStep, jobSlug } = useApplyWizard();

  const progressValue = getProgressValue(step);
  const currentStepNum = getCurrentStepNumber(step);
  const totalSteps = 2;

  const backToJobHref = jobSlug ? `/jobs/${jobSlug}` : '/';

  const handleBack = () => {
    // From OTP verify phase, go back to phone entry phase
    if (step === 'verify') {
      setStep('phone');
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={backToJobHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to job
        </Link>

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
        <Progress value={progressValue} className="h-1.5" />
      </div>

      {/* Back button when on OTP verify phase */}
      {step === 'verify' && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-3" />
          Change number
        </button>
      )}

      {/* Step content */}
      {(step === 'phone' || step === 'verify') && <StepAuth />}
      {step === 'roles' && <StepRoles />}
    </div>
  );
}
