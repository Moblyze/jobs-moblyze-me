'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SET_FIRST_PASSWORD } from '@/lib/graphql/mutations';

const passwordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface StepPasswordProps {
  /** Called after password is set successfully */
  onComplete: () => void;
  /** Demo mode — skip API call */
  demo?: boolean;
}

/**
 * Create Password step — shared between /start claim flow and /apply flow.
 * Calls setFirstPassword mutation to persist the password on the backend.
 * Simple form: password + confirm, 6+ chars.
 */
export function StepPassword({ onComplete, demo }: StepPasswordProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const [setFirstPassword, { loading }] = useMutation(SET_FIRST_PASSWORD);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirm: '' },
  });

  const handleSubmit = async (values: PasswordFormValues) => {
    setApiError('');
    try {
      if (demo) {
        setDemoLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        setDemoLoading(false);
        onComplete();
        return;
      }

      await setFirstPassword({ variables: { password: values.password } });
      onComplete();
    } catch (err) {
      // If password is already set, just advance (not an error for the user)
      const message = err instanceof Error ? err.message : '';
      if (message.includes('already') || message.includes('password')) {
        onComplete();
        return;
      }
      setApiError('Failed to set password. Please try again.');
    }
  };

  const isSubmitting = loading || demoLoading;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="space-y-6 pb-28">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lock className="size-6" />
            Create a password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            You&apos;ll use this to sign in to the Moblyze app.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                {...form.register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="6+ characters"
                autoFocus
                className="pr-10"
                aria-invalid={!!form.formState.errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <div className="relative">
              <Input
                id="confirm"
                {...form.register('confirm')}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className="pr-10"
                aria-invalid={!!form.formState.errors.confirm}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.confirm && (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirm.message}
              </p>
            )}
          </div>
        </div>

        {apiError && (
          <p className="text-sm text-destructive">{apiError}</p>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="h-4 mb-3" />
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Setting password...
              </>
            ) : (
              'Continue'
            )}
          </Button>
          <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
            <p className="text-center text-xs text-muted-foreground">
              Use this password with your phone number to sign in on the Moblyze app.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
