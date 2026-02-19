'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WizardStep, WizardState } from '@/types';

interface WizardActions {
  setStep: (step: WizardStep) => void;
  setJobContext: (jobId: string, jobSlug: string) => void;
  setPhone: (phone: string) => void;
  setToken: (token: string) => void;
  setRoles: (roleIds: string[]) => void;
  setResumeFileId: (fileId: string | null) => void;
  setName: (name: string) => void;
  reset: () => void;
}

const initialState: WizardState = {
  step: 'phone',
  jobId: null,
  jobSlug: null,
  phone: null,
  token: null,
  selectedRoleIds: [],
  resumeFileId: null,
  name: null,
};

/**
 * Zustand store for the job application wizard.
 * Persisted to localStorage so users can resume if they navigate away.
 */
export const useApplyWizard = create<WizardState & WizardActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),

      setJobContext: (jobId, jobSlug) => set({ jobId, jobSlug }),

      setPhone: (phone) => set({ phone }),

      setToken: (token) => set({ token }),

      setRoles: (selectedRoleIds) => set({ selectedRoleIds }),

      setResumeFileId: (resumeFileId) => set({ resumeFileId }),

      setName: (name) => set({ name }),

      reset: () => set(initialState),
    }),
    {
      name: 'moblyze-apply-wizard',
    }
  )
);
