'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { useMutation } from '@apollo/client/react';
import { VERIFY_SMS_START, VERIFY_SMS_CHECK } from '@/lib/graphql/mutations';
import { storeToken } from '@/lib/auth';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

// Phase A: Phone number + name validation
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        try {
          return isValidPhoneNumber(val, 'US');
        } catch {
          return false;
        }
      },
      { message: 'Enter a valid US phone number' }
    ),
  name: z.string().min(1, 'Your name is required').max(80),
});

// Phase B: OTP code validation
const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must be numbers only'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

type AuthPhase = 'phone' | 'otp';

/**
 * Step 1 of the apply wizard: phone OTP authentication + name collection.
 *
 * Phase A: user enters name + phone number -> sends OTP
 * Phase B: user enters 6-digit code -> verifies -> gets JWT token -> advances to roles step
 */
export function StepAuth() {
  const [phase, setPhase] = useState<AuthPhase>('phone');
  const [phoneE164, setPhoneE164] = useState('');
  const [sendError, setSendError] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const { setStep, setPhone, setToken, setName } = useApplyWizard();

  const [verifySmsStart, { loading: startLoading }] = useMutation<{
    verifySmsStart: unknown;
  }>(VERIFY_SMS_START);
  const [verifySmsCheck, { loading: checkLoading }] = useMutation<{
    verifySmsCheck: { token?: string; userId?: string } | null;
  }>(VERIFY_SMS_CHECK);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '', name: '' },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  // Phase A submit: send OTP
  const handleSendCode = async (values: PhoneFormValues) => {
    setSendError('');
    try {
      // Format to E.164 (e.g. +12125551234)
      const parsed = parsePhoneNumber(values.phone, 'US');
      const e164 = parsed.format('E.164');
      setPhoneE164(e164);

      await verifySmsStart({ variables: { phoneNumber: e164 } });
      setPhase('otp');
    } catch {
      setSendError('Failed to send code. Check your number and try again.');
    }
  };

  // Phase B submit: verify OTP
  const handleVerifyCode = async (values: CodeFormValues) => {
    setVerifyError('');
    try {
      const { data } = await verifySmsCheck({
        variables: { phoneNumber: phoneE164, code: values.code },
      });

      // verifySmsCheck returns Any — the token is in data.verifySmsCheck.token
      const token = data?.verifySmsCheck?.token ?? null;

      if (!token) {
        setVerifyError('Verification failed. Try again or resend the code.');
        return;
      }

      // Store token and advance wizard
      storeToken(token);
      setToken(token);
      setPhone(phoneE164);
      setName(phoneForm.getValues('name'));
      setStep('roles');
    } catch {
      setVerifyError('Invalid code. Please try again.');
    }
  };

  // Resend code from OTP phase
  const handleResend = async () => {
    setSendError('');
    try {
      await verifySmsStart({ variables: { phoneNumber: phoneE164 } });
      codeForm.reset();
      setVerifyError('');
    } catch {
      setSendError('Failed to resend. Please try again.');
    }
  };

  // OTP entry phase
  if (phase === 'otp') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enter your code</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We sent a 6-digit code to{' '}
            <span className="font-medium text-foreground">{phoneE164}</span>
          </p>
        </div>

        <form onSubmit={codeForm.handleSubmit(handleVerifyCode)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="code" className="text-sm font-medium">
              Verification code
            </label>
            <Input
              id="code"
              {...codeForm.register('code')}
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              autoFocus
              className="text-center text-lg tracking-widest h-12"
              aria-invalid={!!codeForm.formState.errors.code}
            />
            {codeForm.formState.errors.code && (
              <p className="text-sm text-destructive">
                {codeForm.formState.errors.code.message}
              </p>
            )}
            {verifyError && (
              <p className="text-sm text-destructive">{verifyError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={checkLoading}
          >
            {checkLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify code'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive it?{' '}
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
            disabled={startLoading}
          >
            Resend code
          </button>
        </p>

        {sendError && (
          <p className="text-center text-sm text-destructive">{sendError}</p>
        )}
      </div>
    );
  }

  // Phone + name entry phase
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apply in 30 seconds</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your name and phone number to get started.
        </p>
      </div>

      <form
        onSubmit={phoneForm.handleSubmit(handleSendCode)}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Your name
          </label>
          <Input
            id="name"
            {...phoneForm.register('name')}
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            aria-invalid={!!phoneForm.formState.errors.name}
          />
          {phoneForm.formState.errors.name && (
            <p className="text-sm text-destructive">
              {phoneForm.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone number
          </label>
          <div className="flex gap-2">
            <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground select-none shrink-0">
              +1
            </div>
            <Input
              id="phone"
              {...phoneForm.register('phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(555) 000-0000"
              className="flex-1"
              aria-invalid={!!phoneForm.formState.errors.phone}
            />
          </div>
          {phoneForm.formState.errors.phone && (
            <p className="text-sm text-destructive">
              {phoneForm.formState.errors.phone.message}
            </p>
          )}
          {sendError && (
            <p className="text-sm text-destructive">{sendError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11"
          disabled={startLoading}
        >
          {startLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending code...
            </>
          ) : (
            'Send verification code'
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to receive an SMS to verify your number.
        Standard messaging rates apply.
      </p>
    </div>
  );
}
