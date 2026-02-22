'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { CANDIDATE_ROLES_QUERY, CURRENT_USER_QUERY } from '@/lib/graphql/queries';
import { APPLY_TO_JOB, UPDATE_ROLE_PREFERENCES } from '@/lib/graphql/mutations';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, Search, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TAXONOMY_CATEGORIES } from '@/lib/role-taxonomy';
import type { TaxonomyRole } from '@/lib/role-taxonomy';

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

interface CurrentUserResult {
  currentUser: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    primaryPhone?: string | null;
    candidateProfile?: {
      resumeUrl?: string | null;
      roles?: Array<{ id: string; name: string }> | null;
    } | null;
  };
}

/** Normalize PaginatedRole to TaxonomyRole shape */
function toTaxonomyRole(r: PaginatedRole): TaxonomyRole {
  return { id: r.id, name: r.name, category: r.category?.trim() || 'Other' };
}

/** Group roles by category, sorted by category name */
function groupByCategory(roles: TaxonomyRole[]): { name: string; roles: TaxonomyRole[] }[] {
  const map = new Map<string, TaxonomyRole[]>();
  for (const role of roles) {
    const list = map.get(role.category) ?? [];
    list.push(role);
    map.set(role.category, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, catRoles]) => ({ name, roles: catRoles.sort((a, b) => a.name.localeCompare(b.name)) }));
}

/**
 * Step 2 of the apply wizard: role selection.
 *
 * UX features:
 * - "Suggested for this job" pills always visible at top
 * - Search field filters the accordion only (pills stay)
 * - Collapsible category accordion for browsing 160+ roles
 * - Compact checkbox list items within categories
 * - Sticky bottom CTA — always visible without scrolling
 * - Returning users see adapted copy encouraging additional roles
 */
