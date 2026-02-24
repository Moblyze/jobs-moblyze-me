'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { StepAuth } from './StepAuth';
import { StepPassword } from '@/components/shared/StepPassword';
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
  password: 'Create Password',
  roles: 'Select Roles',
  resume: 'Upload CV',
  confirm: 'Submit',
  success: 'Done',
};

function getProgressValue(step: WizardStep): number {
  if (step === 'phone' || step === 'name') return 20;
  if (step === 'verify') return 33;
  if (step === 'password') return 45;
  if (step === 'roles') return 66;
  if (step === 'resume') return 85;
  return 100;
}

function getCurrentStepNumber(step: WizardStep): number {
  if (step === 'phone' || step === 'verify' || step === 'name') return 1;
  if (step === 'password') return 2;
  if (step === 'roles') return 3;
  if (step === 'resume') return 4;
  return 4;
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
  const { step, setStep, jobSlug, jobId, demo, whiteLabel, employerId } = useApplyWizard();

  const progressValue = getProgressValue(step);
  const currentStepNum = getCurrentStepNumber(step);
  // Total steps: auth (1) + password (2) + roles (3) + cv optional (4)
  const totalSteps = 4;

  const backToJobHref = demo ? '/preview' : jobSlug ? `/jobs/${jobSlug}` : '/';

  /** Whether a back button should be shown for the current step */
  const canGoBack = step === 'verify' || ((step === 'password' || step === 'roles' || step === 'resume') && demo);

  const handleBack = () => {
    if (step === 'verify') {
      setStep('phone');
    } else if (step === 'password') {
      setStep('phone');
    } else if (step === 'roles') {
      setStep('password');
    } else if (step === 'resume') {
      setStep('roles');
    }
  };

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
        <Progress value={progressValue} className="h-1" />
      </div>

      {/* Back button for navigable steps */}
      {canGoBack && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-3" />
          {step === 'verify' ? 'Change number' : 'Back'}
        </button>
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
      {step === 'resume' && <StepCV onComplete={handleCVComplete} />}
    </div>
  );
}
