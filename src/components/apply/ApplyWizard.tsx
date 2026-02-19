'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { StepAuth } from './StepAuth';
import { StepRoles } from './StepRoles';
import { StepCV } from './StepCV';
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
  resume: 'Upload CV',
  confirm: 'Submit',
  success: 'Done',
};

function getProgressValue(step: WizardStep): number {
  if (step === 'phone' || step === 'name') return 25;
  if (step === 'verify') return 40;
  if (step === 'roles') return 66;
  if (step === 'resume') return 85;
  return 100;
}

function getCurrentStepNumber(step: WizardStep): number {
  if (step === 'phone' || step === 'verify' || step === 'name') return 1;
  if (step === 'roles') return 2;
  if (step === 'resume') return 3;
  return 3;
}

/**
 * Multi-step apply wizard shell.
 * - Progress bar shows current position (3 visible steps: Sign In, Select Roles, Upload CV)
 * - Routes to correct step component based on Zustand state
 * - CV step is optional (step 3) — shown when user has no resume on file
 * - "Back to job" link uses slug from wizard state
 */
export function ApplyWizard({ jobTitle }: ApplyWizardProps) {
  const router = useRouter();
  const { step, setStep, jobSlug, jobId } = useApplyWizard();

  const progressValue = getProgressValue(step);
  const currentStepNum = getCurrentStepNumber(step);
  // Total steps: auth (1) + roles (2) + cv optional (3)
  const totalSteps = 3;

  const backToJobHref = jobSlug ? `/jobs/${jobSlug}` : '/';

  const handleBack = () => {
    // From OTP verify phase, go back to phone entry phase
    if (step === 'verify') {
      setStep('phone');
    }
  };

  const handleCVComplete = () => {
    // After CV step (upload or skip), navigate to confirmation page
    const confirmUrl = jobSlug
      ? `/confirm?jobId=${jobId}&slug=${jobSlug}`
      : `/confirm?jobId=${jobId}`;
    router.push(confirmUrl);
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
      {step === 'resume' && <StepCV onComplete={handleCVComplete} />}
    </div>
  );
}
