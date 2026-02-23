'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClaimStep, BranchInfo, GeocodedLocation } from '@/types';

interface ClaimWizardState {
  step: ClaimStep;
  phone: string | null;
  token: string | null;
  name: string | null;
  selectedRoleIds: string[];
  selectedCertNames: string[];
  location: GeocodedLocation | null;
  workLocations: string[];
  resumeFileId: string | null;
  candidatePoolId: string | null;
  branchInfo: BranchInfo | null;
  demo: boolean;
  returning: boolean;
}

interface ClaimWizardActions {
  setStep: (step: ClaimStep) => void;
  setPhone: (phone: string) => void;
  setToken: (token: string) => void;
  setName: (name: string) => void;
  setRoles: (roleIds: string[]) => void;
  setCerts: (certNames: string[]) => void;
  setLocation: (location: GeocodedLocation) => void;
  setWorkLocations: (locations: string[]) => void;
  setResumeFileId: (fileId: string | null) => void;
  setCandidatePoolId: (id: string | null) => void;
  setBranchInfo: (info: BranchInfo) => void;
  setDemo: (val: boolean) => void;
  setReturning: (val: boolean) => void;
  reset: () => void;
}

const initialState: ClaimWizardState = {
  step: 'landing',
  phone: null,
  token: null,
  name: null,
  selectedRoleIds: [],
  selectedCertNames: [],
  location: null,
  workLocations: [],
  resumeFileId: null,
  candidatePoolId: null,
  branchInfo: null,
  demo: false,
  returning: false,
};

export const useClaimWizard = create<ClaimWizardState & ClaimWizardActions>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setPhone: (phone) => set({ phone }),
      setToken: (token) => set({ token }),
      setName: (name) => set({ name }),
      setRoles: (selectedRoleIds) => set({ selectedRoleIds }),
      setCerts: (selectedCertNames) => set({ selectedCertNames }),
      setLocation: (location) => set({ location }),
      setWorkLocations: (workLocations) => set({ workLocations }),
      setResumeFileId: (resumeFileId) => set({ resumeFileId }),
      setCandidatePoolId: (id) => set({ candidatePoolId: id }),
      setBranchInfo: (info) => set({ branchInfo: info }),
      setDemo: (val) => set({ demo: val }),
      setReturning: (val) => set({ returning: val }),
      reset: () => set(initialState),
    }),
    { name: 'moblyze-claim-wizard' }
  )
);