export function StepRoles() {
  const router = useRouter();
  const { jobId, jobSlug, selectedRoleIds, setRoles, setStep, demo, demoReturning, name: wizardName, whiteLabel, employerId } = useApplyWizard();
  const [submitError, setSubmitError] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Fetch all available roles (requires auth — JWT is set from StepAuth)
  const { data: rolesData, loading: rolesLoading } = useQuery<PaginatedRolesResult>(
    CANDIDATE_ROLES_QUERY,
    { variables: { limit: 500 }, skip: demo }
  );

  // Fetch current user to check for existing resume and pre-fill roles
  const { data: currentUserData } = useQuery<CurrentUserResult>(
    CURRENT_USER_QUERY,
    { skip: demo }
  );

  const [applyToJob, { loading: applyLoading }] = useMutation(APPLY_TO_JOB);
  const [updateRolePreferences, { loading: rolesUpdateLoading }] = useMutation(UPDATE_ROLE_PREFERENCES);

  const isSubmitting = applyLoading || rolesUpdateLoading || demoLoading;

  // Detect returning user (has existing roles on their profile, or demo returning mode)
  const existingProfileRoles = currentUserData?.currentUser?.candidateProfile?.roles ?? [];
  const isReturningUser = existingProfileRoles.length > 0 || (demo && demoReturning);

  // User's display name — from wizard (entered at phone step) or API profile
  const displayName = wizardName || currentUserData?.currentUser?.firstName || null;

  // Build the role list: demo taxonomy or API data
  const categories = useMemo(() => {
    if (demo) return TAXONOMY_CATEGORIES;
    const apiRoles = rolesData?.paginatedCandidateRoles?.roles ?? [];
    return groupByCategory(apiRoles.map(toTaxonomyRole));
  }, [demo, rolesData]);

  // All roles flattened (for search + lookups)
  const allRoles = useMemo(() => categories.flatMap((c) => c.roles), [categories]);

  // Filtered categories by search query (pills are NOT filtered)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        roles: cat.roles.filter((r) => r.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.roles.length > 0);
  }, [categories, searchQuery]);

  // Determine pre-selected role IDs: wizard state OR existing profile roles
  const profileRoleIds: string[] = existingProfileRoles.map((r) => r.id);

  // In demo returning mode, pre-select a few roles to simulate existing profile
  const demoReturningRoleIds = useMemo(() => {
    if (!demo || !demoReturning) return [];
    return allRoles
      .filter((r) => ['Electrician', 'Pipefitter'].includes(r.name))
      .map((r) => r.id);
  }, [demo, demoReturning, allRoles]);

  const initialRoleIds =
    selectedRoleIds && selectedRoleIds.length > 0
      ? selectedRoleIds
      : demoReturningRoleIds.length > 0
        ? demoReturningRoleIds
        : profileRoleIds;

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<RolesFormValues>({
    resolver: zodResolver(rolesSchema),
    defaultValues: {
      selectedRoleIds: initialRoleIds,
    },
  });

  const watchedRoleIds = watch('selectedRoleIds');

  // Pre-select roles when data arrives (covers async data load order)
  useEffect(() => {
    const ids =
      selectedRoleIds && selectedRoleIds.length > 0
        ? selectedRoleIds
        : demoReturningRoleIds.length > 0
          ? demoReturningRoleIds
          : profileRoleIds;
    if (ids.length > 0) {
      setValue('selectedRoleIds', ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleIds, currentUserData, demoReturningRoleIds]);

  const toggleRole = (roleId: string) => {
    const current = watchedRoleIds;
    const isSelected = current.includes(roleId);
    const updated = isSelected
      ? current.filter((id) => id !== roleId)
      : [...current, roleId];
    setValue('selectedRoleIds', updated, { shouldValidate: true });
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  // When searching, auto-expand all matching categories
  const isCategoryExpanded = (name: string) => {
    if (searchQuery.trim()) return true;
    return expandedCategories.has(name);
  };

  const handleApply = async (values: RolesFormValues) => {
    // In claim mode (no jobId), skip application — just save roles and advance
    if (!jobId) {
      try {
        if (demo) {
          setDemoLoading(true);
          await new Promise((r) => setTimeout(r, 500));
          setDemoLoading(false);
          setRoles(values.selectedRoleIds);
          setStep('resume');
          return;
        }

        await updateRolePreferences({
          variables: { candidateRoleIds: values.selectedRoleIds },
        });
        setRoles(values.selectedRoleIds);
        setStep('resume');
      } catch {
        setSubmitError('Something went wrong saving your roles. Please try again.');
      }
      return;
    }

    setSubmitError('');

    try {
      if (demo) {
        setDemoLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        setDemoLoading(false);
        setRoles(values.selectedRoleIds);
        setStep('resume');
        return;
      }

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

      // 4. Check for existing resume — if none, show optional CV upload step
      const hasResume = Boolean(
        currentUserData?.currentUser?.candidateProfile?.resumeUrl
      );

      if (!hasResume) {
        setStep('resume');
      } else {
        let confirmUrl = jobSlug
          ? `/confirm?jobId=${jobId}&slug=${jobSlug}`
          : `/confirm?jobId=${jobId}`;
        if (whiteLabel) {
          confirmUrl += '&whiteLabel=true';
        }
        if (employerId) {
          confirmUrl += `&employerId=${encodeURIComponent(employerId)}`;
        }
        router.push(confirmUrl);
      }
    } catch {
      setSubmitError(
        'Something went wrong submitting your application. Please try again.'
      );
    }
  };

  // Suggested roles: roles from the job listing that exist in our role set
  const suggestedRoles = useMemo(() => {
    if (demo) {
      return allRoles.filter((r) =>
        ['Electrician', 'Industrial Electrician', 'Pipefitter', 'Welder', 'Instrument Technician'].includes(r.name)
      );
    }
    // For production, could match on job.roles names
    return [];
  }, [demo, allRoles]);

  // Get role names for selected IDs (for the summary)
  const selectedRoleNames = useMemo(() => {
    return watchedRoleIds
      .map((id) => allRoles.find((r) => r.id === id)?.name)
      .filter(Boolean) as string[];
  }, [watchedRoleIds, allRoles]);

  if (rolesLoading && !demo) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Scrollable content — padded for sticky footer */}
      <div className="space-y-5 pb-36">
        <div>
          {isReturningUser ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back{displayName ? `, ${displayName}` : ''}!
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Your current roles are pre-selected. Adding more trades helps
                you show up for additional opportunities.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Select your trades</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Choose the roles that match your experience. More roles means
                more opportunities.
              </p>
            </>
          )}
        </div>

        <form id="roles-form" onSubmit={handleSubmit(handleApply)}>
          <Controller
            control={control}
            name="selectedRoleIds"
            render={() => (
              <div className="space-y-4">
                {/* Suggested roles — pills always visible */}
                {suggestedRoles.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Suggested for this job
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedRoles.map((role) => {
                        const isSelected = watchedRoleIds.includes(role.id);
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => toggleRole(role.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
                            )}
                            aria-pressed={isSelected}
                          >
                            {/* Always reserve icon space to prevent size shift */}
                            <CheckCircle2 className={cn('size-3.5 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                            {role.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search field */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    inputMode="search"
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Category accordion */}
                <div className="space-y-1">
                  {filteredCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No roles match &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}

                  {filteredCategories.map((category) => {
                    const isExpanded = isCategoryExpanded(category.name);
                    const selectedInCategory = category.roles.filter((r) =>
                      watchedRoleIds.includes(r.id)
                    ).length;

                    return (
                      <div key={category.name} className="border border-border rounded-lg overflow-hidden">
                        {/* Category header */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.name)}
                          className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span>{category.name}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {category.roles.length}
                            </span>
                            {selectedInCategory > 0 && (
                              <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium px-1.5">
                                {selectedInCategory}
                              </span>
                            )}
                          </div>
                          <ChevronDown
                            className={cn(
                              'size-4 text-muted-foreground transition-transform',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </button>

                        {/* Expanded role list */}
                        {isExpanded && (
                          <div className="border-t border-border">
                            {category.roles.map((role) => {
                              const isSelected = watchedRoleIds.includes(role.id);
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  onClick={() => toggleRole(role.id)}
                                  className={cn(
                                    'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors',
                                    'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                                    isSelected && 'bg-primary/5'
                                  )}
                                >
                                  {/* Checkbox */}
                                  <div
                                    className={cn(
                                      'flex items-center justify-center size-5 rounded border shrink-0 transition-colors',
                                      isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border bg-background'
                                    )}
                                  >
                                    {isSelected && <Check className="size-3" />}
                                  </div>
                                  <span className={cn(isSelected && 'font-medium')}>
                                    {role.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          />

          {errors.selectedRoleIds && (
            <p className="text-sm text-destructive mt-4">
              {errors.selectedRoleIds.message}
            </p>
          )}
        </form>
      </div>

      {/* Sticky bottom bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          {/* Selected summary */}
          {selectedRoleNames.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                {selectedRoleNames.length} selected:
              </span>
              <div className="flex gap-1.5">
                {selectedRoleNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button
            type="submit"
            form="roles-form"
            className="w-full h-11"
            disabled={isSubmitting || watchedRoleIds.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {jobId ? 'Submitting application...' : 'Saving roles...'}
              </>
            ) : (
              jobId ? 'Apply Now' : 'Continue'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
