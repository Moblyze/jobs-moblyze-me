'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { CANDIDATE_ROLES_QUERY } from '@/lib/graphql/queries';
import { APPLY_TO_JOB, UPDATE_ROLE_PREFERENCES } from '@/lib/graphql/mutations';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const rolesSchema = z.object({
  selectedRoleIds: z
    .array(z.string())
    .min(1, 'Select at least one role to continue'),
});

type RolesFormValues = z.infer<typeof rolesSchema>;

interface PaginatedRole {
  id: string;
  name: string;
  category: string;
  subCategory: string;
}

interface PaginatedRolesResult {
  paginatedCandidateRoles: {
    roles: PaginatedRole[];
    total: number;
  };
}

/**
 * Step 2 of the apply wizard: role selection.
 *
 * - Fetches all candidate roles (requires auth JWT)
 * - Pre-selects the job's primary role from wizard state
 * - Minimum 1 role required (pre-selection satisfies this)
 * - On submit: calls applyToJob then updateCandidateRolePreferences
 * - Redirects to /confirm on success
 */
export function StepRoles() {
  const router = useRouter();
  const { jobId, jobSlug, selectedRoleIds, setRoles } = useApplyWizard();
  const [submitError, setSubmitError] = useState('');

  // Fetch all available roles (requires auth — JWT is set from StepAuth)
  const { data: rolesData, loading: rolesLoading } = useQuery<PaginatedRolesResult>(
    CANDIDATE_ROLES_QUERY,
    { variables: { limit: 100 } }
  );

  const [applyToJob, { loading: applyLoading }] = useMutation(APPLY_TO_JOB);
  const [updateRolePreferences, { loading: rolesUpdateLoading }] = useMutation(UPDATE_ROLE_PREFERENCES);

  const isSubmitting = applyLoading || rolesUpdateLoading;

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<RolesFormValues>({
    resolver: zodResolver(rolesSchema),
    defaultValues: {
      // Use previously selected roles from wizard state, or empty
      selectedRoleIds: selectedRoleIds ?? [],
    },
  });

  const watchedRoleIds = watch('selectedRoleIds');

  // Pre-select roles from wizard state (set by job detail page or previous visit)
  useEffect(() => {
    if (selectedRoleIds && selectedRoleIds.length > 0) {
      setValue('selectedRoleIds', selectedRoleIds);
    }
  }, [selectedRoleIds, setValue]);

  const toggleRole = (roleId: string) => {
    const current = watchedRoleIds;
    const isSelected = current.includes(roleId);
    const updated = isSelected
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];
    setValue('selectedRoleIds', updated, { shouldValidate: true });
  };

  const handleApply = async (values: RolesFormValues) => {
    if (!jobId) {
      setSubmitError('Job information missing. Please go back and try again.');
      return;
    }

    setSubmitError('');

    try {
      // 1. Submit application
      await applyToJob({
        variables: { moblyzeJobId: jobId },
      });

      // 2. Save role preferences (best-effort — don't block on failure)
      try {
        await updateRolePreferences({
          variables: { candidateRoleIds: values.selectedRoleIds },
        });
      } catch {
        // Non-fatal: application was submitted successfully
      }

      // 3. Save to wizard state
      setRoles(values.selectedRoleIds);

      // 4. Redirect to confirmation page
      const confirmUrl = jobSlug
        ? `/confirm?jobId=${jobId}&slug=${jobSlug}`
        : `/confirm?jobId=${jobId}`;
      router.push(confirmUrl);
    } catch {
      setSubmitError(
        'Something went wrong submitting your application. Please try again.'
      );
    }
  };

  const availableRoles = rolesData?.paginatedCandidateRoles?.roles ?? [];

  // Group roles by category for display
  const rolesByCategory = availableRoles.reduce<Record<string, PaginatedRole[]>>(
    (acc, role) => {
      const cat = role.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(role);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.keys(rolesByCategory).sort();

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Select your trades</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose the roles that match your experience. More roles means more
          opportunities.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleApply)} className="space-y-6">
        <Controller
          control={control}
          name="selectedRoleIds"
          render={() => (
            <div className="space-y-4">
              {sortedCategories.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">
                  No roles available. Please try again.
                </p>
              )}

              {sortedCategories.map((category) => (
                <div key={category}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rolesByCategory[category].map((role) => {
                      const isSelected = watchedRoleIds.includes(role.id);
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => toggleRole(role.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                          )}
                          aria-pressed={isSelected}
                        >
                          {isSelected && (
                            <CheckCircle2 className="size-3.5 shrink-0" />
                          )}
                          {role.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        />

        {errors.selectedRoleIds && (
          <p className="text-sm text-destructive">
            {errors.selectedRoleIds.message}
          </p>
        )}

        {watchedRoleIds.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {watchedRoleIds.length} role{watchedRoleIds.length !== 1 ? 's' : ''} selected
          </p>
        )}

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <Button
          type="submit"
          className="w-full h-11"
          disabled={isSubmitting || watchedRoleIds.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting application...
            </>
          ) : (
            'Apply Now'
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your application will be reviewed by the employer.
        </p>
      </form>
    </div>
  );
}
