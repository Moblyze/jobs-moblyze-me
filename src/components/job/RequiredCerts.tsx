'use client';

import { ShieldCheck, Check } from 'lucide-react';
import type { RequiredCert } from '@/types';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { getIconForCert } from '@/lib/cert-icons';

interface RequiredCertsProps {
  certifications: RequiredCert[];
  /** Cert names already on the user's profile (from API when authenticated) */
  userCertifications?: string[];
}

export function RequiredCerts({ certifications, userCertifications = [] }: RequiredCertsProps) {
  const claimed = useApplyWizard((s) => s.claimedCertifications);
  const toggleCert = useApplyWizard((s) => s.toggleCert);

  if (!certifications || certifications.length === 0) return null;

  const required = certifications.filter((c) => c.required);
  const preferred = certifications.filter((c) => !c.required);

  /** A cert is "held" if it's on the user's profile OR claimed in the wizard */
  const isCertHeld = (name: string) =>
    userCertifications.includes(name) || claimed.includes(name);

  /** Profile certs are read-only (already verified); wizard claims are toggleable */
  const isFromProfile = (name: string) => userCertifications.includes(name);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Required Certifications
      </h2>
      <p className="text-xs text-muted-foreground mb-3">
        Tap any certifications you hold
      </p>
      <div className="flex flex-wrap gap-2">
        {required.map((cert) => {
          const Icon = getIconForCert(cert.name);
          const held = isCertHeld(cert.name);
          const fromProfile = isFromProfile(cert.name);
          return (
            <button
              key={cert.name}
              type="button"
              onClick={() => !fromProfile && toggleCert(cert.name)}
              className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium
                transition-all duration-200
                ${fromProfile ? 'cursor-default' : 'active:scale-95'}
                ${
                  held
                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border border-primary/30 bg-primary/5 text-foreground'
                }
              `}
            >
              {held ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <Icon className="h-4 w-4 text-primary shrink-0" />
              )}
              {cert.name}
            </button>
          );
        })}
        {preferred.map((cert) => {
          const Icon = getIconForCert(cert.name);
          const held = isCertHeld(cert.name);
          const fromProfile = isFromProfile(cert.name);
          return (
            <button
              key={cert.name}
              type="button"
              onClick={() => !fromProfile && toggleCert(cert.name)}
              className={`
                inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm
                transition-all duration-200
                ${fromProfile ? 'cursor-default' : 'active:scale-95'}
                ${
                  held
                    ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border border-dashed border-muted-foreground/40 bg-muted/30 text-muted-foreground'
                }
              `}
            >
              {held ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              {cert.name}
              {!held && <span className="text-xs">(Preferred)</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
