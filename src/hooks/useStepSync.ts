'use client';

import { useEffect, useRef } from 'react';

/**
 * Syncs a wizard step to the URL via pushState/popstate.
 *
 * Two modes:
 * - Query param mode (default): appends `?step=<step>` to the current URL.
 *   Used by the apply flow where the URL already has a dynamic [jobId] segment.
 * - Path-based mode (when `basePath` is provided): pushes `<basePath>/<step>`.
 *   Used by the claim flow (/start/roles, /start/certs, etc.).
 *   For the special case of the first step ('landing'), the URL is just `basePath`
 *   with no step segment appended.
 *
 * Existing query params (demo, candidate_id, utm_source, etc.) are always
 * preserved — only the path or step param changes.
 *
 * - Pushes a new history entry when the step changes (enables browser back/forward)
 * - Listens to popstate to update the step when the user navigates
 * - Skips steps not in the allowedSteps list (e.g. 'landing' for claim flow)
 */
export function useStepSync<T extends string>(
  step: T,
  setStep: (step: T) => void,
  allowedSteps: readonly T[],
  basePath?: string,
) {
  const prevStepRef = useRef(step);
  const isPopstateRef = useRef(false);
  const allowedSet = useRef(new Set(allowedSteps));
  // Whether the URL already had a step segment when the hook first mounted.
  // If false, the first step-change is likely a Zustand hydration catching up to
  // a stale persisted value — we use replaceState rather than pushState so we
  // don't create a spurious history entry that the browser back button would
  // navigate to.
  const urlHadStepOnMountRef = useRef<boolean | null>(null);

  /** Build the URL string for the given step, preserving existing query params. */
  const buildUrl = (targetStep: T): string => {
    const current = new URL(window.location.href);
    if (basePath) {
      // Path-based mode: /start/roles, /start/certs, etc.
      // The 'landing' step maps to just the basePath (no segment).
      const pathSegment = (targetStep as string) === 'landing' ? '' : `/${targetStep}`;
      return `${basePath}${pathSegment}${current.search}`;
    } else {
      // Query param mode: ?step=roles
      const url = new URL(window.location.href);
      url.searchParams.set('step', targetStep);
      return url.toString();
    }
  };

  /** Read the current step from the URL (used by popstate handler). */
  const readStepFromUrl = (): T | undefined => {
    if (basePath) {
      // Extract last path segment; if empty or equals the base, no step segment present.
      const segments = window.location.pathname.split('/').filter(Boolean);
      const baseSegments = basePath.split('/').filter(Boolean);
      const stepSegment = segments[baseSegments.length] as T | undefined;
      return stepSegment || undefined;
    } else {
      const url = new URL(window.location.href);
      return (url.searchParams.get('step') as T | undefined) || undefined;
    }
  };

  // Push history entry when step changes (but not on popstate-triggered changes)
  useEffect(() => {
    if (prevStepRef.current === step) return;
    prevStepRef.current = step;

    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      return;
    }

    // Mount effect hasn't run yet — skip URL updates entirely.
    // This prevents Zustand hydration from bouncing the URL (e.g.
    // /start → /start/roles) before we've recorded the initial URL state.
    // Without this guard, pushState triggers Next.js soft navigation which
    // re-mounts the component, causing an infinite loading loop.
    if (urlHadStepOnMountRef.current === null) {
      return;
    }

    if (!allowedSet.current.has(step)) {
      // In path-based mode, steps not in allowedSteps (e.g. 'landing') still
      // need the URL corrected back to basePath so stale segments (e.g.
      // /start/resume left by a previous session) don't persist.
      if (basePath) {
        window.history.replaceState({ step }, '', buildUrl(step));
      }
      return;
    }

    // If the URL had no step segment when we mounted (e.g. the user navigated
    // to /start rather than /start/roles), the first step-change we see is
    // likely Zustand hydrating a stale persisted value rather than a genuine
    // user navigation.  Use replaceState so we don't push a history entry
    // that the browser back button would revisit unexpectedly.
    if (urlHadStepOnMountRef.current === false) {
      urlHadStepOnMountRef.current = true; // subsequent changes are real navigations
      window.history.replaceState({ step }, '', buildUrl(step));
      return;
    }

    window.history.pushState({ step }, '', buildUrl(step));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopstate = (e: PopStateEvent) => {
      const stateStep = e.state?.step as T | undefined;
      if (stateStep && allowedSet.current.has(stateStep)) {
        isPopstateRef.current = true;
        setStep(stateStep);
      } else {
        // Try reading from URL
        const urlStep = readStepFromUrl();
        if (urlStep && allowedSet.current.has(urlStep)) {
          isPopstateRef.current = true;
          setStep(urlStep);
        }
      }
    };

    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStep]);

  // Replace initial state so the first back works correctly.
  // In path-based mode we always replace — even for steps not in allowedSteps
  // (e.g. 'landing') — so the URL is always correct on initial load.
  // Also record whether the URL already had a step segment on mount so the
  // step-change effect can decide whether to push or replace.
  useEffect(() => {
    const urlStep = readStepFromUrl();
    urlHadStepOnMountRef.current = urlStep !== undefined;

    if (allowedSet.current.has(step) || basePath) {
      window.history.replaceState({ step }, '', buildUrl(step));
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
