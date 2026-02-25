'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storeToken } from '@/lib/auth';
import type { WizardStep, WizardState, BranchInfo, GeocodedLocation } from '@/types';

interface WizardActions {
  setStep: (step: WizardStep) => void;
  setJobContext: (jobId: string, jobSlug: string) => void;
  setPhone: (phone: string) => void;
  setToken: (token: string) => void;
  setRoles: (roleIds: string[]) => void;
  setResumeFileId: (fileId: string | null) => void;
  setName: (name: string) => void;
  toggleCert: (certName: string) => void;
  setDemo: (val: boolean) => void;
  setDemoReturning: (val: boolean) => void;
  setWhiteLabel: (val: boolean) => void;
  setEmployerId: (employerId: string | null) => void;
  setBranchInfo: (info: BranchInfo) => void;
  setLocation: (location: GeocodedLocation) => void;
  setWorkLocations: (locations: string[]) => void;
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
  claimedCertifications: [],
  demo: false,
  demoReturning: false,
  whiteLabel: false,
  employerId: null,
  branchInfo: null,
  location: null,
  workLocations: [],
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

      setToken: (token) => {
        storeToken(token);
        set({ token });
      },

      setRoles: (selectedRoleIds) => set({ selectedRoleIds }),

      setResumeFileId: (resumeFileId) => set({ resumeFileId }),

      setName: (name) => set({ name }),

      toggleCert: (certName) =>
        set((state) => ({
          claimedCertifications: state.claimedCertifications.includes(certName)
            ? state.claimedCertifications.filter((c) => c !== certName)
            : [...state.claimedCertifications, certName],
        })),

      setDemo: (val) => set({ demo: val }),

      setDemoReturning: (val) => set({ demoReturning: val }),

      setWhiteLabel: (val) => set({ whiteLabel: val }),

      setEmployerId: (employerId) => set({ employerId }),

      setBranchInfo: (info) => set({ branchInfo: info }),

      setLocation: (location) => set({ location }),

      setWorkLocations: (workLocations) => set({ workLocations }),

      reset: () => set(initialState),
    }),
    {
      name: 'moblyze-apply-wizard',
    }
  )
);
