import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useClaimWizard } from '../useClaimWizard';

describe('useClaimWizard', () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useClaimWizard.getState().reset();
    });
  });

  it('has correct initial state', () => {
    const state = useClaimWizard.getState();
    expect(state.step).toBe('landing');
    expect(state.phone).toBeNull();
    expect(state.token).toBeNull();
    expect(state.name).toBeNull();
    expect(state.selectedRoleIds).toEqual([]);
    expect(state.selectedCertNames).toEqual([]);
    expect(state.location).toBeNull();
    expect(state.resumeFileId).toBeNull();
    expect(state.candidatePoolId).toBeNull();
    expect(state.branchInfo).toBeNull();
    expect(state.demo).toBe(false);
  });

  it('setStep updates step', () => {
    act(() => {
      useClaimWizard.getState().setStep('phone');
    });
    expect(useClaimWizard.getState().step).toBe('phone');
  });

  it('setPhone updates phone', () => {
    act(() => {
      useClaimWizard.getState().setPhone('+15551234567');
    });
    expect(useClaimWizard.getState().phone).toBe('+15551234567');
  });

  it('setToken updates token', () => {
    act(() => {
      useClaimWizard.getState().setToken('jwt-token-abc');
    });
    expect(useClaimWizard.getState().token).toBe('jwt-token-abc');
  });

  it('setName updates name', () => {
    act(() => {
      useClaimWizard.getState().setName('Jesse');
    });
    expect(useClaimWizard.getState().name).toBe('Jesse');
  });

  it('setRoles updates selectedRoleIds', () => {
    act(() => {
      useClaimWizard.getState().setRoles(['role-1', 'role-2']);
    });
    expect(useClaimWizard.getState().selectedRoleIds).toEqual(['role-1', 'role-2']);
  });

  it('setCerts updates selectedCertNames', () => {
    act(() => {
      useClaimWizard.getState().setCerts(['OSHA 10', 'CWI']);
    });
    expect(useClaimWizard.getState().selectedCertNames).toEqual(['OSHA 10', 'CWI']);
  });

  it('setLocation updates location', () => {
    const loc = {
      displayName: 'Houston, TX',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 29.76, lng: -95.37 },
    };
    act(() => {
      useClaimWizard.getState().setLocation(loc);
    });
    expect(useClaimWizard.getState().location).toEqual(loc);
  });

  it('setResumeFileId updates resumeFileId', () => {
    act(() => {
      useClaimWizard.getState().setResumeFileId('file-123');
    });
    expect(useClaimWizard.getState().resumeFileId).toBe('file-123');

    act(() => {
      useClaimWizard.getState().setResumeFileId(null);
    });
    expect(useClaimWizard.getState().resumeFileId).toBeNull();
  });

  it('setCandidatePoolId updates candidatePoolId', () => {
    act(() => {
      useClaimWizard.getState().setCandidatePoolId('pool-456');
    });
    expect(useClaimWizard.getState().candidatePoolId).toBe('pool-456');
  });

  it('setBranchInfo updates branchInfo', () => {
    const info = {
      channel: 'courier',
      campaign: 'outreach-q1',
      campaignId: 'camp-789',
    };
    act(() => {
      useClaimWizard.getState().setBranchInfo(info);
    });
    expect(useClaimWizard.getState().branchInfo).toEqual(info);
  });

  it('setDemo updates demo flag', () => {
    act(() => {
      useClaimWizard.getState().setDemo(true);
    });
    expect(useClaimWizard.getState().demo).toBe(true);
  });

  it('reset clears all state back to initial values', () => {
    // Set various state values
    act(() => {
      const s = useClaimWizard.getState();
      s.setStep('certs');
      s.setPhone('+15551234567');
      s.setToken('token-abc');
      s.setName('Jesse');
      s.setRoles(['role-1']);
      s.setCerts(['OSHA 10']);
      s.setLocation({
        displayName: 'Houston, TX',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        country: 'United States',
        countryCode: 'US',
        coordinates: { lat: 29.76, lng: -95.37 },
      });
      s.setResumeFileId('file-123');
      s.setCandidatePoolId('pool-456');
      s.setDemo(true);
    });

    // Verify state was set
    expect(useClaimWizard.getState().step).toBe('certs');
    expect(useClaimWizard.getState().phone).toBe('+15551234567');

    // Reset
    act(() => {
      useClaimWizard.getState().reset();
    });

    // Verify all fields are back to initial
    const state = useClaimWizard.getState();
    expect(state.step).toBe('landing');
    expect(state.phone).toBeNull();
    expect(state.token).toBeNull();
    expect(state.name).toBeNull();
    expect(state.selectedRoleIds).toEqual([]);
    expect(state.selectedCertNames).toEqual([]);
    expect(state.location).toBeNull();
    expect(state.resumeFileId).toBeNull();
    expect(state.candidatePoolId).toBeNull();
    expect(state.branchInfo).toBeNull();
    expect(state.demo).toBe(false);
  });

  it('uses moblyze-claim-wizard as the persistence key', () => {
    // The persist middleware uses this key for localStorage
    // We can verify by checking that the store has persist metadata
    const persistApi = (useClaimWizard as unknown as { persist: { getOptions: () => { name: string } } }).persist;
    expect(persistApi.getOptions().name).toBe('moblyze-claim-wizard');
  });
});
