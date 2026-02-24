'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AsYouType, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import { useMutation } from '@apollo/client/react';
import { VERIFY_SMS_START, VERIFY_SMS_CHECK } from '@/lib/graphql/mutations';
import { storeToken } from '@/lib/auth';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronDown } from 'lucide-react';
import {
  PREFERRED_COUNTRIES,
  OTHER_COUNTRIES,
  findCountryByCode,
  type CountryEntry,
} from '@/lib/country-codes';

// Phone schema — country-aware validation is done at submit time via superRefine
const phoneSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
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

/** Format a national phone number as-you-type for the given country */
function formatNational(value: string, country: CountryCode): string {
  // Strip to digits only before formatting
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const formatter = new AsYouType(country);
  return formatter.input(digits);
}

/** Get placeholder for a country (common format example) */
function getPlaceholder(country: CountryCode): string {
  const placeholders: Partial<Record<CountryCode, string>> = {
    US: '(555) 000-0000',
    CA: '(555) 000-0000',
    GB: '7911 123456',
    AU: '0412 345 678',
    ES: '612 34 56 78',
  };
  return placeholders[country] ?? '000 000 0000';
}

/**
 * Step 1 of the apply wizard: phone OTP authentication + name collection.
 *
 * Phase A: user enters name + phone number -> sends OTP
 * Phase B: user enters 6-digit code -> verifies -> gets JWT token -> advances to roles step
 *
 * Features:
 * - Country code selector with preferred countries (US, GB, AU, CA, ES)
 * - As-you-type phone formatting via libphonenumber-js
 * - Numeric keypad on mobile (inputMode="tel")
 * - International phone validation
 */
export function StepAuth() {
  const [phase, setPhase] = useState<AuthPhase>('phone');
  const [country, setCountry] = useState<CountryCode>('US');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneE164, setPhoneE164] = useState('');
  const [sendError, setSendError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const { setStep, setPhone, setToken, setName, name: wizardName, step: wizardStep, demo, branchInfo } = useApplyWizard();

  // Reset internal phase when wizard step goes back to 'phone'
  useEffect(() => {
    if (wizardStep === 'phone') {
      setPhase('phone');
    }
  }, [wizardStep]);

  const currentCountry = findCountryByCode(country);
  const dialCode = currentCountry?.dialCode ?? '+1';

  const [verifySmsStart, { loading: startLoading }] = useMutation<{
    verifySmsStart: unknown;
  }>(VERIFY_SMS_START);
  const [verifySmsCheck, { loading: checkLoading }] = useMutation<{
    verifySmsCheck: { token?: string; userId?: string } | null;
  }>(VERIFY_SMS_CHECK);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '', name: wizardName ?? '' },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  // Format phone as-you-type when user types
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const formatted = formatNational(raw, country);
      phoneForm.setValue('phone', formatted, { shouldValidate: false });
    },
    [country, phoneForm]
  );

  const selectCountry = (entry: CountryEntry) => {
    setCountry(entry.code);
    setShowCountryPicker(false);
    // Clear phone when switching countries since format changes
    phoneForm.setValue('phone', '', { shouldValidate: false });
  };

  // Phase A submit: send OTP
  const handleSendCode = async (values: PhoneFormValues) => {
    setSendError('');

    // Validate phone for selected country
    const digits = values.phone.replace(/\D/g, '');
    if (!digits) {
      phoneForm.setError('phone', { message: 'Phone number is required' });
      return;
    }

    try {
      const valid = isValidPhoneNumber(digits, country);
      if (!valid) {
        phoneForm.setError('phone', { message: 'Enter a valid phone number' });
        return;
      }

      // Format to E.164 (e.g. +12125551234)
      const parsed = parsePhoneNumber(digits, country);
      const e164 = parsed.format('E.164');
      setPhoneE164(e164);

      if (demo) {
        setDemoLoading(true);
        await new Promise((r) => setTimeout(r, 800));
        setDemoLoading(false);
        setPhase('otp');
        setStep('verify');
        return;
      }

      await verifySmsStart({ variables: { phoneNumber: e164 } });
      setPhase('otp');
      setStep('verify');
    } catch {
      setSendError('Failed to send code. Check your number and try again.');
    }
  };

  // Phase B submit: verify OTP
  const handleVerifyCode = async (values: CodeFormValues) => {
    setVerifyError('');
    try {
      if (demo) {
        setDemoLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setDemoLoading(false);
        setToken('demo-token');
        setPhone(phoneE164);
        setName(phoneForm.getValues('name'));
        setStep('password');
        return;
      }

      const { data } = await verifySmsCheck({
        variables: { phoneNumber: phoneE164, code: values.code, branchInfo: branchInfo ?? undefined },
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
      setStep('password');
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
      <form onSubmit={codeForm.handleSubmit(handleVerifyCode)}>
        <div className="space-y-6 pb-28">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Enter your code</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-foreground">{phoneE164}</span>
            </p>
          </div>

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

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="h-4 mb-3" />
            <Button
              type="submit"
              className="w-full h-11"
              disabled={checkLoading || demoLoading}
            >
              {checkLoading || demoLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify code'
              )}
            </Button>
            <div className="min-h-[2.5rem] mt-2" />
          </div>
        </div>
      </form>
    );
  }

  // Phone + name entry phase
  return (
    <form onSubmit={phoneForm.handleSubmit(handleSendCode)}>
      <div className="space-y-6 pb-28">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enter your name and phone number to get started.
          </h1>
        </div>

        <div className="space-y-4">
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
              {/* Country code selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex h-9 items-center gap-1 rounded-md border border-input bg-muted px-3 text-sm text-foreground select-none shrink-0 hover:bg-accent transition-colors"
                  aria-label={`Country code: ${dialCode} (${currentCountry?.name})`}
                >
                  <span className="font-medium">{dialCode}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>

                {/* Country picker dropdown */}
                {showCountryPicker && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCountryPicker(false)}
                    />
                    <div className="absolute left-0 top-full mt-1 z-50 w-64 max-h-72 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
                      {/* Preferred countries */}
                      {PREFERRED_COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => selectCountry(c)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent
                            ${c.code === country ? 'bg-accent font-medium' : ''}
                          `}
                        >
                          <span className="text-muted-foreground w-10 shrink-0">{c.dialCode}</span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}

                      {/* Divider */}
                      <div className="border-t border-border my-1" />

                      {/* Other countries */}
                      {OTHER_COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => selectCountry(c)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent
                            ${c.code === country ? 'bg-accent font-medium' : ''}
                          `}
                        >
                          <span className="text-muted-foreground w-10 shrink-0">{c.dialCode}</span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Input
                id="phone"
                value={phoneForm.watch('phone')}
                onChange={handlePhoneChange}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={getPlaceholder(country)}
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
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="h-4 mb-3" />
          <Button
            type="submit"
            className="w-full h-11"
            disabled={startLoading || demoLoading}
          >
            {startLoading || demoLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending code...
              </>
            ) : (
              'Send verification code'
            )}
          </Button>
          <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our{' '}
              <a
                href="https://moblyze.me/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Terms of Use
              </a>
              , including receiving job notifications via SMS. Standard messaging rates
              may apply.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
